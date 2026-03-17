import { Request, Response } from 'express';
import { prisma } from '@suaraekspor/database';

export async function getMarketplaceProducts(req: Request, res: Response) {
  const { lang = 'en', page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      listings: { where: { languageCode: lang as string }, take: 1 },
      seller: { select: { name: true, province: true, businessName: true } },
    },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.product.count({ where: { status: 'active' } });

  return res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}
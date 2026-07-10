import { Request, Response } from 'express';
import { prisma } from '@suaraekspor/database';

export async function getMarketplaceProducts(req: Request, res: Response) {
  const {
    lang = 'en',
    page = '1',
    limit = '20',
    category,
    province,
    minPrice,
    maxPrice,
    exportReady,
    sort = 'newest',
  } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;

  const where: Record<string, any> = { status: 'active' };

  if (category && category !== 'all') {
    where.category = category as string;
  }
  if (province && province !== 'all') {
    where.seller = { province: province as string };
  }
  if (minPrice || maxPrice) {
    where.recommendedPriceUsd = {
      ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
    };
  }
  if (exportReady === 'true') {
    where.exportReadinessScore = { gte: 70 };
  } else if (exportReady === 'false') {
    where.exportReadinessScore = { lt: 70 };
  }

  const orderBy: Record<string, any> =
    sort === 'price_asc' ? { recommendedPriceUsd: 'asc' } :
    sort === 'price_desc' ? { recommendedPriceUsd: 'desc' } :
    sort === 'export_ready' ? { exportReadinessScore: 'desc' } :
    { createdAt: 'desc' };

  const products = await prisma.product.findMany({
    where,
    include: {
      listings: { where: { languageCode: lang as string }, take: 1 },
      seller: { select: { name: true, province: true, businessName: true } },
    },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    orderBy,
  });

  const total = await prisma.product.count({ where });

  return res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}
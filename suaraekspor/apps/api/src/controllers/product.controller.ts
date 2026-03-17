import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';
import { runAIPipeline } from '../services/product.service';

export async function createProduct(req: AuthRequest, res: Response) {
  const photos = req.files as { [fieldname: string]: Express.Multer.File[] };
  const audio = photos['audio']?.[0];
  const productPhotos = photos['photos'] ?? [];

  if (productPhotos.length === 0) {
    return res.status(400).json({ success: false, error: 'Minimal 1 foto produk diperlukan' });
  }

  const product = await prisma.product.create({
    data: { sellerId: req.userId!, status: 'processing', aiPipelineStage: 'pending', photoUrls: [] },
  });

  runAIPipeline(
    product.id,
    audio?.path ?? null,
    productPhotos.map((f: Express.Multer.File) => f.path),
  ).catch((err: Error) => console.error(err));

  return res.status(202).json({
    success: true,
    data: { productId: product.id, status: 'processing' },
  });
}

export async function getProductStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, status: true, aiPipelineStage: true, updatedAt: true },
  });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

  const stageProgress: Record<string, number> = {
    pending: 0, uploading_photos: 10, stt: 25, vision: 45, listing: 65, pricing: 85, done: 100,
  };
  return res.json({ success: true, data: { ...product, progress: stageProgress[product.aiPipelineStage ?? 'pending'] ?? 0 } });
}

export async function getProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { listings: true, seller: { select: { name: true, province: true, businessName: true } } },
  });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  return res.json({ success: true, data: product });
}

export async function listSellerProducts(req: AuthRequest, res: Response) {
  const products = await prisma.product.findMany({
    where: { sellerId: req.userId! },
    include: { listings: { where: { languageCode: 'en' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ success: true, data: products });
}
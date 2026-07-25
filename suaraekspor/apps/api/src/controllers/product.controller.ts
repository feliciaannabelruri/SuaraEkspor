import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';
import { runAIPipeline } from '../services/product.service';
import { generatePromoCaption, applyPromoVoiceCorrection, transcribeAudio } from '@suaraekspor/ai-engine';
import fs from 'fs';

export async function createProduct(req: AuthRequest, res: Response) {
  const photos = req.files as { [fieldname: string]: Express.Multer.File[] };
  const audio = photos['audio']?.[0];
  const productPhotos = photos['photos'] ?? [];
  const typedDescription = typeof req.body.description === 'string' ? req.body.description.trim() : '';

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
    typedDescription || null,
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
    select: { id: true, status: true, aiPipelineStage: true, pipelineError: true, updatedAt: true },
  });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

  const stageProgress: Record<string, number> = {
    pending: 0, uploading_photos: 10, stt: 25, vision: 45, listing: 65, pricing: 85, done: 100,
  };
  return res.json({ success: true, data: { ...product, progress: stageProgress[product.aiPipelineStage ?? 'pending'] ?? 0 } });
}

export async function getProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { lang } = req.query;

  let product = await prisma.product.findUnique({
    where: { id },
    include: { listings: true, seller: { select: { name: true, province: true, businessName: true } } },
  });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

  // Auto-Heal: Real-time dynamic translation for fallback/missing listings on product detail
  if (lang && typeof lang === 'string') {
    const cleanLang = lang.toLowerCase();
    if (cleanLang !== 'id') {
      const idListing = product.listings.find(l => l.languageCode === 'id');
      const targetListing = product.listings.find(l => l.languageCode === cleanLang);

      const needsTranslate = idListing && (!targetListing || targetListing.title === idListing.title);

      if (needsTranslate) {
        try {
          const { translateDictionary } = require('@suaraekspor/ai-engine');
          const langNames: Record<string, string> = {
            en: 'English', zh: 'Chinese', ar: 'Arabic', ja: 'Japanese', de: 'German'
          };
          const targetLangName = langNames[cleanLang] || cleanLang;

          console.log(`[Auto-Heal Product Detail] Translating product ${id} to ${cleanLang}...`);
          const translated = await translateDictionary({
            title: idListing.title,
            description: idListing.description
          }, targetLangName);

          if (translated && translated.title) {
            const updatedListing = await prisma.productListing.upsert({
              where: { productId_languageCode: { productId: id, languageCode: cleanLang } },
              update: {
                title: translated.title,
                description: translated.description || idListing.description,
                keywords: idListing.keywords
              },
              create: {
                productId: id,
                languageCode: cleanLang,
                languageName: targetLangName,
                title: translated.title,
                description: translated.description || idListing.description,
                keywords: idListing.keywords
              }
            });
            // Update local object to return fresh translated data immediately
            const idx = product.listings.findIndex(l => l.languageCode === cleanLang);
            if (idx > -1) {
              product.listings[idx] = updatedListing;
            } else {
              product.listings.push(updatedListing);
            }
          }
        } catch (err) {
          console.error(`[Auto-Heal Product Detail] Failed translating ${id}:`, err);
        }
      }
    }
  }

  return res.json({ success: true, data: product });
}

export async function trackProductView(req: AuthRequest, res: Response) {
  const { id } = req.params;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return res.json({ success: true, data: product });
  } catch {
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }
}

export async function listSellerProducts(req: AuthRequest, res: Response) {
  const products = await prisma.product.findMany({
    where: { sellerId: req.userId! },
    include: { listings: { where: { languageCode: 'en' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ success: true, data: products });
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }

  if (product.sellerId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan menghapus produk ini' });
  }

  try {
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversation: { productId: id } } }),
      prisma.conversation.deleteMany({ where: { productId: id } }),
      prisma.transaction.deleteMany({ where: { productId: id } }),
      prisma.productListing.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err: any) {
    console.error('[Delete Product Error]', err);
    return res.status(500).json({ success: false, error: 'Gagal menghapus produk' });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, recommendedPriceUsd, listings } = req.body;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }

  if (product.sellerId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengubah produk ini' });
  }

  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (recommendedPriceUsd !== undefined) updateData.recommendedPriceUsd = recommendedPriceUsd;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.product.update({
          where: { id },
          data: updateData,
        });
      }

      if (Array.isArray(listings)) {
        for (const list of listings) {
          const { languageCode, title, description } = list;
          await tx.productListing.upsert({
            where: {
              productId_languageCode: {
                productId: id,
                languageCode,
              },
            },
            update: { title, description },
            create: { productId: id, languageCode, languageName: '', title, description },
          });
        }
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { listings: true },
    });

    return res.json({ success: true, data: updatedProduct });
  } catch (err: any) {
    console.error('[Update Product Error]', err);
    return res.status(500).json({ success: false, error: 'Gagal mengubah produk' });
  }
}

// ImageKit renders this transformation on the fly from the existing product
// photo URL — no server-side image processing or extra upload needed.
function buildPromoImageUrl(photoUrl: string, badgeText: string): string {
  const tr = `tr=w-1080,h-1080,cm-pad_resize,bg-FFFFFF,l-text,i-${encodeURIComponent(badgeText)},fs-48,co-FFFFFF,bg-01261FCC,pa-20,l-end`;
  return `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}${tr}`;
}

export async function generatePromoKit(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      listings: { where: { languageCode: 'id' }, take: 1 },
      seller: { select: { businessName: true, localLanguage: true } },
    },
  });

  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  if (product.sellerId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan membuat promo kit untuk produk ini' });
  }
  if (!product.photoUrls?.[0]) {
    return res.status(400).json({ success: false, error: 'Produk belum punya foto' });
  }

  const listing = product.listings[0];

  try {
    const { caption, hashtags, imageBadgeText } = await generatePromoCaption({
      productTitle: listing?.title || product.category || 'Produk UMKM',
      productDescription: listing?.description || '',
      category: product.category || 'lainnya',
      sellerLanguage: product.seller.localLanguage || 'id',
      businessName: product.seller.businessName || undefined,
    });

    const imageUrl = buildPromoImageUrl(product.photoUrls[0], imageBadgeText);

    return res.json({ success: true, data: { caption, hashtags, imageBadgeText, imageUrl } });
  } catch (err) {
    console.error('Error generating promo kit:', err);
    return res.status(502).json({ success: false, error: 'Gagal membuat promo kit dengan AI. Coba lagi.' });
  }
}

export async function applyPromoVoiceEdit(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, error: 'File audio diperlukan' });

  const product = await prisma.product.findUnique({ where: { id }, select: { sellerId: true, photoUrls: true, seller: { select: { localLanguage: true } } } });
  if (!product) {
    fs.unlink(file.path, () => {});
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }
  if (product.sellerId !== req.userId) {
    fs.unlink(file.path, () => {});
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengubah promo kit produk ini' });
  }

  let current: { caption: string; hashtags: string[]; imageBadgeText: string };
  try {
    current = JSON.parse(req.body.current);
  } catch {
    fs.unlink(file.path, () => {});
    return res.status(400).json({ success: false, error: 'Data promo kit saat ini tidak valid' });
  }

  try {
    const sttResult = await transcribeAudio(file.path);
    fs.unlink(file.path, () => {});

    const corrected = await applyPromoVoiceCorrection(current, sttResult.transcript, product.seller.localLanguage || 'id');
    const imageUrl = product.photoUrls?.[0] ? buildPromoImageUrl(product.photoUrls[0], corrected.imageBadgeText) : '';

    return res.json({ success: true, data: { ...corrected, imageUrl }, transcript: sttResult.transcript });
  } catch (err) {
    if (file) fs.unlink(file.path, () => {});
    console.error('Error applying promo voice edit:', err);
    return res.status(502).json({ success: false, error: 'Gagal memproses koreksi suara. Coba lagi.' });
  }
}
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

  if (category && category !== 'all' && category !== 'Semua') {
    if (category === 'pertanian') {
      where.category = { in: ['pertanian', 'tanaman'] };
    } else {
      where.category = category as string;
    }
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

  // Auto-Heal: Real-time dynamic translation for fallback/missing listings
  const cleanLang = (lang as string).toLowerCase();
  if (cleanLang !== 'id') {
    try {
      const { translateDictionary } = require('@suaraekspor/ai-engine');
      const langNames: Record<string, string> = {
        en: 'English', zh: 'Chinese', ar: 'Arabic', ja: 'Japanese', de: 'German'
      };
      const targetLangName = langNames[cleanLang] || cleanLang;

      await Promise.all(
        products.map(async (product) => {
          const targetListing = product.listings[0];

          // Fetch original Indonesian listing to translate from
          const idListing = await prisma.productListing.findUnique({
            where: { productId_languageCode: { productId: product.id, languageCode: 'id' } }
          });

          if (!idListing) return;

          // Needs translation if target listing is missing OR matches ID listing title (fallback)
          const needsTranslate = !targetListing || targetListing.title === idListing.title;

          if (needsTranslate) {
            try {
              console.log(`[Auto-Heal Translation] Translating product ${product.id} to ${cleanLang}...`);
              const translated = await translateDictionary({
                title: idListing.title,
                description: idListing.description
              }, targetLangName);

              if (translated && translated.title) {
                const updatedListing = await prisma.productListing.upsert({
                  where: { productId_languageCode: { productId: product.id, languageCode: cleanLang } },
                  update: {
                    title: translated.title,
                    description: translated.description || idListing.description,
                    keywords: idListing.keywords
                  },
                  create: {
                    productId: product.id,
                    languageCode: cleanLang,
                    languageName: targetLangName,
                    title: translated.title,
                    description: translated.description || idListing.description,
                    keywords: idListing.keywords
                  }
                });
                // Replace product listings array with the newly translated listing so it renders immediately
                product.listings = [updatedListing];
              }
            } catch (err) {
              console.error(`[Auto-Heal Translation] Failed for product ${product.id}:`, err);
            }
          }
        })
      );
    } catch (err) {
      console.error('[Auto-Heal Translation] Failed to initialize AI translation module:', err);
    }
  }

  const total = await prisma.product.count({ where });

  return res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';

/**
 * Aggregates real platform usage into the metrics judges look for at
 * Innovation Level 4 (adoption, usage, dampak). Never fabricated — every
 * number here is a live count from the database, and simulated transactions
 * are reported separately from real ones so the evidence stays honest.
 */
export async function getImpactMetrics(_req: AuthRequest, res: Response) {
  const [
    totalSellers,
    verifiedSellers,
    totalBuyers,
    totalProducts,
    productsByStatus,
    viewAgg,
    totalListings,
    listingsByLanguage,
    totalConversations,
    totalMessages,
    totalTransactions,
    realTransactions,
    realGmvAgg,
    totalWhatsappMessages,
    sellersWithActiveProduct,
    oldestUser,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'seller' } }),
    prisma.user.count({ where: { role: 'seller', isVerified: true } }),
    prisma.user.count({ where: { role: 'buyer' } }),
    prisma.product.count(),
    prisma.product.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.product.aggregate({ _sum: { viewCount: true } }),
    prisma.productListing.count(),
    prisma.productListing.groupBy({ by: ['languageCode'], _count: { _all: true } }),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { isSimulated: false } }),
    prisma.transaction.aggregate({
      _sum: { totalUsd: true },
      where: { isSimulated: false, status: { in: ['completed', 'released'] } },
    }),
    prisma.whatsappMessage.count(),
    prisma.product.findMany({
      where: { status: 'active' },
      select: { sellerId: true },
      distinct: ['sellerId'],
    }),
    prisma.user.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
  ]);

  return res.json({
    success: true,
    data: {
      generatedAt: new Date().toISOString(),
      platformSince: oldestUser?.createdAt ?? null,
      sellers: {
        total: totalSellers,
        verified: verifiedSellers,
        withActiveProduct: sellersWithActiveProduct.length,
      },
      buyers: { total: totalBuyers },
      products: {
        total: totalProducts,
        byStatus: Object.fromEntries(productsByStatus.map(p => [p.status, p._count._all])),
        totalViews: viewAgg._sum.viewCount ?? 0,
      },
      listings: {
        total: totalListings,
        byLanguage: Object.fromEntries(listingsByLanguage.map(l => [l.languageCode, l._count._all])),
      },
      engagement: {
        conversations: totalConversations,
        messages: totalMessages,
        whatsappMessages: totalWhatsappMessages,
      },
      transactions: {
        total: totalTransactions,
        real: realTransactions,
        simulated: totalTransactions - realTransactions,
        realGmvUsd: realGmvAgg._sum.totalUsd ?? 0,
      },
    },
  });
}

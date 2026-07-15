import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';

const NEXT_STATUS: Record<string, string | null> = {
  order_placed: 'payment_simulated',
  payment_simulated: 'escrow_held',
  escrow_held: 'released',
  released: 'completed',
  completed: null,
  cancelled: null,
};

export async function createTransaction(req: AuthRequest, res: Response) {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ success: false, error: 'productId diperlukan' });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  if (!product.recommendedPriceUsd) {
    return res.status(400).json({ success: false, error: 'Produk belum punya estimasi harga' });
  }

  const transaction = await prisma.transaction.create({
    data: {
      productId,
      sellerId: product.sellerId,
      buyerId: req.userId!,
      quantity,
      totalUsd: product.recommendedPriceUsd * quantity,
      status: 'order_placed',
      isSimulated: true,
    },
  });

  return res.status(201).json({ success: true, data: transaction });
}

export async function listTransactions(req: AuthRequest, res: Response) {
  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ buyerId: req.userId! }, { sellerId: req.userId! }] },
    include: {
      product: { include: { listings: { where: { languageCode: 'en' }, take: 1 } } },
      seller: { select: { id: true, name: true, businessName: true } },
      buyer: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json({ success: true, data: transactions });
}

export async function advanceTransactionStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
  
  // Allow either seller or buyer to advance simulated transactions
  const isSeller = transaction.sellerId === req.userId;
  const isBuyer = transaction.buyerId === req.userId;
  if (!isSeller && !isBuyer) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengubah status transaksi ini' });
  }

  const { status } = req.body;
  if (status === 'cancelled') {
    const updated = await prisma.transaction.update({ where: { id }, data: { status: 'cancelled' } });
    return res.json({ success: true, data: updated });
  }

  const next = NEXT_STATUS[transaction.status];
  if (!next) {
    return res.status(400).json({ success: false, error: `Status ${transaction.status} sudah final` });
  }

  const updated = await prisma.transaction.update({ where: { id }, data: { status: next as any } });
  return res.json({ success: true, data: updated });
}

export async function deleteTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });

  if (transaction.buyerId !== req.userId && transaction.sellerId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan menghapus transaksi ini' });
  }

  await prisma.transaction.delete({ where: { id } });
  return res.json({ success: true, message: 'Transaksi berhasil dihapus' });
}


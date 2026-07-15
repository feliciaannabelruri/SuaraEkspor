import { Router, Response } from 'express';
import { prisma } from '@suaraekspor/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// 1. Send connection request to seller by phone
router.post('/request', async (req: AuthRequest, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Nomor HP diperlukan' });
  }

  try {
    const cleanPhone = phone.trim();

    // Find the target seller
    const targetSeller = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        role: 'seller',
      },
    });

    if (!targetSeller) {
      return res.status(404).json({ success: false, error: 'Penjual (UMKM) dengan nomor tersebut tidak ditemukan' });
    }

    if (targetSeller.id === req.userId) {
      return res.status(400).json({ success: false, error: 'Anda tidak dapat mengelola akun Anda sendiri sebagai middleman' });
    }

    // Check if relation already exists
    const existingRelation = await prisma.middlemanRelation.findUnique({
      where: {
        middlemanId_sellerId: {
          middlemanId: req.userId!,
          sellerId: targetSeller.id,
        },
      },
    });

    if (existingRelation) {
      if (existingRelation.status === 'APPROVED') {
        return res.status(400).json({ success: false, error: 'Anda sudah mengelola penjual ini' });
      }
      if (existingRelation.status === 'PENDING') {
        return res.status(400).json({ success: false, error: 'Permintaan Anda masih dalam status menunggu persetujuan' });
      }
      // If rejected, allow them to re-request by updating status to PENDING
      const updatedRelation = await prisma.middlemanRelation.update({
        where: { id: existingRelation.id },
        data: { status: 'PENDING' },
      });
      return res.json({ success: true, data: updatedRelation });
    }

    // Create new relation
    const newRelation = await prisma.middlemanRelation.create({
      data: {
        middlemanId: req.userId!,
        sellerId: targetSeller.id,
        status: 'PENDING',
      },
    });

    return res.json({ success: true, data: newRelation });
  } catch (error) {
    console.error('Error sending middleman request:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengirimkan permintaan' });
  }
});

// 2. Get list of approved sellers that this middleman manages
router.get('/my-sellers', async (req: AuthRequest, res: Response) => {
  try {
    const relations = await prisma.middlemanRelation.findMany({
      where: {
        middlemanId: req.userId,
        status: 'APPROVED',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            province: true,
            localLanguage: true,
            address: true,
            phone: true,
            _count: {
              select: {
                products: true,
                conversations: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Flatten representation for frontend
    const sellers = relations.map(r => ({
      relationId: r.id,
      id: r.seller.id,
      name: r.seller.name,
      businessName: r.seller.businessName,
      province: r.seller.province,
      localLanguage: r.seller.localLanguage,
      address: r.seller.address,
      phone: r.seller.phone,
      productCount: r.seller._count.products,
      chatCount: r.seller._count.conversations,
    }));

    return res.json({ success: true, data: sellers });
  } catch (error) {
    console.error('Error getting managed sellers:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengambil daftar penjual' });
  }
});

// 3. Get list of pending middleman requests (when current user is the target seller)
router.get('/pending-requests', async (req: AuthRequest, res: Response) => {
  try {
    const relations = await prisma.middlemanRelation.findMany({
      where: {
        sellerId: req.userId,
        status: 'PENDING',
      },
      include: {
        middleman: {
          select: {
            id: true,
            name: true,
            businessName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const requests = relations.map(r => ({
      relationId: r.id,
      middleman: r.middleman,
      createdAt: r.createdAt,
    }));

    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error getting pending middleman requests:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengambil daftar permintaan masuk' });
  }
});

// 4. Approve middleman request (as target seller B)
router.patch('/request/:id/approve', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const relation = await prisma.middlemanRelation.findFirst({
      where: {
        id,
        sellerId: req.userId,
      },
    });

    if (!relation) {
      return res.status(404).json({ success: false, error: 'Permintaan tidak ditemukan atau Anda tidak berwenang' });
    }

    const updated = await prisma.middlemanRelation.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error approving middleman request:', error);
    return res.status(500).json({ success: false, error: 'Gagal menyetujui permintaan' });
  }
});

// 5. Reject middleman request (as target seller B)
router.patch('/request/:id/reject', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const relation = await prisma.middlemanRelation.findFirst({
      where: {
        id,
        sellerId: req.userId,
      },
    });

    if (!relation) {
      return res.status(404).json({ success: false, error: 'Permintaan tidak ditemukan atau Anda tidak berwenang' });
    }

    const updated = await prisma.middlemanRelation.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error rejecting middleman request:', error);
    return res.status(500).json({ success: false, error: 'Gagal menolak permintaan' });
  }
});

// 5.5. Get list of approved middlemen managing current seller
router.get('/my-managers', async (req: AuthRequest, res: Response) => {
  try {
    const relations = await prisma.middlemanRelation.findMany({
      where: {
        sellerId: req.userId,
        status: 'APPROVED',
      },
      include: {
        middleman: {
          select: {
            id: true,
            name: true,
            businessName: true,
            phone: true,
            province: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const managers = relations.map(r => ({
      relationId: r.id,
      id: r.middleman.id,
      name: r.middleman.name,
      businessName: r.middleman.businessName,
      phone: r.middleman.phone,
      province: r.middleman.province,
    }));

    return res.json({ success: true, data: managers });
  } catch (error) {
    console.error('Error getting my managers:', error);
    return res.status(500).json({ success: false, error: 'Gagal mengambil daftar pengelola' });
  }
});

// 6. Delete/disconnect relation (can be done by either middleman or seller)
router.delete('/relation/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const relation = await prisma.middlemanRelation.findFirst({
      where: {
        id,
        OR: [
          { middlemanId: req.userId },
          { sellerId: req.userId },
        ],
      },
    });

    if (!relation) {
      return res.status(404).json({ success: false, error: 'Hubungan tidak ditemukan atau Anda tidak berwenang' });
    }

    await prisma.middlemanRelation.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Hubungan berhasil diputuskan' });
  } catch (error) {
    console.error('Error deleting middleman relation:', error);
    return res.status(500).json({ success: false, error: 'Gagal memutuskan hubungan' });
  }
});

export default router;

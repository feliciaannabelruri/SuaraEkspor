import { Router, Response } from 'express';
import { prisma } from '@suaraekspor/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// Get current profile
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
});

// Update profile
router.patch('/me', async (req: AuthRequest, res: Response) => {
  const { name, province, businessName, address, localLanguage } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        province,
        businessName,
        address,
        localLanguage,
      },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Gagal memperbarui profil' });
  }
});

router.post('/translate-dictionary', async (req: AuthRequest, res: Response) => {
  const { dictionary, targetLanguage } = req.body;
  if (!dictionary || !targetLanguage) {
    return res.status(400).json({ success: false, error: 'dictionary dan targetLanguage diperlukan' });
  }
  try {
    const { translateDictionary } = require('@suaraekspor/ai-engine');
    const translated = await translateDictionary(dictionary, targetLanguage);
    return res.json({ success: true, data: translated });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({ success: false, error: 'Gagal melakukan terjemahan AI: ' + error.message });
  }
});

export default router;

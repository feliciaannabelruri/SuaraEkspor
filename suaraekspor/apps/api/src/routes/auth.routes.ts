import { Router, Request, Response } from 'express';
import { prisma } from '@suaraekspor/database';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();

// Kirim OTP — di development mode, OTP selalu '123456'
router.post('/otp/send', async (req: Request, res: Response) => {
  const { phone, role = 'seller' } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Nomor HP diperlukan' });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone, role } });
  }

  const otp = env.NODE_ENV === 'development' ? '123456' : generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  await prisma.otpToken.create({
    data: { userId: user.id, token: otp, expiresAt },
  });

  // Di production: kirim OTP via Fonnte (WhatsApp) atau Twilio (SMS)
  console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`);

  return res.json({ success: true, message: 'OTP terkirim', devOtp: env.NODE_ENV === 'development' ? otp : undefined });
});

// Verifikasi OTP
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone dan OTP diperlukan' });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan' });

  const token = await prisma.otpToken.findFirst({
    where: { userId: user.id, token: otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!token) return res.status(401).json({ success: false, error: 'OTP tidak valid atau kadaluarsa' });

  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });
  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });

  const jwtToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '30d' });

  return res.json({ success: true, data: { token: jwtToken, user: { id: user.id, phone: user.phone, role: user.role } } });
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default router;
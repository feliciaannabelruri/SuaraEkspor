import { Router, Request, Response } from 'express';
import { prisma } from '@suaraekspor/database';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { env } from '../config/env';

async function sendOtpViaFonnte(phone: string, otp: string): Promise<void> {
  await axios.post(
    'https://api.fonnte.com/send',
    { target: phone, message: `Kode OTP SuaraEkspor Anda: ${otp}. Berlaku 5 menit, jangan bagikan ke siapapun.` },
    { headers: { Authorization: env.FONNTE_API_KEY! } },
  );
}

const router = Router();

// Kirim OTP — di development mode, OTP selalu '123456'
router.post('/otp/send', async (req: Request, res: Response) => {
  const { phone, role = 'seller' } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Nomor HP diperlukan' });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (user) {
    if (user.role !== role) {
      const roleLabel = user.role === 'seller' ? 'Penjual (UMKM)' : 'Pembeli (Buyer)';
      const requestedRoleLabel = role === 'seller' ? 'Penjual (UMKM)' : 'Pembeli (Buyer)';
      return res.status(400).json({
        success: false,
        error: `Nomor WhatsApp ini sudah terdaftar sebagai akun ${roleLabel}. Anda tidak dapat masuk sebagai ${requestedRoleLabel} menggunakan nomor ini.`
      });
    }
  } else {
    user = await prisma.user.create({ data: { phone, role } });
  }

  const useRealWhatsApp = !!env.FONNTE_API_KEY;
  const otp = useRealWhatsApp ? generateOTP() : '123456';
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  await prisma.otpToken.create({
    data: { userId: user.id, token: otp, expiresAt },
  });

  if (useRealWhatsApp) {
    try {
      await sendOtpViaFonnte(phone, otp);
    } catch (err) {
      console.error('[OTP] Gagal kirim via Fonnte, fallback ke log:', err);
      console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`);
    }
  } else {
    console.log(`[OTP] Dev-mode (FONNTE_API_KEY kosong). Phone: ${phone}, OTP: ${otp}`);
  }

  return res.json({ success: true, message: 'OTP terkirim', devOtp: !useRealWhatsApp ? otp : undefined });
});

// Verifikasi OTP
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp, role } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone dan OTP diperlukan' });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan' });

  const token = await prisma.otpToken.findFirst({
    where: { userId: user.id, token: otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!token) return res.status(401).json({ success: false, error: 'OTP tidak valid atau kadaluarsa' });

  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });
  
  // Update verification status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true }
  });

  const jwtToken = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, env.JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    data: {
      token: jwtToken,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        role: updatedUser.role,
        name: updatedUser.name,
        businessName: updatedUser.businessName,
        localLanguage: updatedUser.localLanguage,
        province: updatedUser.province,
        address: updatedUser.address
      }
    }
  });
});


function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default router;
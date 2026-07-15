import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '@suaraekspor/database';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // --- Middleman Mode Impersonation ---
    const selectedSellerId = req.headers['x-selected-seller-id'] as string;
    if (selectedSellerId && decoded.role === 'seller') {
      const relation = await prisma.middlemanRelation.findUnique({
        where: {
          middlemanId_sellerId: {
            middlemanId: decoded.userId,
            sellerId: selectedSellerId,
          },
        },
      });

      if (relation && relation.status === 'APPROVED') {
        req.userId = selectedSellerId;
      } else {
        return res.status(403).json({ success: false, error: 'Akses ditolak: Hubungan pengelolaan tidak valid atau belum disetujui' });
      }
    }

    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token tidak valid atau kadaluarsa' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, error: 'Tidak diizinkan untuk peran ini' });
    }
    next();
  };
}
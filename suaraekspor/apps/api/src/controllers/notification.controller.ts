import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '@suaraekspor/database';

export async function listNotifications(req: AuthRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.userId!, isRead: false } });
  return res.json({ success: true, data: notifications, unreadCount });
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return res.status(404).json({ success: false, error: 'Notifikasi tidak ditemukan' });
  if (notification.userId !== req.userId) {
    return res.status(403).json({ success: false, error: 'Tidak diizinkan mengubah notifikasi ini' });
  }
  const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return res.json({ success: true, data: updated });
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({ where: { userId: req.userId!, isRead: false }, data: { isRead: true } });
  return res.json({ success: true, message: 'Semua notifikasi ditandai dibaca' });
}

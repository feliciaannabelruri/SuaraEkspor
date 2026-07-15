import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notification.controller';

const router = Router();
router.use(authMiddleware);
router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;

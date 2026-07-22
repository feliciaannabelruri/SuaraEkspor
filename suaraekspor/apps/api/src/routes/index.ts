import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import marketplaceRoutes from './marketplace.routes';
import conversationRoutes from './conversation.routes';
import transactionRoutes from './transaction.routes';
import userRoutes from './user.routes';
import middlemanRoutes from './middleman.routes';
import notificationRoutes from './notification.routes';
import whatsappRoutes from './whatsapp.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/conversations', conversationRoutes);
router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);
router.use('/middleman', middlemanRoutes);
router.use('/notifications', notificationRoutes);
router.use('/whatsapp', whatsappRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SuaraEkspor API', version: '1.0.0' });
});

export default router;
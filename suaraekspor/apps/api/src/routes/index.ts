import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import marketplaceRoutes from './marketplace.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/conversations', conversationRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SuaraEkspor API', version: '1.0.0' });
});

export default router;
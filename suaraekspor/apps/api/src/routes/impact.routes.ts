import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { getImpactMetrics } from '../controllers/impact.controller';

const router = Router();
router.use(authMiddleware, requireRole('admin'));
router.get('/', getImpactMetrics);

export default router;

import { Router } from 'express';
import { getMarketplaceProducts } from '../controllers/marketplace.controller';

const router = Router();
router.get('/', getMarketplaceProducts);

export default router;
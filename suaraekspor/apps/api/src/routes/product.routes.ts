import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadAudio, uploadPhoto } from '../middleware/upload.middleware';
import {
  createProduct,
  getProduct,
  getProductStatus,
  listSellerProducts,
} from '../controllers/product.controller';
import multer from 'multer';

const router = Router();
const uploadFields = uploadPhoto.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'audio', maxCount: 1 },
]);

router.post('/', authMiddleware, uploadFields, createProduct);
router.get('/', authMiddleware, listSellerProducts);
router.get('/:id', getProduct);
router.get('/:id/status', getProductStatus);

export default router;
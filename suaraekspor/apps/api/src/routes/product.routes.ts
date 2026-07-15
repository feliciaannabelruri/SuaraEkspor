import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { uploadAudio, uploadPhoto, uploadProductFiles } from '../middleware/upload.middleware';
import {
  createProduct,
  getProduct,
  getProductStatus,
  listSellerProducts,
  deleteProduct,
  updateProduct,
} from '../controllers/product.controller';
import multer from 'multer';

const router = Router();
const uploadFields = uploadProductFiles.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'audio', maxCount: 1 },
]);

router.post('/', authMiddleware, requireRole('seller'), uploadFields, createProduct);
router.get('/', authMiddleware, listSellerProducts);
router.get('/:id', getProduct);
router.get('/:id/status', getProductStatus);
router.delete('/:id', authMiddleware, requireRole('seller'), deleteProduct);
router.patch('/:id', authMiddleware, requireRole('seller'), updateProduct);

export default router;
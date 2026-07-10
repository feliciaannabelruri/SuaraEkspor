import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTransaction, listTransactions, advanceTransactionStatus } from '../controllers/transaction.controller';

const router = Router();
router.use(authMiddleware);
router.post('/', createTransaction);
router.get('/', listTransactions);
router.patch('/:id/status', advanceTransactionStatus);

export default router;

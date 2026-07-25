import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTransaction, listTransactions, advanceTransactionStatus, deleteTransaction } from '../controllers/transaction.controller';
import {
  listLegalDocuments,
  generateLegalDocument,
  updateLegalDocumentField,
  applyVoiceEdit,
  downloadLegalDocumentPdf,
} from '../controllers/legal-document.controller';
import { uploadAudio } from '../middleware/upload.middleware';

const router = Router();
router.use(authMiddleware);
router.post('/', createTransaction);
router.get('/', listTransactions);
router.patch('/:id/status', advanceTransactionStatus);
router.delete('/:id', deleteTransaction);

// ─── Legal Export Documents (Invoice / Packing List / Certificate of Origin) ──
router.get('/:transactionId/legal-documents', listLegalDocuments);
router.post('/:transactionId/legal-documents/:type/generate', generateLegalDocument);
router.patch('/:transactionId/legal-documents/:type', updateLegalDocumentField);
router.post('/:transactionId/legal-documents/:type/voice-edit', uploadAudio.single('audio'), applyVoiceEdit);
router.get('/:transactionId/legal-documents/:type/pdf', downloadLegalDocumentPdf);

export default router;

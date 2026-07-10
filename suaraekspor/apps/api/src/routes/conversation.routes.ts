import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createConversation,
  listConversations,
  getConversation,
  sendBuyerMessage,
} from '../controllers/conversation.controller';

const router = Router();
router.use(authMiddleware);
router.post('/', createConversation);
router.get('/', listConversations);
router.get('/:conversationId', getConversation);
router.post('/:conversationId/messages', sendBuyerMessage);

export default router;
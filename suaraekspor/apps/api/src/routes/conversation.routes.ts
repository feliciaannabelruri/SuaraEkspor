import { Router } from 'express';
import { sendBuyerMessage } from '../controllers/conversation.controller';

const router = Router();
router.post('/:conversationId/messages', sendBuyerMessage);

export default router;
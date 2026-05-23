import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, messageController.getConversations);
router.get('/conversations/:conversationId/messages', authenticateToken, messageController.getMessages);
router.get('/unread', authenticateToken, messageController.getUnreadCount);

export default router;

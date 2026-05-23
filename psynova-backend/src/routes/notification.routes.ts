import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.post('/read-all', authenticateToken, notificationController.markAllRead);
router.patch('/:id/read', authenticateToken, notificationController.markRead);

export default router;

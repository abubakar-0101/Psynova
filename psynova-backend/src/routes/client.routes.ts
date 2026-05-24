import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const client = [authenticateToken, requireRole('CLIENT')];

router.get('/me', ...client, clientController.getMe);
router.put('/me', ...client, clientController.updateMe);
router.get('/me/upload-signature', ...client, clientController.getUploadSignature);
router.post('/me/photo', ...client, clientController.updateProfilePhoto);

export default router;

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateAdminProfileSchema } from '../schemas/admin.schema';

const router = Router();

const admin = [authenticateToken, requireRole('ADMIN')];

router.get('/me', ...admin, adminController.getMe);
router.put('/me', ...admin, validate(updateAdminProfileSchema), adminController.updateMe);
router.get('/me/upload-signature', ...admin, adminController.getUploadSignature);
router.post('/me/photo', ...admin, adminController.updateProfilePhoto);

router.get('/stats', ...admin, adminController.getDashboardStats);
router.get('/users', ...admin, adminController.getAllUsers);
router.patch('/users/:userId/toggle-status', ...admin, adminController.toggleUserStatus);
router.get('/therapists', ...admin, adminController.getAllTherapists);
router.get('/therapists/pending', ...admin, adminController.getPendingTherapists);
router.post('/therapists/:therapistId/approve', ...admin, adminController.approveTherapist);
router.post('/therapists/:therapistId/reject', ...admin, adminController.rejectTherapist);
router.get('/appointments', ...admin, adminController.getAllAppointments);
router.get('/revenue', ...admin, adminController.getRevenue);
router.get('/reports', ...admin, adminController.getReports);

export default router;

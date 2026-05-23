import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
} from '../schemas/appointment.schema';

const router = Router();

router.post(
  '/',
  authenticateToken,
  requireRole('CLIENT'),
  validate(createAppointmentSchema),
  appointmentController.createAppointment,
);

router.post(
  '/:id/cancel',
  authenticateToken,
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment,
);

router.post(
  '/:id/complete',
  authenticateToken,
  requireRole('THERAPIST'),
  appointmentController.completeAppointment,
);

router.get('/upcoming', authenticateToken, appointmentController.getUpcomingAppointments);
router.get('/history', authenticateToken, appointmentController.getAppointmentHistory);

router.get(
  '/by-session/:sessionId',
  authenticateToken,
  appointmentController.getAppointmentBySession,
);

router.get('/:id', authenticateToken, appointmentController.getAppointmentById);

router.patch(
  '/:id/notes',
  authenticateToken,
  requireRole('THERAPIST'),
  appointmentController.saveSessionNotes,
);

export default router;

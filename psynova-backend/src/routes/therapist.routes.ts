import { Router } from 'express';
import * as therapistController from '../controllers/therapist.controller';
import * as reviewController from '../controllers/review.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateTherapistProfileSchema,
  therapistSearchSchema,
  availabilitySlotSchema,
} from '../schemas/therapist.schema';
import { createReviewSchema } from '../schemas/review.schema';

const router = Router();

// Public
router.get('/', validate(therapistSearchSchema, 'query'), therapistController.searchTherapists);
router.get('/:id', therapistController.getTherapistProfile);
router.get('/:id/availability', therapistController.getTherapistAvailability);
router.get('/:therapistId/reviews', reviewController.getTherapistReviews);

// Client
router.post('/reviews', authenticateToken, requireRole('CLIENT'), validate(createReviewSchema), reviewController.createReview);

// Therapist
router.get('/me/profile', authenticateToken, requireRole('THERAPIST'), therapistController.getMyAvailability);
router.put('/me/profile', authenticateToken, requireRole('THERAPIST'), validate(updateTherapistProfileSchema), therapistController.updateMyProfile);
router.post('/me/photo', authenticateToken, requireRole('THERAPIST'), therapistController.updateProfilePhoto);
router.get('/me/upload-signature', authenticateToken, requireRole('THERAPIST'), therapistController.getUploadSignature);
router.post('/me/availability', authenticateToken, requireRole('THERAPIST'), validate(availabilitySlotSchema), therapistController.addAvailabilitySlot);
router.delete('/me/availability/:slotId', authenticateToken, requireRole('THERAPIST'), therapistController.removeAvailabilitySlot);

export default router;

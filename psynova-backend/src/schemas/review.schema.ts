import { z } from 'zod';

export const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().min(1).max(5).int(),
  comment: z.string().max(1000).trim().optional(),
});

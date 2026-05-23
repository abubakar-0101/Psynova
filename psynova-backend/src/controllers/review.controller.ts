import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as reviewService from '../services/review.service';
import { AuthRequest, param } from '../types';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await reviewService.createReview(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: review });
});

export const getTherapistReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string };
  const result = await reviewService.getTherapistReviews(
    param(req.params.therapistId),
    parseInt(page),
    parseInt(limit),
  );
  res.json({ success: true, ...result });
});

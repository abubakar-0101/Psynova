import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as notificationRepo from '../repositories/notification.repository';
import { AuthRequest, param } from '../types';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
  const result = await notificationRepo.getUserNotifications(
    req.user!.userId,
    parseInt(page),
    parseInt(limit),
  );
  res.json({ success: true, data: result });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationRepo.markNotificationRead(param(req.params.id), req.user!.userId);
  res.json({ success: true });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationRepo.markAllNotificationsRead(req.user!.userId);
  res.json({ success: true });
});

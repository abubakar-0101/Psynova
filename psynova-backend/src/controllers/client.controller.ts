import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as clientService from '../services/client.service';
import { AuthRequest } from '../types';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await clientService.getMe(req.user!.userId);
  res.json({ success: true, data: profile });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await clientService.updateMe(req.user!.userId, req.body);
  res.json({ success: true, data: profile });
});

export const getUploadSignature = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { generateUploadSignature } = await import('../lib/cloudinary');
  const sig = await generateUploadSignature('psynova/client-photos', req.user!.userId);
  res.json({ success: true, data: sig });
});

export const updateProfilePhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { photoUrl, publicId } = req.body;
  const client = await clientService.updateProfilePhoto(req.user!.userId, photoUrl, publicId);
  res.json({ success: true, data: client });
});

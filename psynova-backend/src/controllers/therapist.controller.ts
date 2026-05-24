import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as therapistService from '../services/therapist.service';
import { AuthRequest, param } from '../types';

export const searchTherapists = asyncHandler(async (req: Request, res: Response) => {
  const result = await therapistService.searchTherapists(req.query as any);
  res.json({ success: true, ...result });
});

export const getTherapistProfile = asyncHandler(async (req: Request, res: Response) => {
  const therapist = await therapistService.getTherapistProfile(param(req.params.id));
  res.json({ success: true, data: therapist });
});

export const getTherapistAvailability = asyncHandler(async (req: Request, res: Response) => {
  const slots = await therapistService.getTherapistAvailability(param(req.params.id));
  res.json({ success: true, data: slots });
});

export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const therapist = await therapistService.updateMyProfile(req.user!.userId, req.body);
  res.json({ success: true, data: therapist });
});

export const updateProfilePhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { photoUrl, publicId } = req.body;
  const therapist = await therapistService.updateProfilePhoto(req.user!.userId, photoUrl, publicId);
  res.json({ success: true, data: therapist });
});

export const addAvailabilitySlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slot = await therapistService.addAvailabilitySlot(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: slot });
});

export const removeAvailabilitySlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  await therapistService.removeAvailabilitySlot(req.user!.userId, param(req.params.slotId));
  res.json({ success: true, message: 'Slot removed' });
});

export const getMyAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slots = await therapistService.getMyAvailability(req.user!.userId);
  res.json({ success: true, data: slots });
});

export const getUploadSignature = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { generateUploadSignature } = await import('../lib/cloudinary');
  const sig = await generateUploadSignature('psynova/therapist-photos', req.user!.userId);
  res.json({ success: true, data: sig });
});

export const getMyEarnings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { getTherapistEarnings } = await import('../services/appointment.service');
  const result = await getTherapistEarnings(req.user!.userId);
  res.json({ success: true, data: result });
});

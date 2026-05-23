import * as therapistRepo from '../repositories/therapist.repository';
import { AppError } from '../middleware/errorHandler';
import { deleteCloudinaryAsset } from '../lib/cloudinary';
import { Prisma } from '@prisma/client';

export async function searchTherapists(params: {
  q?: string;
  specialization?: string;
  language?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page: number;
  limit: number;
  sessionType?: string;
}) {
  const { therapists, total } = await therapistRepo.searchTherapists(params);
  const totalPages = Math.ceil(total / params.limit);

  return {
    therapists,
    meta: { total, page: params.page, limit: params.limit, totalPages },
  };
}

export async function getTherapistProfile(id: string) {
  const therapist = await therapistRepo.findTherapistById(id);
  if (!therapist) throw new AppError('Therapist not found', 404);
  return therapist;
}

export async function updateMyProfile(userId: string, data: Prisma.TherapistUpdateInput) {
  const therapist = await therapistRepo.findTherapistByUserId(userId);
  if (!therapist) throw new AppError('Therapist profile not found', 404);
  return therapistRepo.updateTherapistProfile(therapist.id, data);
}

export async function updateProfilePhoto(
  userId: string,
  photoUrl: string,
  publicId: string,
) {
  const therapist = await therapistRepo.findTherapistByUserId(userId);
  if (!therapist) throw new AppError('Therapist profile not found', 404);

  if (therapist.photoPublicId) {
    await deleteCloudinaryAsset(therapist.photoPublicId).catch(console.error);
  }

  return therapistRepo.updateTherapistProfile(therapist.id, {
    photoUrl,
    photoPublicId: publicId,
  });
}

export async function addAvailabilitySlot(
  userId: string,
  slot: { dayOfWeek: number; startTime: string; endTime: string; isRecurring: boolean },
) {
  const therapist = await therapistRepo.findTherapistByUserId(userId);
  if (!therapist) throw new AppError('Therapist profile not found', 404);

  return therapistRepo.createAvailabilitySlot({ therapistId: therapist.id, ...slot });
}

export async function removeAvailabilitySlot(userId: string, slotId: string) {
  const therapist = await therapistRepo.findTherapistByUserId(userId);
  if (!therapist) throw new AppError('Therapist profile not found', 404);

  return therapistRepo.deleteAvailabilitySlot(slotId, therapist.id);
}

export async function getMyAvailability(userId: string) {
  const therapist = await therapistRepo.findTherapistByUserId(userId);
  if (!therapist) throw new AppError('Therapist profile not found', 404);
  return therapistRepo.getTherapistAvailability(therapist.id);
}

export async function getTherapistAvailability(therapistId: string) {
  return therapistRepo.getTherapistAvailability(therapistId);
}

export async function approveTherapist(therapistId: string) {
  const therapist = await therapistRepo.findTherapistById(therapistId);
  if (!therapist) throw new AppError('Therapist not found', 404);

  const updated = await therapistRepo.updateTherapistProfile(therapistId, { isApproved: true });

  const { sendTherapistApprovalEmail } = await import('../lib/resend');
  await sendTherapistApprovalEmail(
    therapist.user.email,
    therapist.user.firstName,
  ).catch(console.error);

  return updated;
}

export async function rejectTherapist(therapistId: string) {
  const therapist = await therapistRepo.findTherapistById(therapistId);
  if (!therapist) throw new AppError('Therapist not found', 404);
  return therapistRepo.updateTherapistProfile(therapistId, { isApproved: false });
}

export async function getAllTherapistsAdmin(page: number, limit: number, approved?: boolean) {
  return therapistRepo.getAllTherapistsForAdmin(page, limit, approved);
}

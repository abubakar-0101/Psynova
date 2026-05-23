import prisma from '../lib/db';
import * as therapistRepo from '../repositories/therapist.repository';
import { AppError } from '../middleware/errorHandler';

export async function createReview(
  clientId: string,
  data: { appointmentId: string; rating: number; comment?: string },
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { therapistProfile: true },
  });

  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.clientId !== clientId) throw new AppError('Not authorized', 403);
  if (appointment.status !== 'COMPLETED') throw new AppError('Can only review completed sessions', 400);

  const existing = await prisma.review.findUnique({ where: { appointmentId: data.appointmentId } });
  if (existing) throw new AppError('Already reviewed this session', 409);

  const review = await prisma.review.create({
    data: {
      appointmentId: data.appointmentId,
      clientId,
      therapistId: appointment.therapistId,
      therapistProfileId: appointment.therapistProfileId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  await therapistRepo.recalculateTherapistRating(appointment.therapistProfileId);

  return review;
}

export async function getTherapistReviews(therapistProfileId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { therapistProfileId, isPublic: true },
      include: {
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { therapistProfileId, isPublic: true } }),
  ]);

  const ratingBreakdown = await prisma.review.groupBy({
    by: ['rating'],
    where: { therapistProfileId },
    _count: { rating: true },
  });

  return {
    reviews,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    ratingBreakdown,
  };
}

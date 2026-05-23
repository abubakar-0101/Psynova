import prisma from '../lib/db';
import { Prisma } from '@prisma/client';

export async function findTherapistById(id: string) {
  return prisma.therapist.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, isActive: true } },
      availabilitySlots: true,
      reviews: {
        include: {
          client: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function findTherapistByUserId(userId: string) {
  return prisma.therapist.findUnique({ where: { userId } });
}

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
  const { q, specialization, language, gender, minPrice, maxPrice, rating, page, limit, sessionType } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.TherapistWhereInput = {
    isApproved: true,
    user: { isActive: true },
    ...(q && {
      OR: [
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { bio: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(specialization && { specializations: { has: specialization } }),
    ...(language && { languages: { has: language } }),
    ...(gender && { gender }),
    ...(minPrice !== undefined && { sessionPrice: { gte: minPrice } }),
    ...(maxPrice !== undefined && { sessionPrice: { lte: maxPrice } }),
    ...(rating !== undefined && { rating: { gte: rating } }),
    ...(sessionType && { sessionTypes: { has: sessionType } }),
  };

  const [therapists, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        availabilitySlots: { where: { isBooked: false }, take: 3 },
      },
      skip,
      take: limit,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    }),
    prisma.therapist.count({ where }),
  ]);

  return { therapists, total };
}

export async function updateTherapistProfile(id: string, data: Prisma.TherapistUpdateInput) {
  return prisma.therapist.update({ where: { id }, data });
}

export async function createTherapistProfile(userId: string) {
  return prisma.therapist.create({ data: { userId } });
}

export async function createAvailabilitySlot(data: {
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}) {
  return prisma.availabilitySlot.create({ data });
}

export async function deleteAvailabilitySlot(id: string, therapistId: string) {
  return prisma.availabilitySlot.delete({
    where: { id, therapistId },
  });
}

export async function getTherapistAvailability(therapistId: string) {
  return prisma.availabilitySlot.findMany({
    where: { therapistId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

export async function recalculateTherapistRating(therapistId: string) {
  const result = await prisma.review.aggregate({
    where: { therapistProfileId: therapistId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return prisma.therapist.update({
    where: { id: therapistId },
    data: {
      rating: result._avg.rating ?? 0,
      reviewCount: result._count.rating,
    },
  });
}

export async function getAllTherapistsForAdmin(page: number, limit: number, approved?: boolean) {
  const skip = (page - 1) * limit;
  const where = approved !== undefined ? { isApproved: approved } : {};

  const [therapists, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, isActive: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.therapist.count({ where }),
  ]);

  return { therapists, total };
}

import prisma from '../lib/db';
import { AppointmentStatus, Prisma } from '@prisma/client';

// Lighter shape for list endpoints — drops email from user joins and only
// pulls the slot fields actually rendered. payment/review are 1:1 and used by
// the history/earnings/sessions UIs, so keep them.
const listInclude = {
  client: { select: { id: true, firstName: true, lastName: true } },
  therapistUser: { select: { id: true, firstName: true, lastName: true } },
  therapistProfile: { select: { id: true, photoUrl: true, sessionPrice: true } },
  slot: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true } },
  review: true,
  payment: true,
};

// Full shape for single-appointment views and post-payment webhook flows that
// need the related review/payment records.
const appointmentInclude = {
  client: { select: { id: true, firstName: true, lastName: true, email: true } },
  therapistUser: { select: { id: true, firstName: true, lastName: true, email: true } },
  therapistProfile: { select: { id: true, photoUrl: true, sessionPrice: true } },
  slot: true,
  review: true,
  payment: true,
};

export async function createAppointment(data: {
  clientId: string;
  therapistId: string;
  therapistProfileId: string;
  slotId?: string;
  startTime: Date;
  endTime: Date;
  meetingRoomId: string;
  notes?: string;
}) {
  return prisma.appointment.create({
    data,
    include: appointmentInclude,
  });
}

export async function findAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  extras?: Prisma.AppointmentUpdateInput,
) {
  return prisma.appointment.update({
    where: { id },
    data: { status, ...extras },
    include: appointmentInclude,
  });
}

export async function getUpcomingAppointments(userId: string, role: string) {
  const now = new Date();
  const where: Prisma.AppointmentWhereInput =
    role === 'CLIENT'
      ? { clientId: userId, startTime: { gt: now }, status: { in: ['CONFIRMED', 'PENDING'] } }
      : { therapistId: userId, startTime: { gt: now }, status: { in: ['CONFIRMED', 'PENDING'] } };

  return prisma.appointment.findMany({
    where,
    include: listInclude,
    orderBy: { startTime: 'asc' },
  });
}

export async function getPastAppointments(userId: string, role: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const where: Prisma.AppointmentWhereInput =
    role === 'CLIENT'
      ? { clientId: userId, status: { in: ['COMPLETED', 'NO_SHOW'] } }
      : { therapistId: userId, status: { in: ['COMPLETED', 'NO_SHOW'] } };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: listInclude,
      orderBy: { startTime: 'desc' },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

export async function checkSlotAvailability(
  therapistProfileId: string,
  startTime: Date,
  endTime: Date,
) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      therapistProfileId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    },
  });
  return !conflict;
}

export async function updatePaymentInfo(
  id: string,
  stripeSessionId: string,
  stripePaymentId?: string,
) {
  return prisma.appointment.update({
    where: { id },
    data: { stripeSessionId, stripePaymentId },
  });
}

export async function getAllAppointmentsAdmin(page: number, limit: number, status?: AppointmentStatus) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

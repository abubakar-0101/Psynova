import { v4 as uuidv4 } from 'uuid';
import * as appointmentRepo from '../repositories/appointment.repository';
import * as therapistRepo from '../repositories/therapist.repository';
import * as notificationRepo from '../repositories/notification.repository';
import { createCheckoutSession, createRefund } from '../lib/stripe';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../lib/resend';
import { AppError } from '../middleware/errorHandler';
import { format } from 'date-fns';
import prisma from '../lib/db';

export async function createAppointmentAndCheckout(
  clientId: string,
  clientEmail: string,
  data: {
    therapistId: string;
    slotId?: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  },
) {
  const therapistProfile = await therapistRepo.findTherapistByUserId(data.therapistId);
  if (!therapistProfile) throw new AppError('Therapist not found', 404);
  if (!therapistProfile.isApproved) throw new AppError('Therapist is not approved', 400);

  const available = await appointmentRepo.checkSlotAvailability(
    therapistProfile.id,
    data.startTime,
    data.endTime,
  );
  if (!available) throw new AppError('This time slot is already booked', 409);

  const meetingRoomId = uuidv4();

  const appointment = await appointmentRepo.createAppointment({
    clientId,
    therapistId: data.therapistId,
    therapistProfileId: therapistProfile.id,
    slotId: data.slotId,
    startTime: data.startTime,
    endTime: data.endTime,
    meetingRoomId,
    notes: data.notes,
  });

  const therapistName = `${appointment.therapistUser.firstName} ${appointment.therapistUser.lastName}`;
  const sessionDate = format(data.startTime, 'MMMM d, yyyy');
  const sessionTime = `${format(data.startTime, 'h:mm a')} - ${format(data.endTime, 'h:mm a')}`;

  const session = await createCheckoutSession({
    appointmentId: appointment.id,
    therapistName,
    sessionDate,
    amount: Number(therapistProfile.sessionPrice),
    clientEmail,
    successUrl: `${process.env.CLIENT_URL}/booking/success`,
    cancelUrl: `${process.env.CLIENT_URL}/therapists/${data.therapistId}`,
  });

  await appointmentRepo.updatePaymentInfo(appointment.id, session.id);

  return { appointment, checkoutUrl: session.url };
}

export async function confirmAppointmentAfterPayment(
  stripeSessionId: string,
  paymentIntentId: string,
) {
  const appointment = await prisma.appointment.findFirst({
    where: { stripeSessionId },
    include: {
      client: true,
      therapistUser: true,
      therapistProfile: true,
    },
  });

  if (!appointment) throw new AppError('Appointment not found', 404);

  const updated = await appointmentRepo.updateAppointmentStatus(appointment.id, 'CONFIRMED', {
    stripePaymentId: paymentIntentId,
  });

  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      userId: appointment.clientId,
      stripeSessionId,
      stripePaymentIntentId: paymentIntentId,
      amount: appointment.therapistProfile.sessionPrice,
      status: 'COMPLETED',
    },
  });

  const sessionDate = format(appointment.startTime, 'MMMM d, yyyy');
  const sessionTime = `${format(appointment.startTime, 'h:mm a')} - ${format(appointment.endTime, 'h:mm a')}`;
  const therapistName = `${appointment.therapistUser.firstName} ${appointment.therapistUser.lastName}`;

  await sendBookingConfirmationEmail({
    email: appointment.client.email,
    firstName: appointment.client.firstName,
    therapistName,
    sessionDate,
    sessionTime,
    appointmentId: appointment.id,
  }).catch(console.error);

  await notificationRepo.createNotification({
    userId: appointment.clientId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed',
    body: `Your session with ${therapistName} on ${sessionDate} is confirmed.`,
    metadata: { appointmentId: appointment.id },
  });

  await notificationRepo.createNotification({
    userId: appointment.therapistId,
    type: 'BOOKING_CONFIRMED',
    title: 'New Booking',
    body: `${appointment.client.firstName} booked a session on ${sessionDate}.`,
    metadata: { appointmentId: appointment.id },
  });

  return updated;
}

export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string,
) {
  const appointment = await appointmentRepo.findAppointmentById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);

  if (appointment.clientId !== userId && appointment.therapistId !== userId) {
    throw new AppError('Not authorized', 403);
  }

  if (!['CONFIRMED', 'PENDING'].includes(appointment.status)) {
    throw new AppError('Appointment cannot be cancelled', 400);
  }

  const hoursUntil = (appointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  let refundAmount: number | undefined;

  if (appointment.stripePaymentId && appointment.payment) {
    if (hoursUntil >= 24) {
      refundAmount = Number(appointment.payment.amount);
    } else if (hoursUntil >= 0) {
      refundAmount = Number(appointment.payment.amount) * 0.5;
    }

    if (refundAmount !== undefined && appointment.stripePaymentId) {
      const refund = await createRefund(appointment.stripePaymentId, refundAmount);
      await prisma.payment.update({
        where: { appointmentId },
        data: { status: 'REFUNDED', refundId: refund.id, refundAmount },
      });
    }
  }

  const updated = await appointmentRepo.updateAppointmentStatus(appointment.id, 'CANCELLED', {
    cancellationReason: reason,
  });

  const therapistName = `${appointment.therapistUser.firstName} ${appointment.therapistUser.lastName}`;
  const sessionDate = format(appointment.startTime, 'MMMM d, yyyy');

  await sendCancellationEmail({
    email: appointment.client.email,
    firstName: appointment.client.firstName,
    therapistName,
    sessionDate,
    reason,
  }).catch(console.error);

  await notificationRepo.createNotification({
    userId: appointment.clientId,
    type: 'BOOKING_CANCELLED',
    title: 'Session Cancelled',
    body: `Your session on ${sessionDate} has been cancelled.`,
    metadata: { appointmentId },
  });

  return updated;
}

export async function completeAppointment(appointmentId: string, therapistUserId: string) {
  const appointment = await appointmentRepo.findAppointmentById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.therapistId !== therapistUserId) throw new AppError('Not authorized', 403);

  return appointmentRepo.updateAppointmentStatus(appointmentId, 'COMPLETED');
}

export async function getUpcoming(userId: string, role: string) {
  return appointmentRepo.getUpcomingAppointments(userId, role);
}

export async function getHistory(userId: string, role: string, page: number, limit: number) {
  return appointmentRepo.getPastAppointments(userId, role, page, limit);
}

export async function getAppointmentForUser(appointmentId: string, userId: string) {
  const appointment = await appointmentRepo.findAppointmentById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.clientId !== userId && appointment.therapistId !== userId) {
    throw new AppError('Not authorized', 403);
  }
  return appointment;
}

export async function getAppointmentBySessionId(stripeSessionId: string, userId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { stripeSessionId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      therapistUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      therapistProfile: { select: { id: true, photoUrl: true, sessionPrice: true } },
      payment: true,
    },
  });
  if (!appointment) throw new AppError('Booking not found', 404);
  if (appointment.clientId !== userId && appointment.therapistId !== userId) {
    throw new AppError('Not authorized', 403);
  }
  return appointment;
}

export async function saveSessionNotes(
  appointmentId: string,
  therapistUserId: string,
  sessionNotes: string,
) {
  const appointment = await appointmentRepo.findAppointmentById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.therapistId !== therapistUserId) throw new AppError('Not authorized', 403);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { sessionNotes },
    select: { id: true, sessionNotes: true },
  });
}

// ---------- NEW: therapist clients list ----------
export async function getMyClients(therapistUserId: string) {
  // Pull all completed/confirmed appointments for this therapist,
  // then deduplicate by clientId.
  const appointments = await prisma.appointment.findMany({
    where: {
      therapistId: therapistUserId,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    select: {
      clientId: true,
      startTime: true,
      status: true,
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { startTime: 'desc' },
  });

  // Group by client
  const clientMap = new Map<string, {
    id: string; firstName: string; lastName: string; email: string;
    sessionCount: number; lastSession: Date | null;
  }>();

  for (const apt of appointments) {
    const existing = clientMap.get(apt.clientId);
    if (existing) {
      existing.sessionCount += 1;
      if (!existing.lastSession || apt.startTime > existing.lastSession) {
        existing.lastSession = apt.startTime;
      }
    } else {
      clientMap.set(apt.clientId, {
        ...apt.client,
        sessionCount: 1,
        lastSession: apt.startTime,
      });
    }
  }

  return { clients: Array.from(clientMap.values()) };
}

// ---------- NEW: client payment history ----------
export async function getClientPayments(clientUserId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId: clientUserId },
    include: {
      appointment: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          therapistUser: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { payments };
}

// ---------- NEW: therapist earnings ----------
export async function getTherapistEarnings(therapistUserId: string) {
  // Find the therapist profile id first
  const profile = await prisma.therapist.findUnique({
    where: { userId: therapistUserId },
    select: { id: true },
  });

  if (!profile) throw new AppError('Therapist profile not found', 404);

  const [totalRevenue, monthRevenue, byMonth] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        appointment: { therapistId: therapistUserId },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        appointment: { therapistId: therapistUserId },
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
    prisma.$queryRaw<Array<{ month: Date; revenue: number }>>`
      SELECT date_trunc('month', p."createdAt") AS month,
             COALESCE(SUM(p."amount"), 0)::float AS revenue
      FROM "Payment" p
      JOIN "Appointment" a ON a.id = p."appointmentId"
      WHERE p."status" = 'COMPLETED'
        AND a."therapistId" = ${therapistUserId}
        AND p."createdAt" >= (NOW() - INTERVAL '12 months')
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  return {
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    monthRevenue: Number(monthRevenue._sum.amount ?? 0),
    byMonth: byMonth.map((r) => ({
      month: `${r.month.getFullYear()}-${String(r.month.getMonth() + 1).padStart(2, '0')}`,
      revenue: Number(r.revenue),
    })),
  };
}

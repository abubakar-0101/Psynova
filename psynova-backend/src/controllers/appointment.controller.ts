import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as appointmentService from '../services/appointment.service';
import { AuthRequest, param } from '../types';

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = {
    ...req.body,
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
  };
  const result = await appointmentService.createAppointmentAndCheckout(
    req.user!.userId,
    req.user!.email,
    data,
  );
  res.status(201).json({ success: true, data: result });
});

export const cancelAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.cancelAppointment(
    param(req.params.id),
    req.user!.userId,
    req.body.reason,
  );
  res.json({ success: true, data: appointment });
});

export const completeAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.completeAppointment(
    param(req.params.id),
    req.user!.userId,
  );
  res.json({ success: true, data: appointment });
});

export const getUpcomingAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointments = await appointmentService.getUpcoming(req.user!.userId, req.user!.role);
  res.json({ success: true, data: appointments });
});

export const getAppointmentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string };
  const result = await appointmentService.getHistory(
    req.user!.userId,
    req.user!.role,
    parseInt(page),
    parseInt(limit),
  );
  res.json({ success: true, ...result });
});

export const getAppointmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.getAppointmentForUser(
    param(req.params.id),
    req.user!.userId,
  );
  res.json({ success: true, data: appointment });
});

export const getAppointmentBySession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.getAppointmentBySessionId(
    param(req.params.sessionId),
    req.user!.userId,
  );
  res.json({ success: true, data: appointment });
});

export const saveSessionNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionNotes } = req.body as { sessionNotes?: string };
  const updated = await appointmentService.saveSessionNotes(
    param(req.params.id),
    req.user!.userId,
    sessionNotes ?? '',
  );
  res.json({ success: true, data: updated });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { stripe } = await import('../lib/stripe');
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    await appointmentService.confirmAppointmentAfterPayment(
      session.id,
      session.payment_intent,
    );
  }

  res.json({ received: true });
});

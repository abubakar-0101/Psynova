import { z } from 'zod';

export const createAppointmentSchema = z.object({
  therapistId: z.string().uuid(),
  slotId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  slotId: z.string().uuid().optional(),
});

import { z } from 'zod';

export const updateAdminProfileSchema = z
  .object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .optional(),
  })
  .refine(
    (data) =>
      data.newPassword === undefined || (data.currentPassword && data.currentPassword.length > 0),
    { message: 'Current password is required to set a new password', path: ['currentPassword'] },
  );

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;

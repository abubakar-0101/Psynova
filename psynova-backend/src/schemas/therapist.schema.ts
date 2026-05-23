import { z } from 'zod';

export const updateTherapistProfileSchema = z.object({
  bio: z.string().max(2000).trim().optional(),
  licenseNumber: z.string().max(100).trim().optional(),
  specializations: z.array(z.string()).max(10).optional(),
  languages: z.array(z.string()).max(10).optional(),
  sessionPrice: z.number().min(0).max(10000).optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
  timezone: z.string().optional(),
  sessionTypes: z.array(z.enum(['ONLINE', 'IN_PERSON', 'BOTH'])).optional(),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.number(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
  })).optional(),
});

export const therapistSearchSchema = z.object({
  q: z.string().optional(),
  specialization: z.string().optional(),
  language: z.string().optional(),
  gender: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sessionType: z.string().optional(),
});

export const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isRecurring: z.boolean().default(true),
});

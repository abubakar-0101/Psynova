import { z } from 'zod';

export const createMoodEntrySchema = z.object({
  mood: z.number().min(1).max(10).int(),
  note: z.string().max(500).trim().optional(),
  tags: z.array(z.string().max(30)).max(5).default([]),
});

export const createJournalEntrySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).trim(),
  isPrivate: z.boolean().default(true),
});

export const updateJournalEntrySchema = createJournalEntrySchema.partial();

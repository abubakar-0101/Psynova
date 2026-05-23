import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as moodRepo from '../repositories/mood.repository';
import { AuthRequest, param } from '../types';

export const createMoodEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await moodRepo.createMoodEntry({ userId: req.user!.userId, ...req.body });
  res.status(201).json({ success: true, data: entry });
});

export const getMoodHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { days = '30' } = req.query as { days?: string };
  const entries = await moodRepo.getMoodHistory(req.user!.userId, parseInt(days));
  res.json({ success: true, data: entries });
});

export const createJournalEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wordCount = req.body.content.trim().split(/\s+/).length;
  const entry = await moodRepo.createJournalEntry({
    userId: req.user!.userId,
    wordCount,
    ...req.body,
  });
  res.status(201).json({ success: true, data: entry });
});

export const getJournalEntries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string };
  const result = await moodRepo.getUserJournalEntries(req.user!.userId, parseInt(page), parseInt(limit));
  res.json({ success: true, ...result });
});

export const getJournalEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await moodRepo.getJournalEntryById(param(req.params.id), req.user!.userId);
  if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, data: entry });
});

export const updateJournalEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wordCount = req.body.content ? req.body.content.trim().split(/\s+/).length : undefined;
  const entry = await moodRepo.updateJournalEntry(param(req.params.id), req.user!.userId, {
    ...req.body,
    ...(wordCount && { wordCount }),
  });
  res.json({ success: true, data: entry });
});

export const deleteJournalEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  await moodRepo.deleteJournalEntry(param(req.params.id), req.user!.userId);
  res.json({ success: true, message: 'Entry deleted' });
});

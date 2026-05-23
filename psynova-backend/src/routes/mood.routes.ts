import { Router } from 'express';
import * as moodController from '../controllers/mood.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMoodEntrySchema, createJournalEntrySchema, updateJournalEntrySchema } from '../schemas/mood.schema';

const router = Router();

router.post('/mood', authenticateToken, validate(createMoodEntrySchema), moodController.createMoodEntry);
router.get('/mood', authenticateToken, moodController.getMoodHistory);

router.post('/journal', authenticateToken, validate(createJournalEntrySchema), moodController.createJournalEntry);
router.get('/journal', authenticateToken, moodController.getJournalEntries);
router.get('/journal/:id', authenticateToken, moodController.getJournalEntry);
router.put('/journal/:id', authenticateToken, validate(updateJournalEntrySchema), moodController.updateJournalEntry);
router.delete('/journal/:id', authenticateToken, moodController.deleteJournalEntry);

export default router;

import prisma from '../lib/db';

export async function createMoodEntry(data: {
  userId: string;
  mood: number;
  note?: string;
  tags: string[];
}) {
  return prisma.moodEntry.create({ data });
}

export async function getMoodHistory(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.moodEntry.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createJournalEntry(data: {
  userId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  wordCount: number;
}) {
  return prisma.journalEntry.create({ data });
}

export async function getUserJournalEntries(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  return { entries, total };
}

export async function getJournalEntryById(id: string, userId: string) {
  return prisma.journalEntry.findFirst({ where: { id, userId } });
}

export async function updateJournalEntry(
  id: string,
  userId: string,
  data: { title?: string; content?: string; isPrivate?: boolean; wordCount?: number },
) {
  return prisma.journalEntry.update({ where: { id, userId }, data });
}

export async function deleteJournalEntry(id: string, userId: string) {
  return prisma.journalEntry.delete({ where: { id, userId } });
}

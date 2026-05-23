import prisma from '../lib/db';

export async function findOrCreateConversation(clientId: string, therapistId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { clientId_therapistId: { clientId, therapistId } },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: { clientId, therapistId },
  });
}

export async function getUserConversations(userId: string, role: string) {
  const where = role === 'CLIENT' ? { clientId: userId } : { therapistId: userId };

  return prisma.conversation.findMany({
    where,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      therapist: { select: { id: true, firstName: true, lastName: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });
}

export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
  limit = 30,
) {
  return prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });
}

export async function getUnreadCount(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ clientId: userId }, { therapistId: userId }],
    },
    select: { id: true },
  });

  return prisma.message.count({
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: userId },
      isRead: false,
    },
  });
}

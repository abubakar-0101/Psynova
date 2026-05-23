import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as messageRepo from '../repositories/message.repository';
import { AuthRequest, param } from '../types';

export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const conversations = await messageRepo.getUserConversations(req.user!.userId, req.user!.role);
  res.json({ success: true, data: conversations });
});

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { cursor, limit = '30' } = req.query as { cursor?: string; limit?: string };
  const messages = await messageRepo.getConversationMessages(
    param(req.params.conversationId),
    cursor,
    parseInt(limit),
  );
  res.json({ success: true, data: messages.reverse() });
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await messageRepo.getUnreadCount(req.user!.userId);
  res.json({ success: true, data: { count } });
});

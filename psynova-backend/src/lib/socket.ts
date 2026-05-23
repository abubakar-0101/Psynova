import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from './db';

interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;

    // Mark user online
    if (socket.data.role === 'THERAPIST') {
      await prisma.therapist.updateMany({
        where: { userId },
        data: { isOnline: true },
      });
    }

    // Broadcast online status to all
    socket.broadcast.emit('user:online', { userId });

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Join conversation rooms the user is part of
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
      },
      select: { id: true },
    });

    conversations.forEach((conv) => {
      socket.join(`conv:${conv.id}`);
    });

    // Handle joining a specific conversation
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // Handle sending a message
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
        });

        if (!conversation?.isUnlocked) {
          socket.emit('error', { message: 'Conversation is locked. Book a session to message.' });
          return;
        }

        if (conversation.clientId !== userId && conversation.therapistId !== userId) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            type: (data.type as any) || 'TEXT',
            fileUrl: data.fileUrl,
            fileName: data.fileName,
          },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { lastMessageAt: new Date() },
        });

        io.to(`conv:${data.conversationId}`).emit('message:new', message);
        io.to(`conv:${data.conversationId}`).emit('message:delivered', { messageId: message.id });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('message:read', async (data: { conversationId: string }) => {
      await prisma.message.updateMany({
        where: {
          conversationId: data.conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      socket.to(`conv:${data.conversationId}`).emit('message:read', {
        conversationId: data.conversationId,
        readBy: userId,
      });
    });

    // Typing indicators
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:stop', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.data.role === 'THERAPIST') {
        await prisma.therapist.updateMany({
          where: { userId },
          data: { isOnline: false },
        });
      }
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
}

export type SocketServer = ReturnType<typeof initializeSocket>;

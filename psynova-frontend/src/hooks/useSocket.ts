'use client';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';
import { useMessagingStore } from '@/store/messaging.store';
import { Message } from '@/types';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {};
  }, []);

  return socketRef.current;
}

export function useConversationSocket(conversationId: string | null) {
  const { addMessage, setTyping, markConversationRead } = useMessagingStore();

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    socket.emit('conversation:join', conversationId);

    const onNewMessage = (message: Message) => {
      addMessage(conversationId, message);
    };

    const onTypingStart = ({ userId }: { userId: string }) => {
      setTyping(conversationId, userId, true);
    };

    const onTypingStop = ({ userId }: { userId: string }) => {
      setTyping(conversationId, userId, false);
    };

    const onRead = () => {
      markConversationRead(conversationId);
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:read', onRead);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:read', onRead);
    };
  }, [conversationId, addMessage, setTyping, markConversationRead]);
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Send, Paperclip, Lock, Search, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useMessagingStore } from '@/store/messaging.store';
import { useConversationSocket } from '@/hooks/useSocket';
import { getSocket } from '@/lib/socket';
import api from '@/lib/axios';
import { Conversation, Message } from '@/types';
import { formatRelative, getInitials } from '@/lib/utils';

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && (
        <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
          <AvatarFallback className="text-xs">
            {getInitials(message.sender.firstName, message.sender.lastName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
          isMe
            ? 'bg-[#4A90D9] text-white rounded-br-sm'
            : 'bg-white border border-[#F1F0EE] text-[#1A1A2E] rounded-bl-sm'
        }`}
      >
        {message.content && <p className="leading-relaxed">{message.content}</p>}
        {message.fileUrl && message.type === 'IMAGE' && (
          <img src={message.fileUrl} alt={message.fileName || 'Image'} className="rounded-xl max-w-full mt-1" />
        )}
        {message.fileUrl && message.type === 'FILE' && (
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-xs">
            📎 {message.fileName || 'Download file'}
          </a>
        )}
        <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-[#6B7280]'}`}>
          {formatRelative(message.createdAt)}
          {isMe && <span className="ml-1">{message.isRead ? '✓✓' : '✓'}</span>}
        </p>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const other = conversation.clientId === currentUserId ? conversation.therapist : conversation.client;
  const lastMsg = conversation.messages[0];
  const unread = !conversation.isUnlocked;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
        isActive ? 'bg-[#4A90D9]/10 border border-[#4A90D9]/20' : 'hover:bg-[#F1F0EE]'
      }`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="text-sm">
          {getInitials(other.firstName, other.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1A1A2E] truncate">
            {other.firstName} {other.lastName}
          </p>
          {conversation.lastMessageAt && (
            <span className="text-xs text-[#6B7280] flex-shrink-0">
              {formatRelative(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!conversation.isUnlocked && <Lock className="h-3 w-3 text-[#6B7280]" />}
          <p className="text-xs text-[#6B7280] truncate">
            {lastMsg?.content || (conversation.isUnlocked ? 'No messages yet' : 'Book a session to message')}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { conversations, setConversations, messages, setMessages, addMessage, typingUsers } = useMessagingStore();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useConversationSocket(activeConvId);

  // Load conversations
  const { data: convsData, isLoading: loadingConvs, isError: isConvsError, refetch: refetchConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/api/messages/conversations');
      return res.data.data as Conversation[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (convsData) setConversations(convsData);
  }, [convsData, setConversations]);

  // Load messages for active conversation
  const { data: msgsData, isLoading: loadingMessages, isError: isMsgsError, refetch: refetchMsgs } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: async () => {
      const res = await api.get(`/api/messages/conversations/${activeConvId}/messages`);
      return res.data.data as Message[];
    },
    enabled: !!activeConvId,
  });

  useEffect(() => {
    if (msgsData && activeConvId) setMessages(activeConvId, msgsData);
  }, [msgsData, activeConvId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[activeConvId || '']]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = (activeConvId && messages[activeConvId]) || [];

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    const socket = getSocket();
    socket.emit('message:send', { conversationId: activeConvId, content: input.trim() });
    setInput('');
  };

  const handleTyping = () => {
    if (!activeConvId) return;
    const socket = getSocket();
    socket.emit('typing:start', { conversationId: activeConvId });
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConvId });
    }, 500);
    setTypingTimeout(t);
  };

  const otherTyping = activeConvId
    ? (typingUsers[activeConvId] || []).filter((id) => id !== user?.id)
    : [];

  const dashboardHref =
    user?.role === 'CLIENT'
      ? '/dashboard/client'
      : user?.role === 'THERAPIST'
      ? '/dashboard/therapist'
      : '/dashboard/admin';

  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-[#F1F0EE] bg-white flex flex-col">
          <div className="p-4 border-b border-[#F1F0EE]">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.push(dashboardHref)}
                className="p-1.5 rounded-lg hover:bg-[#F1F0EE] transition-colors text-[#6B7280]"
                title="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="font-semibold text-[#1A1A2E]">Messages</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                placeholder="Search conversations..."
                className="h-9 w-full rounded-xl border border-[#F1F0EE] pl-9 pr-3 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isConvsError ? (
              <div className="text-center py-8 px-4 space-y-2">
                <p className="text-xs text-[#E85D60]">Failed to load conversations</p>
                <Button size="sm" variant="outline" className="h-8" onClick={() => refetchConvs()}>Retry</Button>
              </div>
            ) : loadingConvs ? (
              <div className="text-center py-8 text-sm text-[#6B7280]">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConvId}
                  currentUserId={user?.id || ''}
                  onClick={() => setActiveConvId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="h-16 flex items-center px-5 border-b border-[#F1F0EE] bg-white">
                {(() => {
                  const other = activeConv.clientId === user?.id ? activeConv.therapist : activeConv.client;
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm">
                          {getInitials(other.firstName, other.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A2E]">
                          {other.firstName} {other.lastName}
                        </p>
                        {otherTyping.length > 0 && (
                          <p className="text-xs text-[#4A90D9]">typing...</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!activeConv.isUnlocked ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#F1F0EE] flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8 text-[#6B7280]" />
                    </div>
                    <p className="font-semibold text-[#1A1A2E] mb-2">Conversation locked</p>
                    <p className="text-sm text-[#6B7280] max-w-xs">
                      Book a session with this therapist to unlock messaging.
                    </p>
                  </div>
                ) : loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-[#6B7280] text-sm">
                    Loading messages...
                  </div>
                ) : isMsgsError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <p className="text-sm text-[#E85D60]">Failed to load messages</p>
                    <Button size="sm" onClick={() => refetchMsgs()}>Retry</Button>
                  </div>
                ) : (
                  activeMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === user?.id} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {activeConv.isUnlocked && (
                <div className="p-4 border-t border-[#F1F0EE] bg-white">
                  <div className="flex items-center gap-2 rounded-2xl border border-[#F1F0EE] bg-[#FAFAF9] p-2">
                    <button className="p-2 text-[#6B7280] hover:text-[#4A90D9] transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      value={input}
                      onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2 rounded-xl bg-[#4A90D9] text-white hover:bg-[#3a7ac9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <div className="h-20 w-20 rounded-3xl bg-[#4A90D9]/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-10 w-10 text-[#4A90D9]" />
                </div>
                <p className="font-semibold text-[#1A1A2E] mb-2">Select a conversation</p>
                <p className="text-sm text-[#6B7280]">Choose from your conversations on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

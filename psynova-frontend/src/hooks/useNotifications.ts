'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore } from '@/store/auth.store';
import { Notification } from '@/types';

export function useNotifications() {
  const { setNotifications, setUnreadCount, addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/api/notifications?limit=10');
      return res.data.data;
    },
    enabled: !!user,
  });

  // v5: replace removed onSuccess with a syncing effect.
  useEffect(() => {
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
    }
  }, [data, setNotifications, setUnreadCount]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.on('notification:new', (notification: Notification) => {
      addNotification(notification);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification:new');
    };
  }, [user, addNotification, qc]);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/notifications/${id}/read`);
    },
    onSuccess: (_, id) => {
      useNotificationStore.getState().markRead(id);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/read-all');
    },
    onSuccess: () => {
      useNotificationStore.getState().markAllRead();
    },
  });

  const store = useNotificationStore();

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}

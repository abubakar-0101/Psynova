'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { User } from '@/types';

export function useAuth() {
  const { user, accessToken, setUser, setAccessToken, setIsLoading, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  // TanStack Query v5 removed onSuccess/onError from useQuery — sync to the
  // auth store via useEffect on `data` / `error` instead.
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data as User;
    },
    enabled: !!accessToken,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
      setIsLoading(false);
    }
  }, [meQuery.data, setUser, setIsLoading]);

  useEffect(() => {
    if (meQuery.isError) {
      storeLogout();
      setIsLoading(false);
    }
  }, [meQuery.isError, storeLogout, setIsLoading]);

  useEffect(() => {
    if (!accessToken) setIsLoading(false);
  }, [accessToken, setIsLoading]);

  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
    } else {
      disconnectSocket();
    }
  }, [accessToken]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await api.post('/api/auth/login', credentials);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
    }) => {
      const res = await api.post('/api/auth/register', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout');
    },
    onSuccess: () => {
      storeLogout();
      disconnectSocket();
      qc.clear();
      router.push('/');
    },
  });

  return {
    user,
    accessToken,
    isLoading: meQuery.isLoading || useAuthStore.getState().isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginPending: loginMutation.isPending,
    registerPending: registerMutation.isPending,
  };
}

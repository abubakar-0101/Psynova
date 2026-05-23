'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function useAdminMe() {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/admin/me');
      return res.data.data as AdminProfile;
    },
    staleTime: 60_000,
  });
}

export function useUpdateAdminMe() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: UpdateAdminProfileInput) => {
      const res = await api.put('/api/admin/me', input);
      return res.data.data as AdminProfile;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'me'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      if (user) {
        setUser({
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      }
    },
  });
}

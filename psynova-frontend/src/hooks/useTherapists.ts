'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { TherapistProfile, AvailabilitySlot } from '@/types';

export function useTherapists(params: Record<string, string | number | undefined>) {
  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]),
    ),
  ).toString();

  return useQuery({
    queryKey: ['therapists', params],
    queryFn: async () => {
      const res = await api.get(`/api/therapists?${queryString}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useTherapist(id: string) {
  return useQuery({
    queryKey: ['therapists', id],
    queryFn: async () => {
      const res = await api.get(`/api/therapists/${id}`);
      return res.data.data as TherapistProfile;
    },
    enabled: !!id,
  });
}

export function useTherapistAvailability(therapistId: string) {
  return useQuery({
    queryKey: ['therapists', therapistId, 'availability'],
    queryFn: async () => {
      const res = await api.get(`/api/therapists/${therapistId}/availability`);
      return res.data.data as AvailabilitySlot[];
    },
    enabled: !!therapistId,
  });
}

export function useMyAvailability() {
  return useQuery({
    queryKey: ['therapist', 'availability', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/therapists/me/profile');
      return res.data.data as AvailabilitySlot[];
    },
  });
}

export function useAddAvailabilitySlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slot: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isRecurring: boolean;
    }) => {
      const res = await api.post('/api/therapists/me/availability', slot);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['therapist', 'availability', 'me'] });
    },
  });
}

export function useRemoveAvailabilitySlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slotId: string) => {
      await api.delete(`/api/therapists/me/availability/${slotId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['therapist', 'availability', 'me'] });
    },
  });
}

export function useUpdateTherapistProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TherapistProfile>) => {
      const res = await api.put('/api/therapists/me/profile', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

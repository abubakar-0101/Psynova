'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Appointment } from '@/types';

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const res = await api.get('/api/appointments/upcoming');
      return res.data.data as Appointment[];
    },
  });
}

export function useAppointmentHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['appointments', 'history', page],
    queryFn: async () => {
      const res = await api.get(`/api/appointments/history?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      therapistId: string;
      startTime: string;
      endTime: string;
      slotId?: string;
      notes?: string;
    }) => {
      const res = await api.post('/api/appointments', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.post(`/api/appointments/${id}/cancel`, { reason });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/appointments/${id}/complete`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

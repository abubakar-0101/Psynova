'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Users, Calendar, DollarSign, CheckCircle, Flag, Settings
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { adminNav } from '../_nav';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

export default function AdminAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments'],
    queryFn: async () => {
      const res = await api.get('/api/admin/appointments');
      return res.data.data;
    },
  });

  const appointments: any[] = data?.appointments || [];
  const filtered = statusFilter === 'ALL'
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  return (
    <DashboardShell navItems={adminNav} title="Appointments">
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-9 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#4A90D9] text-white'
                  : 'bg-white border border-[#F1F0EE] text-[#6B7280] hover:border-[#4A90D9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isLoading ? 'Loading...' : `${filtered.length} appointments`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">No appointments found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F0EE]">
                    <th className="text-left px-5 py-3 text-xs text-[#6B7280] font-medium">Client</th>
                    <th className="text-left px-5 py-3 text-xs text-[#6B7280] font-medium">Therapist</th>
                    <th className="text-left px-5 py-3 text-xs text-[#6B7280] font-medium">Date & Time</th>
                    <th className="text-left px-5 py-3 text-xs text-[#6B7280] font-medium">Amount</th>
                    <th className="text-left px-5 py-3 text-xs text-[#6B7280] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F0EE]">
                  {filtered.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#FAFAF9]">
                      <td className="px-5 py-3.5 text-[#1A1A2E]">
                        {apt.client?.firstName} {apt.client?.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-[#1A1A2E]">
                        Dr. {apt.therapistUser?.firstName} {apt.therapistUser?.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7280]">
                        <span>{formatDate(apt.startTime)}</span>
                        <span className="ml-1 text-xs">{formatTime(apt.startTime)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[#1A1A2E] font-medium">
                        {formatCurrency(apt.amount || 0)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[apt.status] || 'default'} className="text-xs">
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

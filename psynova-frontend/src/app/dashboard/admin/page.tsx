'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Users, Calendar, DollarSign, CheckCircle, XCircle,
  TrendingUp, Settings, Flag
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/SkeletonCard';
import api from '@/lib/axios';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { adminNav } from './_nav';

const RevenueAreaChart = dynamic(() => import('@/components/charts/RevenueAreaChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-[#F1F0EE]" />,
});

export default function AdminDashboardPage() {
  const qc = useQueryClient();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data.data;
    },
  });

  const { data: pending } = useQuery({
    queryKey: ['admin', 'pending-therapists'],
    queryFn: async () => {
      const res = await api.get('/api/admin/therapists/pending');
      return res.data.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: revenueData = [] } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: async () => {
      const res = await api.get('/api/admin/revenue');
      return res.data.data as { month: string; revenue: number }[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/api/admin/therapists/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      toast({ title: 'Therapist approved!', variant: 'success' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/api/admin/therapists/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      toast({ title: 'Therapist rejected' });
    },
  });

  const pendingTherapists = pending?.therapists || [];

  const statCards = [
    { label: 'Total Clients', value: stats?.totalUsers || 0, icon: Users, color: '#4A90D9' },
    { label: 'Active Therapists', value: stats?.totalTherapists || 0, icon: CheckCircle, color: '#7BAE9E' },
    { label: "Today's Sessions", value: stats?.todaySessions || 0, icon: Calendar, color: '#4A90D9' },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.monthRevenue || 0), icon: DollarSign, color: '#f97316' },
  ];

  return (
    <DashboardShell navItems={adminNav} title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="h-5 w-5" style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold text-[#1A1A2E]">{s.value}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Revenue chart */}
        <Card>
          <CardHeader><CardTitle>Platform Revenue</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <RevenueAreaChart data={revenueData} gradientId="adminRevenue" height={220} />
            ) : (
              <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Pending therapist approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Verifications</span>
              {stats?.pendingTherapists > 0 && (
                <Badge variant="warning">{stats.pendingTherapists} pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTherapists.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280] text-sm">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-[#7BAE9E] opacity-60" />
                All therapist applications reviewed
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTherapists.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 rounded-2xl border border-[#F1F0EE] p-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getInitials(t.user.firstName, t.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A1A2E] truncate">
                        {t.user.firstName} {t.user.lastName}
                      </p>
                      <p className="text-xs text-[#6B7280]">{t.user.email}</p>
                      <p className="text-xs text-[#6B7280]">Applied {formatDate(t.user.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="sage"
                        className="gap-1"
                        isLoading={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(t.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        isLoading={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(t.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

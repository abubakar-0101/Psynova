'use client';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { DollarSign, Calendar, TrendingUp, MessageCircle, Users, Star, Edit, Settings } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';

const RevenueAreaChart = dynamic(() => import('@/components/charts/RevenueAreaChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] animate-pulse rounded-xl" style={{ background: 'var(--subtle)' }} />
  ),
});

const therapistNav = [
  { href: '/dashboard/therapist', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/therapist/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/therapist/clients', label: 'Clients', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/therapist/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/therapist/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/therapist/profile', label: 'Edit Profile', icon: Edit },
  { href: '/dashboard/therapist/settings', label: 'Settings', icon: Settings },
];

export default function EarningsPage() {
  const { data: earningsData } = useQuery({
    queryKey: ['therapist-earnings'],
    queryFn: async () => {
      const res = await api.get('/api/therapists/me/earnings');
      return res.data.data as { totalRevenue: number; monthRevenue: number; byMonth: { month: string; revenue: number }[] };
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['appointments', 'history', 1],
    queryFn: async () => {
      const res = await api.get('/api/appointments/history?page=1&limit=20');
      return res.data;
    },
  });

  const revenueData = earningsData?.byMonth || [];
  const totalRevenue = earningsData?.totalRevenue || 0;
  const monthRevenue = earningsData?.monthRevenue || 0;
  const payments = historyData?.appointments?.map((a: any) => a.payment).filter(Boolean) || [];

  return (
    <DashboardShell navItems={therapistNav} title="Earnings">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="text-center p-5">
            <p className="text-3xl font-bold text-[#4A90D9]">{formatCurrency(monthRevenue)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--dash-muted)' }}>This Month</p>
          </Card>
          <Card className="text-center p-5">
            <p className="text-3xl font-bold text-[#7BAE9E]">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--dash-muted)' }}>All Time</p>
          </Card>
          <Card className="text-center p-5">
            <p className="text-3xl font-bold" style={{ color: 'var(--dash-text)' }}>{payments.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--dash-muted)' }}>Total Sessions Paid</p>
          </Card>
        </div>

        {/* Revenue chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <RevenueAreaChart data={revenueData} gradientId="colorRevenue" height={250} />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--dash-muted)' }}>
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment history */}
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--dash-muted)' }}>No payments yet</p>
            ) : (
              <div className="space-y-2">
                {payments.slice(0, 10).map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: 'var(--dash-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--dash-text)' }}>{formatDate(p.createdAt)}</p>
                      <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>Session fee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#7BAE9E]">+{formatCurrency(p.amount)}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--dash-muted)' }}>{p.status.toLowerCase()}</p>
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

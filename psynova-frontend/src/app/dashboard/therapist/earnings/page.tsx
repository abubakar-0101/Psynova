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
  loading: () => <div className="h-[250px] animate-pulse rounded-xl bg-[#F1F0EE]" />,
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
  const { data: revenueData = [] } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const res = await api.get('/api/admin/revenue');
      return res.data.data as { month: string; revenue: number }[];
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['appointments', 'history', 1],
    queryFn: async () => {
      const res = await api.get('/api/appointments/history?page=1&limit=20');
      return res.data;
    },
  });

  const payments = historyData?.appointments?.map((a: any) => a.payment).filter(Boolean) || [];
  const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const monthRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1]?.revenue || 0 : 0;

  return (
    <DashboardShell navItems={therapistNav} title="Earnings">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="text-center p-5">
            <p className="text-3xl font-bold text-[#4A90D9]">{formatCurrency(monthRevenue)}</p>
            <p className="text-xs text-[#6B7280] mt-1">This Month</p>
          </Card>
          <Card className="text-center p-5">
            <p className="text-3xl font-bold text-[#7BAE9E]">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-[#6B7280] mt-1">All Time</p>
          </Card>
          <Card className="text-center p-5">
            <p className="text-3xl font-bold text-[#1A1A2E]">{payments.length}</p>
            <p className="text-xs text-[#6B7280] mt-1">Total Sessions Paid</p>
          </Card>
        </div>

        {/* Revenue chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <RevenueAreaChart data={revenueData} gradientId="colorRevenue" height={250} />
            ) : (
              <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">
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
              <p className="text-center text-[#6B7280] text-sm py-6">No payments yet</p>
            ) : (
              <div className="space-y-2">
                {payments.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F0EE] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{formatDate(p.createdAt)}</p>
                      <p className="text-xs text-[#6B7280]">Session fee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#7BAE9E]">+{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-[#6B7280] capitalize">{p.status.toLowerCase()}</p>
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

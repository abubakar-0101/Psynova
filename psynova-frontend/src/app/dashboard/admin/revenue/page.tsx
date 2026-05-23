'use client';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { adminNav } from '../_nav';

const RevenueAreaChart = dynamic(() => import('@/components/charts/RevenueAreaChart'), {
  ssr: false,
  loading: () => <div className="h-[280px] animate-pulse rounded-xl bg-[#F1F0EE]" />,
});

export default function AdminRevenuePage() {
  const { data: revenueData = [], isLoading } = useQuery({
    queryKey: ['admin', 'revenue-detail'],
    queryFn: async () => {
      const res = await api.get('/api/admin/revenue');
      return res.data.data as { month: string; revenue: number }[];
    },
  });

  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const currentMonth = revenueData[revenueData.length - 1]?.revenue || 0;
  const prevMonth = revenueData[revenueData.length - 2]?.revenue || 0;
  const growth = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;

  return (
    <DashboardShell navItems={adminNav} title="Revenue">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
            { label: 'This Month', value: formatCurrency(currentMonth) },
            { label: 'MoM Growth', value: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-[#1A1A2E]">{s.value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-[#6B7280] text-sm">Loading...</div>
            ) : revenueData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-[#6B7280] text-sm">No revenue data yet</div>
            ) : (
              <RevenueAreaChart data={revenueData} height={280} tooltipLabel="Revenue" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

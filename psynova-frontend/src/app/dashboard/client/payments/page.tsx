'use client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MessageCircle, TrendingUp, Heart, BookOpen, Receipt, CreditCard, CheckCircle } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: Heart },
  { href: '/dashboard/client/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard/client/payments', label: 'Payments', icon: Receipt },
];

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
  PAID: 'success',
  PENDING: 'warning',
  REFUNDED: 'default',
  FAILED: 'destructive',
};

export default function ClientPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: async () => {
      const res = await api.get('/api/appointments/payments');
      return res.data.data;
    },
  });

  const payments: any[] = data?.payments || [];
  const totalSpent = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardShell navItems={clientNav} title="Payments">
      <div className="space-y-5 max-w-3xl">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#4A90D9]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1A1A2E]">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-[#6B7280]">Total spent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#7BAE9E]/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#7BAE9E]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1A1A2E]">
                  {payments.filter((p) => p.status === 'PAID').length}
                </p>
                <p className="text-xs text-[#6B7280]">Sessions paid</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment history */}
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280]">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium mb-1">No payments yet</p>
                <p className="text-xs">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F0EE]">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">
                        Session with Dr. {p.appointment?.therapistUser?.firstName}{' '}
                        {p.appointment?.therapistUser?.lastName}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {formatDate(p.createdAt)} · {p.currency?.toUpperCase() || 'USD'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[p.status] || 'default'} className="text-xs">
                        {p.status}
                      </Badge>
                      <span className="text-sm font-semibold text-[#1A1A2E]">
                        {formatCurrency(p.amount || 0)}
                      </span>
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

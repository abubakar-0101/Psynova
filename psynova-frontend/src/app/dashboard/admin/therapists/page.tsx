'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingUp, Users, Calendar, DollarSign, CheckCircle, Flag, Settings, Star
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/axios';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { adminNav } from '../_nav';

export default function AdminTherapistsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'all-therapists'],
    queryFn: async () => {
      const res = await api.get('/api/admin/therapists');
      return res.data.data;
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

  const therapists: any[] = data?.therapists || [];

  return (
    <DashboardShell navItems={adminNav} title="Therapist Management">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isLoading ? 'Loading...' : `${therapists.length} therapists`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-[#6B7280] text-sm">Loading therapists...</div>
          ) : therapists.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280] text-sm">No therapists found</div>
          ) : (
            <div className="divide-y divide-[#F1F0EE]">
              {therapists.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(t.user.firstName, t.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate">
                      {t.user.firstName} {t.user.lastName}
                    </p>
                    <p className="text-xs text-[#6B7280]">{t.user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {t.specializations?.slice(0, 2).map((s: string) => (
                        <span key={s} className="text-xs bg-[#F1F0EE] text-[#6B7280] rounded-full px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-medium text-[#1A1A2E]">{formatCurrency(t.sessionPrice)}/session</p>
                      <p className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400" />
                        {(Number(t.rating) || 0).toFixed(1)} ({t.reviewCount || 0})
                      </p>
                    </div>
                    {t.isApproved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="sage"
                          isLoading={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(t.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          isLoading={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(t.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingUp, Users, Calendar, DollarSign, CheckCircle, Flag, Settings, AlertTriangle
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/axios';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { adminNav } from '../_nav';

export default function AdminReportsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const res = await api.get('/api/admin/reports');
      return res.data.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/api/admin/reports/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast({ title: 'Report resolved', variant: 'success' });
    },
  });

  const reports: any[] = data?.reports || [];

  return (
    <DashboardShell navItems={adminNav} title="Reports">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {isLoading ? 'Loading...' : `${reports.length} reports`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-[#6B7280] text-sm">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280]">
              <Flag className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reports filed</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F0EE]">
              {reports.map((r) => (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.status === 'RESOLVED' ? 'success' : 'warning'} className="text-xs">
                          {r.status}
                        </Badge>
                        <span className="text-xs text-[#6B7280]">{r.targetType}</span>
                      </div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{r.reason}</p>
                      {r.description && (
                        <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{r.description}</p>
                      )}
                      <p className="text-xs text-[#6B7280] mt-2">
                        Reported by {r.reporter?.firstName} {r.reporter?.lastName} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    {r.status !== 'RESOLVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={resolveMutation.isPending}
                        onClick={() => resolveMutation.mutate(r.id)}
                      >
                        Resolve
                      </Button>
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

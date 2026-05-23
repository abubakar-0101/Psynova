'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Users, Calendar, DollarSign, CheckCircle, Flag, Settings, Search, Shield
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/axios';
import { formatDate, getInitials } from '@/lib/utils';
import { adminNav } from '../_nav';

const roleVariant: Record<string, 'default' | 'warning' | 'success'> = {
  CLIENT: 'default',
  THERAPIST: 'success',
  ADMIN: 'warning',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
  });

  const users: any[] = data?.users || [];

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardShell navItems={adminNav} title="User Management">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-[#F1F0EE] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'CLIENT', 'THERAPIST', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 h-10 rounded-xl text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? 'bg-[#4A90D9] text-white'
                    : 'bg-white border border-[#F1F0EE] text-[#6B7280] hover:border-[#4A90D9]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isLoading ? 'Loading...' : `${filtered.length} users`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">No users found</div>
            ) : (
              <div className="divide-y divide-[#F1F0EE]">
                {filtered.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(u.firstName, u.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-[#6B7280] truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={roleVariant[u.role] || 'default'}>{u.role}</Badge>
                      {u.isEmailVerified && (
                        <Shield className="h-3.5 w-3.5 text-[#7BAE9E]" aria-label="Email verified" />
                      )}
                      <span className="text-xs text-[#6B7280]">{formatDate(u.createdAt)}</span>
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

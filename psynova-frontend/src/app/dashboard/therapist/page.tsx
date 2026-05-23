'use client';
import Link from 'next/link';
import {
  Calendar, DollarSign, MessageCircle, Users, Star,
  TrendingUp, Clock, ArrowRight, CheckCircle, BarChart2, Edit, Settings
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingAppointments } from '@/hooks/useAppointments';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, formatTime, formatCurrency, getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

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

export default function TherapistDashboardPage() {
  const { user } = useAuthStore();
  const { data: upcoming = [] } = useUpcomingAppointments();

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const res = await api.get('/api/admin/revenue'); // therapist-scoped in prod
      return res.data.data;
    },
    retry: 0,
  });

  const todaySessions = upcoming.filter((a) => {
    const d = new Date(a.startTime);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  const isApproved = user?.therapistProfile?.isApproved;

  return (
    <DashboardShell navItems={therapistNav} title="Therapist Dashboard">
      <div className="space-y-6">
        {/* Approval notice */}
        {!isApproved && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Profile under review</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Your profile is being reviewed by our team. You'll receive an email once approved (usually within 24–48 hours).
              </p>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A2E]">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Dr. {user?.lastName}!
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">Here's your practice overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Sessions", value: todaySessions.length, icon: Calendar, color: '#4A90D9' },
            { label: 'Upcoming Sessions', value: upcoming.length, icon: Clock, color: '#7BAE9E' },
            { label: 'Rating', value: `${(Number(user?.therapistProfile?.rating) || 0).toFixed(1)}★`, icon: Star, color: '#f97316' },
            { label: 'Total Reviews', value: user?.therapistProfile?.reviewCount || 0, icon: BarChart2, color: '#4A90D9' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-[#1A1A2E]">{stat.value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Today's Schedule
                <Link href="/dashboard/therapist/calendar" className="text-xs text-[#4A90D9] flex items-center gap-1">
                  Full calendar <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <p className="text-sm text-[#6B7280] py-4 text-center">No sessions scheduled today</p>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3">
                      <div className="text-center min-w-16">
                        <p className="text-xs font-semibold text-[#4A90D9]">{formatTime(apt.startTime)}</p>
                        <p className="text-xs text-[#6B7280]">{formatTime(apt.endTime)}</p>
                      </div>
                      <div className="flex-1 rounded-xl bg-[#4A90D9]/5 border border-[#4A90D9]/20 p-2.5">
                        <p className="text-sm font-medium text-[#1A1A2E]">
                          {apt.client.firstName} {apt.client.lastName}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/session/${apt.id}`}>Join</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Edit Profile', href: '/dashboard/therapist/profile', icon: Edit, desc: 'Update bio, photo, specializations' },
                { label: 'Manage Availability', href: '/dashboard/therapist/calendar', icon: Calendar, desc: 'Set your weekly schedule' },
                { label: 'View Earnings', href: '/dashboard/therapist/earnings', icon: DollarSign, desc: 'Track your revenue' },
                { label: 'Read Reviews', href: '/dashboard/therapist/reviews', icon: Star, desc: 'See what clients say' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#F1F0EE] transition-colors"
                >
                  <action.icon className="h-5 w-5 text-[#4A90D9]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{action.label}</p>
                    <p className="text-xs text-[#6B7280]">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#6B7280] ml-auto" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

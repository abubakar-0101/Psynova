'use client';
import Link from 'next/link';
import { Calendar, MessageCircle, TrendingUp, Clock, ArrowRight, Video } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingAppointments } from '@/hooks/useAppointments';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, formatTime, getInitials } from '@/lib/utils';
import { isBefore, addMinutes } from 'date-fns';
import { BookOpen, Heart, Receipt } from 'lucide-react';
import { StatCardSkeleton } from '@/components/shared/SkeletonCard';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: Heart },
  { href: '/dashboard/client/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard/client/payments', label: 'Payments', icon: Receipt },
];

export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const { data: upcomingAppointments = [], isLoading } = useUpcomingAppointments();

  const nextSession = upcomingAppointments[0];
  const now = new Date();
  const canJoin = nextSession && !isBefore(addMinutes(now, 10), new Date(nextSession.startTime));

  return (
    <DashboardShell navItems={clientNav} title="Client Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--dash-text)' }}>
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--dash-muted)' }}>Here's your wellness overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : [
                { label: 'Upcoming Sessions', value: upcomingAppointments.length, color: 'var(--brand)' },
                { label: 'Total Sessions', value: 0, color: 'var(--success)' },
                { label: 'Days Tracked', value: 0, color: 'var(--brand)' },
                { label: 'Journal Entries', value: 0, color: 'var(--success)' },
              ].map((stat) => (
                <Card key={stat.label} className="text-center">
                  <CardContent className="pt-6">
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--dash-muted)' }}>{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Next session */}
        {nextSession && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Next Session</span>
                <Badge variant="success">Confirmed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-white bg-brand-gradient">
                    {getInitials(nextSession.therapistUser.firstName, nextSession.therapistUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--dash-text)' }}>
                    {nextSession.therapistUser.firstName} {nextSession.therapistUser.lastName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--dash-muted)' }}>
                    <Clock className="inline h-3.5 w-3.5 mr-1" />
                    {formatDate(nextSession.startTime)} at {formatTime(nextSession.startTime)}
                  </p>
                </div>
                {nextSession.meetingRoomId && canJoin && (
                  <Button size="sm" className="gap-2" asChild>
                    <Link href={`/session/${nextSession.id}`}>
                      <Video className="h-4 w-4" /> Join
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Find a Therapist', href: '/search', icon: '🔍', desc: 'Browse & book sessions' },
            { label: "Log Today's Mood", href: '/dashboard/client/mood', icon: '😊', desc: 'Track your wellbeing' },
            { label: 'Write in Journal', href: '/dashboard/client/journal', icon: '📝', desc: 'Reflect on your journey' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border p-5 hover:shadow-md transition-all group"
              style={{
                borderColor: 'var(--dash-border)',
                background: 'var(--dash-surface)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--dash-border)';
              }}
            >
              <span className="text-3xl mb-3 block">{action.icon}</span>
              <p className="font-semibold group-hover:text-[#4A90D9] transition-colors" style={{ color: 'var(--dash-text)' }}>
                {action.label}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--dash-muted)' }}>{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Upcoming list */}
        {upcomingAppointments.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Upcoming Sessions
                <Link href="/dashboard/client/sessions" className="text-xs text-primary flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--dash-border)' }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs text-white bg-brand-gradient">
                      {getInitials(apt.therapistUser.firstName, apt.therapistUser.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--dash-text)' }}>
                      {apt.therapistUser.firstName} {apt.therapistUser.lastName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                      {formatDate(apt.startTime)} · {formatTime(apt.startTime)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">Confirmed</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

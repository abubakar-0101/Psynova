'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Video, X, Star } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingAppointments, useAppointmentHistory, useCancelAppointment } from '@/hooks/useAppointments';
import { toast } from '@/components/ui/toaster';
import { formatDate, formatTime, getInitials, formatCurrency } from '@/lib/utils';
import { TrendingUp, MessageCircle, Heart, BookOpen, Receipt } from 'lucide-react';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: Heart },
  { href: '/dashboard/client/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard/client/payments', label: 'Payments', icon: Receipt },
];

const statusColors: Record<string, string> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

export default function ClientSessionsPage() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const { data: upcoming = [], isLoading: loadingUpcoming } = useUpcomingAppointments();
  const { data: historyData, isLoading: loadingHistory } = useAppointmentHistory();
  const cancelMutation = useCancelAppointment();

  const history = historyData?.appointments || [];

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    try {
      await cancelMutation.mutateAsync({ id });
      toast({ title: 'Session cancelled', variant: 'success' });
    } catch {
      toast({ title: 'Cancellation failed', variant: 'destructive' });
    }
  };

  const AppointmentCard = ({ apt }: { apt: any }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#F1F0EE] bg-white hover:shadow-sm transition-shadow">
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarFallback>
          {getInitials(apt.therapistUser.firstName, apt.therapistUser.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1A2E]">
          {apt.therapistUser.firstName} {apt.therapistUser.lastName}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(apt.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatTime(apt.startTime)}
          </span>
          <span>{formatCurrency(apt.therapistProfile.sessionPrice)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={(statusColors[apt.status] as any) || 'secondary'} className="text-xs capitalize">
          {apt.status.toLowerCase()}
        </Badge>

        {apt.status === 'CONFIRMED' && (
          <Button size="sm" variant="default" className="gap-1" asChild>
            <Link href={`/session/${apt.id}`}><Video className="h-3 w-3" /> Join</Link>
          </Button>
        )}

        {apt.status === 'COMPLETED' && !apt.review && (
          <Button size="sm" variant="outline" className="gap-1">
            <Star className="h-3 w-3" /> Review
          </Button>
        )}

        {['CONFIRMED', 'PENDING'].includes(apt.status) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-[#E85D60] hover:text-[#E85D60] hover:bg-red-50 gap-1"
            onClick={() => handleCancel(apt.id)}
            isLoading={cancelMutation.isPending}
          >
            <X className="h-3 w-3" /> Cancel
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DashboardShell navItems={clientNav} title="My Sessions">
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 w-fit rounded-xl bg-[#F1F0EE] p-1">
          {(['upcoming', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#6B7280]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'upcoming' ? (
          <div className="space-y-3">
            {loadingUpcoming ? (
              <p className="text-[#6B7280] text-sm">Loading...</p>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280]">
                <p className="font-medium mb-2">No upcoming sessions</p>
                <Button asChild><Link href="/search">Find a Therapist</Link></Button>
              </div>
            ) : (
              upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loadingHistory ? (
              <p className="text-[#6B7280] text-sm">Loading...</p>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280]">
                <p className="font-medium">No past sessions</p>
              </div>
            ) : (
              history.map((apt: any) => <AppointmentCard key={apt.id} apt={apt} />)
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

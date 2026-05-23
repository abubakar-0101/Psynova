'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, DollarSign, MessageCircle, Users, Star,
  TrendingUp, Edit, Settings, Mail
} from 'lucide-react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/axios';
import { formatDate, getInitials } from '@/lib/utils';

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

export default function TherapistClientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['therapist', 'clients'],
    queryFn: async () => {
      const res = await api.get('/api/appointments/my-clients');
      return res.data.data;
    },
  });

  const clients: any[] = data?.clients || [];

  return (
    <DashboardShell navItems={therapistNav} title="My Clients">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isLoading ? 'Loading...' : `${clients.length} clients`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-[#6B7280] text-sm">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280]">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium mb-1">No clients yet</p>
              <p className="text-xs">Clients will appear here once you have confirmed appointments</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F0EE]">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="text-sm">
                      {getInitials(client.firstName, client.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E]">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-[#6B7280]">{client.email}</p>
                    {client.lastSession && (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Last session: {formatDate(client.lastSession)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-[#F1F0EE] text-[#6B7280] rounded-full px-2.5 py-1">
                      {client.sessionCount || 0} sessions
                    </span>
                    <Button size="sm" variant="outline" asChild className="gap-1">
                      <Link href={`/messages?userId=${client.id}`}>
                        <MessageCircle className="h-3.5 w-3.5" /> Message
                      </Link>
                    </Button>
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

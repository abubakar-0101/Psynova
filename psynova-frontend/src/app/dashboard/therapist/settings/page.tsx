'use client';
import { useForm } from 'react-hook-form';
import {
  Calendar, DollarSign, MessageCircle, Users, Star,
  TrendingUp, Edit, Settings, Bell, Lock
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/toaster';

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

export default function TherapistSettingsPage() {
  const { user } = useAuthStore();

  const inputClass = "flex h-10 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]";

  return (
    <DashboardShell navItems={therapistNav} title="Settings">
      <div className="max-w-xl space-y-5">
        {/* Account info */}
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">First Name</label>
                <input className={inputClass} defaultValue={user?.firstName} readOnly />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Last Name</label>
                <input className={inputClass} defaultValue={user?.lastName} readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Email</label>
              <input className={inputClass} defaultValue={user?.email} readOnly />
            </div>
            <p className="text-xs text-[#6B7280]">To update account details, contact support.</p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'New booking requests', desc: 'Get notified when clients book sessions' },
              { label: 'Session reminders', desc: '24 hours before each session' },
              { label: 'Review received', desc: 'When a client leaves a review' },
              { label: 'Payment received', desc: 'When session payment is processed' },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">{item.label}</p>
                  <p className="text-xs text-[#6B7280]">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#4A90D9]" />
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Current Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">New Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Confirm New Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" />
            </div>
            <Button onClick={() => toast({ title: 'Password updated', variant: 'success' })}>
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

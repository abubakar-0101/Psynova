'use client';
import {
  TrendingUp, Users, Calendar, DollarSign, CheckCircle, Flag, Settings
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminNav } from '../_nav';

export default function AdminSettingsPage() {
  const inputClass = "flex h-10 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]";

  return (
    <DashboardShell navItems={adminNav} title="Platform Settings">
      <div className="max-w-2xl space-y-5">
        <Card>
          <CardHeader><CardTitle>Platform Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Platform Commission (%)</label>
              <input type="number" defaultValue={15} className={inputClass} />
              <p className="text-xs text-[#6B7280] mt-1">Percentage taken from each session payment</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Therapist Approval Mode</label>
              <select className={inputClass}>
                <option>Manual Review</option>
                <option>Auto Approve</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Session Reminder (hours before)</label>
              <input type="number" defaultValue={24} className={inputClass} />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
              <div>
                <p className="text-sm font-medium text-red-800">Clear all sessions</p>
                <p className="text-xs text-red-600">Permanently delete all appointment records</p>
              </div>
              <Button variant="destructive" size="sm">Clear</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

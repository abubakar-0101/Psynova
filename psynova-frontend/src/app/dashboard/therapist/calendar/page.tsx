'use client';
import { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, MessageCircle, Users, Star, TrendingUp, Edit, Settings } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyAvailability, useAddAvailabilitySlot, useRemoveAvailabilitySlot } from '@/hooks/useTherapists';
import { dayOfWeekToLabel } from '@/lib/utils';
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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TherapistCalendarPage() {
  const { data: slots = [], isLoading } = useMyAvailability();
  const addSlot = useAddAvailabilitySlot();
  const removeSlot = useRemoveAvailabilitySlot();

  const [formDay, setFormDay] = useState(1);
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (formEnd <= formStart) {
      toast({ title: 'End time must be after start time', variant: 'destructive' });
      return;
    }
    try {
      await addSlot.mutateAsync({
        dayOfWeek: formDay,
        startTime: formStart,
        endTime: formEnd,
        isRecurring: true,
      });
      toast({ title: 'Slot added!', variant: 'success' });
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to add slot', variant: 'destructive' });
    }
  };

  const grouped = slots.reduce((acc: Record<string, typeof slots>, slot) => {
    const day = dayOfWeekToLabel(slot.dayOfWeek);
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <DashboardShell navItems={therapistNav} title="Availability Calendar">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Weekly Availability</h2>
            <p className="text-sm text-[#6B7280]">Set your recurring weekly schedule</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Slot
          </Button>
        </div>

        {/* Add slot form */}
        {showForm && (
          <Card className="border-[#4A90D9]/30">
            <CardContent className="pt-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#F1F0EE] px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  >
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Start</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#F1F0EE] px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">End</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#F1F0EE] px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="flex-1" isLoading={addSlot.isPending} onClick={handleAdd}>Add Slot</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slots by day */}
        <Card>
          <CardContent className="pt-5">
            {isLoading ? (
              <p className="text-[#6B7280] text-sm">Loading...</p>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No availability slots</p>
                <p className="text-sm">Add your first slot to start accepting bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).sort(([a], [b]) => DAYS.indexOf(a) - DAYS.indexOf(b)).map(([day, daySlots]) => (
                  <div key={day}>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{day}</p>
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-xl border border-[#F1F0EE] bg-[#FAFAF9] px-4 py-2.5"
                        >
                          <span className="text-sm font-medium text-[#1A1A2E]">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <div className="flex items-center gap-2">
                            {slot.isBooked && (
                              <span className="text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Booked</span>
                            )}
                            <button
                              onClick={() => removeSlot.mutate(slot.id)}
                              className="p-1.5 text-[#6B7280] hover:text-[#E85D60] transition-colors rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
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

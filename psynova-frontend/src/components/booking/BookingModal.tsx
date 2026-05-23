'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { format, addHours, startOfDay, addDays, getDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TherapistProfile, AvailabilitySlot } from '@/types';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useTherapistAvailability } from '@/hooks/useTherapists';
import { formatCurrency, getInitials, dayOfWeekToLabel } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface BookingModalProps {
  therapist: TherapistProfile;
  onClose: () => void;
}

export function BookingModal({ therapist, onClose }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const { data: slots } = useTherapistAvailability(therapist.id);
  const createAppointment = useCreateAppointment();

  const fullName = `${therapist.user.firstName} ${therapist.user.lastName}`;

  const getNextOccurrence = (dayOfWeek: number) => {
    const today = new Date();
    const current = getDay(today);
    const diff = (dayOfWeek - current + 7) % 7 || 7;
    return addDays(startOfDay(today), diff);
  };

  const handleBook = async () => {
    if (!selectedSlot || !selectedDate) return;

    const [startH, startM] = selectedSlot.startTime.split(':').map(Number);
    const [endH, endM] = selectedSlot.endTime.split(':').map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endH, endM, 0, 0);

    try {
      const result = await createAppointment.mutateAsync({
        therapistId: therapist.userId,
        slotId: selectedSlot.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      toast({
        title: 'Booking failed',
        description: err?.response?.data?.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#F1F0EE]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={therapist.photoUrl} />
                <AvatarFallback className="text-sm">
                  {getInitials(therapist.user.firstName, therapist.user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[#1A1A2E]">{fullName}</p>
                <p className="text-xs text-[#6B7280]">{formatCurrency(therapist.sessionPrice)} / session</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F1F0EE] rounded-xl transition-colors">
              <X className="h-5 w-5 text-[#6B7280]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' ? (
              <>
                <h3 className="font-semibold text-[#1A1A2E] mb-4">Select a time slot</h3>

                {slots && slots.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {Object.entries(
                      slots.reduce((acc, slot) => {
                        const day = dayOfWeekToLabel(slot.dayOfWeek);
                        if (!acc[day]) acc[day] = [];
                        acc[day].push(slot);
                        return acc;
                      }, {} as Record<string, AvailabilitySlot[]>),
                    ).map(([day, daySlots]) => (
                      <div key={day}>
                        <p className="text-xs font-medium text-[#6B7280] mb-2">
                          {day} · {format(getNextOccurrence(daySlots[0].dayOfWeek), 'MMM d')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setSelectedDate(getNextOccurrence(slot.dayOfWeek));
                              }}
                              className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'bg-[#4A90D9] text-white shadow-md'
                                  : 'border border-[#F1F0EE] text-[#6B7280] hover:border-[#4A90D9] hover:text-[#4A90D9]'
                              }`}
                            >
                              {slot.startTime} – {slot.endTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#6B7280] text-sm">
                    No availability slots set. Please check back later.
                  </div>
                )}

                <div className="mt-4">
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                    Notes for therapist (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What would you like to discuss?"
                    rows={3}
                    className="w-full rounded-xl border border-[#F1F0EE] px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] resize-none"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1A1A2E]">Confirm your booking</h3>

                <div className="rounded-2xl bg-[#FAFAF9] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#4A90D9]" />
                    <span className="text-[#1A1A2E]">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#4A90D9]" />
                    <span className="text-[#1A1A2E]">
                      {selectedSlot?.startTime} – {selectedSlot?.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-[#4A90D9]" />
                    <span className="text-[#1A1A2E]">{formatCurrency(therapist.sessionPrice)} — paid via Stripe</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#4A90D9]/20 bg-[#4A90D9]/5 p-3 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#4A90D9] mt-0.5" />
                  <p className="text-xs text-[#4A90D9]">
                    Free cancellation 24+ hours before session. 50% refund within 24 hours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            {step === 'select' ? (
              <>
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={!selectedSlot}
                  onClick={() => setStep('confirm')}
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Back</Button>
                <Button
                  className="flex-1 gap-2"
                  isLoading={createAppointment.isPending}
                  onClick={handleBook}
                >
                  <CreditCard className="h-4 w-4" /> Pay & Book
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

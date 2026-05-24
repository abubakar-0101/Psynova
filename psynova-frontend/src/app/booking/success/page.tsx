'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { formatDate, formatTime } from '@/lib/utils';

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingSuccessInner />
    </Suspense>
  );
}

function BookingSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) router.replace('/dashboard/client');
  }, [sessionId, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['booking-success', sessionId],
    queryFn: async () => {
      const res = await api.get(`/api/appointments/by-session/${sessionId}`);
      return res.data.data;
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1500,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#7BAE9E]/15 mb-6">
          <CheckCircle className="h-10 w-10 text-[#7BAE9E]" />
        </div>

        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Booking Confirmed!</h1>
        <p className="text-[#6B7280] mb-8">
          Your session has been booked and payment processed. You'll receive a confirmation email shortly.
        </p>

        {data && (
          <div className="bg-white rounded-2xl border border-[#F1F0EE] p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#4A90D9]/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#4A90D9]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A2E]">Session Details</p>
                <p className="text-xs text-[#6B7280]">Booking #{data.id?.slice(-8)}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Therapist</span>
                <span className="font-medium text-[#1A1A2E]">
                  Dr. {data.therapistUser?.firstName} {data.therapistUser?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Date</span>
                <span className="font-medium text-[#1A1A2E]">{formatDate(data.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Time</span>
                <span className="font-medium text-[#1A1A2E]">
                  {formatTime(data.startTime)} – {formatTime(data.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Duration</span>
                <span className="font-medium text-[#1A1A2E]">
                  {data.startTime && data.endTime
                    ? `${Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 60000)} minutes`
                    : '50 minutes'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/dashboard/client/sessions">
              View My Sessions <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/search">Book Another</Link>
          </Button>
        </div>

        <p className="text-xs text-[#6B7280] mt-6">
          A confirmation email has been sent to your registered email address.
          Join your session from the client dashboard 10 minutes before start time.
        </p>
      </div>
    </div>
  );
}

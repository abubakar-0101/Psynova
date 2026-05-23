'use client';
import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, Globe, Clock, Star, MapPin, Calendar,
  MessageCircle, Video, ArrowLeft, Briefcase
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shared/StarRating';
import { Skeleton } from '@/components/shared/SkeletonCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { useTherapist } from '@/hooks/useTherapists';
import { useAuthStore } from '@/store/auth.store';
import { getInitials, formatCurrency, dayOfWeekToLabel } from '@/lib/utils';

export default function TherapistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: therapist, isLoading } = useTherapist(id);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'about' | 'availability' | 'reviews'>('about');
  const [bookingOpen, setBookingOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="pt-20 max-w-5xl mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#1A1A2E] mb-2">Therapist not found</p>
          <Button asChild variant="outline"><Link href="/search">Back to Search</Link></Button>
        </div>
      </div>
    );
  }

  const firstName = therapist.user?.firstName ?? '';
  const lastName = therapist.user?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Therapist';
  const languages = therapist.languages ?? [];
  const specializations = therapist.specializations ?? [];
  const sessionTypes = therapist.sessionTypes ?? [];
  const reviews = therapist.reviews ?? [];
  const groupedSlots = (therapist.availabilitySlots ?? []).reduce((acc, slot) => {
    const day = dayOfWeekToLabel(slot.dayOfWeek);
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, NonNullable<typeof therapist.availabilitySlots>>);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="pt-20">
        {/* Back button */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          {/* Hero */}
          <div className="rounded-3xl bg-gradient-to-br from-[#4A90D9]/10 to-[#7BAE9E]/10 p-6 sm:p-8 mb-6 border border-white/50">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative flex-shrink-0">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={therapist.photoUrl} alt={fullName} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
                {therapist.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">{fullName}</h1>
                  {therapist.isApproved && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                <StarRating rating={therapist.rating} showValue reviewCount={therapist.reviewCount} />

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {therapist.yearsExperience} years experience
                  </span>
                  {languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> {languages.join(', ')}
                    </span>
                  )}
                  {therapist.timezone && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {therapist.timezone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {specializations.map((spec) => (
                    <Badge key={spec} variant="sage">{spec}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-1 rounded-2xl bg-[#F1F0EE] p-1 mb-6">
                {(['about', 'availability', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-all ${
                      activeTab === tab ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#6B7280]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white border border-[#F1F0EE] p-6">
                    <h2 className="text-lg font-semibold text-[#1A1A2E] mb-3">About</h2>
                    <p className="text-[#6B7280] leading-relaxed">
                      {therapist.bio || 'This therapist has not added a bio yet.'}
                    </p>
                  </div>

                  {therapist.education && Array.isArray(therapist.education) && therapist.education.length > 0 && (
                    <div className="rounded-2xl bg-white border border-[#F1F0EE] p-6">
                      <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Education</h2>
                      <div className="space-y-3">
                        {(therapist.education as any[]).map((edu, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="h-2 w-2 rounded-full bg-[#4A90D9] mt-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-[#1A1A2E]">{edu.degree}</p>
                              <p className="text-sm text-[#6B7280]">{edu.institution} · {edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sessionTypes.length > 0 && (
                    <div className="rounded-2xl bg-white border border-[#F1F0EE] p-6">
                      <h2 className="text-lg font-semibold text-[#1A1A2E] mb-3">Session Types</h2>
                      <div className="flex gap-2">
                        {sessionTypes.map((type) => (
                          <Badge key={type} variant="outline">
                            {type === 'ONLINE' ? '💻 Online' : type === 'IN_PERSON' ? '🏢 In-Person' : '📱 Both'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="rounded-2xl bg-white border border-[#F1F0EE] p-6">
                  <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Weekly Availability</h2>
                  {groupedSlots && Object.keys(groupedSlots).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedSlots || {}).map(([day, slots]) => (
                        <div key={day} className="flex items-center gap-4">
                          <span className="w-24 text-sm font-medium text-[#1A1A2E]">{day}</span>
                          <div className="flex flex-wrap gap-2">
                            {(slots || []).map((slot: any) => (
                              <button
                                key={slot.id}
                                onClick={() => user?.role === 'CLIENT' && setBookingOpen(true)}
                                className="rounded-xl border border-[#4A90D9]/30 bg-[#4A90D9]/5 px-3 py-1.5 text-xs font-medium text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-colors"
                              >
                                {slot.startTime} – {slot.endTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6B7280] text-sm">No availability slots set yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review.id} className="rounded-2xl bg-white border border-[#F1F0EE] p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(review.client?.firstName ?? '', review.client?.lastName ?? '')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-[#1A1A2E]">
                              {review.client?.firstName ?? 'Anonymous'} {review.client?.lastName?.[0] ?? ''}.
                            </span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[#6B7280] leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-white border border-[#F1F0EE] p-8 text-center text-[#6B7280]">
                      No reviews yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl bg-white border border-[#F1F0EE] p-6">
                <div className="text-center mb-5">
                  <p className="text-3xl font-bold text-[#1A1A2E]">
                    {formatCurrency(therapist.sessionPrice)}
                  </p>
                  <p className="text-sm text-[#6B7280]">per session</p>
                </div>

                {user?.role === 'CLIENT' ? (
                  <Button className="w-full mb-3 gap-2" onClick={() => setBookingOpen(true)}>
                    <Calendar className="h-4 w-4" /> Book Session
                  </Button>
                ) : !user ? (
                  <Button className="w-full mb-3" asChild>
                    <Link href="/register">Sign Up to Book</Link>
                  </Button>
                ) : null}

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Video className="h-4 w-4" /> Online video session
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <MessageCircle className="h-4 w-4" /> Secure messaging
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle className="h-4 w-4 text-[#7BAE9E]" /> License verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {bookingOpen && therapist && (
        <BookingModal
          therapist={therapist}
          onClose={() => setBookingOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}

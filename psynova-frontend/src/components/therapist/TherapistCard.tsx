'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TherapistProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shared/StarRating';
import { formatCurrency, getInitials } from '@/lib/utils';

interface TherapistCardProps {
  therapist: TherapistProfile;
}

export function TherapistCard({ therapist }: TherapistCardProps) {
  const fullName = `${therapist.user.firstName} ${therapist.user.lastName}`;
  const topSpecs = therapist.specializations?.slice(0, 3) ?? [];
  const nextSlot = therapist.availabilitySlots?.[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col h-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition-all duration-200 hover:border-[var(--brand-accent)]/30 hover:shadow-[0_20px_60px_-20px_rgba(99,102,241,0.25)]"
    >
      {/* Gradient halo on hover */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-brand-gradient opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300" />

      <div className="flex-1 flex flex-col">
        {/* Avatar + meta */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {therapist.photoUrl ? (
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-1 ring-[var(--border-subtle)]">
                <Image
                  src={therapist.photoUrl}
                  alt={fullName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(therapist.user.firstName, therapist.user.lastName)}
              </div>
            )}
            {therapist.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[var(--success)] border-2 border-[var(--surface)]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-[var(--fg)] truncate">{fullName}</h3>
              {therapist.isApproved && (
                <CheckCircle className="h-4 w-4 text-[var(--brand)] flex-shrink-0" />
              )}
            </div>
            <StarRating
              rating={therapist.rating}
              size="sm"
              showValue
              reviewCount={therapist.reviewCount}
            />
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-fg)]">
              <span>{therapist.yearsExperience} yrs exp</span>
              {therapist.languages?.[0] && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {therapist.languages[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {topSpecs.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-[var(--subtle)] px-2.5 py-1 text-xs font-medium text-[var(--fg)]"
            >
              {spec}
            </span>
          ))}
          {(therapist.specializations?.length ?? 0) > 3 && (
            <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--muted-fg)]">
              +{(therapist.specializations?.length ?? 0) - 3}
            </span>
          )}
        </div>
      </div>

      {/* Price + slot */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-xs text-[var(--muted-fg)]">From</p>
          <p className="text-lg font-semibold text-[var(--fg)]">
            {formatCurrency(therapist.sessionPrice)}
            <span className="text-xs text-[var(--muted-fg)] font-normal"> / session</span>
          </p>
        </div>
        {nextSlot && (
          <div className="text-right">
            <p className="text-xs text-[var(--muted-fg)]">Next slot</p>
            <p className="text-xs font-medium text-[var(--fg)] flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextSlot.dayOfWeek]}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="glass" size="sm" className="flex-1" asChild>
          <Link href={`/therapists/${therapist.id}`}>View</Link>
        </Button>
        <Button variant="brand" size="sm" className="flex-1 gap-1" asChild>
          <Link href={`/therapists/${therapist.id}#book`}>
            Book <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

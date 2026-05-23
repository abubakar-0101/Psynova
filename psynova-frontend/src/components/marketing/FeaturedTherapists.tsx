'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { TherapistCardSkeleton } from '@/components/shared/SkeletonCard';
import { TherapistProfile } from '@/types';

export function FeaturedTherapists() {
  const { data, isLoading } = useQuery({
    queryKey: ['therapists', 'featured'],
    queryFn: async () => {
      const res = await api.get('/api/therapists?limit=4&page=1');
      return res.data.therapists as TherapistProfile[];
    },
  });

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)] font-semibold mb-3">
              Featured
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)] mb-2">
              Therapists ready to <span className="text-brand-gradient font-medium">help today</span>
            </h2>
            <p className="text-[var(--muted-fg)]">Highly-rated, verified professionals</p>
          </div>
          <Link
            href="/search"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fg)] hover:text-[var(--brand)] transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <TherapistCardSkeleton key={i} />)
            : (data || []).map((therapist, i) => (
                <motion.div
                  key={therapist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <TherapistCard therapist={therapist} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

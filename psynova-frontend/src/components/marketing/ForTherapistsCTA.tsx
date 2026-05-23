import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Free profile listing — no upfront costs',
  'Keep 90% of every session fee',
  'Flexible scheduling on your terms',
  'Secure video sessions, no extra software',
  'Automatic payment processing',
  'Client messaging & session notes built in',
];

export function ForTherapistsCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0B0B14] via-[#1a1538] to-[#2d1b4e] p-10 sm:p-14">
          {/* Mesh accents */}
          <div
            className="absolute top-0 right-0 h-96 w-96 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, var(--brand-to), transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, var(--brand-from), transparent 70%)' }}
          />

          <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-block rounded-full border border-white/15 bg-white/10 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-white/90 mb-5">
                For therapists
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-light tracking-tight text-white mb-5 leading-[1.1]">
                Grow your practice.
                <br />
                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#a5b4fc] to-[#f9a8d4]">
                  Help more people.
                </span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg mb-8 leading-relaxed max-w-md">
                Join 500+ licensed therapists. We handle scheduling, payments, and client matching
                so you can focus on what you do best.
              </p>
              <Button size="lg" variant="brand" asChild className="rounded-xl">
                <Link href="/register?role=THERAPIST">
                  Apply as a therapist <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur p-4"
                >
                  <CheckCircle className="h-5 w-5 text-[#a5b4fc] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/85 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

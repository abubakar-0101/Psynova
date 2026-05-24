'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Users, Flame, Moon, Focus } from 'lucide-react';

const specializations = [
  { name: 'Anxiety', icon: Zap },
  { name: 'Depression', icon: Moon },
  { name: 'Trauma & PTSD', icon: Flame },
  { name: 'Couples Therapy', icon: Heart },
  { name: 'Family Issues', icon: Users },
  { name: 'ADHD', icon: Focus },
  { name: 'Self-Esteem', icon: Brain },
];

export function SpecializationsGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)] font-semibold mb-3">
            Specializations
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)] mb-3">
            Whatever you're <span className="text-brand-gradient font-medium">working through</span>
          </h2>
          <p className="text-[var(--muted-fg)]">Browse therapists by what they specialize in.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {specializations.map((spec, i) => (
            <motion.div
              key={spec.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/search?specialization=${encodeURIComponent(spec.name)}`}
                className="group relative flex flex-col items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition-all duration-200 hover:border-[var(--brand-accent)]/30 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 -z-10 bg-brand-gradient opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300" />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--subtle)] text-[var(--brand)] group-hover:bg-brand-gradient group-hover:text-white transition-all duration-200">
                  <spec.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[var(--fg)]">{spec.name}</span>
                  <p className="text-xs text-[var(--muted-fg)] mt-0.5">Find specialists →</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, Calendar, Video } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search & match',
    description:
      'Browse licensed therapists by specialization, language, price, and availability. Read profiles, reviews, and pick who feels right.',
  },
  {
    icon: Calendar,
    title: 'Book in seconds',
    description:
      'Pick a time that works, pay securely with Stripe, and get an instant confirmation. Reschedule or cancel with one click.',
  },
  {
    icon: Video,
    title: 'Heal at your pace',
    description:
      'Join your video session with one click, message your therapist between sessions, and track your progress over time.',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-24 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-xs uppercase tracking-[0.2em] text-[var(--brand)] font-semibold mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl font-light tracking-tight text-[var(--fg)] mb-4"
          >
            From <span className="text-brand-gradient font-medium">first message</span> to first session
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--muted-fg)] text-lg"
          >
            Three steps to get the support you've been thinking about.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-7 hover:border-[var(--brand-accent)]/30 transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute top-7 right-7 font-display text-5xl font-light text-[var(--border-subtle)] group-hover:text-brand-gradient transition-colors">
                0{i + 1}
              </div>
              {/* Icon */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_8px_30px_-6px_rgba(99,102,241,0.4)] mb-6">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-medium text-[var(--fg)] mb-2.5">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

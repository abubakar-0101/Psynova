'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Calendar, CreditCard, MessageCircle,
  Shield, Sparkles, Users, TrendingUp, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroStats = [
  { label: 'Active therapists', value: '500+' },
  { label: 'Average earnings', value: '$8.4K/mo' },
  { label: 'Client retention', value: '78%' },
  { label: 'Setup time', value: '< 15 min' },
];

const benefits = [
  {
    icon: CreditCard,
    title: 'Keep 90% of every session',
    body: 'We take a flat 10% — no hidden fees, no per-payment surcharges, no monthly subscription.',
  },
  {
    icon: Calendar,
    title: 'Own your schedule',
    body: 'Set weekly availability in minutes. Clients book the slots you make open — never your downtime.',
  },
  {
    icon: MessageCircle,
    title: 'Secure messaging built-in',
    body: 'HIPAA-aligned chat with file attachments. No more chasing emails or juggling SMS.',
  },
  {
    icon: Shield,
    title: 'Licensed-only marketplace',
    body: 'We verify every license. Clients trust the platform, so they trust you faster.',
  },
  {
    icon: Sparkles,
    title: 'Get matched with the right clients',
    body: 'Our recommendation engine sends clients to therapists who fit their needs — not the highest bidder.',
  },
  {
    icon: TrendingUp,
    title: 'Grow at your pace',
    body: 'Part-time, full-time, or supplementing a private practice. You decide how many clients to take on.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Apply in minutes',
    body: 'Tell us about your practice, upload your license, and we review within 48 hours.',
  },
  {
    n: '02',
    title: 'Build your profile',
    body: 'Add your bio, specializations, photo, and rates. Set your weekly availability.',
  },
  {
    n: '03',
    title: 'Get matched & paid',
    body: 'Clients book directly. Payments hit your account weekly via Stripe — no chasing invoices.',
  },
];

const stories = [
  {
    name: 'Dr. Maya Chen, LMFT',
    location: 'San Francisco, CA',
    blurb: 'Within 3 months I had a full caseload of clients who actually fit my specialty. The matching is way better than the directories I was paying for.',
    rating: 5,
    sessions: '420 sessions',
  },
  {
    name: 'James Okonkwo, LCSW',
    location: 'Brooklyn, NY',
    blurb: 'I left a group practice to go independent and Psynova made it easy. Scheduling, billing, and notes are all in one place.',
    rating: 5,
    sessions: '680 sessions',
  },
  {
    name: 'Dr. Priya Subramanian',
    location: 'Austin, TX',
    blurb: "The 90/10 split is real. I make more here in 15 hours/week than I did at my old W-2 job working 35.",
    rating: 5,
    sessions: '290 sessions',
  },
];

const faqs = [
  {
    q: 'How does Psynova make money?',
    a: 'We take a flat 10% of each completed session. That covers payment processing, marketing, support, and platform development. No subscription, no per-listing fee.',
  },
  {
    q: 'Do I need to be licensed?',
    a: 'Yes. Psynova is licensed-only. You\'ll upload your license number and we verify it during onboarding. We support LMFTs, LCSWs, LPCs, PsyDs, PhDs, and equivalents.',
  },
  {
    q: 'How fast do I get paid?',
    a: 'Payouts run weekly via Stripe. Once a session is completed, the payment is queued for the next payout cycle. Stripe transfers usually clear within 2 business days.',
  },
  {
    q: 'Can I bring my existing clients?',
    a: 'Absolutely. Many therapists migrate their existing practice to Psynova to consolidate scheduling and billing. You can send your clients a direct booking link.',
  },
  {
    q: 'What about insurance and superbills?',
    a: "We currently support private-pay only. You can issue superbills from your appointment history for clients to submit to their insurers for out-of-network reimbursement.",
  },
  {
    q: 'Can I take time off?',
    a: 'Of course. Block off availability anytime — vacation, sick days, or just protected time. Clients only see open slots, never closed ones.',
  },
];

export default function ForTherapistsPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-[#7BAE9E]/20 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#4A90D9]/15 blur-3xl"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-[#7BAE9E]/15 px-4 py-1.5 text-sm font-medium text-[#7BAE9E] mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              For licensed therapists
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-[#1A1A2E] leading-tight mb-6"
            >
              Run your practice.<br />
              <span className="text-[#4A90D9]">Not the paperwork.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#6B7280] leading-relaxed mb-8"
            >
              Psynova handles scheduling, payments, secure messaging, and client matching — so you can focus on
              showing up for the people in front of you. Keep 90% of every session.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Button size="lg" asChild className="gap-2">
                <Link href="/register?role=THERAPIST">
                  Apply as a therapist <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {heroStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#F1F0EE] bg-white/80 backdrop-blur-sm p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#4A90D9]">{s.value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              Built for the way you actually work
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              We talked to hundreds of therapists before writing a line of code. Every feature exists because
              someone in private practice asked for it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-[#F1F0EE] bg-[#FAFAF9] p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center mb-4">
                  <b.icon className="h-5 w-5 text-[#4A90D9]" />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">{b.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{b.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#FAFAF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              From application to first session in days
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Onboarding is intentionally fast. We verify, you build, clients book.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-[#F1F0EE] bg-white p-7"
              >
                <p className="text-5xl font-bold text-[#4A90D9]/20 mb-3">{s.n}</p>
                <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">Simple, honest pricing</h2>
            <p className="text-[#6B7280]">No subscription. No setup fee. No surprise charges.</p>
          </div>
          <div className="rounded-3xl border-2 border-[#4A90D9] bg-gradient-to-br from-white to-[#4A90D9]/5 p-8 sm:p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#4A90D9] mb-2">Therapist plan</p>
            <p className="text-6xl font-bold text-[#1A1A2E] mb-2">
              10<span className="text-2xl">%</span>
            </p>
            <p className="text-[#6B7280] mb-8">flat fee per completed session</p>

            <div className="grid sm:grid-cols-2 gap-3 text-left mb-8">
              {[
                'Unlimited clients',
                'Unlimited sessions',
                'Secure video sessions',
                'In-app messaging',
                'Automated reminders',
                'Weekly payouts via Stripe',
                'Session notes & history',
                'Profile in matching engine',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#7BAE9E] flex-shrink-0" />
                  <span className="text-[#1A1A2E]">{f}</span>
                </div>
              ))}
            </div>

            <Button size="lg" asChild className="gap-2">
              <Link href="/register?role=THERAPIST">
                Start your application <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-[#6B7280] mt-4">No credit card required to apply.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              Therapists who chose Psynova
            </h2>
            <p className="text-[#6B7280]">Real stories from licensed clinicians on the platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-[#F1F0EE] bg-white p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: s.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#1A1A2E] leading-relaxed mb-4">&ldquo;{s.blurb}&rdquo;</p>
                <div className="pt-4 border-t border-[#F1F0EE]">
                  <p className="text-sm font-semibold text-[#1A1A2E]">{s.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{s.location} · {s.sessions}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">Common questions</h2>
            <p className="text-[#6B7280]">If we missed yours, our team can answer it within 24 hours.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-[#F1F0EE] bg-[#FAFAF9] p-5 open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm sm:text-base font-semibold text-[#1A1A2E] pr-4">{f.q}</span>
                  <span className="text-[#4A90D9] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#6B7280] mb-4">Still have questions?</p>
            <Button variant="outline" asChild>
              <Link href="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1A1A2E] to-[#2d2d4a]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-[#7BAE9E] mb-6">
            <Users className="h-3.5 w-3.5" />
            Join 500+ therapists growing their practice
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Ready to do less admin?
          </h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            We'll review your application within 48 hours and get you set up in a single onboarding call.
          </p>
          <Button size="lg" variant="sage" asChild className="gap-2">
            <Link href="/register?role=THERAPIST">
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

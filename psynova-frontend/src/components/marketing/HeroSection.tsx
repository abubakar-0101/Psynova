'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Trauma', 'Couples', 'Grief', 'Stress', 'ADHD',
];

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-24 pb-16">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 -z-10 bg-brand-mesh" />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Animated orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -left-32 h-[28rem] w-[28rem] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, var(--brand-from), transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/4 -right-32 h-[26rem] w-[26rem] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, var(--brand-to), transparent 70%)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full glass border border-[var(--border-subtle)] px-3.5 py-1.5 text-xs font-medium text-[var(--fg)] mb-7"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-gradient" style={{ color: 'var(--brand-accent)' }} />
              <span className="text-[var(--muted-fg)]">Trusted by 10,000+ people</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted-fg)]" />
              <span>Licensed therapists only</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[var(--fg)] leading-[1.05] mb-6">
              Therapy that
              <br />
              <span className="font-medium text-brand-gradient">actually fits</span>
              <br />
              your life.
            </h1>

            <p className="text-lg text-[var(--muted-fg)] leading-relaxed mb-8 max-w-xl">
              Match with a licensed therapist in minutes. Video sessions, secure messaging, and
              progress tracking — all in one beautifully simple space.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-5">
              <div className="glass rounded-2xl p-1.5 flex gap-1.5 max-w-2xl shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-fg)]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What are you looking for help with?"
                    className="h-12 w-full bg-transparent pl-10 pr-4 text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-none text-sm"
                  />
                </div>
                <Button type="submit" variant="brand" className="h-12 px-5 rounded-xl">
                  Search <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Pill quick-filters */}
            <div className="flex flex-wrap gap-2 mb-9">
              {SPECIALIZATIONS.slice(0, 5).map((spec) => (
                <button
                  key={spec}
                  onClick={() => router.push(`/search?specialization=${spec}`)}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/60 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-[var(--muted-fg)] hover:text-[var(--fg)] hover:border-[var(--brand-accent)]/40 transition-all"
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" variant="brand" asChild className="rounded-xl">
                <Link href="/recommend">
                  Get matched in 60 seconds <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/for-therapists"
                className="text-sm font-medium text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
              >
                For therapists →
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3 text-xs text-[var(--muted-fg)]">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop',
                ].map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-[var(--bg)] object-cover"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 font-medium text-[var(--fg)]">4.9</span>
              </div>
              <span>from 3,200+ reviews</span>
            </div>
          </motion.div>

          {/* Right: Stacked glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative hidden lg:block h-[28rem]"
          >
            {/* Main therapist card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-0 w-[22rem] rounded-3xl glass-strong p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80&auto=format&fit=crop"
                  alt="Dr. Sarah Andrews"
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-[var(--border-subtle)]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--fg)] truncate">Dr. Sarah Andrews</p>
                  <p className="text-xs text-[var(--muted-fg)]">Anxiety · Depression · CBT</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] text-[var(--muted-fg)] ml-1">5.0 · 124</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[var(--subtle)] p-3 mb-4">
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted-fg)] mb-1">
                  Next available
                </p>
                <p className="text-sm font-semibold text-[var(--fg)]">Today · 3:00 PM</p>
              </div>
              <button className="w-full rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-6px_rgba(99,102,241,0.45)] hover:brightness-110 transition-all">
                Book session — $120
              </button>
            </motion.div>

            {/* Floating online indicator */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-0 left-4 rounded-2xl glass-strong px-3.5 py-2.5 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
                </span>
                <p className="text-xs font-medium text-[var(--fg)]">42 therapists online</p>
              </div>
            </motion.div>

            {/* Floating message card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-4 left-0 w-72 rounded-2xl glass-strong p-4 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop"
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <p className="text-xs font-medium text-[var(--fg)]">Dr. Maya Chen</p>
                <span className="ml-auto text-[10px] text-[var(--muted-fg)]">2m</span>
              </div>
              <p className="text-xs text-[var(--muted-fg)] leading-relaxed">
                "Try the breathing exercise before our next session — it'll give us a starting
                point to build on."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

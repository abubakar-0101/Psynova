'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Client',
    content:
      "Psynova changed my life. I found a therapist who truly understands my anxiety, and within 3 sessions I felt measurable improvement. The platform is incredibly easy to use.",
    rating: 5,
    initials: 'SM',
  },
  {
    name: 'James R.',
    role: 'Client',
    content:
      "As someone who struggled to find a Black therapist who specialized in trauma, Psynova's filters were a game-changer. Booked my first session within an hour.",
    rating: 5,
    initials: 'JR',
  },
  {
    name: 'Dr. Emily K.',
    role: 'Therapist on Psynova',
    content:
      "The platform lets me focus on what I love — helping clients. The dashboard is intuitive, payments are automatic, and I've grown my practice 3x in 6 months.",
    rating: 5,
    initials: 'EK',
  },
  {
    name: 'Maya & Tom L.',
    role: 'Couple clients',
    content:
      "We were skeptical about online couples therapy. Our therapist on Psynova was so warm and professional that we forgot we were on a video call.",
    rating: 5,
    initials: 'MT',
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Soft mesh backdrop */}
      <div className="absolute inset-0 -z-10 bg-brand-mesh opacity-30" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)] font-semibold mb-3">
            Real stories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)]">
            What our <span className="text-brand-gradient font-medium">community</span> says
          </h2>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl glass-strong p-8 sm:p-10 text-center"
            >
              <Quote className="h-10 w-10 text-[var(--brand)]/30 mx-auto mb-4" />
              <p className="font-display text-xl sm:text-2xl font-light leading-relaxed text-[var(--fg)] mb-6">
                "{t.content}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-11 w-11 rounded-full bg-brand-gradient flex items-center justify-center text-white font-semibold text-sm">
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--fg)] text-sm">{t.name}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-7">
            <button
              onClick={() =>
                setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
              }
              className="h-9 w-9 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--subtle)] transition-colors text-[var(--fg)] flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? 'w-8 bg-brand-gradient' : 'w-1.5 bg-[var(--border-subtle)]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
              className="h-9 w-9 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--subtle)] transition-colors text-[var(--fg)] flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

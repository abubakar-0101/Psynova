'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'How are therapists verified on Psynova?',
    a: 'Every therapist undergoes a thorough verification process including license validation, background checks, and credential review by our admin team. Approved therapists receive a verified badge on their profile.',
  },
  {
    q: 'How does the video session work?',
    a: 'Sessions use Jitsi Meet — a secure, browser-based video platform. No downloads required. Just click "Join Session" at the scheduled time, and your therapist will be waiting.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Cancel 24+ hours before your session for a full refund. Cancellations within 24 hours receive a 50% refund. No-shows are non-refundable.',
  },
  {
    q: 'Is my data and conversation private?',
    a: 'Absolutely. All messages are encrypted. Session notes are visible only to your therapist. We never share your personal data with third parties, and we are fully HIPAA-conscious.',
  },
  {
    q: 'Can I switch therapists?',
    a: 'Yes, at any time. Your mood tracking, payment history, and profile stay with you regardless of which therapist you work with.',
  },
  {
    q: 'How do I pay for sessions?',
    a: 'Psynova uses Stripe for secure payment processing. We accept all major credit/debit cards. Payment is collected at booking, and receipts are emailed automatically.',
  },
  {
    q: 'Are sessions covered by insurance?',
    a: 'Psynova is a self-pay platform. We provide detailed receipts that you can submit for reimbursement with out-of-network benefits. We recommend checking with your insurance provider.',
  },
  {
    q: 'What types of therapy are available?',
    a: 'We offer a wide range, including CBT, DBT, EMDR, psychodynamic therapy, couples counseling, family therapy, and more. Filter by approach on the search page.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)] font-semibold mb-3">
            FAQ
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)] mb-3">
            Questions, <span className="text-brand-gradient font-medium">answered</span>
          </h2>
          <p className="text-[var(--muted-fg)]">Everything you need to know before getting started.</p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border bg-[var(--surface)] overflow-hidden transition-colors ${
                  isOpen
                    ? 'border-[var(--brand-accent)]/30'
                    : 'border-[var(--border-subtle)] hover:border-[var(--muted-fg)]/30'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-medium text-[var(--fg)] text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isOpen
                        ? 'bg-brand-gradient text-white rotate-45'
                        : 'bg-[var(--subtle)] text-[var(--muted-fg)]'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 text-sm text-[var(--muted-fg)] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

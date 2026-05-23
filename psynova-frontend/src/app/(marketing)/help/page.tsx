'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Calendar, CreditCard, MessageCircle, ShieldCheck,
  UserCog, Video, HelpCircle, ArrowRight, Mail,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
}

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting started', icon: HelpCircle, color: '#4A90D9' },
  { id: 'booking', label: 'Booking & sessions', icon: Calendar, color: '#7BAE9E' },
  { id: 'payments', label: 'Payments & billing', icon: CreditCard, color: '#f97316' },
  { id: 'messaging', label: 'Messaging', icon: MessageCircle, color: '#4A90D9' },
  { id: 'video', label: 'Video sessions', icon: Video, color: '#7BAE9E' },
  { id: 'account', label: 'Account & profile', icon: UserCog, color: '#f97316' },
  { id: 'privacy', label: 'Privacy & safety', icon: ShieldCheck, color: '#4A90D9' },
];

const ARTICLES: Article[] = [
  // Getting started
  {
    id: 'what-is-psynova',
    category: 'getting-started',
    title: 'What is Psynova?',
    body: 'Psynova is a marketplace that connects clients with licensed therapists for online sessions. You can browse therapists, book sessions, message securely, and meet over encrypted video — all in one place.',
  },
  {
    id: 'how-to-sign-up',
    category: 'getting-started',
    title: 'How do I sign up?',
    body: 'Click "Sign Up" in the top right. Choose whether you\'re looking for therapy (Client) or providing it (Therapist). Verify your email, complete your profile, and you\'re ready to go.',
  },
  {
    id: 'find-therapist',
    category: 'getting-started',
    title: 'How do I find the right therapist?',
    body: 'You have two options: browse our full directory at /search with filters for specialization, language, gender, and price — or take our 5-question quiz at /recommend to get personalized matches scored by fit.',
  },
  // Booking
  {
    id: 'how-to-book',
    category: 'booking',
    title: 'How do I book a session?',
    body: 'Open a therapist\'s profile, switch to the Availability tab, and click an open slot. You\'ll see a summary of the time and price, then complete payment via Stripe. Once paid, your session is confirmed and added to your dashboard.',
  },
  {
    id: 'reschedule',
    category: 'booking',
    title: 'Can I reschedule or cancel?',
    body: 'Yes. From your dashboard, open the appointment and click Reschedule or Cancel. Cancellations more than 24 hours before the session are free; within 24 hours, a 50% fee applies. Therapists may waive the fee at their discretion.',
  },
  {
    id: 'session-length',
    category: 'booking',
    title: 'How long are sessions?',
    body: 'Standard sessions are 50 minutes — the industry-standard "therapeutic hour." Some therapists offer 30-minute check-ins or 80-minute extended sessions; check their profile for what they offer.',
  },
  // Payments
  {
    id: 'payment-methods',
    category: 'payments',
    title: 'What payment methods do you accept?',
    body: 'We accept all major credit and debit cards (Visa, Mastercard, AmEx, Discover) plus Apple Pay and Google Pay where supported, all processed securely via Stripe.',
  },
  {
    id: 'receipts',
    category: 'payments',
    title: 'Where can I find my receipts?',
    body: 'Open your client dashboard and go to Payments. Every completed session has a downloadable receipt that you can submit to insurance for out-of-network reimbursement (a superbill format is available on request).',
  },
  {
    id: 'refunds',
    category: 'payments',
    title: 'How do refunds work?',
    body: 'Cancellations more than 24h before the session are refunded in full to your original payment method within 5–10 business days. Disputed sessions are reviewed by our support team within 48 hours.',
  },
  // Messaging
  {
    id: 'when-can-i-message',
    category: 'messaging',
    title: 'When can I message my therapist?',
    body: 'Messaging unlocks automatically after your first confirmed booking. Until then, you can browse therapist profiles but can\'t send messages — this prevents unsolicited outreach and keeps the platform safe.',
  },
  {
    id: 'attachments',
    category: 'messaging',
    title: 'Can I send files in messages?',
    body: 'Yes. You can attach images, PDFs, and short voice notes (up to 10MB). Files are scanned and stored encrypted. Your therapist will see a preview and can download for their records.',
  },
  // Video
  {
    id: 'video-requirements',
    category: 'video',
    title: 'What do I need for a video session?',
    body: 'A modern browser (Chrome, Edge, Safari, or Firefox), a webcam and microphone, and a stable internet connection (1.5 Mbps up/down minimum). You can join from desktop or mobile — no app install required.',
  },
  {
    id: 'join-session',
    category: 'video',
    title: 'How do I join my session?',
    body: 'The "Join" button appears in your dashboard 10 minutes before the session starts. Click it and you\'ll go straight to the encrypted video room — no codes or passwords required.',
  },
  {
    id: 'video-trouble',
    category: 'video',
    title: 'My video isn\'t working — what should I do?',
    body: 'First, refresh the page and check that your browser has camera/mic permission. If issues persist, try a different browser or device. If you still can\'t connect, message your therapist — they can switch to a phone session.',
  },
  // Account
  {
    id: 'change-password',
    category: 'account',
    title: 'How do I change my password?',
    body: 'Go to Dashboard → Settings → Security. You\'ll need to confirm your current password before setting a new one. If you\'ve forgotten it, use the "Forgot password" link on the login page.',
  },
  {
    id: 'delete-account',
    category: 'account',
    title: 'How do I delete my account?',
    body: "Go to Dashboard → Settings → Danger Zone. Account deletion is permanent and removes your profile, messages, and history. We\'ll keep limited records for legal and tax purposes only.",
  },
  // Privacy
  {
    id: 'data-privacy',
    category: 'privacy',
    title: 'Is my data private?',
    body: 'Yes. All messages and session content are end-to-end encrypted in transit and at rest. We follow HIPAA-aligned practices and never sell your data. Read our full Privacy Policy for details.',
  },
  {
    id: 'safety',
    category: 'privacy',
    title: 'What if I feel unsafe in a session?',
    body: 'You can leave any session at any time. To report a therapist, use the Report button on their profile or contact safety@psynova.com. If you\'re in immediate crisis, please call your local emergency line or the Suicide & Crisis Lifeline at 988 (US).',
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchesCategory = !activeCategory || a.category === activeCategory;
      const matchesQuery =
        !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-[#4A90D9]/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-[#6B7280] mb-8">
            Search our help center or browse by category. Most questions are answered within minutes.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="h-14 w-full rounded-2xl border border-[#F1F0EE] bg-white pl-13 pr-5 text-base text-[#1A1A2E] placeholder:text-[#6B7280] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
              style={{ paddingLeft: '3.25rem' }}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280] mb-5">
            Browse by category
          </h2>
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F1F0EE] text-[#6B7280] hover:bg-[#4A90D9]/10'
              }`}
            >
              All topics
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === c.id
                    ? 'bg-[#1A1A2E] text-white'
                    : 'bg-[#F1F0EE] text-[#6B7280] hover:bg-[#4A90D9]/10'
                }`}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Articles */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[#F1F0EE]">
              <HelpCircle className="h-10 w-10 text-[#6B7280] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1A1A2E] mb-1">No articles found</p>
              <p className="text-sm text-[#6B7280] mb-5">
                Try different keywords or browse all topics.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A90D9] hover:underline"
              >
                Contact support <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filtered.map((a) => {
                const cat = CATEGORIES.find((c) => c.id === a.category);
                return (
                  <details
                    key={a.id}
                    className="group rounded-2xl border border-[#F1F0EE] bg-[#FAFAF9] p-5 open:bg-white open:shadow-sm transition-all"
                  >
                    <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {cat && (
                          <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}1A` }}
                          >
                            <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                          </div>
                        )}
                        <span className="text-sm sm:text-base font-semibold text-[#1A1A2E] truncate">
                          {a.title}
                        </span>
                      </div>
                      <span className="text-[#4A90D9] text-xl group-open:rotate-45 transition-transform flex-shrink-0">
                        +
                      </span>
                    </summary>
                    <p className="text-sm text-[#6B7280] mt-3 leading-relaxed pl-12">{a.body}</p>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Crisis banner */}
      <section className="py-12 bg-[#FAFAF9]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-[#E85D60]/30 bg-red-50 p-6">
            <p className="text-base font-semibold text-[#1A1A2E] mb-2">In a crisis right now?</p>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
              Psynova is not designed for emergency situations. If you or someone you know is in immediate
              danger, please contact emergency services.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white border border-[#E85D60]/20 p-3">
                <p className="font-semibold text-[#E85D60]">988 — Suicide & Crisis Lifeline (US)</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Call or text 24/7</p>
              </div>
              <div className="rounded-xl bg-white border border-[#E85D60]/20 p-3">
                <p className="font-semibold text-[#E85D60]">741741 — Crisis Text Line</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Text HOME to get connected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="h-10 w-10 text-[#4A90D9] mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-3">Still need help?</h2>
          <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
            Our support team responds within 24 hours, Monday through Friday.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4A90D9] text-white px-6 py-3 text-sm font-semibold hover:bg-[#3a7ac9] transition-colors"
          >
            Contact support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

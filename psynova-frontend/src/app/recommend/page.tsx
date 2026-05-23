'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { TherapistCardSkeleton } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { TherapistProfile } from '@/types';
import api from '@/lib/axios';

type Answers = {
  concern: string;
  style: string;
  gender: string;
  language: string;
  budget: string;
};

interface Question {
  id: keyof Answers;
  title: string;
  subtitle: string;
  options: { value: string; label: string; emoji?: string; description?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'concern',
    title: "What's on your mind right now?",
    subtitle: 'Pick the area you most want to focus on — you can always change this later.',
    options: [
      { value: 'Anxiety', label: 'Anxiety', emoji: '🌊', description: 'Worry, panic, feeling on edge' },
      { value: 'Depression', label: 'Depression', emoji: '🌫️', description: 'Low mood, loss of interest, fatigue' },
      { value: 'Trauma', label: 'Trauma / PTSD', emoji: '🛡️', description: 'Working through past experiences' },
      { value: 'Relationships', label: 'Relationships', emoji: '💞', description: 'Couples, family, or interpersonal' },
      { value: 'Stress', label: 'Stress & burnout', emoji: '🔥', description: 'Overwhelm at work or in life' },
      { value: 'LGBTQ+', label: 'Identity & LGBTQ+', emoji: '🏳️‍🌈', description: 'Identity, coming out, affirming care' },
      { value: 'Grief', label: 'Grief & loss', emoji: '🕊️', description: 'Processing the loss of someone' },
      { value: 'ADHD', label: 'ADHD & focus', emoji: '⚡', description: 'Attention, motivation, executive function' },
    ],
  },
  {
    id: 'style',
    title: 'What style of therapy feels right?',
    subtitle: "There's no wrong answer — pick the one that sounds like a good fit today.",
    options: [
      { value: 'structured', label: 'Structured & practical', emoji: '🎯', description: 'CBT, goals, homework, skills' },
      { value: 'exploratory', label: 'Open conversation', emoji: '🌿', description: 'Talk-based, exploring feelings' },
      { value: 'mindful', label: 'Mindfulness-based', emoji: '🧘', description: 'Present moment, somatic, calm' },
      { value: 'flexible', label: 'A mix / not sure yet', emoji: '🌀', description: "Let the therapist guide it" },
    ],
  },
  {
    id: 'gender',
    title: 'Do you have a therapist gender preference?',
    subtitle: 'Many people feel more comfortable with someone specific. Totally optional.',
    options: [
      { value: 'FEMALE', label: 'Female therapist', emoji: '👩' },
      { value: 'MALE', label: 'Male therapist', emoji: '👨' },
      { value: 'NON_BINARY', label: 'Non-binary therapist', emoji: '🧑' },
      { value: 'any', label: 'No preference', emoji: '🤝' },
    ],
  },
  {
    id: 'language',
    title: 'In what language would you like to speak?',
    subtitle: 'Therapy works best in a language you feel at home in.',
    options: [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish / Español' },
      { value: 'French', label: 'French / Français' },
      { value: 'Arabic', label: 'Arabic / العربية' },
      { value: 'Mandarin', label: 'Mandarin / 中文' },
      { value: 'Hindi', label: 'Hindi / हिन्दी' },
      { value: 'Portuguese', label: 'Portuguese / Português' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'budget',
    title: "What's a comfortable budget per session?",
    subtitle: 'Sliding scale and lower-cost options are available — we\'ll surface them.',
    options: [
      { value: '0-60',   label: 'Up to $60',    emoji: '💚', description: 'Most affordable options' },
      { value: '60-100', label: '$60 – $100',   emoji: '💙', description: 'Standard rate' },
      { value: '100-150',label: '$100 – $150',  emoji: '💜', description: 'Experienced practitioners' },
      { value: '150-999',label: '$150+',        emoji: '⭐', description: 'Senior specialists' },
    ],
  },
];

// Map concern to canonical specialization names used in search.
const CONCERN_SPECS: Record<string, string[]> = {
  Anxiety: ['Anxiety'],
  Depression: ['Depression'],
  Trauma: ['Trauma', 'Trauma & PTSD', 'PTSD'],
  Relationships: ['Couples', 'Couples Therapy', 'Family Issues', 'Relationships'],
  Stress: ['Stress'],
  'LGBTQ+': ['LGBTQ+'],
  Grief: ['Grief'],
  ADHD: ['ADHD'],
};

function scoreTherapist(t: TherapistProfile, a: Answers): number {
  let score = 0;
  // Specialization (highest weight)
  const wantedSpecs = CONCERN_SPECS[a.concern] || [a.concern];
  if (t.specializations.some((s) => wantedSpecs.some((w) => s.toLowerCase().includes(w.toLowerCase())))) {
    score += 50;
  }
  // Gender match
  if (a.gender !== 'any' && t.gender === a.gender) score += 15;
  else if (a.gender === 'any') score += 5;
  // Language match
  if (a.language !== 'any' && t.languages.some((l) => l.toLowerCase() === a.language.toLowerCase())) {
    score += 15;
  } else if (a.language === 'any') score += 5;
  // Budget (sessionPrice may arrive as a string from Prisma Decimal)
  const price = Number(t.sessionPrice) || 0;
  const [minB, maxB] = a.budget.split('-').map(Number);
  if (price >= minB && price <= maxB) score += 12;
  else if (price < minB) score += 8; // cheaper than budget is fine
  // Rating boost
  score += Math.min(8, Math.round(Number(t.rating) * 1.5));
  // Experience light boost
  score += Math.min(5, Math.floor(t.yearsExperience / 3));

  return score;
}

export default function RecommendPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [matches, setMatches] = useState<{ therapist: TherapistProfile; score: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];
  const progress = Math.round(((step + (matches ? 1 : 0)) / (total + 1)) * 100);

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const next = async () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      await runMatch();
    }
  };

  const runMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const a = answers as Answers;
      const params = new URLSearchParams();
      const wantedSpecs = CONCERN_SPECS[a.concern] || [a.concern];
      params.set('specialization', wantedSpecs[0]);
      if (a.language !== 'any') params.set('language', a.language);
      if (a.gender !== 'any') params.set('gender', a.gender);
      const [, maxB] = a.budget.split('-').map(Number);
      if (maxB) params.set('maxPrice', String(maxB));
      params.set('limit', '24');

      // Primary query
      let res = await api.get(`/api/therapists?${params.toString()}`);
      let therapists: TherapistProfile[] = res.data.therapists || res.data.data?.therapists || [];

      // Widen the net if nothing came back — drop hard filters except specialization.
      if (therapists.length === 0) {
        const widened = new URLSearchParams();
        widened.set('specialization', wantedSpecs[0]);
        widened.set('limit', '24');
        res = await api.get(`/api/therapists?${widened.toString()}`);
        therapists = res.data.therapists || res.data.data?.therapists || [];
      }

      // Widen further: anyone, then score.
      if (therapists.length === 0) {
        res = await api.get(`/api/therapists?limit=24`);
        therapists = res.data.therapists || res.data.data?.therapists || [];
      }

      const ranked = therapists
        .map((t) => ({ therapist: t, score: scoreTherapist(t, a) }))
        .sort((x, y) => y.score - x.score)
        .slice(0, 9);

      setMatches(ranked);
    } catch (e) {
      setError("We couldn't load matches right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setMatches(null);
    setError(null);
  };

  const selected = answers[current?.id];
  const maxScore = matches?.[0]?.score || 1;

  // --- Results view ---
  if (matches !== null || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7BAE9E]/15 px-4 py-1.5 text-sm font-medium text-[#7BAE9E] mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Your personalized matches
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
                {loading ? 'Finding therapists for you…' : "Here are the therapists we think you'll click with"}
              </h1>
              <p className="text-[#6B7280] max-w-xl mx-auto">
                Ranked by fit with your answers. You can book a session, view a full profile, or restart the quiz.
              </p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TherapistCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={RotateCcw}
                title="Something went wrong"
                description={error}
                action={{ label: 'Try again', onClick: runMatch }}
              />
            ) : matches!.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No matches yet"
                description="We couldn't find anyone matching those preferences. Try widening your criteria."
                action={{ label: 'Restart quiz', onClick: restart }}
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches!.map(({ therapist, score }, i) => (
                    <div key={therapist.id} className="relative">
                      {i < 3 && (
                        <div className="absolute -top-2 -left-2 z-10 rounded-full bg-[#4A90D9] text-white text-xs font-bold px-3 py-1 shadow-md">
                          {i === 0 ? '🏆 Top match' : `#${i + 1} match`}
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10 rounded-full bg-white border border-[#F1F0EE] text-xs font-semibold text-[#7BAE9E] px-2 py-0.5 shadow-sm">
                        {Math.round((score / maxScore) * 100)}% fit
                      </div>
                      <TherapistCard therapist={therapist} />
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={restart} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Restart quiz
                  </Button>
                  <Button variant="ghost" asChild>
                    <a href="/search">Browse all therapists</a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Quiz view ---
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span>Question {step + 1} of {total}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#F1F0EE] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4A90D9] to-[#7BAE9E]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-[#F1F0EE] bg-white p-6 sm:p-10 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#4A90D9]/10 px-3 py-1 text-xs font-medium text-[#4A90D9] mb-4">
                <Sparkles className="h-3 w-3" /> Get matched
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-2">{current.title}</h2>
              <p className="text-sm text-[#6B7280] mb-8">{current.subtitle}</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {current.options.map((opt) => {
                  const isSelected = selected === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#4A90D9] bg-[#4A90D9]/[0.06] shadow-sm'
                          : 'border-[#F1F0EE] bg-white hover:border-[#4A90D9]/40 hover:bg-[#FAFAF9]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {opt.emoji && <span className="text-2xl flex-shrink-0">{opt.emoji}</span>}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isSelected ? 'text-[#4A90D9]' : 'text-[#1A1A2E]'}`}>
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{opt.description}</p>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#4A90D9] flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={next}
                  disabled={!selected}
                  className="gap-2"
                  isLoading={loading}
                >
                  {step === total - 1 ? 'See my matches' : 'Next'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-xs text-[#6B7280] mt-6">
            Your answers stay on this device — we use them only to rank therapists for you.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

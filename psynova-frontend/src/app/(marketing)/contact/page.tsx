'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, ShieldAlert, BookOpen, ArrowRight,
  Send, CheckCircle, MapPin, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(80),
  email: z.string().email('Please enter a valid email'),
  topic: z.enum(['general', 'billing', 'safety', 'press']),
  subject: z.string().min(3, 'Subject is too short').max(120),
  message: z.string().min(20, 'Please share a bit more detail (at least 20 chars)').max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const topicOptions = [
  { value: 'general', label: 'General question', icon: MessageSquare, color: '#4A90D9' },
  { value: 'billing', label: 'Billing & payments', icon: Mail, color: '#7BAE9E' },
  { value: 'safety', label: 'Safety concern', icon: ShieldAlert, color: '#E85D60' },
  { value: 'press', label: 'Press & partnerships', icon: BookOpen, color: '#f97316' },
] as const;

const contactChannels = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@psynova.com',
    href: 'mailto:support@psynova.com',
    note: 'Replies within 24 hours, Mon–Fri',
  },
  {
    icon: ShieldAlert,
    label: 'Safety reports',
    value: 'safety@psynova.com',
    href: 'mailto:safety@psynova.com',
    note: 'Reviewed within 4 business hours',
  },
  {
    icon: BookOpen,
    label: 'Press',
    value: 'press@psynova.com',
    href: 'mailto:press@psynova.com',
    note: 'For media inquiries only',
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: 'general' },
  });

  const selectedTopic = watch('topic');

  const onSubmit = async (_data: ContactForm) => {
    // Simulate submission — backend endpoint can be wired here later.
    await new Promise((r) => setTimeout(r, 700));
    setSent(true);
    reset();
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-[#4A90D9]/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-[#6B7280]">
            Questions, feedback, or something else on your mind? We're here.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form (3 cols) */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-[#F1F0EE] bg-white p-6 sm:p-8 shadow-sm">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-[#7BAE9E]/15 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-[#7BAE9E]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Message sent</h2>
                    <p className="text-[#6B7280] max-w-sm mx-auto mb-6">
                      Thanks for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button variant="outline" onClick={() => setSent(false)}>
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold text-[#1A1A2E] mb-1">Send us a message</h2>
                      <p className="text-sm text-[#6B7280]">We typically reply within one business day.</p>
                    </div>

                    {/* Topic picker */}
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                        What's this about?
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {topicOptions.map((t) => {
                          const isActive = selectedTopic === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setValue('topic', t.value, { shouldValidate: true })}
                              className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                                isActive
                                  ? 'border-[#4A90D9] bg-[#4A90D9]/5'
                                  : 'border-[#F1F0EE] hover:border-[#4A90D9]/40'
                              }`}
                            >
                              <div
                                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${t.color}1A` }}
                              >
                                <t.icon className="h-4 w-4" style={{ color: t.color }} />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isActive ? 'text-[#4A90D9]' : 'text-[#1A1A2E]'
                                }`}
                              >
                                {t.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                          Your name
                        </label>
                        <Input id="name" placeholder="Jane Doe" {...register('name')} />
                        {errors.name && (
                          <p className="text-xs text-[#E85D60] mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-xs text-[#E85D60] mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="A short summary"
                        {...register('subject')}
                      />
                      {errors.subject && (
                        <p className="text-xs text-[#E85D60] mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        placeholder="Tell us what's going on…"
                        className="w-full rounded-xl border border-[#F1F0EE] bg-white px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] resize-none"
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-xs text-[#E85D60] mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-[#6B7280] hidden sm:block">
                        By submitting you agree to our{' '}
                        <Link href="/privacy" className="text-[#4A90D9] hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                      <Button type="submit" isLoading={isSubmitting} className="gap-2 ml-auto">
                        <Send className="h-4 w-4" />
                        Send message
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-[#F1F0EE] bg-white p-6">
                <h3 className="text-base font-semibold text-[#1A1A2E] mb-4">Or reach us directly</h3>
                <div className="space-y-4">
                  {contactChannels.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className="flex items-start gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4A90D9]/20 transition-colors">
                        <c.icon className="h-4 w-4 text-[#4A90D9]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#6B7280]">{c.label}</p>
                        <p className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#4A90D9] transition-colors truncate">
                          {c.value}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{c.note}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#F1F0EE] bg-[#FAFAF9] p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#7BAE9E] mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Support hours</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Monday – Friday<br />
                      9:00 AM – 6:00 PM (PT)<br />
                      <span className="text-[#7BAE9E] font-medium">Safety reports answered 24/7</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#F1F0EE] bg-white p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#4A90D9] mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Headquarters</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Psynova, Inc.<br />
                      548 Market St, Suite 5210<br />
                      San Francisco, CA 94104
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/help"
                className="block rounded-2xl border-2 border-dashed border-[#4A90D9]/30 bg-[#4A90D9]/[0.04] p-5 hover:border-[#4A90D9] hover:bg-[#4A90D9]/[0.08] transition-all group"
              >
                <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Looking for quick answers?</p>
                <p className="text-xs text-[#6B7280] mb-2">
                  Most common questions are answered in our Help Center.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-[#4A90D9] font-semibold">
                  Browse help center <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

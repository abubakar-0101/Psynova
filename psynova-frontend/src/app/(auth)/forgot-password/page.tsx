'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', data);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-2">
          {sent ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-[#7BAE9E]/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#7BAE9E]" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>We've sent a reset link. It expires in 1 hour.</CardDescription>
            </div>
          ) : (
            <>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
            </>
          )}
        </CardHeader>
        {!sent && (
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1A1A2E] mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-[#E85D60]">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" isLoading={loading}>Send Reset Link</Button>
            </form>
          </CardContent>
        )}
        <div className="px-6 pb-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#4A90D9]">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

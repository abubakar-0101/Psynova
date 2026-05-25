'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginPending } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data);
      toast({ title: 'Welcome back!', variant: 'success' });
      const role = result?.user?.role;
      if (role === 'CLIENT') router.push('/dashboard/client');
      else if (role === 'THERAPIST') router.push('/dashboard/therapist');
      else router.push('/dashboard/admin');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue your wellness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--fg)] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[var(--muted-fg)]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[var(--danger)]">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--fg)]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--brand)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[var(--muted-fg)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-10 pr-10 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-colors [&::-ms-reveal]:hidden"
                  style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[var(--muted-fg)] hover:text-[var(--fg)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-[var(--danger)]">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loginPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--muted-fg)]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[var(--brand)] font-medium hover:underline">
              Create one free
            </Link>
          </div>

          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className="mt-4 rounded-xl bg-[var(--subtle)] p-3 text-xs text-[var(--muted-fg)]">
              <strong className="text-[var(--fg)]">Demo:</strong> client@psynova.com / Demo1234! &nbsp;|&nbsp;
              therapist@psynova.com / Demo1234!
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

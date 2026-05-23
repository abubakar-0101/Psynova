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
              <label className="text-sm font-medium text-[#1A1A2E] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[#E85D60]">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#1A1A2E]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#4A90D9] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white pl-10 pr-10 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#6B7280] hover:text-[#1A1A2E]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-[#E85D60]">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loginPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#4A90D9] font-medium hover:underline">
              Create one free
            </Link>
          </div>

          <div className="mt-4 rounded-xl bg-[#F1F0EE] p-3 text-xs text-[#6B7280]">
            <strong className="text-[#1A1A2E]">Demo:</strong> client@psynova.com / Demo1234! &nbsp;|&nbsp;
            therapist@psynova.com / Demo1234!
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

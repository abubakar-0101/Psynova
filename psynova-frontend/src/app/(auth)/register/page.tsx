'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['CLIENT', 'THERAPIST']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, registerPending } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENT' },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await registerUser(data);
      toast({ title: 'Account created!', variant: 'success' });
      if (data.role === 'CLIENT') router.push('/dashboard/client');
      else router.push('/dashboard/therapist');
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const inputClass = "flex h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start your journey to better mental health</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6 rounded-2xl bg-[var(--subtle)] p-1">
            {(['CLIENT', 'THERAPIST'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue('role', r)}
                className={`py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  role === r
                    ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm'
                    : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                }`}
              >
                {r === 'CLIENT' ? 'I\'m a Client' : 'I\'m a Therapist'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--fg)] mb-1 block">First Name</label>
                <input type="text" placeholder="Jane" className={inputClass} {...register('firstName')} />
                {errors.firstName && <p className="mt-1 text-xs text-[var(--danger)]">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--fg)] mb-1 block">Last Name</label>
                <input type="text" placeholder="Doe" className={inputClass} {...register('lastName')} />
                {errors.lastName && <p className="mt-1 text-xs text-[var(--danger)]">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--fg)] mb-1 block">Email</label>
              <input type="email" placeholder="you@example.com" className={inputClass} {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-[var(--danger)]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--fg)] mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, uppercase, number"
                  className={`${inputClass} pr-10 [&::-ms-reveal]:hidden`}
                  style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[var(--muted-fg)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-[var(--danger)]">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={registerPending}>
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-[var(--muted-fg)]">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-[var(--brand)] hover:underline">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[var(--brand)] hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-3 text-center text-sm text-[var(--muted-fg)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--brand)] font-medium hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

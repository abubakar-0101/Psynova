'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Check, X } from 'lucide-react';
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

function getPasswordStrength(password: string): { strength: number; label: string; color: string; requirements: { met: boolean; label: string }[] } {
  const requirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'Contains uppercase' },
    { met: /[0-9]/.test(password), label: 'Contains number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: 'Contains special character' },
    { met: password.length >= 12, label: 'At least 12 characters (strong)' },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const strength = Math.min((metCount / 3) * 100, 100);

  let label = 'Weak';
  let color = 'bg-red-500';

  if (metCount >= 3 && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    label = 'Good';
    color = 'bg-yellow-500';
  }
  if (metCount >= 4) {
    label = 'Strong';
    color = 'bg-green-500';
  }

  return { strength, label, color, requirements };
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, registerPending } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENT' },
    mode: 'onChange',
  });

  const role = watch('role');
  const password = watch('password');

  const passwordStrength = useMemo(() => getPasswordStrength(password || ''), [password]);
  const isPasswordValid = password && /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8;

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
                  className="absolute right-3 top-3.5 text-[var(--muted-fg)] hover:text-[var(--fg)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted-fg)]">Password strength</span>
                      <motion.span
                        className={`text-xs font-medium ${
                          passwordStrength.label === 'Weak'
                            ? 'text-red-500'
                            : passwordStrength.label === 'Good'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                      >
                        {passwordStrength.label}
                      </motion.span>
                    </div>
                    <div className="h-2 bg-[var(--subtle)] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${passwordStrength.color} transition-all`}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        initial={{ width: 0 }}
                      />
                    </div>
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {passwordStrength.requirements.slice(0, 4).map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[var(--muted-fg)]">
                        {req.met ? (
                          <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-[var(--muted-fg)]'}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && <p className="mt-2 text-xs text-[var(--danger)]">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={registerPending}
              disabled={!isPasswordValid || !isValid || registerPending}
            >
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

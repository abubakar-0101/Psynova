'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, KeyRound } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toaster';
import { getInitials, formatDate } from '@/lib/utils';
import { adminNav } from '../_nav';
import { useAdminMe, useUpdateAdminMe } from '@/hooks/useAdmin';

const profileSchema = z
  .object({
    firstName: z.string().min(1, 'First name required').max(50),
    lastName: z.string().min(1, 'Last name required').max(50),
    email: z.string().email('Invalid email'),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine(
        (v) => !v || (v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v)),
        { message: 'Min 8 chars, uppercase + number' },
      ),
  })
  .refine((d) => !d.newPassword || (d.currentPassword && d.currentPassword.length > 0), {
    message: 'Current password required to change password',
    path: ['currentPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;

const inputClass =
  'flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] transition-colors';

export default function AdminProfilePage() {
  const { data: profile, isLoading } = useAdminMe();
  const update = useUpdateAdminMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    const payload: Record<string, string> = {};
    if (data.firstName !== profile?.firstName) payload.firstName = data.firstName;
    if (data.lastName !== profile?.lastName) payload.lastName = data.lastName;
    if (data.email !== profile?.email) payload.email = data.email;
    if (data.newPassword) {
      payload.newPassword = data.newPassword;
      payload.currentPassword = data.currentPassword ?? '';
    }

    if (Object.keys(payload).length === 0) {
      toast({ title: 'Nothing to update', variant: 'default' });
      return;
    }

    try {
      await update.mutateAsync(payload);
      toast({ title: 'Profile updated', variant: 'success' });
      reset((current) => ({ ...current, currentPassword: '', newPassword: '' }));
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell navItems={adminNav} title="Admin Profile">
      <div className="max-w-2xl space-y-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-[#4A90D9]/10 text-[#4A90D9]">
                  {profile ? getInitials(profile.firstName, profile.lastName) : '...'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-[#1A1A2E] truncate">
                    {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
                  </h2>
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </Badge>
                </div>
                <p className="text-xs text-[#6B7280]">{profile?.email}</p>
                {profile && (
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Member since {formatDate(profile.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">First Name</label>
                  <input {...register('firstName')} className={inputClass} disabled={isLoading} />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-[#E85D60]">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Last Name</label>
                  <input {...register('lastName')} className={inputClass} disabled={isLoading} />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-[#E85D60]">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className={inputClass}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#E85D60]">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#6B7280]" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[#6B7280]">
                Leave blank to keep your current password.
              </p>
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                  Current Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  {...register('currentPassword')}
                  className={inputClass}
                  placeholder="••••••••"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs text-[#E85D60]">{errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                  New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register('newPassword')}
                  className={inputClass}
                  placeholder="At least 8 characters with uppercase and number"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-[#E85D60]">{errors.newPassword.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" isLoading={update.isPending}>
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}

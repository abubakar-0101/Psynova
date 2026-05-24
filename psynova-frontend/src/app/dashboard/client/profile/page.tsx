'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, KeyRound, BookOpen } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toaster';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: '📊' as const },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: '📅' as const },
  { href: '/messages', label: 'Messages', icon: '💬' as const },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: '❤️' as const },
  { href: '/dashboard/client/journal', label: 'Journal', icon: '📝' as const },
  { href: '/dashboard/client/profile', label: 'Profile', icon: '👤' as const },
];

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50),
  lastName: z.string().min(1, 'Last name required').max(50),
  email: z.string().email('Invalid email'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
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

const inputClass = 'flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] transition-colors';

export default function ClientProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user, reset]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be under 5 MB', variant: 'destructive' });
      return;
    }

    setPhotoUploading(true);
    try {
      const sigRes = await api.get('/api/clients/me/upload-signature');
      const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: form },
      );
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
      const uploaded = await uploadRes.json();

      const saveRes = await api.post('/api/clients/me/photo', {
        photoUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      });

      if (user) {
        setUser({
          ...user,
          photoUrl: saveRes.data.data.photoUrl,
        });
      }
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast({ title: 'Photo updated', variant: 'success' });
    } catch (err: any) {
      toast({
        title: 'Photo upload failed',
        description: err?.response?.data?.message || err?.message || 'Try again',
        variant: 'destructive',
      });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {};
      if (data.firstName !== user?.firstName) payload.firstName = data.firstName;
      if (data.lastName !== user?.lastName) payload.lastName = data.lastName;
      if (data.email !== user?.email) payload.email = data.email;
      if (data.bio !== (user?.bio || '')) payload.bio = data.bio || '';
      if (data.newPassword) {
        payload.newPassword = data.newPassword;
        payload.currentPassword = data.currentPassword ?? '';
      }

      if (Object.keys(payload).length === 0) {
        toast({ title: 'No changes to save', variant: 'default' });
        setIsSubmitting(false);
        return;
      }

      const res = await api.put('/api/clients/me', payload);
      setUser(res.data.data);
      toast({ title: 'Profile updated successfully', variant: 'success' });
      reset((current) => ({ ...current, currentPassword: '', newPassword: '' }));
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell navItems={clientNav} title="My Profile">
      <div className="max-w-2xl space-y-5">
        {/* Profile Photo */}
        <Card>
          <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 flex-shrink-0">
                {user?.photoUrl ? (
                  <Image
                    src={user.photoUrl}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Profile'}
                    fill
                    sizes="96px"
                    className="rounded-2xl object-cover"
                  />
                ) : (
                  <Avatar className="h-24 w-24 rounded-2xl">
                    <AvatarFallback className="text-xl bg-[#4A90D9]/10 text-[#4A90D9] rounded-2xl">
                      {user ? getInitials(user.firstName, user.lastName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1A2E] font-medium mb-1">
                  {user?.photoUrl ? 'Your profile photo' : 'No photo yet'}
                </p>
                <p className="text-xs text-[#6B7280] mb-3">
                  Square image, at least 400x400. JPG or PNG, under 5 MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="gap-1.5"
                >
                  {photoUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-3.5 w-3.5" /> {user?.photoUrl ? 'Replace photo' : 'Upload photo'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Account Information */}
          <Card>
            <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">First Name</label>
                  <input {...register('firstName')} className={inputClass} />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-[#E85D60]">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Last Name</label>
                  <input {...register('lastName')} className={inputClass} />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-[#E85D60]">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Email</label>
                <input type="email" {...register('email')} className={inputClass} />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#E85D60]">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio/About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#6B7280]" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                Bio <span className="text-[#6B7280]">(optional)</span>
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Tell us a bit about yourself or any health goals you're working towards..."
                className="w-full rounded-xl border border-[#F1F0EE] bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] resize-none"
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-[#E85D60]">{errors.bio.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
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

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}

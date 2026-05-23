'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, Calendar, TrendingUp, MessageCircle, Users, Star, Edit, Settings, Camera, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateTherapistProfile } from '@/hooks/useTherapists';
import { toast } from '@/components/ui/toaster';
import { getInitials } from '@/lib/utils';
import api from '@/lib/axios';

const therapistNav = [
  { href: '/dashboard/therapist', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/therapist/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/therapist/clients', label: 'Clients', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/therapist/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/therapist/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/therapist/profile', label: 'Edit Profile', icon: Edit },
  { href: '/dashboard/therapist/settings', label: 'Settings', icon: Settings },
];

const schema = z.object({
  bio: z.string().max(2000).optional(),
  licenseNumber: z.string().optional(),
  sessionPrice: z.coerce.number().min(0).optional(),
  yearsExperience: z.coerce.number().min(0).optional(),
  specializations: z.string().optional(),
  languages: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TherapistProfileEditPage() {
  const { user, setUser } = useAuthStore();
  const tp = user?.therapistProfile;
  const updateProfile = useUpdateTherapistProfile();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

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
      const sigRes = await api.get('/api/therapists/me/upload-signature');
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

      const saveRes = await api.post('/api/therapists/me/photo', {
        photoUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      });

      if (user && tp) {
        setUser({
          ...user,
          therapistProfile: { ...tp, photoUrl: saveRes.data.data.photoUrl },
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      bio: tp?.bio || '',
      licenseNumber: tp?.licenseNumber || '',
      sessionPrice: tp?.sessionPrice || 0,
      yearsExperience: tp?.yearsExperience || 0,
      specializations: tp?.specializations?.join(', ') || '',
      languages: tp?.languages?.join(', ') || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile.mutateAsync({
        ...data,
        specializations: data.specializations?.split(',').map((s) => s.trim()).filter(Boolean) || [],
        languages: data.languages?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      });
      toast({ title: 'Profile updated!', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const inputClass = "flex h-11 w-full rounded-xl border border-[#F1F0EE] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] transition-colors";

  return (
    <DashboardShell navItems={therapistNav} title="Edit Profile">
      <div className="max-w-2xl space-y-5">
        <Card>
          <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 flex-shrink-0">
                {tp?.photoUrl ? (
                  <Image
                    src={tp.photoUrl}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Therapist'}
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
                  {tp?.photoUrl ? 'Your profile photo' : 'No photo yet'}
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
                      <Camera className="h-3.5 w-3.5" /> {tp?.photoUrl ? 'Replace photo' : 'Upload photo'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={5}
                  placeholder="Tell clients about yourself, your approach, and what you specialize in..."
                  className="w-full rounded-xl border border-[#F1F0EE] bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Session Price (USD)</label>
                  <input type="number" {...register('sessionPrice')} className={inputClass} placeholder="120" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">Years of Experience</label>
                  <input type="number" {...register('yearsExperience')} className={inputClass} placeholder="5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">License Number</label>
                <input {...register('licenseNumber')} className={inputClass} placeholder="LIC-12345" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Specializations & Languages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                  Specializations <span className="text-[#6B7280]">(comma-separated)</span>
                </label>
                <input
                  {...register('specializations')}
                  className={inputClass}
                  placeholder="Anxiety, Depression, Trauma, CBT"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#1A1A2E] mb-1 block">
                  Languages <span className="text-[#6B7280]">(comma-separated)</span>
                </label>
                <input
                  {...register('languages')}
                  className={inputClass}
                  placeholder="English, Spanish"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" isLoading={updateProfile.isPending}>
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}

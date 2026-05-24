'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

type Role = 'CLIENT' | 'THERAPIST' | 'ADMIN';

const dashboardForRole: Record<Role, string> = {
  CLIENT: '/dashboard/client',
  THERAPIST: '/dashboard/therapist',
  ADMIN: '/dashboard/admin',
};

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      const target = dashboardForRole[user.role as Role] ?? '/';
      router.replace(target);
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || user.role !== role) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

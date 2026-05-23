import { RoleGuard } from '@/components/dashboard/RoleGuard';

export default function TherapistDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="THERAPIST">{children}</RoleGuard>;
}

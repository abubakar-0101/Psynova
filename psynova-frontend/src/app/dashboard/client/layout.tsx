import { RoleGuard } from '@/components/dashboard/RoleGuard';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="CLIENT">{children}</RoleGuard>;
}

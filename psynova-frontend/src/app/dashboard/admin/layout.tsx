import { RoleGuard } from '@/components/dashboard/RoleGuard';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="ADMIN">{children}</RoleGuard>;
}

import {
  TrendingUp,
  Users,
  CheckCircle,
  Calendar,
  DollarSign,
  Flag,
  Settings,
  UserCircle,
} from 'lucide-react';

export const adminNav = [
  { href: '/dashboard/admin', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/therapists', label: 'Therapists', icon: CheckCircle },
  { href: '/dashboard/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/admin/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Flag },
  { href: '/dashboard/admin/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

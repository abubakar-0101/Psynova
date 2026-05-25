'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { getInitials } from '@/lib/utils';
import api from '@/lib/axios';
import { disconnectSocket } from '@/lib/socket';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export function DashboardShell({ children, navItems, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    disconnectSocket();
    router.push('/');
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 p-6 border-b"
        style={{ borderColor: 'var(--dash-border)' }}
      >
        <div className="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(99,102,241,0.5)]">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="font-bold" style={{ color: 'var(--dash-text)' }}>Psynova</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const isEmoji = typeof icon === 'string';
          const Icon = !isEmoji ? icon : null;

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--dash-active-bg)' : 'transparent',
                color: active ? 'var(--dash-active-text)' : 'var(--dash-muted)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--dash-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--dash-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--dash-muted)';
                }
              }}
            >
              {isEmoji ? (
                <span className="text-lg">{icon}</span>
              ) : (
                Icon && <Icon className="h-5 w-5 flex-shrink-0" />
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--dash-border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.therapistProfile?.photoUrl} />
            <AvatarFallback
              className="text-sm text-white bg-brand-gradient"
            >
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--dash-text)' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--dash-muted)' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: 'var(--dash-bg)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 flex-col flex-shrink-0 border-r"
        style={{
          background: 'var(--dash-surface)',
          borderColor: 'var(--dash-border)',
        }}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r lg:hidden"
              style={{
                background: 'var(--dash-surface)',
                borderColor: 'var(--dash-border)',
              }}
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-5 border-b flex-shrink-0"
          style={{
            background: 'var(--dash-surface)',
            borderColor: 'var(--dash-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--dash-muted)' }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold" style={{ color: 'var(--dash-text)' }}>{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: 'var(--dash-muted)' }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-gradient text-white text-[10px] flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

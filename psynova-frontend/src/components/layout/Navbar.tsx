'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useNotifications } from '@/hooks/useNotifications';
import { getInitials } from '@/lib/utils';
import api from '@/lib/axios';
import { disconnectSocket } from '@/lib/socket';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/search', label: 'Find Therapists' },
  { href: '/recommend', label: 'Get Matched' },
  { href: '/#how-it-works', label: 'How It Works' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {}
    logout();
    disconnectSocket();
    router.push('/');
  };

  const dashboardHref =
    user?.role === 'CLIENT'
      ? '/dashboard/client'
      : user?.role === 'THERAPIST'
      ? '/dashboard/therapist'
      : '/dashboard/admin';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-[var(--border-subtle)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)] group-hover:shadow-[0_8px_30px_-4px_rgba(236,72,153,0.5)] transition-shadow duration-300">
              <span className="text-white font-bold text-base">P</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-semibold text-xl text-[var(--fg)] hidden sm:block tracking-tight">
              Psynova
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    active
                      ? 'text-[var(--fg)]'
                      : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-[var(--subtle)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  href="/notifications"
                  className="relative h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--subtle)] transition-colors flex items-center justify-center text-[var(--fg)]"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-gradient text-white text-[10px] flex items-center justify-center font-semibold ring-2 ring-[var(--bg)]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl pl-1.5 pr-2.5 py-1.5 border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--subtle)] transition-colors"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.therapistProfile?.photoUrl} />
                      <AvatarFallback className="text-[10px] bg-brand-gradient text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-[var(--fg)]">
                      {user.firstName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-fg)]" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 rounded-2xl glass-strong border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-1.5 z-50 overflow-hidden"
                      >
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--fg)] hover:bg-[var(--subtle)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 text-[var(--muted-fg)]" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--fg)] hover:bg-[var(--subtle)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-[var(--muted-fg)]" />
                          Profile
                        </Link>
                        <div className="my-1 h-px bg-[var(--border-subtle)]" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--muted-fg)] hover:text-[var(--fg)] px-3.5 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-center text-[var(--fg)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--surface)]"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[var(--fg)] hover:bg-[var(--subtle)]"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <>
                  <div className="my-2 h-px bg-[var(--border-subtle)]" />
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[var(--fg)] hover:bg-[var(--subtle)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium text-white bg-brand-gradient text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

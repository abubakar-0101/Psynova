'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Bell, Check, CheckCheck, Calendar, MessageCircle, Star,
  CreditCard, ShieldCheck, AlertOctagon, Clock, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { Notification, NotificationType } from '@/types';
import { formatRelative } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from '@/components/ui/toaster';
import { getSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

const ICONS: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  BOOKING_CONFIRMED:  { icon: Calendar,    color: '#4A90D9', bg: 'bg-[#4A90D9]/10' },
  BOOKING_CANCELLED:  { icon: Calendar,    color: '#E85D60', bg: 'bg-red-100' },
  NEW_MESSAGE:        { icon: MessageCircle, color: '#7BAE9E', bg: 'bg-[#7BAE9E]/15' },
  SESSION_REMINDER:   { icon: Clock,       color: '#f59e0b', bg: 'bg-amber-100' },
  REVIEW_RECEIVED:    { icon: Star,        color: '#f97316', bg: 'bg-orange-100' },
  PAYMENT_RECEIVED:   { icon: CreditCard,  color: '#7BAE9E', bg: 'bg-emerald-100' },
  ACCOUNT_APPROVED:   { icon: ShieldCheck, color: '#4A90D9', bg: 'bg-[#4A90D9]/10' },
  ACCOUNT_SUSPENDED:  { icon: AlertOctagon, color: '#E85D60', bg: 'bg-red-100' },
};

function linkFor(n: Notification): string {
  const meta = (n.metadata || {}) as Record<string, string>;
  switch (n.type) {
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'SESSION_REMINDER':
    case 'PAYMENT_RECEIVED':
      return meta.appointmentId ? `/session/${meta.appointmentId}` : '/dashboard/client/sessions';
    case 'NEW_MESSAGE':
      return '/messages';
    case 'REVIEW_RECEIVED':
      return '/dashboard/therapist/reviews';
    case 'ACCOUNT_APPROVED':
    case 'ACCOUNT_SUSPENDED':
      return '/dashboard/therapist';
    default:
      return '/';
  }
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { addNotification, markRead: markReadStore, markAllRead: markAllReadStore } = useNotificationStore();

  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Redirect anonymous users to login (after auth has hydrated).
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/login?next=/notifications');
  }, [user, authLoading, router]);

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/notifications?page=${nextPage}&limit=20`);
        const fetched: Notification[] = res.data.data.notifications || [];
        setItems((prev) => (replace ? fetched : [...prev, ...fetched]));
        setHasMore(fetched.length === 20);
        setPage(nextPage);
      } catch {
        toast({ title: 'Failed to load notifications', variant: 'destructive' });
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    [loading],
  );

  // Initial fetch
  useEffect(() => {
    if (!user) return;
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Live updates via socket
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onNew = (n: Notification) => {
      setItems((prev) => [n, ...prev]);
      addNotification(n);
    };
    socket.on('notification:new', onNew);
    return () => {
      socket.off('notification:new', onNew);
    };
  }, [user, addNotification]);

  // Infinite-scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadPage(page + 1);
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page, loadPage]);

  const markOneRead = async (n: Notification) => {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    markReadStore(n.id);
    try {
      await api.patch(`/api/notifications/${n.id}/read`);
    } catch {
      // revert on failure
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: false } : x)));
    }
  };

  const markAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    markAllReadStore();
    try {
      await api.post('/api/notifications/read-all');
      toast({ title: 'All caught up' });
    } catch {
      toast({ title: 'Could not mark all read', variant: 'destructive' });
    }
  };

  const visible = filter === 'unread' ? items.filter((i) => !i.isRead) : items;
  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E] flex items-center gap-3">
                <Bell className="h-7 w-7 text-[#4A90D9]" />
                Notifications
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
                  : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAll} className="gap-2">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-5">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-[#1A1A2E] text-white'
                    : 'bg-white border border-[#F1F0EE] text-[#6B7280] hover:border-[#4A90D9]'
                }`}
              >
                {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>

          {/* List */}
          {!initialLoaded ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#F1F0EE] bg-white p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F1F0EE]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-[#F1F0EE]" />
                      <div className="h-3 w-3/4 rounded bg-[#F1F0EE]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              description={
                filter === 'unread'
                  ? "You're all caught up. Check back later."
                  : 'When you book sessions, get messages, or receive reviews, they\'ll show up here.'
              }
              action={filter === 'unread' ? { label: 'View all', onClick: () => setFilter('all') } : undefined}
            />
          ) : (
            <ul className="space-y-2">
              {visible.map((n) => {
                const { icon: Icon, color, bg } = ICONS[n.type] || ICONS.NEW_MESSAGE;
                const href = linkFor(n);
                return (
                  <li key={n.id}>
                    <Link
                      href={href}
                      onClick={() => markOneRead(n)}
                      className={`block rounded-2xl border p-4 transition-all hover:shadow-md ${
                        n.isRead
                          ? 'border-[#F1F0EE] bg-white'
                          : 'border-[#4A90D9]/30 bg-[#4A90D9]/[0.04]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-sm ${n.isRead ? 'font-medium text-[#1A1A2E]' : 'font-semibold text-[#1A1A2E]'}`}>
                              {n.title}
                            </p>
                            <span className="text-xs text-[#6B7280] flex-shrink-0 whitespace-nowrap">
                              {formatRelative(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[#6B7280] mt-0.5 leading-relaxed">{n.body}</p>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markOneRead(n);
                            }}
                            className="flex-shrink-0 p-1 text-[#6B7280] hover:text-[#4A90D9] transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && initialLoaded && visible.length > 0 && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loading && <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, DollarSign, MessageCircle, Users, Star,
  TrendingUp, Edit, Settings
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import { formatDate, getInitials } from '@/lib/utils';

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-[#E5E7EB]'}`}
        />
      ))}
    </div>
  );
}

export default function TherapistReviewsPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['therapist-reviews', user?.therapistProfile?.id],
    queryFn: async () => {
      const res = await api.get(`/api/therapists/${user?.therapistProfile?.id}/reviews`);
      return res.data.data;
    },
    enabled: !!user?.therapistProfile?.id,
  });

  const reviews: any[] = data?.reviews || [];
  const avg = Number(user?.therapistProfile?.rating) || 0;
  const count = user?.therapistProfile?.reviewCount || 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <DashboardShell navItems={therapistNav} title="Reviews">
      <div className="space-y-6 max-w-3xl">
        {/* Summary */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#1A1A2E]">{avg.toFixed(1)}</p>
                <StarRating rating={Math.round(avg)} />
                <p className="text-xs text-[#6B7280] mt-1">{count} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280] w-4">{d.star}</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2 bg-[#F1F0EE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#6B7280] w-4">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review list */}
        {isLoading ? (
          <div className="text-center py-8 text-[#6B7280] text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-[#6B7280]">
            <Star className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium mb-1">No reviews yet</p>
            <p className="text-sm">Reviews will appear after clients complete sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(r.client?.firstName, r.client?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#1A1A2E]">
                          {r.client?.firstName} {r.client?.lastName}
                        </p>
                        <span className="text-xs text-[#6B7280]">{formatDate(r.createdAt)}</span>
                      </div>
                      <StarRating rating={r.rating} />
                      {r.comment && (
                        <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

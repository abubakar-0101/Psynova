'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, MessageCircle, Heart, BookOpen, Receipt } from 'lucide-react';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { toast } from '@/components/ui/toaster';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: Heart },
  { href: '/dashboard/client/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard/client/payments', label: 'Payments', icon: Receipt },
];

const MOOD_EMOJIS = ['😞', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🌟'];
const MOOD_TAGS = ['Anxious', 'Calm', 'Energized', 'Tired', 'Grateful', 'Stressed', 'Happy', 'Sad'];

export default function MoodTrackerPage() {
  const qc = useQueryClient();
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ['mood'],
    queryFn: async () => {
      const res = await api.get('/api/wellness/mood?days=30');
      return res.data.data;
    },
  });

  const logMood = useMutation({
    mutationFn: async () => {
      await api.post('/api/wellness/mood', { mood, note, tags });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mood'] });
      setSubmitted(true);
      setNote('');
      setTags([]);
      toast({ title: 'Mood logged!', variant: 'success' });
    },
  });

  const chartData = entries.map((e: any) => ({
    date: format(new Date(e.createdAt), 'MMM d'),
    mood: e.mood,
  }));

  const streak = (() => {
    if (entries.length === 0) return 0;
    let count = 1;
    for (let i = 1; i < entries.length; i++) {
      const diff = (new Date(entries[i - 1].createdAt).getTime() - new Date(entries[i].createdAt).getTime()) / 86400000;
      if (diff <= 1.5) count++;
      else break;
    }
    return count;
  })();

  return (
    <DashboardShell navItems={clientNav} title="Mood Tracker">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Log mood */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">{MOOD_EMOJIS[mood - 1]}</p>
                <p className="font-semibold text-[#1A1A2E]">Mood logged!</p>
                <p className="text-sm text-[#6B7280] mt-1">Come back tomorrow</p>
                <Button variant="outline" className="mt-3" onClick={() => setSubmitted(false)}>Log again</Button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-6xl mb-2">{MOOD_EMOJIS[mood - 1]}</p>
                  <p className="text-sm text-[#6B7280]">Mood: {mood}/10</p>
                </div>

                <input
                  type="range"
                  min={1}
                  max={10}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full accent-[#4A90D9]"
                />

                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag])}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        tags.includes(tag)
                          ? 'bg-[#4A90D9] text-white'
                          : 'bg-[#F1F0EE] text-[#6B7280] hover:bg-[#4A90D9]/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note... (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-[#F1F0EE] px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9] resize-none"
                />

                <Button
                  className="w-full"
                  isLoading={logMood.isPending}
                  onClick={() => logMood.mutate()}
                >
                  Log Mood
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats + chart */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center p-4">
              <p className="text-2xl font-bold text-[#4A90D9]">{streak}</p>
              <p className="text-xs text-[#6B7280]">Day Streak 🔥</p>
            </Card>
            <Card className="text-center p-4">
              <p className="text-2xl font-bold text-[#7BAE9E]">
                {entries.length > 0
                  ? (entries.reduce((a: number, e: any) => a + e.mood, 0) / entries.length).toFixed(1)
                  : '—'}
              </p>
              <p className="text-xs text-[#6B7280]">Avg Mood (30d)</p>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>30-Day Trend</CardTitle></CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F0EE', fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#4A90D9"
                      strokeWidth={2}
                      dot={{ fill: '#4A90D9', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">
                  Log your first mood to see your trend
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

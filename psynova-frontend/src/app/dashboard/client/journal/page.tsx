'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Lock, Globe, BookOpen, Calendar } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, MessageCircle, Heart, Receipt } from 'lucide-react';
import api from '@/lib/axios';
import { JournalEntry } from '@/types';
import { formatDate, readingTime } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

const clientNav = [
  { href: '/dashboard/client', label: 'Overview', icon: TrendingUp },
  { href: '/dashboard/client/sessions', label: 'My Sessions', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: Heart },
  { href: '/dashboard/client/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard/client/payments', label: 'Payments', icon: Receipt },
];

export default function JournalPage() {
  const qc = useQueryClient();
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: async () => {
      const res = await api.get('/api/wellness/journal');
      return res.data;
    },
  });

  const entries: JournalEntry[] = data?.entries || [];

  const createMutation = useMutation({
    mutationFn: async () => api.post('/api/wellness/journal', { title, content, isPrivate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] });
      setComposing(false);
      setTitle(''); setContent('');
      toast({ title: 'Entry saved!', variant: 'success' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/wellness/journal/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] });
      toast({ title: 'Entry deleted' });
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate();
  };

  const inputStyle = {
    color: 'var(--dash-text)',
    background: 'transparent',
  };

  return (
    <DashboardShell navItems={clientNav} title="Journal">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--dash-text)' }}>My Journal</h2>
            <p className="text-sm" style={{ color: 'var(--dash-muted)' }}>{entries.length} entries</p>
          </div>
          <Button onClick={() => { setComposing(true); setEditing(null); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        </div>

        {/* Compose */}
        {composing && (
          <Card className="border-[#4A90D9]/30">
            <CardContent className="pt-5 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title..."
                className="w-full text-lg font-semibold border-0 focus:outline-none placeholder:opacity-40"
                style={{ ...inputStyle, color: 'var(--dash-text)' }}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts..."
                rows={8}
                className="w-full text-sm border-0 focus:outline-none resize-none leading-relaxed placeholder:opacity-40"
                style={inputStyle}
              />
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'var(--dash-border)' }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: isPrivate ? 'var(--subtle)' : 'rgba(123,174,158,0.12)',
                      color: isPrivate ? 'var(--dash-muted)' : '#7BAE9E',
                    }}
                  >
                    {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    {isPrivate ? 'Private' : 'Public'}
                  </button>
                  <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                    {content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setComposing(false)}>Cancel</Button>
                  <Button size="sm" isLoading={createMutation.isPending} onClick={handleSave}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entries */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-10 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 && !composing ? (
          <div className="text-center py-16" style={{ color: 'var(--dash-muted)' }}>
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">Your journal is empty</p>
            <p className="text-sm">Start writing to reflect on your wellness journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: 'var(--dash-text)' }}>{entry.title}</h3>
                    <div className="flex items-center gap-1">
                      {entry.isPrivate ? (
                        <Lock className="h-3.5 w-3.5" style={{ color: 'var(--dash-muted)' }} />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-[#7BAE9E]" />
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(entry.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--dash-muted)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = '#E85D60';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(232,93,96,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--dash-muted)';
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--dash-muted)' }}>
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--dash-muted)' }}>
                    <span>{formatDate(entry.createdAt)}</span>
                    <span>·</span>
                    <span>{entry.wordCount} words</span>
                    <span>·</span>
                    <span>{readingTime(entry.content)}</span>
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

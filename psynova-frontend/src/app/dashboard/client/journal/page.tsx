'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, Lock, Globe, BookOpen, Calendar } from 'lucide-react';
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

  const { data } = useQuery({
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

  return (
    <DashboardShell navItems={clientNav} title="Journal">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A2E]">My Journal</h2>
            <p className="text-sm text-[#6B7280]">{entries.length} entries</p>
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
                className="w-full text-lg font-semibold text-[#1A1A2E] placeholder:text-[#6B7280] border-0 focus:outline-none bg-transparent"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts..."
                rows={8}
                className="w-full text-sm text-[#1A1A2E] placeholder:text-[#6B7280] border-0 focus:outline-none bg-transparent resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[#F1F0EE]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      isPrivate ? 'bg-[#F1F0EE] text-[#6B7280]' : 'bg-[#7BAE9E]/10 text-[#7BAE9E]'
                    }`}
                  >
                    {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    {isPrivate ? 'Private' : 'Public'}
                  </button>
                  <span className="text-xs text-[#6B7280]">{content.trim().split(/\s+/).filter(Boolean).length} words</span>
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
        {entries.length === 0 && !composing ? (
          <div className="text-center py-16 text-[#6B7280]">
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
                    <h3 className="font-semibold text-[#1A1A2E]">{entry.title}</h3>
                    <div className="flex items-center gap-1">
                      {entry.isPrivate ? (
                        <Lock className="h-3.5 w-3.5 text-[#6B7280]" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-[#7BAE9E]" />
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(entry.id)}
                        className="p-1.5 text-[#6B7280] hover:text-[#E85D60] transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3 mb-3">{entry.content}</p>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
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

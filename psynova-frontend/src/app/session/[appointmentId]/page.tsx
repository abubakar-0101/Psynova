'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Maximize2, Minimize2, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/toaster';
import api from '@/lib/axios';

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default function SessionPage({ params }: PageProps) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isTherapist = user?.role === 'THERAPIST';

  const [notesPanelOpen, setNotesPanelOpen] = useState(isTherapist);
  const [notes, setNotes] = useState('');
  const [iframeExpanded, setIframeExpanded] = useState(false);

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const res = await api.get(`/api/appointments/${appointmentId}`);
      return res.data.data;
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: async () => api.patch(`/api/appointments/${appointmentId}/notes`, { sessionNotes: notes }),
    onSuccess: () => toast({ title: 'Notes saved', variant: 'success' }),
    onError: () => toast({ title: 'Failed to save notes', variant: 'destructive' }),
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => api.post(`/api/appointments/${appointmentId}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Session ended', variant: 'success' });
      router.push(isTherapist ? '/dashboard/therapist' : '/dashboard/client');
    },
  });

  useEffect(() => {
    if (appointment?.sessionNotes) {
      setNotes(appointment.sessionNotes);
    }
  }, [appointment]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1A1A2E]">
        <div className="text-white text-center">
          <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm opacity-70">Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1A1A2E]">
        <div className="text-white text-center">
          <p className="text-lg font-semibold mb-2">Session not found</p>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  if (appointment.status !== 'CONFIRMED') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1A1A2E]">
        <div className="text-white text-center max-w-sm">
          <p className="text-lg font-semibold mb-2">Session unavailable</p>
          <p className="text-sm opacity-70 mb-4">
            This session is not currently active. Status: {appointment.status}
          </p>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  const roomName = `psynova-session-${appointmentId}`;
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true&appData.localStorageContent=null`;

  return (
    <div className="h-screen flex flex-col bg-[#1A1A2E]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A2E]/90 border-b border-white/10 z-10">
        <div>
          <p className="text-white font-semibold text-sm">
            {isTherapist
              ? `Session with ${appointment.client?.firstName} ${appointment.client?.lastName}`
              : `Session with Dr. ${appointment.therapistUser?.firstName} ${appointment.therapistUser?.lastName}`}
          </p>
          <p className="text-white/50 text-xs">Secure video session</p>
        </div>
        <div className="flex items-center gap-2">
          {isTherapist && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs gap-1"
              onClick={() => setNotesPanelOpen((p) => !p)}
            >
              {notesPanelOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              Notes
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            className="text-xs gap-1"
            isLoading={endSessionMutation.isPending}
            onClick={() => endSessionMutation.mutate()}
          >
            <Phone className="h-3.5 w-3.5 rotate-[135deg]" /> End Session
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video iframe */}
        <div className={`flex-1 relative ${notesPanelOpen && isTherapist ? 'lg:flex-[2]' : ''}`}>
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            title="Psynova video session"
          />
        </div>

        {/* Therapist notes panel */}
        {isTherapist && notesPanelOpen && (
          <div className="w-80 bg-white border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-[#F1F0EE]">
              <h3 className="font-semibold text-[#1A1A2E] text-sm">Session Notes</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Private — not visible to client</p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record observations, treatment notes, next steps..."
              className="flex-1 p-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] resize-none focus:outline-none leading-relaxed"
            />
            <div className="p-4 border-t border-[#F1F0EE]">
              <Button
                size="sm"
                className="w-full gap-1"
                isLoading={saveNotesMutation.isPending}
                onClick={() => saveNotesMutation.mutate()}
              >
                <Save className="h-3.5 w-3.5" /> Save Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

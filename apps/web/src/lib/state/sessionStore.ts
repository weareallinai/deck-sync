import { create } from 'zustand';
import type { Session } from '@deck/shared';

interface SessionState {
  session: Session | null;
  currentSlideId: string | null;
  currentStep: number;
  viewerCount: number;
  isConnected: boolean;
  latency: number;
  
  // Actions
  setSession: (session: Session) => void;
  setCurrentSlide: (slideId: string, step: number) => void;
  setViewerCount: (count: number) => void;
  setConnectionStatus: (connected: boolean) => void;
  setLatency: (ms: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  currentSlideId: null,
  currentStep: 0,
  viewerCount: 0,
  isConnected: false,
  latency: 0,
  
  setSession: (session) => set({ session }),
  setCurrentSlide: (slideId, step) => set({ currentSlideId: slideId, currentStep: step }),
  setViewerCount: (count) => set({ viewerCount: count }),
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  setLatency: (ms) => set({ latency: ms }),
}));


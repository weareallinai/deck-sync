import { create } from 'zustand';
import type { Deck } from '@deck/shared';

interface ViewerState {
  deck: Deck | null;
  currentSlideId: string | null;
  currentStep: number;
  isConnected: boolean;
  serverTimeOffset: number; // ms offset for clock sync
  
  // Actions
  setDeck: (deck: Deck) => void;
  setCurrentSlide: (slideId: string, step: number) => void;
  setConnectionStatus: (connected: boolean) => void;
  setServerTimeOffset: (offset: number) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  deck: null,
  currentSlideId: null,
  currentStep: 0,
  isConnected: false,
  serverTimeOffset: 0,
  
  setDeck: (deck) => set({ deck }),
  setCurrentSlide: (slideId, step) => set({ currentSlideId: slideId, currentStep: step }),
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  setServerTimeOffset: (offset) => set({ serverTimeOffset: offset }),
}));


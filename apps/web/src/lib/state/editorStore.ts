import { create } from 'zustand';
import type { Deck, Slide, Element } from '@deck/shared';

interface EditorState {
  deck: Deck | null;
  currentSlideId: string | null;
  selectedElementId: string | null;
  
  // Actions
  setDeck: (deck: Deck) => void;
  setCurrentSlide: (slideId: string) => void;
  selectElement: (elementId: string | null) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<Element>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  deck: null,
  currentSlideId: null,
  selectedElementId: null,
  
  setDeck: (deck) => set({ deck }),
  setCurrentSlide: (slideId) => set({ currentSlideId: slideId }),
  selectElement: (elementId) => set({ selectedElementId: elementId }),
  updateElement: (slideId, elementId, updates) => {
    // Stub: will update element in deck
    set((state) => state);
  },
}));


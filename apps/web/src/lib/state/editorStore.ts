import { create } from 'zustand';
import type { Deck, Slide, Element, Background } from '@deck/shared';

interface EditorState {
  deck: Deck | null;
  slides: Map<string, Slide>; // slideId -> Slide
  currentSlideId: string | null;
  selectedElementId: string | null;
  
  // Undo/redo
  history: { deck: Deck; slides: Map<string, Slide> }[];
  historyIndex: number;
  
  // Deck actions
  setDeck: (deck: Deck, slides: Slide[]) => void;
  updateDeckTitle: (title: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveHistory: () => void;
  
  // Slide actions
  addSlide: () => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setCurrentSlide: (slideId: string) => void;
  updateSlideBackground: (slideId: string, bg: Background) => void;
  
  // Element actions
  selectElement: (elementId: string | null) => void;
  addElement: (slideId: string, element: Element) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<Element>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  duplicateElement: (slideId: string, elementId: string) => void;
  reorderElement: (slideId: string, elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  
  // Helpers
  getCurrentSlide: () => Slide | null;
  getSelectedElement: () => Element | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  deck: null,
  slides: new Map(),
  currentSlideId: null,
  selectedElementId: null,
  history: [],
  historyIndex: -1,
  
  // Deck actions
  setDeck: (deck, slidesList) => {
    const slidesMap = new Map<string, Slide>();
    slidesList.forEach(slide => slidesMap.set(slide.id, slide));
    set({ 
      deck, 
      slides: slidesMap,
      currentSlideId: slidesList[0]?.id || null,
      selectedElementId: null,
      history: [{ deck, slides: slidesMap }],
      historyIndex: 0,
    });
  },
  
  // History actions
  saveHistory: () => {
    const state = get();
    if (!state.deck) return;
    
    // Create a deep copy of current state
    const snapshot = {
      deck: { ...state.deck },
      slides: new Map(state.slides),
    };
    
    // Remove any future history if we're not at the end
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({ historyIndex: state.historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    
    const newIndex = state.historyIndex - 1;
    const snapshot = state.history[newIndex];
    
    set({
      deck: snapshot.deck,
      slides: new Map(snapshot.slides),
      historyIndex: newIndex,
      selectedElementId: null, // Deselect on undo
    });
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    
    const newIndex = state.historyIndex + 1;
    const snapshot = state.history[newIndex];
    
    set({
      deck: snapshot.deck,
      slides: new Map(snapshot.slides),
      historyIndex: newIndex,
      selectedElementId: null, // Deselect on redo
    });
  },
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
  
  updateDeckTitle: (title) => set((state) => {
    if (!state.deck) return state;
    return { deck: { ...state.deck, title } };
  }),
  
  // Slide actions
  addSlide: () => set((state) => {
    if (!state.deck) return state;
    
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      deckId: state.deck.id,
      index: state.deck.slides.length,
      bg: { type: 'color', value: '#ffffff' },
      elements: [],
    };
    
    const newSlides = new Map(state.slides);
    newSlides.set(newSlideId, newSlide);
    
    return {
      deck: {
        ...state.deck,
        slides: [...state.deck.slides, { id: newSlideId }],
      },
      slides: newSlides,
      currentSlideId: newSlideId,
    };
  }),
  
  deleteSlide: (slideId) => set((state) => {
    if (!state.deck || state.deck.slides.length <= 1) return state; // Keep at least one slide
    
    const newSlides = new Map(state.slides);
    newSlides.delete(slideId);
    
    const newSlideRefs = state.deck.slides.filter(ref => ref.id !== slideId);
    const newCurrentSlideId = state.currentSlideId === slideId 
      ? newSlideRefs[0]?.id || null 
      : state.currentSlideId;
    
    return {
      deck: { ...state.deck, slides: newSlideRefs },
      slides: newSlides,
      currentSlideId: newCurrentSlideId,
      selectedElementId: null,
    };
  }),
  
  duplicateSlide: (slideId) => set((state) => {
    if (!state.deck) return state;
    
    const slideToDupe = state.slides.get(slideId);
    if (!slideToDupe) return state;
    
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      ...slideToDupe,
      id: newSlideId,
      index: state.deck.slides.length,
      elements: slideToDupe.elements.map(el => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}`,
      })),
    };
    
    const newSlides = new Map(state.slides);
    newSlides.set(newSlideId, newSlide);
    
    return {
      deck: {
        ...state.deck,
        slides: [...state.deck.slides, { id: newSlideId }],
      },
      slides: newSlides,
      currentSlideId: newSlideId,
    };
  }),
  
  reorderSlides: (fromIndex, toIndex) => set((state) => {
    if (!state.deck) return state;
    
    const newSlideRefs = [...state.deck.slides];
    const [moved] = newSlideRefs.splice(fromIndex, 1);
    newSlideRefs.splice(toIndex, 0, moved);
    
    return {
      deck: { ...state.deck, slides: newSlideRefs },
    };
  }),
  
  setCurrentSlide: (slideId) => set({ currentSlideId: slideId, selectedElementId: null }),
  
  updateSlideBackground: (slideId, bg) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, { ...slide, bg });
    
    return { slides: newSlides };
  }),
  
  // Element actions
  selectElement: (elementId) => set({ selectedElementId: elementId }),
  
  addElement: (slideId, element) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, {
      ...slide,
      elements: [...slide.elements, element],
    });
    
    return {
      slides: newSlides,
      selectedElementId: element.id,
    };
  }),
  
  updateElement: (slideId, elementId, updates) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, {
      ...slide,
      elements: slide.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      ),
    });
    
    return { slides: newSlides };
  }),
  
  deleteElement: (slideId, elementId) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, {
      ...slide,
      elements: slide.elements.filter(el => el.id !== elementId),
    });
    
    return {
      slides: newSlides,
      selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
    };
  }),
  
  duplicateElement: (slideId, elementId) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const elementToDupe = slide.elements.find(el => el.id === elementId);
    if (!elementToDupe) return state;
    
    const newElement = {
      ...elementToDupe,
      id: `${elementId}-copy-${Date.now()}`,
      x: elementToDupe.x + 20,
      y: elementToDupe.y + 20,
    };
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, {
      ...slide,
      elements: [...slide.elements, newElement],
    });
    
    return {
      slides: newSlides,
      selectedElementId: newElement.id,
    };
  }),
  
  reorderElement: (slideId, elementId, direction) => set((state) => {
    const slide = state.slides.get(slideId);
    if (!slide) return state;
    
    const elementIndex = slide.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return state;
    
    const newElements = [...slide.elements];
    const element = newElements[elementIndex];
    
    // Update z-index based on direction
    switch (direction) {
      case 'forward':
        if (elementIndex < newElements.length - 1) {
          [newElements[elementIndex], newElements[elementIndex + 1]] = 
          [newElements[elementIndex + 1], newElements[elementIndex]];
        }
        break;
      case 'backward':
        if (elementIndex > 0) {
          [newElements[elementIndex], newElements[elementIndex - 1]] = 
          [newElements[elementIndex - 1], newElements[elementIndex]];
        }
        break;
      case 'front':
        newElements.splice(elementIndex, 1);
        newElements.push(element);
        break;
      case 'back':
        newElements.splice(elementIndex, 1);
        newElements.unshift(element);
        break;
    }
    
    // Recalculate z-index
    newElements.forEach((el, idx) => {
      el.z = idx;
    });
    
    const newSlides = new Map(state.slides);
    newSlides.set(slideId, { ...slide, elements: newElements });
    
    return { slides: newSlides };
  }),
  
  // Helpers
  getCurrentSlide: () => {
    const state = get();
    if (!state.currentSlideId) return null;
    return state.slides.get(state.currentSlideId) || null;
  },
  
  getSelectedElement: () => {
    const state = get();
    if (!state.currentSlideId || !state.selectedElementId) return null;
    const slide = state.slides.get(state.currentSlideId);
    if (!slide) return null;
    return slide.elements.find(el => el.id === state.selectedElementId) || null;
  },
}));


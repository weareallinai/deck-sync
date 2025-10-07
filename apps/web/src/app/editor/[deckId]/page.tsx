'use client';

import { Stage } from '@/components/editor/Stage';
import { Toolbar } from '@/components/editor/Toolbar';
import { SidebarSlides } from '@/components/editor/SidebarSlides';
import { Inspector } from '@/components/editor/Inspector';
import { AnimationsPanel } from '@/components/editor/AnimationsPanel';
import { useEditorStore } from '@/lib/state/editorStore';
import { useEffect, useState, useCallback } from 'react';
import { mockDeck, mockSlides } from '@/lib/data/mockSlides';

export default function EditorPage({ params }: { params: Promise<{ deckId: string }> }) {
  const [deckId, setDeckId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const setDeck = useEditorStore(state => state.setDeck);
  
  // Get store actions for keyboard shortcuts
  const selectedElementId = useEditorStore(state => state.selectedElementId);
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const selectElement = useEditorStore(state => state.selectElement);
  const deleteElement = useEditorStore(state => state.deleteElement);
  const duplicateElement = useEditorStore(state => state.duplicateElement);
  const updateElement = useEditorStore(state => state.updateElement);
  const getSelectedElement = useEditorStore(state => state.getSelectedElement);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const canUndo = useEditorStore(state => state.canUndo);
  const canRedo = useEditorStore(state => state.canRedo);
  const saveHistory = useEditorStore(state => state.saveHistory);

  useEffect(() => {
    // Resolve params and load deck
    params.then(p => {
      setDeckId(p.deckId);
      
      // Load mock data for now
      // TODO: Replace with actual API call
      setDeck(mockDeck, mockSlides);
      setIsReady(true);
    });
  }, [params, setDeck]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    // Delete key
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId && currentSlideId) {
        e.preventDefault();
        deleteElement(currentSlideId, selectedElementId);
        saveHistory();
      }
      return;
    }

    // Escape key - deselect
    if (e.key === 'Escape') {
      e.preventDefault();
      selectElement(null);
      return;
    }

    // Cmd/Ctrl + D - duplicate
    if (modKey && e.key === 'd') {
      e.preventDefault();
      if (selectedElementId && currentSlideId) {
        duplicateElement(currentSlideId, selectedElementId);
        saveHistory();
      }
      return;
    }

    // Cmd/Ctrl + Z - undo
    if (modKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo()) {
        undo();
      }
      return;
    }

    // Cmd/Ctrl + Shift + Z - redo
    if (modKey && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      if (canRedo()) {
        redo();
      }
      return;
    }

    // Arrow keys - nudge position
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (selectedElementId && currentSlideId) {
        e.preventDefault();
        const element = getSelectedElement();
        if (!element) return;

        const nudgeAmount = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        switch (e.key) {
          case 'ArrowUp':
            dy = -nudgeAmount;
            break;
          case 'ArrowDown':
            dy = nudgeAmount;
            break;
          case 'ArrowLeft':
            dx = -nudgeAmount;
            break;
          case 'ArrowRight':
            dx = nudgeAmount;
            break;
        }

        updateElement(currentSlideId, selectedElementId, {
          x: element.x + dx,
          y: element.y + dy,
        });
        
        // Save history on first nudge, then debounce subsequent ones
        // For now, just save on every nudge (can optimize later)
        saveHistory();
      }
      return;
    }
  }, [
    selectedElementId,
    currentSlideId,
    selectElement,
    deleteElement,
    duplicateElement,
    updateElement,
    getSelectedElement,
    undo,
    redo,
    canUndo,
    canRedo,
    saveHistory,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Loading editor...</div>
          <div className="text-sm text-gray-500 mt-2">Deck ID: {deckId || '...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left sidebar - slides */}
      <aside className="w-64 bg-white border-r">
        <SidebarSlides />
      </aside>

      {/* Main editor */}
      <main className="flex-1 flex flex-col">
        <Toolbar />
        <div className="flex-1 overflow-hidden">
          <Stage />
        </div>
      </main>

      {/* Right sidebar - inspector & animations */}
      <aside className="w-80 bg-white border-l flex flex-col">
        <div className="flex-1 overflow-auto">
          <Inspector />
        </div>
        <div className="border-t">
          <AnimationsPanel />
        </div>
      </aside>
    </div>
  );
}


'use client';

import { Stage } from '@/components/editor/Stage';
import { Toolbar } from '@/components/editor/Toolbar';
import { SidebarSlides } from '@/components/editor/SidebarSlides';
import { Inspector } from '@/components/editor/Inspector';
import { AnimationsPanel } from '@/components/editor/AnimationsPanel';
import { useEditorStore } from '@/lib/state/editorStore';
import { useEffect, useState } from 'react';
import { mockDeck, mockSlides } from '@/lib/data/mockSlides';

export default function EditorPage({ params }: { params: Promise<{ deckId: string }> }) {
  const [deckId, setDeckId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const setDeck = useEditorStore(state => state.setDeck);

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


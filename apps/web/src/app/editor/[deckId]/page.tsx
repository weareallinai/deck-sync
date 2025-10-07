'use client';

import { Stage } from '@/components/editor/Stage';
import { Toolbar } from '@/components/editor/Toolbar';
import { SidebarSlides } from '@/components/editor/SidebarSlides';
import { Inspector } from '@/components/editor/Inspector';
import { AnimationsPanel } from '@/components/editor/AnimationsPanel';

export default function EditorPage({ params }: { params: Promise<{ deckId: string }> }) {
  // Stub: will load deck data and wire up state
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


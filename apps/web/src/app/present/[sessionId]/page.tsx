'use client';

import { PresenterControls } from '@/components/present/PresenterControls';
import { ConnectionStatus } from '@/components/present/ConnectionStatus';
import { useEffect, useState } from 'react';

export default function PresentPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  // Stub: will connect to WebSocket and manage presentation state
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main preview */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-2xl aspect-video w-full max-w-5xl">
          <div className="flex items-center justify-center h-full text-gray-400">
            Preview Area - Session: {sessionId}
          </div>
        </div>
      </main>

      {/* Control panel */}
      <aside className="w-96 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <ConnectionStatus />
        </div>
        <div className="flex-1 overflow-auto p-4">
          <PresenterControls />
        </div>
      </aside>
    </div>
  );
}


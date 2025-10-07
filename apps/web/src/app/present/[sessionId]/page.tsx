'use client';

import { PresenterControls } from '@/components/present/PresenterControls';
import { ConnectionStatus } from '@/components/present/ConnectionStatus';
import { useEffect, useState, useRef } from 'react';

export default function PresentPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    params.then(p => {
      setSessionId(p.sessionId);
      connectWebSocket(p.sessionId);
    });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [params]);

  const connectWebSocket = (sid: string) => {
    // Connect to Cloudflare Durable Object
    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8787';
    const url = `${wsUrl}/${sid}`;
    
    console.log('[Presenter] Connecting to:', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[Presenter] Connected');
      setIsConnected(true);
      
      // Send HELLO message
      ws.send(JSON.stringify({
        t: 'HELLO',
        role: 'presenter',
        token: 'presenter-token', // TODO: Get from API
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Presenter] Received:', message);

        if (message.t === 'STATE') {
          setCurrentStep(message.step);
        }
      } catch (error) {
        console.error('[Presenter] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[Presenter] WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[Presenter] Disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const sendCommand = (cmd: string, slideId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[Presenter] WebSocket not connected');
      return;
    }

    const message: any = {
      t: 'CMD',
      cmd,
    };

    if (slideId) {
      message.slideId = slideId;
    }

    console.log('[Presenter] Sending command:', message);
    wsRef.current.send(JSON.stringify(message));
  };

  const handleStart = () => sendCommand('START', 'slide-1');
  const handleNext = () => sendCommand('NEXT_STEP');
  const handlePrev = () => sendCommand('PREV_STEP');

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main preview */}
      <main className="flex-1 flex items-center justify-center p-8 bg-black overflow-hidden">
        <div 
          className="border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl bg-black"
          style={{ 
            width: '90%',
            maxWidth: '1200px',
            aspectRatio: '16/9'
          }}
        >
          {sessionId && (
            <iframe
              src={`/view/${sessionId}?t=presenter-preview`}
              className="w-full h-full border-0"
              title="Presenter Preview"
            />
          )}
        </div>
      </main>

      {/* Control panel */}
      <aside className="w-96 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <ConnectionStatus isConnected={isConnected} />
        </div>
        <div className="flex-1 overflow-auto p-4">
          <PresenterControls 
            onStart={handleStart}
            onNext={handleNext}
            onPrev={handlePrev}
            currentStep={currentStep}
          />
        </div>
      </aside>
    </div>
  );
}


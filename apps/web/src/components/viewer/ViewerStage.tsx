'use client';

import { useEffect, useState, useRef } from 'react';

// GUARDRAIL: Viewer component must NOT import Konva or editor dependencies
// GUARDRAIL: Use only CSS transforms/opacity for animations

interface ViewerStageProps {
  sessionId: string;
  token: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function ViewerStage({ sessionId, token }: ViewerStageProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8787';
    const url = `${wsUrl}/${sessionId}`;
    
    console.log('[Viewer] Connecting to:', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[Viewer] Connected');
      setIsConnected(true);
      
      // Send HELLO message with viewer role
      ws.send(JSON.stringify({
        t: 'HELLO',
        role: 'viewer',
        token,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Viewer] Received:', message);

        if (message.t === 'STATE') {
          // Initial state
          setCurrentStep(message.step);
          addEvent(`STATE received: step ${message.step}`);
        } else if (message.t === 'EVT') {
          // Event from coordinator
          addEvent(`EVT: ${message.cmd} (seq=${message.seq})`);
          
          // Handle command events
          switch (message.cmd) {
            case 'START':
              setCurrentStep(0);
              setColorIndex(0);
              addEvent('Presentation started');
              break;
              
            case 'NEXT_STEP':
              setCurrentStep(prev => prev + 1);
              setColorIndex(prev => (prev + 1) % COLORS.length);
              addEvent(`Step forward to ${currentStep + 1}`);
              break;
              
            case 'PREV_STEP':
              setCurrentStep(prev => Math.max(0, prev - 1));
              setColorIndex(prev => (prev - 1 + COLORS.length) % COLORS.length);
              addEvent(`Step back to ${Math.max(0, currentStep - 1)}`);
              break;
          }
        }
      } catch (error) {
        console.error('[Viewer] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[Viewer] WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[Viewer] Disconnected');
      setIsConnected(false);
      addEvent('Disconnected');
    };

    wsRef.current = ws;
  };

  const addEvent = (event: string) => {
    setEvents(prev => [
      `[${new Date().toLocaleTimeString()}] ${event}`,
      ...prev.slice(0, 9) // Keep last 10 events
    ]);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Color indicator - changes on NEXT/PREV */}
      <div className={`flex-1 flex items-center justify-center transition-colors duration-500 ${COLORS[colorIndex]}`}>
        <div className="text-white text-center">
          <h1 className="text-6xl font-bold mb-4">Step {currentStep}</h1>
          <p className="text-2xl opacity-75">Session: {sessionId}</p>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white'}`} />
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Event log */}
      <div className="h-48 bg-black bg-opacity-50 p-4 overflow-auto">
        <h3 className="text-white text-xs font-mono mb-2">EVENT LOG:</h3>
        <div className="space-y-1">
          {events.map((event, i) => (
            <div key={i} className="text-green-400 text-xs font-mono">
              {event}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


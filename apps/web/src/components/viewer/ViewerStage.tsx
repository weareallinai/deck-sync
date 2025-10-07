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

  const [clockOffset, setClockOffset] = useState(0);
  const pendingEvents = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Clear pending timeouts
      pendingEvents.current.forEach(timeout => clearTimeout(timeout));
      pendingEvents.current.clear();
    };
  }, [sessionId]);

  const connectWebSocket = async () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8787';
    const url = `${wsUrl}/${sessionId}`;
    
    console.log('[Viewer] Connecting to:', url);
    const ws = new WebSocket(url);

    ws.onopen = async () => {
      console.log('[Viewer] Connected');
      setIsConnected(true);
      
      // Send HELLO message with viewer role
      ws.send(JSON.stringify({
        t: 'HELLO',
        role: 'viewer',
        token,
      }));

      // Perform clock sync
      await performClockSync(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle PONG for clock sync
        if (message.t === 'PONG') {
          return; // Handled by syncClock
        }

        console.log('[Viewer] Received:', message);

        if (message.t === 'STATE') {
          // Initial state
          setCurrentStep(message.step);
          addEvent(`STATE received: step ${message.step}`);
        } else if (message.t === 'EVT') {
          // Event from coordinator with applyAt timestamp
          const latency = Date.now() - (message.applyAt - clockOffset);
          addEvent(`EVT: ${message.cmd} (seq=${message.seq}, latency=${latency.toFixed(0)}ms)`);
          
          // Schedule event at applyAt + offset
          scheduleEvent(message);
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

  const performClockSync = async (ws: WebSocket) => {
    try {
      addEvent('Starting clock sync...');
      const offsets: number[] = [];
      
      // Take 6 samples for clock sync
      for (let i = 0; i < 6; i++) {
        const t0 = Date.now();
        ws.send(JSON.stringify({ t: 'PING', ts: t0 }));
        
        // Wait for PONG
        const serverTs = await new Promise<number>((resolve) => {
          const handler = (ev: MessageEvent) => {
            try {
              const m = JSON.parse(ev.data);
              if (m.t === 'PONG') {
                ws.removeEventListener('message', handler as any);
                resolve(m.ts as number);
              }
            } catch {}
          };
          ws.addEventListener('message', handler as any);
        });
        
        const t1 = Date.now();
        const rtt = t1 - t0;
        const offset = serverTs - (t0 + rtt / 2);
        offsets.push(offset);
      }
      
      // Use median offset
      offsets.sort((a, b) => a - b);
      const median = offsets[Math.floor(offsets.length / 2)];
      setClockOffset(median);
      
      addEvent(`Clock synced! Offset: ${median.toFixed(0)}ms`);
      console.log('[Viewer] Clock offset:', median);
    } catch (error) {
      console.error('[Viewer] Clock sync failed:', error);
      addEvent('Clock sync failed');
    }
  };

  const scheduleEvent = (message: any) => {
    // Calculate when to apply this event
    const now = Date.now();
    const applyAt = message.applyAt + clockOffset;
    const delay = Math.max(0, applyAt - now);
    
    console.log(`[Viewer] Scheduling ${message.cmd} in ${delay}ms (applyAt=${applyAt}, now=${now})`);
    
    // Clear any existing timeout for this sequence
    const existing = pendingEvents.current.get(message.seq);
    if (existing) {
      clearTimeout(existing);
    }
    
    // Schedule the event
    const timeout = setTimeout(() => {
      applyEvent(message);
      pendingEvents.current.delete(message.seq);
    }, delay);
    
    pendingEvents.current.set(message.seq, timeout);
  };

  const applyEvent = (message: any) => {
    console.log(`[Viewer] Applying ${message.cmd} at ${Date.now()}`);
    addEvent(`Applied: ${message.cmd}`);
    
    switch (message.cmd) {
      case 'START':
        setCurrentStep(0);
        setColorIndex(0);
        break;
        
      case 'NEXT_STEP':
        setCurrentStep(prev => prev + 1);
        setColorIndex(prev => (prev + 1) % COLORS.length);
        break;
        
      case 'PREV_STEP':
        setCurrentStep(prev => Math.max(0, prev - 1));
        setColorIndex(prev => (prev - 1 + COLORS.length) % COLORS.length);
        break;
    }
  };

  const addEvent = (event: string) => {
    setEvents(prev => [
      `[${new Date().toLocaleTimeString()}] ${event}`,
      ...prev.slice(0, 14) // Keep last 15 events
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


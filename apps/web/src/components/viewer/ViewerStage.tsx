'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { SlideRenderer } from './SlideRenderer';
import { mockSlides } from '@/lib/data/mockSlides';
import { preloadManager } from '@/lib/render/preload';
import { ReconnectManager } from '@/lib/realtime/reconnect';

// GUARDRAIL: Viewer component must NOT import Konva or editor dependencies
// GUARDRAIL: Use only CSS transforms/opacity for animations

interface ViewerStageProps {
  sessionId: string;
  token: string;
  isPreview?: boolean;
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

export function ViewerStage({ sessionId, token, isPreview = false }: ViewerStageProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const [clockOffset, setClockOffset] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastSeq, setLastSeq] = useState(-1);
  const pendingEvents = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const reconnectManager = useRef(new ReconnectManager());
  const lastSeqRef = useRef(-1);
  const clockOffsetRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    lastSeqRef.current = lastSeq;
  }, [lastSeq]);

  useEffect(() => {
    clockOffsetRef.current = clockOffset;
  }, [clockOffset]);

  const connectWebSocket = useCallback(async () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8787';
    const url = `${wsUrl}/${sessionId}`;
    
    console.log('[Viewer] Connecting to:', url);
    const ws = new WebSocket(url);

    ws.onopen = async () => {
      console.log('[Viewer] Connected');
      setIsConnected(true);
      setReconnectAttempts(0);
      reconnectManager.current.reset();
      
      // Send HELLO message with viewer role
      ws.send(JSON.stringify({
        t: 'HELLO',
        role: 'viewer',
        token,
      }));

      // Request snapshot if we've seen events before (reconnect)
      if (lastSeqRef.current >= 0) {
        console.log('[Viewer] Requesting snapshot after reconnect');
        ws.send(JSON.stringify({ t: 'REQUEST_SNAPSHOT' }));
      }

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
          // Initial state or snapshot
          setCurrentStep(message.step);
          setCurrentSlideId(message.slideId);
          setLastSeq(message.seq);
          addEvent(`STATE received: step ${message.step}, slide ${message.slideId}, seq ${message.seq}`);
        } else if (message.t === 'EVT') {
          // Check for sequence gap
          if (lastSeqRef.current >= 0 && message.seq > lastSeqRef.current + 1) {
            console.warn(`[Viewer] Sequence gap detected: expected ${lastSeqRef.current + 1}, got ${message.seq}`);
            addEvent(`⚠️ Sequence gap - requesting snapshot`);
            ws.send(JSON.stringify({ t: 'REQUEST_SNAPSHOT' }));
          }
          
          setLastSeq(message.seq);
          
          // Event from coordinator with applyAt timestamp
          const latency = Date.now() - (message.applyAt - clockOffsetRef.current);
          addEvent(`EVT: ${message.cmd} (seq=${message.seq}, latency=${latency.toFixed(0)}ms)`);
          
          // Schedule event at applyAt + offset
          scheduleEvent(message);
        }
      } catch (error) {
        console.error('[Viewer] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      // Suppress error logging for premature close (React Strict Mode)
      // Errors are typically handled in onclose
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[Viewer] Disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect
      const shouldReconnect = reconnectManager.current.scheduleReconnect(() => {
        setReconnectAttempts(reconnectManager.current.getAttempts());
        addEvent(`🔄 Reconnecting... (attempt ${reconnectManager.current.getAttempts()})`);
        connectWebSocket();
      });
      
      if (!shouldReconnect) {
        addEvent('❌ Max reconnect attempts reached');
      }
    };

    wsRef.current = ws;
  }, [sessionId, token]);

  useEffect(() => {
    // Don't connect until we have a valid sessionId
    if (!sessionId) {
      console.log('[Viewer] Waiting for sessionId...');
      return;
    }

    console.log('[Viewer] Initializing connection for session:', sessionId);
    connectWebSocket();

    return () => {
      reconnectManager.current.cancel();
      if (wsRef.current) {
        // Only close if WebSocket is in OPEN or CONNECTING state
        const ws = wsRef.current;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        wsRef.current = null;
      }
      // Clear pending timeouts
      pendingEvents.current.forEach(timeout => clearTimeout(timeout));
      pendingEvents.current.clear();
    };
  }, [connectWebSocket, sessionId]);

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
    const applyAt = message.applyAt + clockOffsetRef.current;
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
        setCurrentSlideId(message.slideId || 'slide-1');
        break;
        
      case 'NEXT_STEP':
        setCurrentStep(prev => prev + 1);
        setColorIndex(prev => (prev + 1) % COLORS.length);
        break;
        
      case 'PREV_STEP':
        setCurrentStep(prev => Math.max(0, prev - 1));
        setColorIndex(prev => (prev - 1 + COLORS.length) % COLORS.length);
        break;

      case 'JUMP_SLIDE':
        setCurrentSlideId(message.slideId);
        setCurrentStep(0);
        break;
    }
  };

  const addEvent = (event: string) => {
    setEvents(prev => [
      `[${new Date().toLocaleTimeString()}] ${event}`,
      ...prev.slice(0, 14) // Keep last 15 events
    ]);
  };

  // Get current slide from mock data
  const currentSlide = mockSlides.find(s => s.id === currentSlideId) || mockSlides[0];

  // Preload next slide
  useEffect(() => {
    if (currentSlide) {
      const nextSlideIndex = currentSlide.index + 1;
      const nextSlide = mockSlides[nextSlideIndex];
      if (nextSlide) {
        preloadManager.preloadSlide(nextSlide);
      }
    }
  }, [currentSlide]);

  // Handle after-media advance
  const handleVideoEnd = () => {
    if (currentSlide?.advance?.type === 'after-media') {
      addEvent('Video ended - auto-advancing...');
      console.log('[Viewer] After-media advance triggered');
      
      // Auto-advance to next slide (simulate NEXT_STEP)
      // In a real implementation, this might send a message to coordinator
      // For now, just advance locally as if we received an event
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setColorIndex(prev => (prev + 1) % COLORS.length);
        
        // Move to next slide if this was the last element
        const nextSlideIndex = currentSlide.index + 1;
        if (nextSlideIndex < mockSlides.length) {
          setCurrentSlideId(mockSlides[nextSlideIndex].id);
          setCurrentStep(0);
        }
      }, 500); // Small delay for smooth transition
    }
  };

  const [showDebug, setShowDebug] = useState(!isPreview);

  return (
    <div 
      className={`flex flex-col bg-black ${isPreview ? 'w-full h-full' : 'h-screen w-screen'}`}
    >
      {/* Main slide renderer */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className={`aspect-video ${isPreview ? 'w-full h-full' : 'w-full h-full max-w-[1280px] max-h-[720px]'}`}>
            <SlideRenderer 
              slide={currentSlide} 
              step={currentStep}
              onVideoEnd={handleVideoEnd}
            />
          </div>
        </div>

        {/* Connection indicator overlay */}
        {!isPreview && (
          <div className="absolute top-4 right-4 z-50">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-500' : reconnectAttempts > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white'}`} />
              <span className="text-white text-xs font-medium">
                {isConnected ? 'Live' : reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Disconnected'}
              </span>
            </div>
          </div>
        )}

        {/* Debug toggle */}
        {!isPreview && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="absolute bottom-4 right-4 z-50 px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded hover:bg-opacity-70"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        )}
      </div>

      {/* Event log (debug panel) */}
      {showDebug && !isPreview && (
        <div className="h-40 bg-black bg-opacity-90 p-3 overflow-auto border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-green-400 text-xs font-mono font-bold">EVENT LOG</h3>
            <div className="text-gray-400 text-xs font-mono">
              Slide: {currentSlide?.id} | Step: {currentStep}
            </div>
          </div>
          <div className="space-y-0.5">
            {events.map((event, i) => (
              <div key={i} className="text-green-400 text-xs font-mono leading-tight">
                {event}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


import type { WSClient } from './wsClient';
import type { WSPong } from '@deck/shared';

/**
 * Synchronize clock with server using multiple samples
 * GUARDRAIL: Uses median offset for stability
 */
export async function syncClock(ws: WebSocket, samples = 6): Promise<{ offset: number }> {
  const offsets: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t0 = Date.now();
    ws.send(JSON.stringify({ t: 'PING', ts: t0 }));
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
      ws.addEventListener('message', handler as any, { once: true });
    });
    const t1 = Date.now();
    const rtt = t1 - t0;
    const offset = serverTs - (t0 + rtt / 2);
    offsets.push(offset);
  }
  const median = offsets.sort((a, b) => a - b)[Math.floor(offsets.length / 2)];
  return { offset: median };
}

/**
 * Legacy class-based ClockSync (deprecated, use syncClock function above)
 */
export class ClockSync {
  private offset = 0;
  private rtt = 0;
  private samples: number[] = [];
  private maxSamples = 5;

  async sync(wsClient: WSClient): Promise<number> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const unsubscribe = wsClient.onMessage((message) => {
        if (message.t === 'PONG') {
          const endTime = Date.now();
          const rtt = endTime - message.clientTime;
          const serverTime = message.serverTime;
          const estimatedServerNow = serverTime + rtt / 2;
          const offset = estimatedServerNow - endTime;
          
          this.addSample(offset);
          this.rtt = rtt;
          
          unsubscribe();
          resolve(this.offset);
        }
      });

      wsClient.ping();
      
      // Timeout after 5s
      setTimeout(() => {
        unsubscribe();
        resolve(this.offset);
      }, 5000);
    });
  }

  private addSample(offset: number) {
    this.samples.push(offset);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    // Use median for stability
    const sorted = [...this.samples].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    this.offset = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  getOffset(): number {
    return this.offset;
  }

  getRTT(): number {
    return this.rtt;
  }

  nowServer(): number {
    return Date.now() + this.offset;
  }
}


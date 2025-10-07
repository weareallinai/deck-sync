import type { WSMessage, WSCommand, WSEvent, Session } from '@deck/shared';
import { WSMessageSchema } from '@deck/shared';

interface SessionState {
  seq: number;
  status: Session['status'];
  slideId: string | null;
  step: number;
  deckId: string;
  clients: Map<string, WebSocket>;
  presenterId: string | null;
  rttSamples: number[];
}

export class SessionCoordinator {
  private state: SessionState;
  private env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = {
      seq: 0,
      status: 'idle',
      slideId: null,
      step: 0,
      deckId: '',
      clients: new Map(),
      presenterId: null,
      rttSamples: [],
    };
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleWebSocket(ws: WebSocket) {
    ws.accept();

    const clientId = crypto.randomUUID();
    let role: 'presenter' | 'viewer' | null = null;

    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string) as WSMessage;
        const validated = WSMessageSchema.parse(message);

        switch (validated.t) {
          case 'HELLO':
            role = validated.role;
            if (role === 'presenter') {
              this.state.presenterId = clientId;
            }
            this.state.clients.set(clientId, ws);
            this.sendState(ws);
            break;

          case 'CMD':
            if (role === 'presenter') {
              this.handleCommand(validated);
            }
            break;

          case 'PING':
            this.sendMessage(ws, {
              t: 'PONG',
              clientTime: validated.clientTime,
              serverTime: Date.now(),
            });
            break;
        }
      } catch (error) {
        console.error('[SessionCoordinator] Message error:', error);
      }
    });

    ws.addEventListener('close', () => {
      this.state.clients.delete(clientId);
      if (clientId === this.state.presenterId) {
        this.state.presenterId = null;
      }
    });

    ws.addEventListener('error', (event) => {
      console.error('[SessionCoordinator] WebSocket error:', event);
    });
  }

  private handleCommand(cmd: WSCommand) {
    this.state.seq += 1;

    const guardMs = this.estimateGuard();
    const applyAt = Date.now() + guardMs;

    const event: WSEvent = {
      t: 'EVT',
      seq: this.state.seq,
      cmd: cmd.cmd,
      payload: cmd.payload,
      applyAt,
    };

    // Update state
    this.reduceState(event);

    // Broadcast to all clients
    this.broadcast(event);
  }

  private reduceState(event: WSEvent) {
    switch (event.cmd) {
      case 'START':
        this.state.status = 'running';
        this.state.slideId = (event.payload as any)?.slideId || this.state.slideId;
        this.state.step = 0;
        break;

      case 'PAUSE':
        this.state.status = 'paused';
        break;

      case 'RESUME':
        this.state.status = 'running';
        break;

      case 'STOP':
        this.state.status = 'ended';
        break;

      case 'NEXT_STEP':
        this.state.step += 1;
        break;

      case 'PREV_STEP':
        this.state.step = Math.max(0, this.state.step - 1);
        break;

      case 'JUMP_SLIDE':
        this.state.slideId = (event.payload as any)?.slideId;
        this.state.step = 0;
        break;

      case 'RESTART_SLIDE':
        this.state.step = 0;
        break;
    }
  }

  private broadcast(message: WSMessage) {
    const json = JSON.stringify(message);
    for (const [clientId, ws] of this.state.clients.entries()) {
      try {
        ws.send(json);
      } catch (error) {
        console.error(`[SessionCoordinator] Failed to send to ${clientId}:`, error);
        this.state.clients.delete(clientId);
      }
    }
  }

  private sendMessage(ws: WebSocket, message: WSMessage) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[SessionCoordinator] Failed to send message:', error);
    }
  }

  private sendState(ws: WebSocket) {
    this.sendMessage(ws, {
      t: 'STATE',
      seq: this.state.seq,
      slideId: this.state.slideId,
      step: this.state.step,
      status: this.state.status,
      serverTime: Date.now(),
    });
  }

  private estimateGuard(): number {
    // Use median RTT / 2 + 30ms, clamped to [50, 150]ms
    if (this.state.rttSamples.length === 0) {
      return 50;
    }

    const sorted = [...this.state.rttSamples].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianRTT = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    const guard = medianRTT / 2 + 30;
    return Math.max(50, Math.min(150, guard));
  }
}

export default {
  async fetch(request: Request, env: any) {
    return new Response('Session Coordinator Worker', { status: 200 });
  },
};


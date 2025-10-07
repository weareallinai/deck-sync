/**
 * Cloudflare Durable Object: Session Coordinator
 * Handles WebSocket connections for real-time presentation sync
 */

export interface Env {
  SESSION_COORDINATOR: DurableObjectNamespace;
}

interface ClientInfo {
  role: 'presenter' | 'viewer';
  ws: WebSocket;
}

export class SessionCoordinator {
  private state: DurableObjectState;
  private env: Env;
  private clients: Map<string, ClientInfo>;
  private seq: number;
  private currentStep: number;
  private currentSlideId: string | null;
  private presenterId: string | null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.clients = new Map();
    this.seq = 0;
    this.currentStep = 0;
    this.currentSlideId = null;
    this.presenterId = null;
  }

  async fetch(request: Request): Promise<Response> {
    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept and handle the server-side WebSocket
    this.handleWebSocket(server as WebSocket);

    // Return the client-side WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleWebSocket(ws: WebSocket) {
    ws.accept();

    const clientId = crypto.randomUUID();
    console.log(`[Coordinator] Client connected: ${clientId}`);

    let clientRole: 'presenter' | 'viewer' | null = null;

    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? event.data : event.data.toString();
        const message = JSON.parse(data);

        console.log(`[Coordinator] Received from ${clientId}:`, message.t);

        switch (message.t) {
          case 'HELLO':
            // Register client
            clientRole = message.role;
            this.clients.set(clientId, { role: clientRole, ws });
            
            if (clientRole === 'presenter') {
              this.presenterId = clientId;
              console.log(`[Coordinator] Presenter registered: ${clientId}`);
            }

            // Send current state
            this.sendToClient(ws, {
              t: 'STATE',
              seq: this.seq,
              slideId: this.currentSlideId,
              step: this.currentStep,
              serverTime: Date.now(),
            });
            break;

          case 'PING':
            // Echo back PONG with server timestamp
            this.sendToClient(ws, {
              t: 'PONG',
              ts: Date.now(),
            });
            break;

          case 'REQUEST_SNAPSHOT':
            // Send current state snapshot
            console.log(`[Coordinator] Snapshot requested by ${clientId}`);
            this.sendToClient(ws, {
              t: 'STATE',
              seq: this.seq,
              slideId: this.currentSlideId,
              step: this.currentStep,
              serverTime: Date.now(),
            });
            break;

          case 'CMD':
            // Only presenter can send commands
            if (clientRole === 'presenter') {
              this.handleCommand(message);
            } else {
              console.warn(`[Coordinator] Non-presenter tried to send command: ${clientId}`);
            }
            break;
        }
      } catch (error) {
        console.error(`[Coordinator] Error handling message from ${clientId}:`, error);
      }
    });

    ws.addEventListener('close', () => {
      console.log(`[Coordinator] Client disconnected: ${clientId}`);
      this.clients.delete(clientId);
      
      if (clientId === this.presenterId) {
        this.presenterId = null;
        console.log('[Coordinator] Presenter disconnected');
      }
    });

    ws.addEventListener('error', (event: Event) => {
      console.error(`[Coordinator] WebSocket error for ${clientId}:`, event);
    });
  }

  private handleCommand(cmd: any) {
    this.seq += 1;

    // Update state based on command
    switch (cmd.cmd) {
      case 'START':
        console.log('[Coordinator] START command');
        this.currentStep = 0;
        this.currentSlideId = cmd.slideId || 'slide-1';
        break;

      case 'NEXT_STEP':
        console.log('[Coordinator] NEXT_STEP command');
        this.currentStep += 1;
        break;

      case 'PREV_STEP':
        console.log('[Coordinator] PREV_STEP command');
        this.currentStep = Math.max(0, this.currentStep - 1);
        break;

      case 'JUMP_SLIDE':
        console.log(`[Coordinator] JUMP_SLIDE to ${cmd.slideId}`);
        this.currentSlideId = cmd.slideId;
        this.currentStep = 0;
        break;
    }

    // Broadcast event to all clients
    const guardMs = 50; // Simple 50ms guard for MVP
    const applyAt = Date.now() + guardMs;

    const event = {
      t: 'EVT',
      seq: this.seq,
      cmd: cmd.cmd,
      slideId: cmd.slideId,
      applyAt,
    };

    console.log(`[Coordinator] Broadcasting event (seq=${this.seq}):`, event);
    this.broadcast(event);
  }

  private broadcast(message: any) {
    const json = JSON.stringify(message);
    let sent = 0;
    let failed = 0;

    for (const [clientId, info] of this.clients.entries()) {
      try {
        info.ws.send(json);
        sent++;
      } catch (error) {
        console.error(`[Coordinator] Failed to send to ${clientId}:`, error);
        this.clients.delete(clientId);
        failed++;
      }
    }

    console.log(`[Coordinator] Broadcast complete: ${sent} sent, ${failed} failed`);
  }

  private sendToClient(ws: WebSocket, message: any) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[Coordinator] Failed to send to client:', error);
    }
  }
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract session ID from URL
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/').pop() || 'default';

    // Get Durable Object for this session
    const id = env.SESSION_COORDINATOR.idFromName(sessionId);
    const stub = env.SESSION_COORDINATOR.get(id);

    // Forward request to Durable Object
    return stub.fetch(request);
  },
};


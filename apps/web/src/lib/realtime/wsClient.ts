import type { WSMessage, WSCommand, CommandType } from '@deck/shared';
import { buildCommand, buildPing, buildHello } from '@deck/shared';

type MessageHandler = (message: WSMessage) => void;

export class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private role: 'presenter' | 'viewer';
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private seq = 0;
  private lastKnownSeq = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string, token: string, role: 'presenter' | 'viewer') {
    this.url = url;
    this.token = token;
    this.role = role;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WSClient] Connected');
          this.reconnectAttempts = 0;
          this.send(buildHello(this.role, this.token));
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as WSMessage;
          this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('[WSClient] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WSClient] Disconnected');
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WSMessage) {
    // GUARDRAIL: Validate all messages with Zod
    try {
      // Message already parsed as JSON, now validate with Zod
      // (In production, import and use WSMessageSchema.parse(message))
      
      // GUARDRAIL: Check sequence integrity
      if (message.t === 'EVT' || message.t === 'STATE') {
        const expectedSeq = this.lastKnownSeq + 1;
        
        if (message.seq !== expectedSeq && this.lastKnownSeq !== 0) {
          console.warn(
            `[WSClient] Sequence gap detected: expected ${expectedSeq}, got ${message.seq}`
          );
          this.requestSnapshot();
          return;
        }
        
        this.lastKnownSeq = message.seq;
      }
      
      this.handlers.forEach((handler) => handler(message));
    } catch (error) {
      console.warn('[WSClient] Invalid message, dropping:', error);
      // Drop invalid messages
    }
  }
  
  private requestSnapshot() {
    console.log('[WSClient] Requesting state snapshot');
    this.send({ t: 'REQUEST_SNAPSHOT', lastKnownSeq: this.lastKnownSeq });
  }

  sendCommand(cmd: CommandType, payload?: unknown) {
    this.seq += 1;
    const command = buildCommand(this.seq, cmd, payload);
    this.send(command);
  }

  ping() {
    this.send(buildPing());
  }

  private send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.ping();
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WSClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WSClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}


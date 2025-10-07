/**
 * Exponential backoff reconnect logic for WebSocket connections
 */

interface ReconnectConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
}

export class ReconnectManager {
  private attempts = 0;
  private config: Required<ReconnectConfig>;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: ReconnectConfig = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 10,
      initialDelayMs: config.initialDelayMs ?? 1000,
      maxDelayMs: config.maxDelayMs ?? 30000,
      backoffFactor: config.backoffFactor ?? 2,
    };
  }

  /**
   * Calculate delay for next reconnect attempt
   */
  getDelay(): number {
    const delay = Math.min(
      this.config.initialDelayMs * Math.pow(this.config.backoffFactor, this.attempts),
      this.config.maxDelayMs
    );
    return delay;
  }

  /**
   * Schedule a reconnect attempt
   */
  scheduleReconnect(callback: () => void): boolean {
    if (this.attempts >= this.config.maxAttempts) {
      console.warn('[Reconnect] Max attempts reached');
      return false;
    }

    const delay = this.getDelay();
    console.log(`[Reconnect] Attempt ${this.attempts + 1}/${this.config.maxAttempts} in ${delay}ms`);

    this.timeoutId = setTimeout(() => {
      this.attempts++;
      callback();
    }, delay);

    return true;
  }

  /**
   * Reset reconnect state (call on successful connect)
   */
  reset() {
    this.attempts = 0;
    this.cancel();
  }

  /**
   * Cancel pending reconnect
   */
  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get current attempt count
   */
  getAttempts(): number {
    return this.attempts;
  }

  /**
   * Check if max attempts reached
   */
  isExhausted(): boolean {
    return this.attempts >= this.config.maxAttempts;
  }
}


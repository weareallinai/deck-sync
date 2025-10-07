import type { CommandType, WSCommand, WSPing, WSHello } from './types';

// Refined message types for presenter -> coordinator -> viewer flow
export type PresenterCmd =
  | { t: 'CMD'; cmd: 'START'; seq?: number }
  | { t: 'CMD'; cmd: 'NEXT_STEP'; seq?: number }
  | { t: 'CMD'; cmd: 'PREV_STEP'; seq?: number }
  | { t: 'CMD'; cmd: 'JUMP_SLIDE'; slideId: string; seq?: number };

export type CoordinatorEvt =
  | { t: 'STATE'; seq: number; slideId: string | null; step: number; serverTime: number }
  | { t: 'EVT'; seq: number; applyAt: number; payload: Omit<PresenterCmd, 't' | 'seq'> };

export type Ping = { t: 'PING'; ts: number };
export type Pong = { t: 'PONG'; ts: number };

// Message builders for client -> server
export function buildCommand(
  seq: number,
  cmd: CommandType,
  payload?: unknown
): WSCommand {
  return {
    t: 'CMD',
    seq,
    cmd,
    payload,
    at: Date.now(),
  };
}

export function buildPing(): WSPing {
  return {
    t: 'PING',
    clientTime: Date.now(),
  };
}

export function buildHello(role: 'presenter' | 'viewer', token: string): WSHello {
  return {
    t: 'HELLO',
    role,
    token,
  };
}

// Refined message builders using new types
export function buildPresenterCmd(cmd: PresenterCmd['cmd'], slideId?: string): PresenterCmd {
  if (cmd === 'JUMP_SLIDE' && slideId) {
    return { t: 'CMD', cmd: 'JUMP_SLIDE', slideId };
  }
  return { t: 'CMD', cmd } as PresenterCmd;
}

export function buildPingV2(): Ping {
  return { t: 'PING', ts: Date.now() };
}

export function buildPongV2(ts: number): Pong {
  return { t: 'PONG', ts };
}


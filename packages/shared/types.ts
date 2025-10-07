// Core domain types
export type Deck = {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slides: SlideRef[];
};

export type SlideRef = {
  id: string;
  hidden?: boolean;
};

export type Slide = {
  id: string;
  deckId: string;
  index: number;
  bg: Background;
  elements: Element[];
  transition?: Transition;
  advance?: AdvanceRule;
};

export type Background =
  | { type: 'color'; value: string }
  | { type: 'gradient'; value: string }
  | { type: 'image'; value: string };

export type Element = TextEl | ShapeEl | ImageEl | VideoEl;

export type BaseEl = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  animations?: Animation[];
};

export type TextEl = BaseEl & {
  type: 'text';
  content: string;
  style: TextStyle;
};

export type ShapeEl = BaseEl & {
  type: 'shape';
  shape: 'rect' | 'ellipse' | 'line';
  fill?: string;
  stroke?: Stroke;
};

export type ImageEl = BaseEl & {
  type: 'image';
  src: string;
  alt?: string;
};

export type VideoEl = BaseEl & {
  type: 'video';
  src: string | { youtubeId?: string; vimeoId?: string };
  loop?: boolean;
  startAt?: number;
};

export type TextStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
};

export type Stroke = {
  color: string;
  width: number;
};

export type Animation = {
  kind: 'fade' | 'move' | 'scale' | 'dissolve';
  durationMs: number;
  delayMs?: number;
  easing?: string;
  order: number;
};

export type Transition = {
  kind: 'fade' | 'dissolve' | 'cube' | 'pageFlip' | 'morphLite';
  durationMs: number;
  easing?: string;
};

export type AdvanceRule =
  | { type: 'click' }
  | { type: 'auto'; delayMs: number }
  | { type: 'after-media' };

// Session types
export type Session = {
  id: string;
  deckId: string;
  status: 'idle' | 'running' | 'paused' | 'ended';
  createdAt: string;
  endedAt?: string;
};

// WebSocket message types
export type WSMessage =
  | WSCommand
  | WSEvent
  | WSState
  | WSPing
  | WSPong
  | WSHello;

export type WSCommand = {
  t: 'CMD';
  seq: number;
  cmd: CommandType;
  payload?: unknown;
  at: number;
};

export type WSEvent = {
  t: 'EVT';
  seq: number;
  cmd: CommandType;
  payload?: unknown;
  applyAt: number;
};

export type WSState = {
  t: 'STATE';
  seq: number;
  slideId: string | null;
  step: number;
  status: Session['status'];
  serverTime: number;
};

export type WSPing = {
  t: 'PING';
  clientTime: number;
};

export type WSPong = {
  t: 'PONG';
  clientTime: number;
  serverTime: number;
};

export type WSHello = {
  t: 'HELLO';
  role: 'presenter' | 'viewer';
  token: string;
};

export type CommandType =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'JUMP_SLIDE'
  | 'RESTART_SLIDE';

// Auth types
export type JWTPayload = {
  sub: string;
  role: 'editor' | 'presenter' | 'viewer';
  sessionId?: string;
  exp: number;
};


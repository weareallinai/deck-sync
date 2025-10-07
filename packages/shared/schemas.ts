import { z } from 'zod';

// Background schemas
export const BackgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('color'), value: z.string() }),
  z.object({ type: z.literal('gradient'), value: z.string() }),
  z.object({ type: z.literal('image'), value: z.string() }),
]);

// Element schemas
export const BaseElSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  z: z.number(),
  animations: z.array(z.any()).optional(),
});

export const TextElSchema = BaseElSchema.extend({
  type: z.literal('text'),
  content: z.string(),
  style: z.object({
    fontFamily: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.number().optional(),
    color: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    lineHeight: z.number().optional(),
    letterSpacing: z.number().optional(),
  }),
});

export const ShapeElSchema = BaseElSchema.extend({
  type: z.literal('shape'),
  shape: z.enum(['rect', 'ellipse', 'line']),
  fill: z.string().optional(),
  stroke: z
    .object({
      color: z.string(),
      width: z.number(),
    })
    .optional(),
});

export const ImageElSchema = BaseElSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
});

export const VideoElSchema = BaseElSchema.extend({
  type: z.literal('video'),
  src: z.union([
    z.string(),
    z.object({
      youtubeId: z.string().optional(),
      vimeoId: z.string().optional(),
    }),
  ]),
  loop: z.boolean().optional(),
  startAt: z.number().optional(),
});

export const ElementSchema = z.discriminatedUnion('type', [
  TextElSchema,
  ShapeElSchema,
  ImageElSchema,
  VideoElSchema,
]);

// Slide schemas
export const AdvanceRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click') }),
  z.object({ type: z.literal('auto'), delayMs: z.number() }),
  z.object({ type: z.literal('after-media') }),
]);

export const TransitionSchema = z.object({
  kind: z.enum(['fade', 'dissolve', 'cube', 'pageFlip', 'morphLite']),
  durationMs: z.number(),
  easing: z.string().optional(),
});

export const SlideSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  index: z.number(),
  bg: BackgroundSchema,
  elements: z.array(ElementSchema),
  transition: TransitionSchema.optional(),
  advance: AdvanceRuleSchema.optional(),
});

// Deck schemas
export const SlideRefSchema = z.object({
  id: z.string(),
  hidden: z.boolean().optional(),
});

export const DeckSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  slides: z.array(SlideRefSchema),
});

// WebSocket message schemas
export const WSCommandSchema = z.object({
  t: z.literal('CMD'),
  seq: z.number(),
  cmd: z.enum([
    'START',
    'PAUSE',
    'RESUME',
    'STOP',
    'NEXT_STEP',
    'PREV_STEP',
    'JUMP_SLIDE',
    'RESTART_SLIDE',
  ]),
  payload: z.any().optional(),
  at: z.number(),
});

export const WSEventSchema = z.object({
  t: z.literal('EVT'),
  seq: z.number(),
  cmd: z.enum([
    'START',
    'PAUSE',
    'RESUME',
    'STOP',
    'NEXT_STEP',
    'PREV_STEP',
    'JUMP_SLIDE',
    'RESTART_SLIDE',
  ]),
  payload: z.any().optional(),
  applyAt: z.number(),
});

export const WSStateSchema = z.object({
  t: z.literal('STATE'),
  seq: z.number(),
  slideId: z.string().nullable(),
  step: z.number(),
  status: z.enum(['idle', 'running', 'paused', 'ended']),
  serverTime: z.number(),
});

export const WSPingSchema = z.object({
  t: z.literal('PING'),
  clientTime: z.number(),
});

export const WSPongSchema = z.object({
  t: z.literal('PONG'),
  clientTime: z.number(),
  serverTime: z.number(),
});

export const WSHelloSchema = z.object({
  t: z.literal('HELLO'),
  role: z.enum(['presenter', 'viewer']),
  token: z.string(),
});

export const WSMessageSchema = z.discriminatedUnion('t', [
  WSCommandSchema,
  WSEventSchema,
  WSStateSchema,
  WSPingSchema,
  WSPongSchema,
  WSHelloSchema,
]);


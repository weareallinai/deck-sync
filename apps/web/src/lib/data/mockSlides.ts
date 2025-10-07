import type { Slide, Deck } from '@deck/shared';

// Helper to load from localStorage (for MVP testing persistence)
export const loadFromStorage = (): { deck: Deck; slides: Slide[] } | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('deck-sync-test-deck');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[MockSlides] Loaded from localStorage');
      return parsed;
    }
  } catch (e) {
    console.error('[MockSlides] Failed to load from localStorage:', e);
  }
  return null;
};

// Mock slides for testing
export const mockSlides: Slide[] = [
  {
    id: 'slide-1',
    deckId: 'demo-deck',
    index: 0,
    bg: { type: 'color', value: '#1e40af' }, // Blue
    elements: [
      {
        id: 'el-1',
        type: 'text',
        content: 'Welcome to Deck Sync',
        x: 100,
        y: 200,
        w: 1080,
        h: 150,
        z: 1,
        style: {
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          align: 'center',
        },
      },
      {
        id: 'el-2',
        type: 'text',
        content: 'Real-time synchronized presentations',
        x: 100,
        y: 380,
        w: 1080,
        h: 60,
        z: 2,
        style: {
          fontSize: 32,
          fontWeight: 400,
          color: '#e0e7ff',
          align: 'center',
        },
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
  },
  {
    id: 'slide-2',
    deckId: 'demo-deck',
    index: 1,
    bg: { type: 'color', value: '#059669' }, // Green
    elements: [
      {
        id: 'el-3',
        type: 'text',
        content: 'Step 1',
        x: 100,
        y: 100,
        w: 1080,
        h: 80,
        z: 1,
        style: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          align: 'left',
        },
      },
      {
        id: 'el-4',
        type: 'text',
        content: 'Multiple viewers stay in perfect sync',
        x: 100,
        y: 220,
        w: 1080,
        h: 120,
        z: 2,
        style: {
          fontSize: 36,
          fontWeight: 400,
          color: '#d1fae5',
          align: 'left',
        },
      },
      {
        id: 'el-5',
        type: 'shape',
        shape: 'rect',
        x: 100,
        y: 400,
        w: 300,
        h: 200,
        z: 3,
        fill: '#10b981',
        stroke: { color: '#ffffff', width: 4 },
      },
    ],
    transition: { kind: 'dissolve', durationMs: 400 },
  },
  {
    id: 'slide-3',
    deckId: 'demo-deck',
    index: 2,
    bg: { type: 'color', value: '#7c3aed' }, // Purple
    elements: [
      {
        id: 'el-6',
        type: 'text',
        content: 'Step 2',
        x: 100,
        y: 100,
        w: 1080,
        h: 80,
        z: 1,
        style: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          align: 'left',
        },
      },
      {
        id: 'el-7',
        type: 'text',
        content: 'Clock synchronization ensures <150ms latency',
        x: 100,
        y: 220,
        w: 1080,
        h: 120,
        z: 2,
        style: {
          fontSize: 36,
          fontWeight: 400,
          color: '#ede9fe',
          align: 'left',
        },
      },
      {
        id: 'el-8',
        type: 'shape',
        shape: 'ellipse',
        x: 500,
        y: 400,
        w: 280,
        h: 280,
        z: 3,
        fill: '#a78bfa',
        stroke: { color: '#ffffff', width: 6 },
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
  },
  {
    id: 'slide-4',
    deckId: 'demo-deck',
    index: 3,
    bg: { type: 'color', value: '#dc2626' }, // Red
    elements: [
      {
        id: 'el-9',
        type: 'text',
        content: 'Step 3',
        x: 100,
        y: 100,
        w: 1080,
        h: 80,
        z: 1,
        style: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          align: 'left',
        },
      },
      {
        id: 'el-10',
        type: 'text',
        content: 'Events are scheduled with applyAt timestamps',
        x: 100,
        y: 220,
        w: 1080,
        h: 120,
        z: 2,
        style: {
          fontSize: 36,
          fontWeight: 400,
          color: '#fee2e2',
          align: 'left',
        },
      },
      {
        id: 'el-11',
        type: 'text',
        content: 'All viewers transition simultaneously!',
        x: 100,
        y: 380,
        w: 1080,
        h: 80,
        z: 3,
        style: {
          fontSize: 32,
          fontWeight: 600,
          color: '#fef2f2',
          align: 'left',
        },
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
  },
  {
    id: 'slide-5',
    deckId: 'demo-deck',
    index: 4,
    bg: { type: 'color', value: '#0891b2' }, // Cyan
    elements: [
      {
        id: 'el-12',
        type: 'text',
        content: 'Video Demo (with after-media advance)',
        x: 100,
        y: 50,
        w: 1080,
        h: 80,
        z: 1,
        style: {
          fontSize: 42,
          fontWeight: 700,
          color: '#ffffff',
          align: 'center',
        },
      },
      {
        id: 'el-13',
        type: 'video',
        videoType: 'direct',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        x: 190,
        y: 160,
        w: 900,
        h: 506,
        z: 2,
        loop: false,
        autoplay: true,
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
    advance: { type: 'after-media' },
  },
  {
    id: 'slide-6',
    deckId: 'demo-deck',
    index: 5,
    bg: { type: 'color', value: '#fefce8' }, // Light Yellow
    elements: [
      {
        id: 'el-14',
        type: 'text',
        content: 'YouTube Integration',
        x: 100,
        y: 40,
        w: 1080,
        h: 60,
        z: 1,
        style: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ca8a04',
          align: 'center',
        },
      },
      {
        id: 'el-15',
        type: 'video',
        videoType: 'youtube',
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeId: 'dQw4w9WgXcQ',
        x: 340,
        y: 130,
        w: 600,
        h: 338,
        z: 2,
        loop: false,
        autoplay: true,
      },
      {
        id: 'el-16',
        type: 'text',
        content: 'Embedded videos play seamlessly',
        x: 200,
        y: 520,
        w: 880,
        h: 60,
        z: 3,
        style: {
          fontSize: 32,
          fontWeight: 400,
          color: '#854d0e',
          align: 'center',
        },
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
  },
  {
    id: 'slide-7',
    deckId: 'demo-deck',
    index: 6,
    bg: { type: 'gradient', value: 'linear-gradient(to bottom right, #8b5cf6, #ec4899)' }, // Purple to Pink
    elements: [
      {
        id: 'el-17',
        type: 'text',
        content: 'Vimeo Support',
        x: 100,
        y: 40,
        w: 1080,
        h: 60,
        z: 1,
        style: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          align: 'center',
        },
      },
      {
        id: 'el-18',
        type: 'video',
        videoType: 'vimeo',
        src: 'https://vimeo.com/148751763',
        vimeoId: '148751763',
        x: 340,
        y: 130,
        w: 600,
        h: 338,
        z: 2,
        loop: false,
        autoplay: true,
      },
      {
        id: 'el-19',
        type: 'text',
        content: 'Professional video hosting integrated',
        x: 200,
        y: 520,
        w: 880,
        h: 60,
        z: 3,
        style: {
          fontSize: 32,
          fontWeight: 400,
          color: '#f0f9ff',
          align: 'center',
        },
      },
    ],
    transition: { kind: 'fade', durationMs: 300 },
  },
];

export const mockDeck: Deck = {
  id: 'demo-deck',
  ownerId: 'user-1',
  title: 'Demo Presentation',
  slides: mockSlides.map((s) => ({ id: s.id })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};


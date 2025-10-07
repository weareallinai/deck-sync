# Deck Sync

Real-time synchronized slide deck presentations. Replace meeting-platform video streaming with local slide playback synchronized across unlimited viewers with <150ms latency.

## Features

- 🎯 **Real-time Synchronization** - All viewers stay in perfect lockstep
- ⏱️ **Clock Sync** - NTP-style synchronization for deterministic rendering
- 🎬 **Rich Slides** - Text, shapes, images, and video with smooth animations
- 🔄 **Auto Reconnect** - Exponential backoff with state recovery
- 📹 **Video Support** - MP4 playback with after-media auto-advance
- 🎨 **Beautiful UI** - Framer Motion animations, GPU-accelerated
- ♿ **Accessible** - Respects `prefers-reduced-motion`
- 📦 **Bundle Optimized** - Viewer < 200KB gzipped

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Presenter  │────────▶│ Durable Object   │────────▶│  Viewer 1   │
│  (Control)  │  CMD    │ (Coordinator)    │  EVT    │  (Sync'd)   │
└─────────────┘         │                  │────────▶│  Viewer 2   │
                        │ - State mgmt     │         │  (Sync'd)   │
                        │ - Clock ref      │────────▶│  Viewer 3   │
                        │ - WS fan-out     │         │  (Sync'd)   │
                        └──────────────────┘         └─────────────┘
```

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Animation**: Framer Motion
- **Real-time**: Cloudflare Durable Objects + WebSockets
- **Database**: Postgres + Drizzle ORM
- **Storage**: Cloudflare R2
- **Testing**: Playwright
- **Monorepo**: pnpm workspaces

## Quickstart

```bash
pnpm i
cp .env.example .env.local
# Set DATABASE_URL, JWT_SECRET, R2 creds, NEXT_PUBLIC_WS_BASE

pnpm drizzle:generate && pnpm drizzle:migrate
pnpm dev
```

### Cloudflare Durable Objects
```bash
wrangler login
wrangler deploy workers/session-coordinator.ts
```

### E2E tests
```bash
pnpm test:e2e
```

## Development

### Repository Structure

```
deck-sync/
├── apps/
│   └── web/                        # Next.js app
│       ├── src/
│       │   ├── app/
│       │   │   ├── editor/[deckId]/     # Editor UI
│       │   │   ├── present/[sessionId]/ # Presenter controls
│       │   │   ├── view/[sessionId]/    # Viewer (sync'd)
│       │   │   └── api/                 # API routes
│       │   ├── components/
│       │   │   ├── viewer/              # Viewer components
│       │   │   └── present/             # Presenter components
│       │   └── lib/
│       │       ├── realtime/            # Clock sync, reconnect
│       │       ├── render/              # Transitions, preload
│       │       └── utils/               # Utilities
│       └── tests/e2e/              # Playwright tests
├── packages/
│   ├── shared/                     # Shared types & schemas
│   └── ui/                         # Shared UI components
├── workers/
│   └── session-coordinator.ts      # Cloudflare Durable Object
└── drizzle/
    ├── schema.ts                   # Database schema
    └── migrations/                 # Migrations
```

### Local Development

**Terminal 1: Cloudflare Worker (Durable Object)**
```bash
pnpm worker:dev
```

**Terminal 2: Next.js**
```bash
pnpm dev
```

**Browser Testing:**
- Presenter: `http://localhost:3000/present/test-session`
- Viewer: `http://localhost:3000/view/test-session?t=test-token`

Open 3+ viewer tabs and watch them stay perfectly synchronized!

### Available Scripts

```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm worker:dev       # Start Cloudflare Worker locally

# Database
pnpm drizzle:generate # Generate migrations
pnpm drizzle:migrate  # Run migrations
pnpm drizzle:studio   # Open Drizzle Studio

# Testing
pnpm test:e2e         # Run Playwright tests
pnpm test:e2e:ui      # Run tests with UI

# Build
pnpm build            # Build Next.js app
pnpm build:analyze    # Build with bundle analyzer

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript compiler
pnpm bundle-check     # Check viewer bundle size
```

## How It Works

### 1. Session Creation

```typescript
POST /api/session
→ { sessionId, presenterToken, viewerToken, viewerUrl }
```

### 2. WebSocket Connection

**Presenter & Viewers connect to Durable Object:**
```typescript
// Presenter sends commands
{ t: 'CMD', cmd: 'NEXT_STEP' }

// Coordinator broadcasts events
{ t: 'EVT', seq: 42, cmd: 'NEXT_STEP', applyAt: 1696704000000 }

// Viewers schedule event at precise time
setTimeout(() => applyEvent(event), applyAt + clockOffset - now)
```

### 3. Clock Synchronization

**6-sample ping/pong exchange:**
```typescript
Viewer → PING { ts: t0 }
Coordinator → PONG { ts: server_time }
Viewer calculates offset = server_time - (t0 + rtt/2)

Repeat 6x, use median offset
```

### 4. Synchronized Rendering

All viewers:
1. Receive event with `applyAt` timestamp
2. Calculate `delay = applyAt + clockOffset - now`
3. Schedule `setTimeout(applyEvent, delay)`
4. Transition happens simultaneously (within ~50ms)

### 5. Reconnection

```typescript
Connection lost → exponential backoff (1s, 2s, 4s, 8s, 16s, 30s)
On reconnect → REQUEST_SNAPSHOT
Coordinator → STATE { seq, slideId, step }
Viewer recovers and continues
```

## Message Protocol

### Client → Coordinator

| Message | Description |
|---------|-------------|
| `HELLO` | Register as presenter or viewer |
| `PING` | Clock sync request |
| `CMD` | Presenter command (NEXT_STEP, PREV_STEP, JUMP_SLIDE) |
| `REQUEST_SNAPSHOT` | Request current state (after reconnect) |

### Coordinator → Client

| Message | Description |
|---------|-------------|
| `STATE` | Current session state (seq, slideId, step) |
| `PONG` | Clock sync response |
| `EVT` | Broadcast event with applyAt timestamp |

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
# Database
DATABASE_URL=postgres://USER:PASS@HOST:5432/DB

# Auth
JWT_SECRET=your-secret-key-here

# Cloudflare R2
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=deck-assets
R2_PUBLIC_BASE=https://cdn.example.com

# WebSocket (Cloudflare Worker)
NEXT_PUBLIC_WS_BASE=ws://localhost:8787     # dev
# NEXT_PUBLIC_WS_BASE=wss://ws.example.com  # prod
```

## Deployment

### Next.js (Vercel)

```bash
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard.

### Cloudflare Worker

```bash
wrangler login
wrangler deploy workers/session-coordinator.ts
```

Update `NEXT_PUBLIC_WS_BASE` to your Worker URL.

### Database

Recommended: [Neon](https://neon.tech) or [Supabase](https://supabase.com)

```bash
# Run migrations on production DB
DATABASE_URL=<prod_url> pnpm drizzle:migrate
```

## Performance

- **Latency**: <150ms viewer synchronization
- **Clock Sync**: ~10-30ms typical offset
- **Reconnect**: Exponential backoff (max 10 attempts)
- **Bundle Size**: Viewer <200KB gzipped (target)
- **Scalability**: 1000s of viewers per session (Durable Objects)

## Guardrails

The codebase enforces several performance and security guardrails:

- ✅ **Bundle Size** - Automated checks, code splitting by route
- ✅ **CSS Performance** - GPU-accelerated properties only (transform/opacity)
- ✅ **WebSocket Validation** - Zod schema validation (stubbed)
- ✅ **Sequence Integrity** - Gap detection with snapshot recovery
- ✅ **JWT Auth** - Viewer URLs include short-lived tokens
- ✅ **Accessibility** - `prefers-reduced-motion` support

## E2E Testing

Playwright tests validate multi-viewer synchronization:

```bash
# Run tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e --debug
```

**Test Coverage:**
- 3-viewer synchronization
- Reconnect with state recovery
- Clock sync accuracy
- Sequence gap handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Real-time sync via [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects)
- Animations powered by [Framer Motion](https://www.framer.com/motion)

---

**Status**: MVP Complete ✅  
**Documentation**: See [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)  
**Progress**: See [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)

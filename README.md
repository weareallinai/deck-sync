# Deck Sync

Real-time synchronized slide deck presentations with browser-based rendering.

## Overview

Deck Sync is a presentation tool that replaces video streaming with locally-rendered slides synchronized in real-time across participants. The presenter controls playback, and viewers render slides in their browsers with <150ms latency.

### Key Features

- **Editor**: Author decks with text, shapes, images, videos, animations, and transitions
- **Presenter**: Start live sessions, control playback, share viewer URLs
- **Viewer**: Join sessions via URL, render slides locally, auto-sync with presenter
- **Real-time Sync**: WebSocket coordination with sequence numbers, clock sync, and deterministic rendering

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Zustand, Framer Motion, Konva
- **Realtime**: Cloudflare Durable Objects for WebSocket coordination
- **Backend**: Next.js API routes, Drizzle ORM, Postgres (Neon/Supabase)
- **Storage**: Cloudflare R2 (or S3) for assets
- **Auth**: JWT with short-lived tokens

## Project Structure

```
deck-sync/
├── apps/
│   └── web/              # Next.js app
│       ├── src/
│       │   ├── app/      # Routes (editor, presenter, viewer, API)
│       │   ├── components/
│       │   └── lib/      # State, realtime, render utilities
│       └── tests/        # Playwright E2E tests
├── packages/
│   ├── shared/           # Shared types, schemas, protocols
│   └── ui/               # Reusable UI components
├── drizzle/              # Database schema & migrations
└── workers/              # Cloudflare Durable Object
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Postgres database (Neon/Supabase)
- Cloudflare account (for Durable Objects & R2)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up database
pnpm db:push

# Run development server
pnpm dev
```

### Development

```bash
# Run Next.js app
cd apps/web
pnpm dev

# Run Cloudflare worker locally
pnpm wrangler dev

# Run tests
pnpm test:e2e
```

### Environment Variables

See `.env.example` for required environment variables:

- Database connection (Postgres)
- JWT secret for auth
- Cloudflare account & R2 credentials
- Durable Objects namespace
- App & WebSocket URLs

## Guardrails 🚨

This project enforces strict performance and security constraints:

- **Bundle Size:** Viewer ≤ 200KB gzipped (no editor deps)
- **Code Splitting:** Konva only in `/editor` routes
- **CSS Performance:** Transform/opacity only (GPU accelerated)
- **WS Validation:** All messages validated with Zod
- **Sequence Integrity:** Idempotent apply with gap detection
- **JWT Auth:** Short-lived tokens (24h), URL `?t=` param
- **Accessibility:** `prefers-reduced-motion` → cross-fade fallback

See `GUARDRAILS.md` for complete specifications.

**Quick check:**
```bash
pnpm bundle-check  # Enforces bundle size limits
```

## Architecture

### Synchronization Model

1. **Presenter** sends commands via WebSocket to **Durable Object**
2. **Durable Object** stamps sequence numbers & `applyAt` timestamps
3. Commands broadcast to all **Viewers**
4. **Viewers** schedule actions at `applyAt + clockOffset` for deterministic sync

### Clock Sync

- NTP-style ping/pong to calculate offset between client and server
- Viewers schedule events using synchronized time
- Median RTT/2 + 30ms guard interval (50-150ms)

### Asset Preloading

- When slide N is active, preload slide N+1 assets
- Images, videos, and fonts are fetched ahead of time
- Ensures smooth transitions without loading delays

## API Routes

- `GET /api/decks` - List decks
- `POST /api/decks` - Create deck
- `GET /api/decks/[id]` - Get deck
- `PATCH /api/decks/[id]` - Update deck
- `DELETE /api/decks/[id]` - Delete deck
- `PATCH /api/slides/[id]` - Update slide
- `POST /api/assets/sign` - Get signed upload URL
- `POST /api/session` - Create presentation session
- `PATCH /api/session` - End session
- `POST /api/auth/jwt` - Mint JWT token

## Testing

```bash
# Run Playwright E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui
```

## Deployment

### Vercel (Next.js)

```bash
vercel deploy
```

### Cloudflare (Durable Object)

```bash
wrangler deploy
```

## Roadmap

### MVP (Current)

- [x] Project scaffolding
- [ ] Database schema & migrations
- [ ] Editor UI with canvas
- [ ] Presenter controls
- [ ] Viewer renderer
- [ ] WebSocket coordination
- [ ] Clock sync
- [ ] Asset preloading
- [ ] Basic animations & transitions
- [ ] E2E tests

### Phase 2

- Presenter notes & timer
- Multi-presenter handoff
- Master slides & components
- Recording/export to MP4
- Analytics (viewer tracking)
- SSO & team workspaces

## Contributing

See [MVP_DOCUMENTATION.md](../MVP_DOCUMENTATION.md) for detailed technical specifications.

## License

MIT

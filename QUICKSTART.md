# Quick Start Guide

## What's Been Built

The complete repository structure has been scaffolded with:

✅ **Monorepo** with pnpm workspaces
✅ **Shared types** and schemas (`@deck/shared`)
✅ **UI components** (`@deck/ui`)
✅ **Next.js app** with all routes (editor, presenter, viewer)
✅ **API routes** (stubs ready for implementation)
✅ **Component stubs** (editor, presenter, viewer)
✅ **State management** (Zustand stores)
✅ **Realtime library** (WebSocket client + clock sync)
✅ **Render utilities** (transitions, animations, preload)
✅ **Cloudflare Durable Object** (session coordinator)
✅ **Database schema** (Drizzle ORM)
✅ **E2E test structure** (Playwright)

**Status:** TypeScript compiles cleanly ✅

## Run the App

```bash
cd deck-sync

# Start Next.js dev server
pnpm dev

# In another terminal, start Cloudflare worker (when ready)
pnpm worker:dev
```

Then open http://localhost:3000

## Project Structure

```
deck-sync/
├── apps/web/           # Next.js application
│   ├── src/app/        # Routes (pages + API)
│   ├── src/components/ # React components
│   ├── src/lib/        # Utilities (state, realtime, render)
│   └── tests/          # E2E tests
├── packages/
│   ├── shared/         # Types, schemas, protocols
│   └── ui/             # Reusable UI components
├── drizzle/            # Database schema
└── workers/            # Cloudflare Durable Object
```

## Key Files to Start With

### 1. API Implementation
- `apps/web/src/app/api/decks/route.ts` - Connect to database
- `apps/web/src/app/api/session/route.ts` - Create sessions
- `drizzle/schema.ts` - Already defined

### 2. Editor
- `apps/web/src/components/editor/Stage.tsx` - Konva canvas
- `apps/web/src/lib/state/editorStore.ts` - State management

### 3. Presenter
- `apps/web/src/components/present/PresenterControls.tsx` - UI controls
- `apps/web/src/lib/realtime/wsClient.ts` - Already implemented

### 4. Viewer
- `apps/web/src/components/viewer/ViewerStage.tsx` - Slide renderer
- `apps/web/src/lib/realtime/clocksync.ts` - Already implemented

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Set up Postgres database (Neon/Supabase)
3. Create Cloudflare account for Durable Objects & R2
4. Fill in environment variables

## Database Setup

```bash
# Generate migration
pnpm db:generate

# Push schema to database
pnpm db:push

# Open Drizzle Studio (optional)
pnpm db:studio
```

## Testing

```bash
# Run E2E tests
pnpm test:e2e

# Open Playwright UI
pnpm test:e2e:ui
```

## Available Scripts

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm test:e2e         # Run E2E tests
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio
pnpm worker:dev       # Run Cloudflare worker locally
pnpm worker:deploy    # Deploy worker to Cloudflare
```

## Next Steps

See `PROJECT_STATUS.md` for detailed implementation checklist.

**Priority order:**
1. Set up database connection
2. Implement API routes with Drizzle
3. Build editor UI with Konva
4. Connect WebSocket coordinator
5. Implement viewer renderer

## Architecture Overview

```
┌─────────┐     HTTP/REST      ┌──────────┐
│ Editor  │────────────────────│ Next.js  │
└─────────┘                    │   API    │
                               └──────────┘
                                     │
                              ┌──────┴──────┐
                              │   Postgres  │
                              └─────────────┘

┌───────────┐   WebSocket   ┌───────────────────┐
│ Presenter │───────────────│ Durable Object    │
└───────────┘               │ (Coordinator)     │
                            └──────┬────────────┘
                                   │ Broadcast
                            ┌──────┴──────┐
                            │             │
                      ┌─────▼─┐     ┌────▼───┐
                      │Viewer1│     │Viewer2 │
                      └───────┘     └────────┘
```

## Support

- See `README.md` for architecture details
- See `MVP_DOCUMENTATION.md` for full specifications
- See `PROJECT_STATUS.md` for implementation checklist

## Notes

All dependencies are already installed. TypeScript is configured for strict mode. The codebase is ready for implementation!


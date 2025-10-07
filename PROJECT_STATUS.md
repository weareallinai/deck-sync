# Project Status - Deck Sync MVP

## ✅ Completed: Repository Scaffolding

### Monorepo Structure
- [x] pnpm workspace configuration
- [x] Three packages: `apps/web`, `packages/shared`, `packages/ui`
- [x] TypeScript configurations (all packages)
- [x] ESLint and Next.js configs
- [x] Git ignore file

### Shared Package (`packages/shared/`)
- [x] Complete type definitions (Deck, Slide, Element, Session, WebSocket messages)
- [x] Zod schemas for runtime validation
- [x] Protocol message builders (command, ping, hello)
- [x] Exported as `@deck/shared`

### UI Package (`packages/ui/`)
- [x] Button component with variants (primary, secondary, ghost)
- [x] Card components (Card, CardHeader, CardTitle, CardContent)
- [x] Exported as `@deck/ui`

### Database (`drizzle/`)
- [x] Complete schema (users, decks, slides, sessions, assets)
- [x] Drizzle configuration
- [x] Migrations directory structure

### Web App (`apps/web/`)

#### Routes
- [x] Home page (`/`)
- [x] Editor page (`/editor/[deckId]`)
- [x] Presenter page (`/present/[sessionId]`)
- [x] Viewer page (`/view/[sessionId]`)

#### API Routes (Stubs)
- [x] `GET/POST /api/decks` - List/create decks
- [x] `GET/PATCH/DELETE /api/decks/[id]` - CRUD operations
- [x] `GET/PATCH/DELETE /api/slides/[id]` - Slide operations
- [x] `POST /api/assets/sign` - Signed upload URLs
- [x] `POST/PATCH /api/session` - Session create/end
- [x] `POST /api/auth/jwt` - JWT minting

#### Components (Stubs)
**Editor:**
- [x] Stage - Konva canvas for editing
- [x] Toolbar - Text, shape, image, video tools
- [x] SidebarSlides - Slide thumbnails with reorder
- [x] Inspector - Element properties panel
- [x] AnimationsPanel - Animation timeline

**Presenter:**
- [x] PresenterControls - Start/next/prev/pause controls
- [x] ConnectionStatus - WebSocket status indicator

**Viewer:**
- [x] ViewerStage - Full-screen slide renderer
- [x] PreloadManager - Asset preloading utility

#### State Management (Zustand)
- [x] editorStore - Deck editing state
- [x] sessionStore - Presentation session state
- [x] viewerStore - Viewer sync state

#### Realtime Library
- [x] WSClient - WebSocket client with reconnection, heartbeat, sequence tracking
- [x] ClockSync - NTP-style clock synchronization with offset calculation

#### Render Utilities
- [x] transitions.ts - Transition configs (fade, dissolve, cube, pageFlip, morphLite)
- [x] anims.ts - Animation configs (fade, move, scale, dissolve)
- [x] layout.ts - Slide dimensions, scaling, bounding boxes
- [x] preload.ts - Asset preloading manager for images/videos

#### API Client
- [x] api.ts - Typed API client for all backend routes

### Workers (`workers/`)
- [x] session-coordinator.ts - Cloudflare Durable Object for WebSocket coordination
  - Handles HELLO, CMD, PING messages
  - Sequence number management
  - State broadcasting
  - Guard interval calculation

### Testing
- [x] Playwright configuration
- [x] E2E test stubs (presentation flow, reconnect, video advance)

### Configuration
- [x] wrangler.toml - Cloudflare Durable Object config
- [x] drizzle.config.ts - Database configuration
- [x] .env.example - Environment variable template
- [x] README.md - Project documentation

## 🚧 TODO: Implementation (Next Steps)

### 1. Database Setup
- [ ] Run database migrations
- [ ] Implement database connection
- [ ] Add RLS policies for security
- [ ] Implement seed data for testing

### 2. API Implementation
- [ ] Connect routes to database (Drizzle ORM)
- [ ] Implement JWT signing/verification
- [ ] Add Cloudflare R2 integration for asset signing
- [ ] Add error handling and validation
- [ ] Add authentication middleware

### 3. Editor Implementation
- [ ] Wire up Konva stage with element rendering
- [ ] Implement text tool with inline editing
- [ ] Implement shape tools (rect, ellipse, line)
- [ ] Implement image upload and placement
- [ ] Implement video embed (MP4 + YouTube)
- [ ] Add drag/resize/rotate transforms
- [ ] Add z-order management
- [ ] Implement animations panel with timeline
- [ ] Add slide reordering (drag-drop)
- [ ] Implement autosave (debounced)

### 4. Presenter Implementation
- [ ] Connect to WebSocket (Durable Object)
- [ ] Implement control buttons (start, next, prev, pause)
- [ ] Add local preview rendering
- [ ] Show viewer count from WebSocket
- [ ] Add connection status indicator
- [ ] Implement session URL sharing

### 5. Viewer Implementation
- [ ] Connect to WebSocket with viewer token
- [ ] Implement clock sync on join
- [ ] Render slides from deck JSON
- [ ] Schedule events at `applyAt + offset`
- [ ] Implement slide transitions (Framer Motion)
- [ ] Implement element animations
- [ ] Add preloading for next slide
- [ ] Handle video playback sync
- [ ] Implement reconnection logic with state snapshot

### 6. Durable Object Enhancement
- [ ] Add JWT verification
- [ ] Implement state snapshots for late joiners
- [ ] Add viewer tracking and count
- [ ] Collect RTT samples for guard calculation
- [ ] Add logging and error handling
- [ ] Implement graceful shutdown

### 7. Asset Storage
- [ ] Implement R2 signed URL generation
- [ ] Add upload endpoint
- [ ] Implement CDN caching headers
- [ ] Add image optimization
- [ ] Add video transcoding (optional)

### 8. Testing
- [ ] Write unit tests for state reducers
- [ ] Write unit tests for message validators
- [ ] Implement E2E test: 3 viewers join and sync
- [ ] Implement E2E test: reconnection flow
- [ ] Implement E2E test: video after-media advance
- [ ] Add chaos testing (packet loss, jitter)

### 9. Performance Optimization
- [ ] Code split routes (editor, presenter, viewer)
- [ ] Lazy load Konva only in editor
- [ ] Optimize bundle size
- [ ] Add font subsetting
- [ ] Implement responsive image loading
- [ ] Add service worker for offline assets (optional)

### 10. Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Deploy Cloudflare Durable Object
- [ ] Set up Postgres database (Neon/Supabase)
- [ ] Configure R2 bucket
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring (Sentry)

## 📊 Metrics & Goals

### Performance Targets
- ⏱️ Median latency: <150ms (presenter → viewer)
- 📦 Initial bundle: <500KB (viewer), <1MB (editor)
- 🎬 Transition smoothness: 60 FPS
- 👥 Concurrent viewers: 20 (MVP)

### Code Quality
- ✅ TypeScript strict mode
- ✅ All files type-checked
- ✅ Linting configured
- 🔜 >80% test coverage (integration + E2E)

## 🎯 MVP Definition of Done
1. Deck CRUD works (create, edit, save)
2. Slides can be authored with text, shapes, images
3. Presenter can start session and control playback
4. 3+ viewers can join and stay synced <150ms
5. Reconnection works correctly
6. Basic animations work (fade, move)
7. E2E tests pass in CI
8. Deployed to staging environment

## 📝 Notes

### Dependencies Installed
All core dependencies are installed:
- Next.js 15.5.4
- React 19.1.0
- Zustand 5.0.8
- Framer Motion 12.23.22
- Konva 10.0.2 + react-konva
- Zod 4.1.12
- Drizzle ORM 0.44.6
- Playwright 1.56.0
- Wrangler (Cloudflare)

### Current Status
✅ **Scaffolding Complete** - All stub files created, TypeScript compiles cleanly, monorepo structure ready for development.

### Next Immediate Steps
1. Set up database and run migrations
2. Implement API routes with database integration
3. Build out editor UI with Konva
4. Connect WebSocket coordinator
5. Implement viewer renderer with clock sync


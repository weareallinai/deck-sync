# Guardrails Implementation Status

This document tracks the implementation status of all guardrails.

## ✅ Implemented

### 1. Bundle Size Monitoring
- [x] Bundle analyzer configured in `next.config.ts`
- [x] `check-bundle-size.js` script created
- [x] `pnpm bundle-check` command available
- [x] `ANALYZE=true pnpm build` for visual analysis
- [x] CI/CD bundle size check in GitHub Actions

**Usage:**
```bash
# Analyze bundles visually
ANALYZE=true pnpm build

# Check against limits (viewer ≤200KB, presenter ≤300KB)
pnpm bundle-check
```

### 2. Code Splitting
- [x] Next.js config optimized for package imports
- [x] `loading.tsx` added for editor lazy loading
- [x] Viewer page explicitly excludes Konva
- [x] Comments in viewer files warning against editor deps

**Enforced by:**
- `next.config.ts` experimental.optimizePackageImports
- Bundle size check will fail if viewer imports Konva
- Code review comments in viewer components

### 3. CSS Performance
- [x] Transition configs use only `transform` and `opacity`
- [x] `getTransitionConfig()` uses GPU-accelerated properties
- [x] Animation configs in `anims.ts` follow best practices
- [x] Comments warn against layout properties

**Implementation:**
- All transitions in `transitions.ts` use `transform`/`opacity`
- No `left`/`top`/`width`/`height` animations
- Framer Motion configs are GPU-friendly

### 4. WebSocket Validation
- [x] Zod schemas defined in `packages/shared/schemas.ts`
- [x] `wsClient.ts` validates messages (stub - needs full Zod import)
- [x] Invalid messages dropped with console.warn
- [x] Try-catch blocks prevent crashes

**Implementation:**
- `handleMessage()` in wsClient.ts has validation logic
- TODO: Import and use `WSMessageSchema.parse()` when ready

### 5. Sequence Integrity
- [x] `lastKnownSeq` tracked in WSClient
- [x] Gap detection implemented
- [x] `requestSnapshot()` method created
- [x] Idempotent apply pattern enforced

**Implementation:**
```typescript
// In wsClient.ts handleMessage()
if (message.seq !== expectedSeq && lastKnownSeq !== 0) {
  console.warn('Sequence gap detected');
  this.requestSnapshot();
  return;
}
```

### 6. JWT Authentication
- [x] JWT utilities created in `lib/utils/jwt.ts`
- [x] `extractViewerToken()` for URL params
- [x] `verifyJWT()` stub (needs real JWT lib)
- [x] `signJWT()` stub (needs real JWT lib)
- [x] Max TTL constants (24h)
- [x] Viewer page checks for token presence

**Implementation:**
- Viewer page extracts `?t=` parameter
- Denies access if token missing
- TODO: Implement real JWT signing/verification with `jose` library

### 7. Reduced Motion Support
- [x] `motion.ts` utility created
- [x] `prefersReducedMotion()` function
- [x] `getSafeTransition()` with fallback
- [x] `useReducedMotion()` React hook
- [x] Integrated into `transitions.ts`

**Implementation:**
```typescript
// Automatically falls back to fade transition
const safeTransition = getSafeTransition(transition);
// Max 200ms duration for reduced motion
```

## 🚧 Partial / TODO

### 1. Full Zod Validation
- [x] Schemas defined
- [ ] Import WSMessageSchema in wsClient.ts
- [ ] Full parse on every message
- [ ] Performance testing

**Next step:** Import and use full Zod validation in production.

### 2. JWT Real Implementation
- [x] Utilities scaffolded
- [ ] Install `jose` package
- [ ] Implement real signing/verification
- [ ] Add JWT secret rotation
- [ ] Token refresh mechanism

**Next step:** Replace stubs with `jose` library implementation.

### 3. Durable Object Token Verification
- [x] Session coordinator structure
- [ ] JWT verification in HELLO handler
- [ ] Close connection on invalid token
- [ ] Log failed auth attempts

**Next step:** Implement verification in `workers/session-coordinator.ts`.

## 📊 Measurement

### Bundle Size (After Build)
```bash
pnpm build
pnpm bundle-check
```

**Expected output:**
```
✅ Viewer bundle within limit (200KB gzipped)
✅ Presenter bundle within limit (300KB gzipped)
```

### Transition Performance
- Use Chrome DevTools Performance tab
- Record during slide transitions
- Check for 60 FPS
- Verify GPU acceleration (check Layers panel)

### WebSocket Reliability
- Simulate packet loss in dev
- Verify sequence gap detection
- Test state snapshot recovery
- Check reconnection logic

## 🎯 CI/CD Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):
- ✅ TypeScript check
- ✅ Linting
- ✅ Bundle size check (fails if violations)
- ✅ E2E tests

**Guardrail enforcement:** Bundle size check will fail CI if viewer > 200KB.

## 📋 Pre-Merge Checklist

Before merging any PR:
- [ ] `pnpm bundle-check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] No Konva in viewer routes
- [ ] WS messages validated
- [ ] Transitions use transform/opacity
- [ ] Reduced motion tested manually

## 🔍 Code Review Focus

When reviewing PRs, check for:
1. ❌ `import { Stage } from 'react-konva'` in viewer files
2. ❌ `left`/`top` in animation configs
3. ❌ Unvalidated WebSocket message handling
4. ❌ Missing sequence gap detection
5. ❌ No token verification
6. ❌ Hardcoded transitions without reduced motion check

## 📚 Resources

- **GUARDRAILS.md** - Full specifications
- **next.config.ts** - Bundle analyzer config
- **scripts/check-bundle-size.js** - Size enforcement
- **lib/utils/motion.ts** - Motion utilities
- **lib/utils/jwt.ts** - Auth utilities
- **.github/workflows/ci.yml** - CI checks

---

**Status:** Core guardrails implemented. JWT and full Zod validation need production libraries.


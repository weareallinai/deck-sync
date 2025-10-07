# Project Guardrails

> **Critical constraints to maintain throughout development**

## 🎯 Performance Targets

### Bundle Size
- **Viewer bundle:** ≤ 200KB gzipped (excluding editor-only deps)
- **Editor bundle:** Can be larger (includes Konva, heavy tools)
- **Presenter bundle:** ≤ 300KB gzipped

**Enforcement:**
- Use `@next/bundle-analyzer` to monitor
- Route-level code splitting (see below)
- Lazy load editor components

### Code Splitting Rules

✅ **DO:**
- Keep Konva imports ONLY in `/editor` routes
- Lazy load heavy components with `dynamic()`
- Use route-level splitting by default (Next.js App Router)
- Import viewer components without editor dependencies

❌ **DON'T:**
- Import Konva in viewer or presenter routes
- Load editor state stores in viewer
- Include animation tools in viewer bundle

**Implementation:**
```typescript
// ✅ Good - in /editor routes only
import { Stage, Layer } from 'react-konva';

// ✅ Good - in viewer
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });

// ❌ Bad - DO NOT do this in viewer
import { Stage } from 'react-konva'; // Adds ~100KB!
```

## 🎨 Rendering Performance

### CSS Performance Rules

✅ **Prefer:**
- `transform: translate3d()` for positioning
- `opacity` for fade effects
- `will-change: transform` (sparingly, only when animating)
- Hardware-accelerated properties

❌ **Avoid:**
- `left`/`top`/`width`/`height` animations (causes layout thrash)
- Frequent DOM measurements (getBoundingClientRect during animation)
- Animating `box-shadow`, `border-radius` with large values
- Multiple layout reflows per frame

**Implementation:**
```css
/* ✅ Good - GPU accelerated */
.slide-enter {
  transform: translate3d(0, 0, 0);
  opacity: 1;
  transition: transform 250ms, opacity 250ms;
}

/* ❌ Bad - causes layout recalc */
.slide-enter {
  left: 0;
  top: 0;
  transition: left 250ms, top 250ms;
}
```

### Framer Motion Usage
```typescript
// ✅ Good - transform only
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.25 }}
/>

// ❌ Bad - layout properties
<motion.div
  initial={{ width: 0 }}
  animate={{ width: 500 }}
/>
```

## 🔒 Security & Validation

### WebSocket Message Validation

**EVERY incoming message MUST be validated with Zod.**

```typescript
// ✅ Required pattern
wsClient.onMessage((rawMessage) => {
  try {
    const message = WSMessageSchema.parse(rawMessage);
    // Handle validated message
  } catch (error) {
    console.warn('[WS] Invalid message, dropping:', error);
    return; // Drop invalid messages
  }
});
```

**Rules:**
- Parse with Zod schema before processing
- Drop invalid messages (don't crash)
- Log warnings for debugging
- Never trust client input

### Sequence Number Integrity

**Idempotent apply with gap detection:**

```typescript
if (message.seq !== lastSeq + 1) {
  console.warn(`[WS] Sequence gap detected: ${lastSeq} → ${message.seq}`);
  wsClient.send({ t: 'REQUEST_SNAPSHOT' });
  return;
}
lastSeq = message.seq;
```

**Rules:**
- Track `lastSeq` on every message
- Detect gaps (seq !== lastSeq + 1)
- Request `STATE_SNAPSHOT` immediately
- Apply events idempotently (safe to replay)

### JWT Token Security

**Viewer URLs use short-lived tokens:**

```typescript
// Viewer URL format
https://app.example.com/view/session-123?t=eyJhbGc...

// Token claims
{
  sub: "viewer",
  role: "viewer",
  sessionId: "session-123",
  exp: now + 86400 // 24h max
}
```

**Rules:**
- Token in query param `?t=`
- Max TTL: 24 hours
- Verify on WebSocket connect (in Durable Object)
- Deny connection if expired/invalid
- Presenter tokens separate (longer TTL if needed)

**WebSocket Auth Flow:**
```typescript
// 1. Viewer extracts token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('t');

// 2. Send HELLO with token
ws.send({ t: 'HELLO', role: 'viewer', token });

// 3. Durable Object verifies JWT
const payload = await verifyJWT(token);
if (!payload || payload.exp < Date.now()) {
  ws.close(4001, 'Invalid or expired token');
  return;
}
```

## ♿ Accessibility

### Reduced Motion Support

**MUST respect `prefers-reduced-motion`:**

```typescript
// Detect user preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Apply cross-fade fallback
const transition = prefersReducedMotion
  ? { kind: 'fade', durationMs: 200 }
  : slide.transition;
```

**Rules:**
- Check media query on viewer mount
- Override all transitions with simple fade
- Reduce duration to 200ms max
- No parallax, cube, or 3D effects
- Cross-fade only for reduced motion

**Framer Motion Integration:**
```typescript
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

const variants = shouldReduceMotion
  ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
  : { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } };
```

## 📊 Monitoring & Enforcement

### Bundle Analysis

```bash
# Analyze bundles
ANALYZE=true pnpm build

# Check viewer bundle
pnpm bundle-check
```

### Pre-commit Checks

```json
{
  "husky": {
    "pre-commit": [
      "lint-staged",
      "tsc --noEmit",
      "pnpm bundle-check"
    ]
  }
}
```

### Metrics to Track

- Viewer bundle size (gzipped)
- Time to Interactive (TTI) for viewer
- WebSocket connection latency
- Dropped message rate (invalid payloads)
- Transition FPS (should be 60)

## 🚨 Violations = Blockers

These are **hard requirements**. PRs violating guardrails should not merge:

1. ❌ Viewer bundle > 200KB gzipped
2. ❌ Konva imported outside `/editor`
3. ❌ Layout properties animated
4. ❌ WebSocket messages not validated
5. ❌ Sequence gaps not handled
6. ❌ No JWT verification on viewer WS
7. ❌ No reduced-motion fallback

## ✅ Checklist for Each Feature

Before merging:
- [ ] Bundle size checked (`ANALYZE=true pnpm build`)
- [ ] No editor deps in viewer routes
- [ ] Animations use transform/opacity only
- [ ] All WS messages validated with Zod
- [ ] Sequence gap handling tested
- [ ] JWT verification implemented
- [ ] Reduced motion tested manually

## 📚 References

- [Web Performance Best Practices](https://web.dev/fast/)
- [Framer Motion Performance](https://www.framer.com/motion/guide-reduce-bundle-size/)
- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Zod Validation](https://zod.dev)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Remember: Guardrails exist to ensure the MVP is fast, secure, and accessible.** 🚀


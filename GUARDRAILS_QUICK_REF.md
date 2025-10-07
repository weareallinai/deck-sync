# Guardrails Quick Reference Card

> **Keep this visible during development** 🚨

## 🎯 Critical Rules

### 1. Bundle Size
```bash
# Check before committing
pnpm bundle-check

# Must pass:
✅ Viewer ≤ 200KB gzipped
✅ Presenter ≤ 300KB gzipped
```

### 2. Code Splitting
```typescript
// ❌ NEVER in viewer routes
import { Stage } from 'react-konva';

// ✅ OK in editor routes only
import { Stage } from 'react-konva';

// ✅ Dynamic import if needed
const Heavy = dynamic(() => import('./Heavy'));
```

### 3. CSS Performance
```typescript
// ✅ GPU accelerated
animate={{ opacity: 1, x: 0 }}

// ❌ Layout thrash
animate={{ width: 500, left: 0 }}
```

### 4. WebSocket
```typescript
// ✅ Always validate
const msg = WSMessageSchema.parse(data);

// ✅ Check sequence
if (msg.seq !== lastSeq + 1) {
  requestSnapshot();
}
```

### 5. JWT
```typescript
// ✅ Viewer URL format
/view/session-id?t=jwt-token

// ✅ Verify before WS connect
if (!verifyJWT(token)) {
  ws.close(4001);
}
```

### 6. Reduced Motion
```typescript
// ✅ Always check
const safe = getSafeTransition(transition);

// ✅ Or use hook
const reduced = useReducedMotion();
```

## 📋 Pre-Commit Checklist

```bash
# Run all checks
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm bundle-check
```

## 🚨 Auto-Fail Conditions

These will block CI:
1. Viewer bundle > 200KB
2. TypeScript errors
3. Lint errors
4. Failed E2E tests

## 💡 Quick Fixes

**Bundle too large?**
- Check for Konva imports in viewer
- Use `ANALYZE=true pnpm build`
- Look for duplicate dependencies

**Animations janky?**
- Use `transform` not `left`/`top`
- Add `will-change: transform`
- Check with Chrome DevTools Performance

**WS disconnects?**
- Check JWT expiry (24h max)
- Verify sequence numbers
- Test with `REQUEST_SNAPSHOT`

## 📚 Full Docs

- `GUARDRAILS.md` - Complete specifications
- `GUARDRAILS_IMPLEMENTATION.md` - Status & todos
- `lib/utils/motion.ts` - Motion utilities
- `lib/utils/jwt.ts` - Auth utilities

---

**When in doubt, check the guardrails!** ⚠️


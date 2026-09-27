# Production Hardening — Design Spec

**Date:** 2026-04-29
**Status:** Approved

## Goal

Close the remaining gaps between the current 7.5/10 production readiness and a best-in-class baseline. Three targeted changes: fix a type drift, surface client errors to Vercel, and add CI.

---

## 1. UserLanguage Type

**File:** `types/index.ts`

Expand `UserLanguage` from `'is' | 'en' | 'pl'` to all 8 configured locales:

```ts
export type UserLanguage = 'is' | 'en' | 'pl' | 'es' | 'lt' | 'tl' | 'uk' | 'vi';
```

The type currently diverges from `i18n-config.ts` which defines all 8 locales. Any code that stores or compares `user.language` against a locale string will silently accept invalid values under the current type.

---

## 2. ErrorBoundary — Vercel Error Capture

**File:** `components/ErrorBoundary.tsx`

Add `console.error(error, errorInfo)` inside `componentDidCatch`. Vercel captures all `console.error` calls from both server and client runtimes and surfaces them in the Vercel dashboard. Without this, client-side crashes are invisible in production.

No new dependency, no account required — it is already how the rest of the app's `logger.error` works.

---

## 3. Logger Cleanup

**File:** `lib/logger.ts`

Remove the commented-out Sentry block and `// TODO` note. Replace with a one-line comment explaining that Vercel captures `console.error` automatically. No behaviour change — purely removes misleading dead code that implies monitoring is not set up when it effectively is.

---

## 4. GitHub Actions CI

**File:** `.github/workflows/ci.yml`

Runs on:
- Every push to `main`
- Every pull request targeting `main`

Steps (in order):
1. Checkout
2. Setup Node 20 (matches `@types/node: ^20`)
3. `npm ci`
4. `npm run lint`
5. `npm run test:run`
6. `npm run build` — this is the TypeScript gate; no separate `tsc` script exists

**Why `next build` not `tsc`:** The project has no standalone typecheck script. `next build` runs `tsc` internally under strict mode and is the canonical type-check gate.

Cache `~/.npm` on the Node version + `package-lock.json` hash to keep runs fast.

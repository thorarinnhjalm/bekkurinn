# Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining production readiness gaps: fix UserLanguage type drift, remove misleading dead code, and add CI.

**Architecture:** Four independent, self-contained changes. No shared state or ordering dependency between them. Each can be implemented and committed separately.

**Tech Stack:** TypeScript, Next.js 16, GitHub Actions

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `types/index.ts` | Modify | Expand `UserLanguage` from 3 to 8 locales |
| `components/ErrorBoundary.tsx` | Modify | Remove Sentry TODO comment block |
| `lib/logger.ts` | Modify | Remove Sentry TODO comment block |
| `.github/workflows/ci.yml` | Create | Lint + test + build on push/PR to main |

---

## Task 1: Fix UserLanguage Type

**Files:**
- Modify: `types/index.ts:12`

- [ ] **Step 1: Update the type**

In `types/index.ts`, replace line 12:

```ts
// Before
export type UserLanguage = 'is' | 'en' | 'pl';

// After
export type UserLanguage = 'is' | 'en' | 'pl' | 'es' | 'lt' | 'tl' | 'uk' | 'vi';
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "fix(types): expand UserLanguage to all 8 configured locales"
```

---

## Task 2: Clean Up ErrorBoundary Dead Code

**Files:**
- Modify: `components/ErrorBoundary.tsx:43-51`

The `componentDidCatch` method already calls `console.error` correctly on line 45. Remove only the Sentry comment block below it.

- [ ] **Step 1: Remove the Sentry TODO comment block**

In `components/ErrorBoundary.tsx`, replace the `componentDidCatch` method:

```tsx
// Before
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, you might send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service (Sentry, etc)
    // if (process.env.NODE_ENV === 'production') {
    //     Sentry.captureException(error, { extra: errorInfo });
    // }
}

// After
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Vercel captures all console.error calls in production automatically
    console.error('ErrorBoundary caught an error:', error, errorInfo);
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add components/ErrorBoundary.tsx
git commit -m "chore: remove stale Sentry TODO from ErrorBoundary"
```

---

## Task 3: Clean Up Logger Dead Code

**Files:**
- Modify: `lib/logger.ts:30-37`

- [ ] **Step 1: Remove the Sentry TODO comment block**

In `lib/logger.ts`, replace the `error` method:

```ts
// Before
error: (message: string, error?: Error | unknown) => {
    console.error(message, error);

    // TODO: Send to error tracking service in production
    // if (!isDevelopment && typeof window !== 'undefined') {
    //     Sentry.captureException(error, { extra: { message } });
    // }
},

// After
error: (message: string, error?: Error | unknown) => {
    // Vercel captures all console.error calls in production automatically
    console.error(message, error);
},
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add lib/logger.ts
git commit -m "chore: remove stale Sentry TODO from logger"
```

---

## Task 4: Add GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow directory and file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml` with this content:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
        env:
          # Build requires env vars to be present — use empty stubs for CI
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY || 'stub' }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'stub' }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'stub' }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'stub' }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'stub' }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID || 'stub' }}
```

- [ ] **Step 2: Verify the YAML is valid**

```bash
npx js-yaml .github/workflows/ci.yml
```

Expected: prints the parsed object without errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow (lint, test, build)"
```

---

## Self-Review Notes

- Task 1 covers the `UserLanguage` spec requirement completely.
- Tasks 2 & 3 cover the logger/ErrorBoundary cleanup. Note: `console.error` was already present in ErrorBoundary — only the dead comment needed removing.
- Task 4 covers CI. The `next build` step is the TypeScript gate (no separate `tsc` script exists in `package.json`).
- Firebase env var stubs in the workflow prevent build failures from missing secrets; real values should be added as GitHub repo secrets for accurate production-equivalent builds.

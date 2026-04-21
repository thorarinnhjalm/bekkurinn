# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Next.js dev server on :3000 (start URL: /is/dashboard)
npm run build            # Production build
npm run lint             # ESLint (eslint-config-next)
npm run test             # Vitest watch mode
npm run test:run         # Vitest single run (CI)
npm run test:run tests/validation.test.ts   # Run one test file
npx playwright test                          # E2E suite (boots `npm run dev` automatically)
npx playwright test e2e/smoke.spec.ts --project=chromium  # Single e2e
npm run sync-admins      # Sync NEXT_PUBLIC_ADMIN_EMAILS from .env.local → Firestore `system_admins`
firebase deploy --only firestore:rules,firestore:indexes,storage
```

No typecheck script — `tsc` runs via `next build`. TypeScript is **strict**; the `@/*` path alias maps to repo root (see [tsconfig.json](tsconfig.json)).

## Architecture

### Routing & i18n (non-obvious)

All user-facing routes live under `app/[locale]/`. Supported locales: `is` (default), `en`, `pl`, `es`, `lt`, `tl`, `uk`, `vi` — see [i18n-config.ts](i18n-config.ts). Middleware forces a locale prefix on every path except `/api` and static assets ([middleware.ts](middleware.ts)). `localeDetection: false` — we never auto-redirect based on Accept-Language.

Inside `app/[locale]/` there are two route groups:
- **`(app)/`** — authenticated app (dashboard, directory, calendar, patrol, announcements, agreement, lost-found, settings, user). Wraps children in `DesktopSidebar` + `TopHeader` + `MobileNavWrapper` via [app/[locale]/(app)/layout.tsx](app/[locale]/(app)/layout.tsx).
- **`(marketing)/`** + top-level marketing pages (`how-it-works`, `why-us`, `handbok`, `privacy`, `terms`, ...) — plain landing content.

The `getRequestConfig` in [i18n.ts](i18n.ts) loads `messages/<locale>.json` per request. `i18n.ts.disabled` is an older copy; ignore it. All user-facing error messages in services are in Icelandic (e.g. `'Gat ekki búið til notanda'`).

### Data layer

- **Firebase client SDK** ([lib/firebase/config.ts](lib/firebase/config.ts)) — singleton pattern exporting `{ app, auth, db, storage }`. Used everywhere that reads/writes as the signed-in user.
- **Firebase Admin SDK** ([lib/firebase/admin.ts](lib/firebase/admin.ts)) — server-only, used by API routes in `app/api/*` to verify ID tokens. Requires `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` (newlines escaped as `\n`) or falls back to ADC.
- **`services/`** — all CRUD lives here (`firestore.ts`, `admin.ts`, `agreementService.ts`, `storage.ts`). Components never call `firebase/firestore` directly; they go through these services.
- **`hooks/useFirestore.ts`** — React Query wrappers over the services. This is the canonical read path for client components.

React Query is configured with aggressive caching to minimize Firestore reads ([components/providers/QueryProvider.tsx](components/providers/QueryProvider.tsx)): `staleTime: 5min`, `gcTime: 10min`, `refetchOnWindowFocus: false`. When you add a mutation, invalidate the relevant query keys rather than lowering stale time.

### Security model (Firestore rules)

[firestore.rules](firestore.rules) is the source of truth for access control and is non-trivial — read it before changing data shapes:
- `system_admins/{uid}` doc presence → super-admin.
- `parentLinks/{uid}_{classId}` doc presence → class member. The composite ID is load-bearing; preserve it when writing parent links.
- `classes.admins[]` array or `parentLinks.role == 'admin'` → class admin.
- `schools.admins[]` → school admin (foreldrafélag / PTA).

`NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local` is not consulted at runtime — run `npm run sync-admins` to materialize it into the `system_admins` collection.

### Providers & layout chain

Root render order (see [app/[locale]/layout.tsx](app/[locale]/layout.tsx)):
`ErrorBoundary → NextIntlClientProvider → AuthProvider → StructuredData → children → ToastContainer`.

`AuthProvider` ([components/providers/AuthProvider.tsx](components/providers/AuthProvider.tsx)) exposes Firebase auth + a synced `users/{uid}` doc via `useAuth()`. `QueryProvider` is mounted once at the root ([app/layout.tsx](app/layout.tsx)), so `useQuery` works anywhere.

The root [app/page.tsx](app/page.tsx) renders the Icelandic landing directly (not a redirect) — deliberate fix for Google Search Console indexing. Because this route is not under `[locale]/`, it mounts its own `AuthProvider` + `NextIntlClientProvider`; any page under `[locale]/` goes through the locale layout's providers instead. Don't convert the root to a redirect.

### Tests

- **Vitest + jsdom** runs `tests/**/*.test.{ts,tsx}` only (see [vitest.config.ts](vitest.config.ts)). `tests/setup.ts` just imports `@testing-library/jest-dom`. The `@/*` alias is wired through Vitest too.
- **Playwright** (`e2e/`) spins up `npm run dev` via `webServer` and runs against Chromium/Firefox/WebKit + Mobile Chrome/Safari. Don't start a dev server yourself before `npx playwright test`.

### Scripts

`scripts/` contains one-shot data loaders (`seed.ts`, `seedDemo.ts`, `importAddresses.ts`, `importCalendar.ts`, ...). They load `.env.local` via dotenv and expect `GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth application-default login` for Admin SDK access. Run with `tsx scripts/<file>.ts`.

### Styling

Tailwind v4 (via `@tailwindcss/postcss`) + custom Nordic design tokens in [app/globals.css](app/globals.css). Reusable classes worth knowing: `.nordic-card`, `.nordic-button`, `.tap-target` (44px min for mobile). Brand color is `--sage-green: #3d7a5d`.

## Repo hygiene

Root is littered with historical session/status markdown files (`SESSION_*.md`, `*_STATUS.md`, `PROJECT_STATUS.md`, `COMPLETION_SUMMARY.md`, etc.). Treat them as stale context — the code is the source of truth. The README's "Project Structure" and "Known Issues" sections are from v0.2.0 and now out of date.

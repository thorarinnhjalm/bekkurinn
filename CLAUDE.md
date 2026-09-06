# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Next.js dev server on :3000 (start URL: /is/dashboard)
npm run build            # Production build — the only typecheck gate in CI; needs the six NEXT_PUBLIC_FIREBASE_* vars present (CI uses stubs)
npx tsc --noEmit         # Standalone typecheck without a full build
npm run lint             # ESLint 9 flat config (eslint-config-next); `no-explicit-any` is a warning, not an error
npm run test             # Vitest watch mode
npm run test:run         # Vitest single run (CI)
npm run test:run tests/validation.test.ts   # Run one test file
npm run test:coverage    # Vitest with coverage
npx playwright test                          # E2E suite (boots `npm run dev` itself)
npx playwright test e2e/smoke.spec.ts --project=chromium  # Single e2e
npm run sync-admins      # Materialize NEXT_PUBLIC_ADMIN_EMAILS (.env.local) into Firestore `system_admins`
firebase deploy --only firestore:rules,firestore:indexes,storage
```

**Install gotcha (as of Sept 2026):** `package-lock.json` is out of sync with `package.json` (`npm ci` aborts with `Missing: @swc/helpers@0.5.23 from lock file`), so `npm ci` fails locally and the CI install step is red on `main`. Run `npm install` and commit the updated lockfile before relying on CI.

Stack: Next.js 16 (App Router, `params` is a Promise), React 19, TypeScript **strict**, Tailwind v4, Firebase v12 client + firebase-admin v13, TanStack Query v5, next-intl v4, Zod v4. `@/*` maps to the repo root. CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint → `test:run` → build on Node 20.

## Architecture

### Routing & i18n

All user-facing routes live under `app/[locale]/`. Locales: `is` (default), `en`, `pl`, `es`, `lt`, `tl`, `uk`, `vi` ([i18n-config.ts](i18n-config.ts)). [middleware.ts](middleware.ts) forces a locale prefix on every path except `/api`, `_next`, `_vercel` and dotted files; `localeDetection: false` — never auto-redirect on Accept-Language.

There is exactly one route group, **`(app)/`** — the authenticated shell (dashboard, directory, calendar, patrol, announcements, agreement, lost-found, settings, user/profile) wrapped in `DesktopSidebar` + `TopHeader` + `MobileNavWrapper` by [app/[locale]/(app)/layout.tsx](app/[locale]/(app)/layout.tsx). Everything else sits directly under `app/[locale]/` with no shell: `login`, `onboarding`, `admin` (super-admin / school-admin console, deliberately outside the shell; its Users tab shows per-user class membership — admin / approved / pending / none — built by [utils/membership.ts](utils/membership.ts) from `classes.admins[]` plus every `parentLinks` doc) and the marketing/legal pages (`how-it-works`, `samanburdur`, `bekkjarsattmali`, `foreldrarolt`, `contact`, `handbok/*`, `privacy`, `terms`). There is no `(marketing)` group.

Two translation patterns coexist: client components call `useTranslations()`; server layouts/pages dynamically import `messages/<locale>.json` and pass slices down as a `translations` prop (see `(app)/layout.tsx`, `dashboard/page.tsx`). `messages/is.json` is the source of truth (~590 leaf keys); other locales lag (es has ~275), so add new keys to `is.json` first. [i18n.ts](i18n.ts) loads messages per request; `i18n.ts.disabled` is an old copy — ignore it.

The root [app/page.tsx](app/page.tsx) renders the Icelandic landing directly (not a redirect) — a deliberate fix for Google Search Console indexing — and mounts its own `NextIntlClientProvider` + `AuthProvider` because it is outside `[locale]/`. `app/[locale]/page.tsx` is the same composition; change both. Don't convert the root to a redirect.

`app/manifest.ts` generates `/manifest.webmanifest`, but the locale layout's metadata links the static `public/manifest.json` — they are independent files. `app/sitemap.ts` only lists a handful of public routes per locale.

### Data layer

- **Firebase client SDK** ([lib/firebase/config.ts](lib/firebase/config.ts)) — singleton exporting `{ app, auth, db, storage }`.
- **Firebase Admin SDK** ([lib/firebase/admin.ts](lib/firebase/admin.ts)) — server-only, initialised at module load from `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` (newlines escaped as `\n`) or ADC.
- **`services/`** (`firestore.ts`, `admin.ts`, `agreementService.ts`, `storage.ts`) is the intended CRUD layer and **`hooks/useFirestore.ts`** wraps it in React Query as the canonical read path. In practice about a dozen pages/components (`OnboardingView`, `AdminView`, `SettingsView`, directory, agreement, profile, several modals, `DesktopSidebar`, `PendingApprovals`) plus the lost-found and poll-vote hooks still call `firebase/firestore` directly. Use the services for new code and pull direct calls into a service when you touch them.
- Errors thrown by services are Icelandic strings (`'Gat ekki búið til bekk'`) and are shown to users as-is.
- React Query defaults ([components/providers/QueryProvider.tsx](components/providers/QueryProvider.tsx)): `staleTime` 5 min, `gcTime` 10 min, `refetchOnWindowFocus: false`, `retry: 1`. Mutations invalidate keys (`['tasks']`, `['announcements', classId]`, …) — do that rather than lowering stale time.
- **Active class.** `useUserClasses(uid, email)` is the "which class am I in" primitive: role `admin` if the uid is in `classes.admins[]`, otherwise `parent` via `parentLinks` (no status filter, so pending links count). `NEXT_PUBLIC_ADMIN_EMAILS` elevates every class to `admin` in the UI. It overrides `staleTime` to 1 min with `refetchOnMount: 'always'`. Pages take the first class as active (the agreement page prefers an admin class); there is no global class switcher — the dashboard keeps its own `selectedClassId` state.
- `hooks/useNotifications.ts` is an `onSnapshot` listener (last 50 for the user) outside React Query. Toasts are a zustand store in [components/ui/Toast.tsx](components/ui/Toast.tsx): `import { toast } from '@/components/ui/Toast'` (its doc comment points at a `lib/toast` that doesn't exist). That store is the only zustand usage.
- Firestore rejects `undefined` field values and `ignoreUndefinedProperties` is not enabled — write `null` for absent optional fields.

### Security model (Firestore + Storage rules)

[firestore.rules](firestore.rules) is the source of truth for access control; read it before changing data shapes.
- `system_admins/{uid}` doc presence → super-admin. `parentLinks/{uid}_{classId}` doc presence → class member. `classes.admins[]` or `parentLinks.role == 'admin'` → class admin. `schools.admins[]` → school admin (foreldrafélag / PTA).
- The composite parentLink ID is load-bearing (rules require `linkId == userId + '_' + classId`) and implies **one link per user per class** — linking a second child in the same class overwrites the first (`setDoc`).
- `NEXT_PUBLIC_ADMIN_EMAILS` is read client-side (`AdminView` gating, `useUserClasses`) but rules only honour `system_admins`. After changing it run `npm run sync-admins`, or the UI shows admin controls whose writes get denied.
- Known rule/code mismatches to resolve deliberately rather than paper over: `useFirestore.ts` reads and writes `lost_items` while rules only define `lostItems`; `agreementService.signAgreement` writes `agreements/{id}/signatures`, which has no rule (only `votes` does). Both are denied under production rules.
- Composite indexes live in [firestore.indexes.json](firestore.indexes.json). A `where` + `orderBy` on different fields needs an entry and a deploy; `getTasksByClass` deliberately sorts in memory to avoid one.
- `firestore.test.rules` is fully open — local development only. `firebase.json` deploys `firestore.rules`.
- [storage.rules](storage.rules): images only, 5 MB max, under `users/{uid}/…`, `students/{id}/…`, `lost-found/{classId}/…`; everything else denied.

### Auth, onboarding and the dashboard gate

- `AuthProvider` ([components/providers/AuthProvider.tsx](components/providers/AuthProvider.tsx)) exposes Firebase auth plus the `users/{uid}` doc via `useAuth()` and creates that doc on first sign-in (`language: 'is'`, `phone: ''`). Google popup and email/password sign-in are both supported. `user` is the Firebase `User`; `userData` is the Firestore `User` doc (`phone`, `language`, `notificationSettings`, `starredStudents`) — don't confuse them. `QueryProvider` is mounted once in [app/layout.tsx](app/layout.tsx), so `useQuery` works anywhere.
- `login` honours `?returnTo=` and warns Facebook/Instagram/Messenger in-app browsers that the Google popup may fail.
- Join codes are stored canonical (uppercase, NFC, letters/digits/hyphens: `SALA-4-B-1234`, co-admin variant `…-ADMIN`) and compared byte-for-byte, so every code from user input, invite links or class creation goes through `normalizeJoinCode()` in [lib/joinCode.ts](lib/joinCode.ts) first. `JoinCodeSchema` normalizes before validating.
- `onboarding` steps are URL-driven (`?step=language|select|create|join`). **create** (class rep) makes the class with a `joinCode` for parents and a `parentTeamCode` for co-admins, records `confidentialityAgreedAt`, and imports holiday events from the school's ICS through `/api/proxy-calendar`. **join** takes a code, then either an existing child (link `pending`, approved by that child's other parent or a class admin) or a newly created child (link `approved` immediately); an admin code yields `role: 'admin'`. Invite links: `?step=join&code=…&inviterId=…` (dashboard "copy join link") and `?join=<studentId>&classId=…` (spouse invite).
- `DashboardView` is the gate: no user → `/login`; user with zero classes → `/onboarding`; a `pending` link → blocking "Beðið eftir samþykki" screen. `?welcome=true` opens `WelcomeWizard`.

### Scope model

Tasks, announcements and lost-found items carry `scope: 'class' | 'school'` with `classId` / `schoolId`. `'class'` sets `classId` and queries filter on it; `'school'` sets `schoolId` and is visible to all members of that school. Set the unused ID to `null` — rules check both and the SDK rejects `undefined`. Tasks are polymorphic on `type` (`rolt` | `event` | `gift_collection` | `school_event` | `birthday`); birthdays may be `isPrivate` with `invitees` (student IDs) and are filtered client-side in `useTasks`. Lost & found queries by `schoolId` only, so a class without a `schoolId` sees nothing there.

### Babelfish translation

`<Babelfish>` ([components/Babelfish.tsx](components/Babelfish.tsx)) calls `/api/translate` and caches with `staleTime: Infinity`. It runs only when text is present, `originalLanguage !== targetLanguage`, and the target is not `is`. The route (Gemini `gemini-pro`, 20 req/min per IP, 5000 chars) whitelists only `is/en/pl/es/lt` — `tl`, `uk` and `vi` users get a 400 and Babelfish silently renders nothing.

### API routes (`app/api/`)

Mutating routes share one pattern: rate-limit by IP → verify `Authorization: Bearer <Firebase ID token>` with the Admin SDK → check `classes.admins` / `schools.admins` for the target scope → act through `adminDb`. Error bodies are Icelandic.
- **`translate/`** — Gemini proxy (above)
- **`notifications/fan-out/`** — writes one `notifications` doc per class/school member in 500-op batches (20/min)
- **`send-critical-announcement/`** — Resend email to members who haven't opted out of `notificationSettings.email.announcements`, max 500 recipients (5/min); needs `RESEND_API_KEY`
- **`proxy-calendar/`** — ICS fetcher with HTTPS + municipality-domain allowlist (Reykjavík, Kópavogur, Garðabær, Mosfellsbær, Seltjarnarnes, Hafnarfjörður, Keflavík); a school elsewhere needs the list extended (10/min, 1 h cache)
- **`plausible-stats/`** — analytics proxy for the admin dashboard (`PLAUSIBLE_API_KEY`)
- **`cron/reminders/`** — hourly via [vercel.json](vercel.json); auth is `Bearer ${CRON_SECRET}` with a `testing123`-in-URL bypass that should not survive into production. Uses `volunteerReminderSent` / `generalReminderSent` flags on `Task` to prevent double sends.

[lib/rate-limit.ts](lib/rate-limit.ts) is an in-memory LRU (500 keys, 1 min TTL) — per serverless instance, so best-effort on Vercel.

### Environment

`.env.example` covers the client Firebase keys, `GEMINI_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_PLAUSIBLE_SITE_ID` and `PLAUSIBLE_API_KEY`. Also used but not listed there: `NEXT_PUBLIC_ADMIN_EMAILS`, `FIREBASE_ADMIN_*`, `CRON_SECRET`. The Plausible script loads only when `NODE_ENV === 'production'`.

### Utilities

- [lib/logger.ts](lib/logger.ts) — `debug`/`info` are no-ops outside development; `warn`/`error` always log (Vercel captures `console.error`). Use it instead of `console.*` in services and routes.
- [lib/validation.ts](lib/validation.ts) — Zod schemas (`OnboardingSchema`, `JoinCodeSchema`, `StudentSchema`, `TaskSchema`, `SettingsSchema`, `UserUpdateSchema`) plus `validateInput()`. Despite the header comment the messages are English, and `UserUpdateSchema.language` allows only `is | en` while `UserLanguage` has eight values.
- [lib/utils.ts](lib/utils.ts) — `cn()` (clsx + tailwind-merge) for all conditional class merging. [lib/canvasUtils.ts](lib/canvasUtils.ts) — crop helper for the `react-easy-crop` upload flow.
- [constants/schools.ts](constants/schools.ts) — hardcoded Kópavogur schools with ICS URLs; `isKopavogurSchool()` in [utils/schoolUtils.ts](utils/schoolUtils.ts) gates municipality features. Other schools live in the Firestore `schools` collection, created from `/admin`.

### Tests

- Vitest ([vitest.config.ts](vitest.config.ts)): `happy-dom`, `pool: 'vmThreads'`, globals on, `tests/**/*.test.{ts,tsx}`, setup just imports `@testing-library/jest-dom`. **`tests/ui/**` is excluded unconditionally** (added because Node 24 deadlocks on `.tsx` workers). The inline comment says CI runs them, but CI uses the same config, so the UI component tests currently run nowhere until that exclude is lifted.
- Mocking pattern: `vi.mock('firebase/firestore', importOriginal…)` + `vi.mock('@/lib/firebase/config', () => ({ db: {} }))` + `vi.mock('@/lib/logger')` for services; route-level tests mock `@/lib/firebase/admin` and `@/services/firestore`. No emulator.
- Playwright: one smoke spec ([e2e/smoke.spec.ts](e2e/smoke.spec.ts)) across Chromium/Firefox/WebKit + Mobile Chrome/Safari. `webServer` starts `npm run dev` (reused if already running locally) — don't start one yourself first.

### Scripts (`scripts/`, run with `npx tsx scripts/<file>.ts`)

One-shot loaders; most load `.env.local` via dotenv. Only `syncAdmins.ts` uses the Admin SDK (needs ADC: `gcloud auth application-default login`). The seed/import scripts (`seed.ts`, `seedDemo.ts`, `seedSimple.ts`, `seedDatabase.ts`, `importAddresses.ts`, `importCalendar.ts`, `patchCalendarUrls.ts`) use the **client** SDK unauthenticated, so they only succeed against open test rules. `importCalendar.ts` has a hardcoded `CLASS_ID`.

### Styling

Tailwind v4 via `@tailwindcss/postcss` (v4 class names: `bg-linear-to-r`, `shrink-0`, `z-10`) plus Material-3 style tokens in [app/globals.css](app/globals.css) implementing **fjord_moss / "The Academic Sanctuary"** (`design/stitch/nordic_trust_os/fjord_moss/DESIGN.md`; `fjord_echo/` is an unused alternative). Tokens are exposed to Tailwind through `@theme`, so use `bg-primary`, `text-on-surface`, `bg-surface-container-low`, `border-outline-variant`, etc. Primary Deep Fjord `#12362e`, secondary terracotta `#934a2c`, surface Soft Bone `#fbf9f2`. Design rules: no 1px borders for sectioning — separate with surface tokens or `.ghost-border`; shadows are teal-tinted (`.ambient-shadow`), never grey; Inter only. Helper classes: `.nordic-card` (tonal, borderless), `.nordic-button` (gradient pill), `.btn-secondary`, `.glass-nav`, `.tap-target` (44 px). Primitives in `components/ui/` (`Button`, `Card`, `Chip`, `Input`, …). The legacy `--trust-navy` / `--nordic-blue` / `--bg-*` / `--text-*` / `--gray-*` vars are aliases slated for removal — don't add new references. Per-screen Stitch reference HTML lives in `design/stitch/nordic_trust_os/<screen>_<desktop|mobile>/code.html`.

## Planning docs and repo hygiene

- `docs/superpowers/specs/` and `plans/` hold the redesign rollout (Phase 0 tokens → Phase 1 marketing → Phase 2 app screens) and the production-hardening plan. These are the current intent documents.
- The root is littered with historical status files (`SESSION_*.md`, `*_STATUS.md`, `PROJECT_STATUS.md`, `COMPLETION_SUMMARY.md`, `LAUNCH_ACTION_PLAN.md`, `SYSTEM_AUDIT_*.md`, `TODO_THORARINN.md`) and committed tool output (`lint_errors.txt`, `test_errors.txt`, `playwright-report/`, `test-results/`). Treat all of it as stale; the code is the source of truth. `README.md` (v0.2.0: "Next.js 14", four languages, sage-green palette) and `public/llms.txt` (references a `src/` tree that doesn't exist) are out of date as well.

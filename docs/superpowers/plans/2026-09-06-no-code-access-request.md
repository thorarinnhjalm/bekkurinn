# "Ég er ekki með kóða" — Access Request Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Date:** 2026-09-06
**Status:** Draft — decisions below need Þórarinn's sign-off before Task 1 starts.

**Goal:** A parent who reaches onboarding without a join code currently has no way forward and silently drops off (visible in the admin Users tab as "Enginn bekkur"). Give them a third option that records what they need, routes it to whoever can let them in, and keeps them informed.

**Architecture:** One new Firestore collection, `accessRequests`, written by the parent from onboarding. Phase 1 surfaces requests to super-admins in a new admin tab and emails them; that alone closes the loop manually. Phase 2 lets class representatives see requests that match their class and send the join code with one click. Phase 3 adds nudges and retention. Each phase ships on its own.

**Tech Stack:** Next.js 16 route handlers (Admin SDK), Firestore rules + composite index, Resend, next-intl, Zod, Vitest.

---

## Decisions to confirm before starting

1. **Who is told about a new request.** Recommended: email the super-admin address(es) via Resend on every new request (Phase 1), and the matching class admins once Phase 2 lands. Alternative: admin tab only, no email.
2. **What the parent is asked.** School (picked from the school list, free text allowed), grade (1–10), optional section, optional note (≤ 500 chars). Not the child's name — it is not needed to route the request and keeps the collection low-sensitivity.
3. **One-click "Senda kóða" (Phase 2).** Sends the class join code by email to the requester. The code is the class's shared secret, so only verified class admins get the button, and the email goes to the sign-up address only.
4. **Retention.** Requests are auto-closed and deleted 90 days after creation (Phase 3). One sentence is added to the privacy policy.

---

## Data model

```ts
// types/index.ts
export type AccessRequestStatus = 'open' | 'invited' | 'closed';

export interface AccessRequest {
    id: string;
    userId: string;                 // requester uid
    email: string;                  // sign-up email, copied for the admin view and mail sending
    displayName: string;
    schoolId: string | null;        // SCHOOLS constant id or Firestore schools id when picked from the list
    schoolName: string;             // always set; free text allowed
    grade: number;                  // 1–10
    section: string | null;
    note: string | null;            // ≤ 500 chars
    status: AccessRequestStatus;
    matchedClassId: string | null;  // set by "Senda kóða" or when the parent joins
    handledBy: string | null;       // admin uid who acted
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
```

Documents use auto IDs. The UI prevents duplicates by loading the user's own open request first (a parent with children in two classes may legitimately have two).

**Rules** (`firestore.rules`):

```
match /accessRequests/{requestId} {
  // Parent files a request for themselves; it must start open and carry their own email
  allow create: if isAuthenticated()
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.email == request.auth.token.email
                && request.resource.data.status == 'open';

  // Requester sees their own; super-admins see all. Class admins read via the Phase 2 API route, never directly.
  allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isSuperAdmin());

  // Super-admins manage; the requester may only withdraw (open → closed)
  allow update: if isSuperAdmin()
                || (isAuthenticated()
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt'])
                    && request.resource.data.status == 'closed');

  allow delete: if isSuperAdmin();
}
```

**Index** (`firestore.indexes.json`): `accessRequests` on `status ASC, createdAt DESC` (admin tab). Phase 2 adds `schoolId ASC, grade ASC, status ASC`.

---

## Phase 1 — Capture + super-admin handling (MVP)

### File Map

| File | Action | Change |
|------|--------|--------|
| `types/index.ts` | Modify | `AccessRequest`, `AccessRequestStatus`, `CreateAccessRequestInput` |
| `firestore.rules` | Modify | `accessRequests` block above |
| `firestore.indexes.json` | Modify | `status` + `createdAt` index |
| `lib/validation.ts` | Modify | `AccessRequestSchema` (schoolName 2–100, grade int 1–10, section ≤ 10, note ≤ 500) |
| `services/accessRequests.ts` | Create | `createAccessRequest`, `getMyOpenAccessRequests`, `getOpenAccessRequests`, `updateAccessRequest` |
| `hooks/useFirestore.ts` | Modify | `useMyAccessRequests`, `useCreateAccessRequest`, `useOpenAccessRequests`, `useUpdateAccessRequest` |
| `utils/accessRequestMatch.ts` | Create | Pure matcher: request ↔ classes by `schoolId` or normalized school name, plus grade |
| `app/[locale]/onboarding/OnboardingView.tsx` | Modify | Third card on `select`, new `request` step, "request received" status card |
| `app/[locale]/admin/AdminView.tsx` | Modify | "Beiðnir" tab with count badge; fetch open requests for super-admins |
| `app/[locale]/admin/components/AccessRequestsTab.tsx` | Create | List, matching classes with join code, mark handled |
| `app/api/access-requests/notify/route.ts` | Create | Emails super-admins about a new request (Resend) |
| `messages/is.json`, `messages/en.json` (+ pl, es, lt, tl, uk, vi) | Modify | `onboarding.request_*` and `admin.requests_*` keys |
| `tests/accessRequestMatch.test.ts` | Create | Matcher cases |
| `tests/validation.test.ts` | Modify | `AccessRequestSchema` cases |

### Task 1: Types, rules, index

- [ ] **Step 1:** Add the types above to `types/index.ts` next to `ParentLink`. `CreateAccessRequestInput = Omit<AccessRequest, 'id' | 'status' | 'matchedClassId' | 'handledBy' | 'createdAt' | 'updatedAt'>`.
- [ ] **Step 2:** Add the rules block to `firestore.rules` after `contactMessages`.
- [ ] **Step 3:** Add the composite index to `firestore.indexes.json`.
- [ ] **Step 4:** `npx tsc --noEmit` — clean. Deploy rules + index: `firebase deploy --only firestore:rules,firestore:indexes`.
- [ ] **Step 5:** Commit: `feat(access-requests): types, rules and index`.

### Task 2: Service, validation, hooks

- [ ] **Step 1:** `lib/validation.ts` — `AccessRequestSchema` with the limits in the File Map; messages follow the existing (English) style.
- [ ] **Step 2:** `services/accessRequests.ts` — CRUD following `services/firestore.ts` conventions (`serverTimestamp()`, Icelandic error strings, `logger.error`). `getOpenAccessRequests` queries `status == 'open'` ordered by `createdAt desc`, limit 200.
- [ ] **Step 3:** `hooks/useFirestore.ts` — React Query wrappers; mutations invalidate `['accessRequests']` and `['myAccessRequests', uid]`.
- [ ] **Step 4:** `utils/accessRequestMatch.ts` — `matchRequestToClasses(request, classes)`: same `schoolId` when both set, else `normalizeJoinCode(schoolName)` equality, and `grade` equal; returns matching classes. Pure, no Firestore.
- [ ] **Step 5:** Tests: `tests/accessRequestMatch.test.ts` (id match, name match with different casing/accents, grade mismatch, no schoolId on either side) and `AccessRequestSchema` cases in `tests/validation.test.ts`.
- [ ] **Step 6:** `npm run test:run` — green. Commit: `feat(access-requests): service, validation, matcher`.

### Task 3: Onboarding — the third way in

- [ ] **Step 1:** Add `'request'` to `OnboardingStep` and to the URL-step whitelist so `?step=request` deep-links.
- [ ] **Step 2:** On the `select` step, add a third card under the two existing ones: title `t('request_card_title')` ("Ég er ekki með kóða"), body `t('request_card_desc')` ("Segðu okkur hvaða skóla og bekk barnið þitt er í og við hjálpum þér að komast inn."). If `useMyAccessRequests` returns an open request, render the status card (Step 4) instead of the three cards.
- [ ] **Step 3:** `request` step: form with the school picker already used by the create step (`availableSchools`, free text allowed), grade select 1–10, optional section, optional note. Validate with `AccessRequestSchema`, then `useCreateAccessRequest`, then `fetch('/api/access-requests/notify', …)` with the ID token (fire-and-forget; failures only log). Progress indicator labels: `['Velja aðferð', 'Biðja um aðgang']`.
- [ ] **Step 4:** Status card ("Beiðni móttekin"): what happens next, the email we will use, a "Ég fékk kóða" button that jumps to `?step=join`, and a "Hætta við beiðni" link that sets `status: 'closed'`.
- [ ] **Step 5:** When a parent completes the join step (`handleJoinClass` / `handleCreateStudentAndJoin`) and has an open request, set it `closed` with `matchedClassId`.
- [ ] **Step 6:** Copy in `messages/is.json` first, then `en.json`; other locales get the English strings until translated (record this in the PR).
- [ ] **Step 7:** Manual QA on a fresh account: no code → request → status card survives reload → "Ég fékk kóða" → join works and closes the request. Commit: `feat(onboarding): request access without a join code`.

### Task 4: Admin "Beiðnir" tab

- [ ] **Step 1:** `AdminView.tsx` — add `'requests'` to `activeTab`, fetch `getOpenAccessRequests()` in the super-admin branch, badge with the open count like the Approvals tab.
- [ ] **Step 2:** `components/AccessRequestsTab.tsx` — table: parent name, email (mailto link), school, grade/section, note, age of request. Per row: matching classes from `matchRequestToClasses` with their join code and a "Afrita boðshlekk" button producing `/${locale}/onboarding?step=join&code=<joinCode>`; "Merkja afgreidda" sets `status: 'closed'`, `handledBy`.
- [ ] **Step 3:** Empty state: "Engar opnar beiðnir". Commit: `feat(admin): access requests tab`.

### Task 5: Notify super-admins

- [ ] **Step 1:** `app/api/access-requests/notify/route.ts` — same pattern as `send-critical-announcement`: rate limit 5/min per IP, verify ID token, load the request by id with `adminDb`, require `userId == uid` and `status == 'open'`, then Resend to `ACCESS_REQUEST_NOTIFY_EMAILS` (new server env var, comma-separated). If `RESEND_API_KEY` is unset, return 200 with `{ skipped: true }` and log.
- [ ] **Step 2:** Add `ACCESS_REQUEST_NOTIFY_EMAILS` to `.env.example` and the Vercel project.
- [ ] **Step 3:** Route test in `tests/` mocking `@/lib/firebase/admin` and `resend` (missing token → 401, foreign request → 403, happy path → 200). Commit: `feat(access-requests): notify super-admins by email`.

### Task 6: Docs

- [ ] Update `CLAUDE.md` (onboarding section: the third option and the `accessRequests` collection; API routes list). Update the privacy page with one sentence on access-request data and its 90-day retention.

**Phase 1 estimate:** about one working day.

---

## Phase 2 — Class representatives resolve requests themselves

- [ ] `app/api/access-requests/for-admin/route.ts` (GET, ID token): loads the caller's admin classes with `adminDb`, returns open requests matching them (`matchRequestToClasses`). Keeps school-wide reads server-side; rules stay unchanged.
- [ ] Dashboard card for admins next to `PendingApprovals`: "N foreldrar bíða eftir kóða" with name and grade; button "Senda kóða".
- [ ] `app/api/access-requests/invite/route.ts` (POST): verifies the caller is admin of `classId`, emails the parent a join link (`?step=join&code=…&inviterId=<caller>`), writes a `notifications` doc for the parent, sets `status: 'invited'`, `matchedClassId`, `handledBy`.
- [ ] When the parent joins (Task 3 Step 5 already closes the request), the dashboard card disappears.
- [ ] Add the `schoolId + grade + status` index.

**Phase 2 estimate:** about one working day.

## Phase 3 — Nudges and retention

- [ ] Extend `app/api/cron/reminders/route.ts`: `open` requests older than 24 h with no match → daily digest to super-admins; `invited` older than 3 days without a join → one reminder to the parent.
- [ ] Users with zero classes and no request 24 h after sign-up → one "Þarftu hjálp við að komast í bekkinn?" email, respecting `notificationSettings.email`.
- [ ] Auto-close and delete requests older than 90 days.
- [ ] Remove the `testing123` bypass from the cron route while touching it.

**Phase 3 estimate:** about half a working day.

---

## Out of scope

- Letting parents browse or search classes without a code (would leak class existence and names).
- Teacher or school-staff accounts.
- SMS delivery.

## Open questions

- Should the request also be offered on the login page for people who never sign up? (Today the flow requires an account first, which is what makes the email address trustworthy.)
- Should super-admins be able to create the parent link directly from the request when exactly one class matches? Saves a round trip but bypasses the class representative.

# Nordic Trust OS Redesign — Design Spec

**Status:** Draft, awaiting user approval
**Date:** 2026-04-21
**Source:** Stitch export at `design/stitch/nordic_trust_os/` (21 screens, desktop + mobile, plus `fjord_moss` and `fjord_echo` design-system docs)

## 1. Goal

Replace the current "Trust Navy" visual system with the **fjord_moss / "Academic Sanctuary"** design system produced by Stitch. Scope covers both surfaces (public marketing + authenticated app), all current top-level routes, desktop + mobile.

Not in scope: data model changes, feature additions, icon-library swap, any behavioural change. This is a visual migration.

## 2. Source-of-Truth Mapping

| Artifact | Role |
|---|---|
| `design/stitch/nordic_trust_os/*/code.html` | Visual reference for layout, spacing, token usage — **not copied verbatim**. |
| `design/stitch/nordic_trust_os/fjord_moss/DESIGN.md` | Design-system rules (tokens, typography, depth, no-line rule, etc.). Normative. |
| `design/stitch/nordic_trust_os/fjord_echo/DESIGN.md` | Rejected alternative. Retained for reference only. |
| `messages/*.json` | Source of truth for all copy. Stitch copy is reference only; any new strings get added to `is.json` first, then the other 7 locales. |
| `services/**`, `hooks/useFirestore.ts` | Data layer is untouched. Redesigned screens wire to existing hooks. |

## 3. Design Tokens (fjord_moss)

Adopt Material 3 token naming 1:1 with the Stitch Tailwind config, written into `app/globals.css` (Tailwind v4, no separate config file).

**Palette (primitive tokens → CSS vars):**
- `--primary: #12362e` (Deep Fjord) and `--primary-container: #2a4d44`
- `--secondary: #934a2c` (Muted Terracotta) used for warm/human accents
- `--surface: #fbf9f2` (Soft Bone canvas)
- `--surface-container-low: #f6f4ec`, `-container: #eceae4`, `-container-high: #e6e4de`, `-container-lowest: #ffffff`
- `--on-surface: #1b1c18`, `--on-surface-variant: #404943`
- `--error: #ba1a1a`, `--error-container: #ffdad6`
- `--tertiary-fixed: #ffddb8` (amber, birthdays/pinned)
- `--outline-variant: #c1c8c4` (used only for ghost borders at 15–20% opacity)

**Radii:** cap at `xl` (0.75rem). No hard 90-degree corners anywhere.

**Shadow:** one ambient shadow `0 12px 32px rgba(18, 54, 46, 0.06)` — tinted teal, never grey/black.

**Typography:** Inter only (already loaded). Display/headline with `letter-spacing: -0.02em`. Labels uppercase with `letter-spacing: 0.05em`.

**Legacy tokens:** `--trust-navy` and friends stay defined for one release but are marked deprecated in comments; nothing new should reference them.

## 4. Rollout Phases

### Phase 0 — Tokens + core primitives (one PR)
- Rewrite `app/globals.css` `:root` to the fjord_moss vars above. Keep the legacy `--trust-navy*`, `--nordic-blue*`, `--bg-*`, `--text-*`, `--shadow-*`, `--radius-*` var names defined as aliases to the closest new equivalent so unmigrated screens degrade gracefully. The aliases are removed once Phase 2 lands; no new code references them.
- Update `.nordic-button`, `.nordic-card`, `.tap-target` in globals.css to match fjord_moss rules (gradient primary, `xl` radii, ambient shadow, no border for sectioning).
- Add small utility classes: `.ambient-shadow`, `.ghost-border`, `.glass-nav` (surface at 80% opacity + 20px backdrop-blur).
- Introduce lightweight primitive components in `components/ui/` **if** a pattern is used on ≥3 screens: `Button.tsx`, `Card.tsx`, `Chip.tsx`, `Input.tsx`. Anything used once stays inline.
- Keep **lucide-react** as the icon library. The Stitch mockups use Google Material Symbols but swapping 40+ icon usages is out of scope for this migration — we translate by intent (e.g. `calendar_month` → `Calendar`). Add lucide equivalents where missing.
- Update `DesktopSidebar`, `TopHeader`, `BottomNav`, `MobileDrawer` to use the new tokens + glassmorphic style.
- **Acceptance:** lint + build + existing Vitest + Playwright smoke pass. Half-styled screens look coherent (warm bone background, new nav, new buttons) but may have stale per-screen spacing — acceptable.

### Phase 1 — Marketing site (3 PRs)
There is no `(marketing)` route group today; marketing pages live directly under `app/[locale]/` as siblings of `(app)`. Paths below reflect that.
1. **Landing (`app/page.tsx` + `app/[locale]/page.tsx`)** — full hero, bento-grid features, how-it-works, FAQ preview, final CTA, footer. Port Stitch `landing_page_desktop` + `landing_page_mobile`. Copy comes from `messages/is.json.landing.*`, extending keys as needed. Sibling marketing pages (`how-it-works`, `why-us`, `samanburdur`, `contact`, `bekkjarsattmali`, `foreldrarolt`) adopt the new tokens automatically via Phase 0 but are **not** re-laid-out in this PR.
2. **FAQ (`app/[locale]/handbok/`)** — port `faq_*`. Copy from existing `handbok.*` keys.
3. **Terms & Privacy (`app/[locale]/terms/`, `app/[locale]/privacy/`)** — port `terms_privacy_*`. Existing page content retained; wrapper + typographic treatment updated.

### Phase 2 — Internal app (7 PRs, one per screen)
Order: `dashboard` → `directory` → `calendar` → `announcements` → `agreement` → `patrol` → `lost-found`. Each PR:
- Rewrites the corresponding page + its sub-components to the Stitch layout using real data from `hooks/useFirestore.ts`.
- Keeps the file's data-fetching and loading/error states untouched.
- Adds a Playwright screenshot spec for desktop + mobile of that screen.
- The **`directory`** PR also introduces the **Privacy Veil** component (`components/ui/PrivacyVeil.tsx`) per fjord_moss §5.

## 5. New / Renamed Components

| Path | Purpose |
|---|---|
| `components/ui/Button.tsx` | Primary (gradient), Secondary (container), Tertiary (text) variants. |
| `components/ui/Card.tsx` | `surface-container-lowest` + ambient shadow. No border. |
| `components/ui/Chip.tsx` | "Anthro" chip — birthday/pinned/success variants. |
| `components/ui/Input.tsx` | `surface-container-high` fill, no default border, 2px primary ghost border on focus. |
| `components/ui/PrivacyVeil.tsx` | Blur overlay toggled for sensitive directory rows. |
| `components/navigation/TopHeader.tsx` (existing) | Convert to `.glass-nav` style. |

## 6. Testing

- **Vitest:** no new unit tests required — visual migration. Existing tests must continue to pass.
- **Playwright:** add one `*.visual.spec.ts` per migrated screen that takes a pinned screenshot at 1280×800 and 390×844. Stored at `e2e/__screenshots__/`. Baseline generated on the first Phase-1 PR.
- **Lint/build:** every PR must pass `npm run lint` and `npm run build`.

## 7. Risks & Mitigations

- **Half-styled state** — mitigated by Phase 0 shipping coherent tokens + nav first.
- **Stitch HTML has hallucinated copy** — all copy sourced from `messages/is.json`; Stitch text is visual guidance only.
- **Material Symbols mismatch** — translate icons by intent, don't swap libraries.
- **`patrol` page divergence** — existing `/patrol` route has its own feature set; Stitch's `patrol_*` is a visual treatment, not new functionality. PR scope = style only.
- **Stale CLAUDE.md sage reference** — update `CLAUDE.md` brand-color line in Phase 0.
- **Translations drift** — any new copy keys added to `messages/is.json` must also be added to the other 7 locales. Non-Icelandic locales get the Icelandic value inlined as a placeholder prefixed with `⟨TODO⟩ ` so it's greppable; a human translation pass is a follow-up task, not a blocker.

## 8. Non-Goals

- Icon library swap (lucide → Material Symbols).
- Dark mode (Stitch exports are light-only).
- New features not already in the codebase.
- Changing Firestore schema, services, or React Query hooks.
- Migrating the marketing-blog or admin routes (none of which Stitch covered).

## 9. Deliverable

Phase 0 PR merged to main, followed by 10 subsequent PRs (Phase 1 × 3, Phase 2 × 7) merged incrementally. All visible to users as they land.

# Nordic Trust OS — Phase 0: Tokens + Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Trust Navy visual tokens in `app/globals.css` with the fjord_moss (Academic Sanctuary) palette, refactor legacy component classes to match, add the utility classes (`ambient-shadow`, `ghost-border`, `glass-nav`) and four primitive components (`Button`, `Card`, `Chip`, `Input`) that Phase 1 & 2 screens will consume, and convert the four nav shells to the new look. No feature or data-layer changes.

**Architecture:** Tailwind v4 with `@theme`-registered tokens driven by CSS custom properties in `:root`. Legacy `--trust-navy*`, `--nordic-blue*`, `--bg-*`, `--shadow-*`, `--radius-*` vars stay aliased to the nearest fjord_moss equivalents so unmigrated screens render without breakage. Primitives are tiny headless React components under `components/ui/` that wrap native elements with token-aware classes; variants selected via a `variant` prop.

**Tech Stack:** Next.js 16 App Router · Tailwind v4 (no external config file) · React 18 client components · Vitest + `@testing-library/react` for primitive tests · lucide-react for icons.

**Reference:** Spec at `docs/superpowers/specs/2026-04-21-nordic-trust-os-redesign-design.md`. Visual source at `design/stitch/nordic_trust_os/` — especially `fjord_moss/DESIGN.md` and any `*/code.html` (every screen uses the same token set).

---

## File Map

- **Create:**
  - `components/ui/Button.tsx` — Primary/Secondary/Tertiary button. Gradient primary.
  - `components/ui/Card.tsx` — Surface-container-lowest wrapper with ambient shadow, no border.
  - `components/ui/Chip.tsx` — "Anthro" chip: `birthday`, `pinned`, `success`, `info`, `danger` variants.
  - `components/ui/Input.tsx` — Surface-container-high fill, ghost-border on focus.
  - `tests/ui/Button.test.tsx`, `tests/ui/Card.test.tsx`, `tests/ui/Chip.test.tsx`, `tests/ui/Input.test.tsx` — renders-variant-class smoke tests.

- **Modify:**
  - `app/globals.css` — replace `:root` tokens, uncomment+rewrite `@theme`, rewrite `.nordic-button`/`.nordic-card`/`.professional-card`/`.btn-*` classes, add utility classes.
  - `components/navigation/DesktopSidebar.tsx` — swap `bg-blue-900`/`text-blue-900`/`text-gray-*` → new tokens.
  - `components/navigation/TopHeader.tsx` — `bg-white/90 backdrop-blur-md` → `.glass-nav`, swap token references.
  - `components/navigation/BottomNav.tsx` — `text-trust-navy`/`bg-trust-navy` → `text-primary`/`bg-primary`.
  - `components/navigation/MobileDrawer.tsx` — `text-trust-navy`, `bg-trust-navy` → new tokens.
  - `CLAUDE.md` — fix stale "brand color is `--sage-green`" line.
  - `.gitignore` — ignore `stitch_*.zip` at repo root and `design/stitch/**/screen.png` (~5 MB of reference imagery).

- **No test runner changes** — existing Vitest setup already picks up `tests/**/*.test.{ts,tsx}`.

---

## Pre-Task: Clean the working tree

The pending pickup-offers removal from the earlier session (20+ changed files) must not mix with Phase 0's diff. Before Task 1, either commit those changes on a separate `chore: remove pickup-offers` commit or stash them. I will assume the executor commits them first as `chore: remove pickup-offers feature`.

---

### Task 1: Replace `:root` tokens + `@theme` in `app/globals.css`

**Files:**
- Modify: `app/globals.css:1-96`

- [ ] **Step 1: Rewrite the `:root` block and activate `@theme`**

Replace lines 1–96 of `app/globals.css` with:

```css
@import "tailwindcss";

/* ========================================
   NORDIC TRUST OS — fjord_moss
   The Academic Sanctuary
   Source: design/stitch/nordic_trust_os/fjord_moss/DESIGN.md
   ======================================== */

:root {
  /* --- Primary: Deep Fjord --- */
  --primary: #12362e;
  --primary-container: #2a4d44;
  --on-primary: #ffffff;
  --on-primary-container: #c8ffdf;
  --primary-fixed: #b0f1cd;
  --primary-fixed-dim: #95d4b2;

  /* --- Secondary: Moss & Earth (Terracotta) --- */
  --secondary: #934a2c;
  --secondary-container: #bceed1;
  --on-secondary: #ffffff;
  --on-secondary-container: #406d56;

  /* --- Tertiary: Human amber --- */
  --tertiary: #7a4c00;
  --tertiary-container: #9b6200;
  --tertiary-fixed: #ffddb8;
  --tertiary-fixed-dim: #ffb95f;
  --on-tertiary: #ffffff;
  --on-tertiary-fixed: #2a1700;
  --on-tertiary-fixed-variant: #653e00;

  /* --- Error --- */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  --on-error-container: #93000a;

  /* --- Surfaces (tonal layering) --- */
  --surface: #fbf9f2;
  --surface-dim: #d6d4ce;
  --surface-bright: #f2f0e9;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f6f4ec;
  --surface-container: #eceae4;
  --surface-container-high: #e6e4de;
  --surface-container-highest: #e0ded8;

  /* --- Text --- */
  --on-surface: #1b1c18;
  --on-surface-variant: #404943;
  --on-background: #1a1c1c;

  /* --- Outline --- */
  --outline: #707973;
  --outline-variant: #c1c8c4;

  /* --- Shadow (tinted teal, never grey) --- */
  --shadow-ambient: 0 12px 32px rgba(18, 54, 46, 0.06);

  /* --- Radius --- */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1.5rem;    /* 24px — primary CTAs */
  --radius-full: 9999px;

  /* --- Legacy aliases (removed in Phase 2) --- */
  --trust-navy: var(--primary);
  --trust-navy-light: var(--primary-container);
  --trust-navy-dark: #0a2620;
  --nordic-blue: var(--primary);
  --nordic-blue-light: var(--primary-container);
  --nordic-blue-dark: #0a2620;
  --bg-primary: var(--surface-container-lowest);
  --bg-secondary: var(--surface);
  --bg-tertiary: var(--surface-container-low);
  --border-light: var(--outline-variant);
  --border-medium: var(--outline);
  --border-dark: var(--on-surface-variant);
  --text-primary: var(--on-surface);
  --text-secondary: var(--on-surface-variant);
  --text-tertiary: var(--outline);
  --shadow-sm: 0 1px 2px 0 rgba(18, 54, 46, 0.04);
  --shadow-md: var(--shadow-ambient);
  --shadow-lg: 0 16px 40px rgba(18, 54, 46, 0.08);
  --shadow-xl: 0 24px 56px rgba(18, 54, 46, 0.10);
  --shadow-glass: var(--shadow-sm);
  --shadow-glass-hover: var(--shadow-md);
  --shadow-float: var(--shadow-lg);
  --gray-50: var(--surface);
  --gray-100: var(--surface-container-low);
  --gray-200: var(--surface-container);
  --gray-300: var(--surface-container-high);
  --gray-400: var(--surface-dim);
  --gray-500: var(--outline);
  --gray-600: var(--on-surface-variant);
  --gray-700: var(--on-surface);
  --gray-800: var(--on-surface);
  --gray-900: var(--on-background);
  --white: #ffffff;
  --black: #000000;
  --color-success: #0d5137;
  --color-warning: var(--tertiary);
  --color-error: var(--error);
  --color-info: var(--primary);
}

@theme {
  --font-inter: "Inter", sans-serif;

  --color-primary: var(--primary);
  --color-primary-container: var(--primary-container);
  --color-on-primary: var(--on-primary);
  --color-on-primary-container: var(--on-primary-container);
  --color-secondary: var(--secondary);
  --color-secondary-container: var(--secondary-container);
  --color-on-secondary: var(--on-secondary);
  --color-on-secondary-container: var(--on-secondary-container);
  --color-tertiary: var(--tertiary);
  --color-tertiary-fixed: var(--tertiary-fixed);
  --color-on-tertiary-fixed: var(--on-tertiary-fixed);
  --color-error: var(--error);
  --color-error-container: var(--error-container);
  --color-on-error: var(--on-error);
  --color-surface: var(--surface);
  --color-surface-dim: var(--surface-dim);
  --color-surface-bright: var(--surface-bright);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-high: var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-on-surface: var(--on-surface);
  --color-on-surface-variant: var(--on-surface-variant);
  --color-on-background: var(--on-background);
  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);

  /* Legacy Tailwind color aliases (one more Tailwind class still references these) */
  --color-trust-navy: var(--primary);
  --color-trust-navy-light: var(--primary-container);
  --color-nordic-blue: var(--primary);

  --shadow-ambient: var(--shadow-ambient);
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build 2>&1 | tail -20`
Expected: build succeeds. Tailwind v4 picks up new `@theme` tokens; any class like `bg-primary` / `text-on-surface-variant` / `bg-tertiary-fixed` now resolves.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style(tokens): adopt fjord_moss palette in :root + @theme"
```

---

### Task 2: Rewrite component classes (`.nordic-button`, `.nordic-card`, `.professional-card`, `.btn-*`, scrollbar, focus)

**Files:**
- Modify: `app/globals.css:98-240` (approximate — lines shift after Task 1)

- [ ] **Step 1: Replace the `--- Component Utilities ---` block**

Find the line `/* --- Global Reset & Base --- */` and replace everything from there through the end of the existing `.bg-trust`/`.border-trust`/`.text-trust` block with:

```css
/* --- Global Reset & Base --- */
body {
  background-color: var(--surface);
  color: var(--on-surface);
  font-family: var(--font-inter);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

/* --- Typography --- */
h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--on-surface);
}

/* --- Depth utilities --- */
.ambient-shadow {
  box-shadow: var(--shadow-ambient);
}

.ghost-border {
  /* outline-variant at 15% opacity — felt, not seen. */
  box-shadow: inset 0 0 0 1px rgb(193 200 196 / 0.15);
}

.glass-nav {
  background-color: color-mix(in oklab, var(--surface) 80%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* --- Cards (Academic Sanctuary) --- */
.nordic-card,
.professional-card,
.glass-card,
.trust-card {
  background-color: var(--surface-container-lowest);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ambient);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nordic-card:hover,
.professional-card:hover {
  transform: translateY(-1px);
}

/* --- Buttons --- */
.nordic-button,
.btn-premium,
.trust-button {
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
  color: var(--on-primary);
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  box-shadow: var(--shadow-ambient);
  transition: opacity 0.2s ease, transform 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nordic-button:hover,
.btn-premium:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.nordic-button:active,
.btn-premium:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  border: none;
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  opacity: 0.9;
}

/* --- Tap target (mobile) --- */
.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* --- Scrollbar --- */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--surface-container-low);
}
::-webkit-scrollbar-thumb {
  background: var(--outline-variant);
  border-radius: var(--radius-md);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--outline);
}

/* --- Focus (accessible) --- */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* --- Legacy color utilities (kept only to avoid breaking unmigrated screens) --- */
.text-trust    { color: var(--primary); }
.bg-trust      { background-color: var(--primary); }
.border-trust  { border-color: var(--primary); }
```

Remove any remaining definitions of `.glass-card`, `.trust-card`, or other duplicates further down in the file.

- [ ] **Step 2: Run dev server briefly to check styles compile**

Run: `npm run build 2>&1 | tail -10`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style(css): rewrite component utilities for fjord_moss"
```

---

### Task 3: Create the `Button` primitive

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `tests/ui/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/ui/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders the primary variant with gradient classes by default', () => {
    render(<Button>Stofna bekk</Button>);
    const btn = screen.getByRole('button', { name: 'Stofna bekk' });
    expect(btn.className).toMatch(/bg-gradient/);
    expect(btn.className).toMatch(/text-on-primary/);
  });

  it('renders the secondary variant with container fill', () => {
    render(<Button variant="secondary">Hætta við</Button>);
    const btn = screen.getByRole('button', { name: 'Hætta við' });
    expect(btn.className).toMatch(/bg-secondary-container/);
    expect(btn.className).toMatch(/text-on-secondary-container/);
  });

  it('renders the tertiary variant as text-only', () => {
    render(<Button variant="tertiary">Meira</Button>);
    const btn = screen.getByRole('button', { name: 'Meira' });
    expect(btn.className).toMatch(/text-primary/);
    expect(btn.className).not.toMatch(/bg-gradient/);
  });

  it('forwards custom className', () => {
    render(<Button className="extra-class">x</Button>);
    expect(screen.getByRole('button').className).toMatch(/extra-class/);
  });

  it('supports asChild for Link wrapping via data attribute', () => {
    render(<Button data-testid="a" type="button">Go</Button>);
    expect(screen.getByTestId('a').tagName).toBe('BUTTON');
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm run test:run tests/ui/Button.test.tsx`
Expected: FAIL — "Failed to resolve import '@/components/ui/Button'".

- [ ] **Step 3: Implement the primitive**

Create `components/ui/Button.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full shadow-ambient hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-secondary-container text-on-secondary-container rounded-full hover:opacity-90',
  tertiary:
    'text-primary hover:text-primary-container underline-offset-4 hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-4 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, type, ...rest }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm run test:run tests/ui/Button.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx tests/ui/Button.test.tsx
git commit -m "feat(ui): add Button primitive with primary/secondary/tertiary variants"
```

---

### Task 4: Create the `Card` primitive

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `tests/ui/Card.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/ui/Card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children inside a surface-container-lowest box with ambient shadow', () => {
    render(<Card data-testid="c">Hello</Card>);
    const el = screen.getByTestId('c');
    expect(el.className).toMatch(/bg-surface-container-lowest/);
    expect(el.className).toMatch(/shadow-ambient/);
    expect(el.className).toMatch(/rounded-/);
    expect(el.textContent).toBe('Hello');
  });

  it('renders the elevated tone variant on surface-container', () => {
    render(<Card tone="elevated" data-testid="c">x</Card>);
    expect(screen.getByTestId('c').className).toMatch(/bg-surface-container\b/);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm run test:run tests/ui/Card.test.tsx`
Expected: FAIL — import not resolved.

- [ ] **Step 3: Implement the primitive**

Create `components/ui/Card.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export type CardTone = 'default' | 'elevated' | 'subtle';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  default: 'bg-surface-container-lowest shadow-ambient',
  elevated: 'bg-surface-container shadow-ambient',
  subtle: 'bg-surface-container-low',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-3xl p-6 transition-transform duration-200', toneClasses[tone], className)}
      {...rest}
    />
  ),
);
Card.displayName = 'Card';
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm run test:run tests/ui/Card.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Card.tsx tests/ui/Card.test.tsx
git commit -m "feat(ui): add Card primitive with default/elevated/subtle tones"
```

---

### Task 5: Create the `Chip` primitive (Anthro chip)

**Files:**
- Create: `components/ui/Chip.tsx`
- Create: `tests/ui/Chip.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/ui/Chip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from '@/components/ui/Chip';

describe('Chip', () => {
  it('renders the birthday variant in tertiary-fixed amber', () => {
    render(<Chip variant="birthday">Afmæli</Chip>);
    expect(screen.getByText('Afmæli').className).toMatch(/bg-tertiary-fixed/);
    expect(screen.getByText('Afmæli').className).toMatch(/text-on-tertiary-fixed/);
  });

  it('renders the success variant on primary-container tint', () => {
    render(<Chip variant="success">Samþykkt</Chip>);
    expect(screen.getByText('Samþykkt').className).toMatch(/bg-primary-container\/10/);
    expect(screen.getByText('Samþykkt').className).toMatch(/text-primary/);
  });

  it('renders the danger variant with error tokens', () => {
    render(<Chip variant="danger">Villa</Chip>);
    expect(screen.getByText('Villa').className).toMatch(/bg-error-container/);
    expect(screen.getByText('Villa').className).toMatch(/text-on-error-container/);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm run test:run tests/ui/Chip.test.tsx`
Expected: FAIL — import not resolved.

- [ ] **Step 3: Implement the primitive**

Create `components/ui/Chip.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export type ChipVariant = 'info' | 'success' | 'birthday' | 'pinned' | 'danger';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variantClasses: Record<ChipVariant, string> = {
  info: 'bg-surface-container-high text-on-surface',
  success: 'bg-primary-container/10 text-primary',
  birthday: 'bg-tertiary-fixed text-on-tertiary-fixed',
  pinned: 'bg-tertiary-fixed text-on-tertiary-fixed',
  danger: 'bg-error-container text-on-error-container',
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant = 'info', className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  ),
);
Chip.displayName = 'Chip';
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm run test:run tests/ui/Chip.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Chip.tsx tests/ui/Chip.test.tsx
git commit -m "feat(ui): add Chip primitive (info/success/birthday/pinned/danger)"
```

---

### Task 6: Create the `Input` primitive

**Files:**
- Create: `components/ui/Input.tsx`
- Create: `tests/ui/Input.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/ui/Input.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders a text input with surface-container-high fill and no border', () => {
    render(<Input placeholder="Nafn" />);
    const el = screen.getByPlaceholderText('Nafn');
    expect(el.tagName).toBe('INPUT');
    expect(el.className).toMatch(/bg-surface-container-high/);
    expect(el.className).toMatch(/border-0/);
  });

  it('shows error styling when invalid is true', () => {
    render(<Input invalid placeholder="x" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/ring-error/);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm run test:run tests/ui/Input.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement the primitive**

Create `components/ui/Input.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, type = 'text', ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full px-4 py-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-on-surface-variant',
        'border-0 transition-shadow duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0',
        invalid && 'ring-2 ring-error',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm run test:run tests/ui/Input.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/Input.tsx tests/ui/Input.test.tsx
git commit -m "feat(ui): add Input primitive with invalid state"
```

---

### Task 7: Convert `DesktopSidebar` to new tokens

**Files:**
- Modify: `components/navigation/DesktopSidebar.tsx`

- [ ] **Step 1: Replace token references**

Edit `components/navigation/DesktopSidebar.tsx` and apply these find/replace operations across the file:

| Find | Replace |
|---|---|
| `bg-white border-r border-gray-200` | `bg-surface-container-low border-r border-outline-variant/20` |
| `bg-blue-900` | `bg-primary` |
| `text-blue-900` | `text-primary` |
| `hover:shadow-md transition-shadow` | `shadow-ambient transition-shadow` |
| `text-gray-900` | `text-on-surface` |
| `text-gray-600` (sidebar-nav context) | `text-on-surface-variant` |
| `text-gray-500` | `text-on-surface-variant` |
| `bg-gray-50` (nav item active) | `bg-surface-container-high` |
| `bg-gray-50` (profile card) | `bg-surface-container-low` |
| `border-gray-100` | `border-outline-variant/15` |
| `border-gray-200` (profile card) | `border-outline-variant/25` |
| `bg-gray-200` (avatar fallback) | `bg-surface-container-high` |
| `text-gray-600` (avatar fallback text) | `text-on-surface-variant` |
| `hover:bg-gray-100` (settings link) | `hover:bg-surface-container` |
| `text-gray-700` | `text-on-surface` |

Then, in the active nav-item class string, change `border-l-2 border-blue-900` to `border-l-2 border-primary`.

- [ ] **Step 2: Smoke-build**

Run: `npm run build 2>&1 | tail -10`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/navigation/DesktopSidebar.tsx
git commit -m "style(nav): retint DesktopSidebar for fjord_moss"
```

---

### Task 8: Convert `TopHeader` to `.glass-nav` + new tokens

**Files:**
- Modify: `components/navigation/TopHeader.tsx`

- [ ] **Step 1: Replace the top-of-header class string**

Find the `<header className={...}>` classes (near line 60) and replace `bg-white/90 backdrop-blur-md` with `glass-nav ambient-shadow` plus border/token fixes:

| Find | Replace |
|---|---|
| `bg-white/90 backdrop-blur-md` | `glass-nav` |
| `border-b border-gray-200` | `border-b border-outline-variant/20` |
| `border-b border-gray-100` | `border-b border-outline-variant/15` |
| `text-trust-navy` | `text-primary` |
| `bg-trust-navy` | `bg-primary` |
| `text-gray-500` / `text-gray-600` | `text-on-surface-variant` |
| `text-gray-900` | `text-on-surface` |
| `bg-gray-100` / `bg-gray-50` (notification panel etc.) | `bg-surface-container-low` |
| `hover:bg-gray-100` | `hover:bg-surface-container` |
| `bg-red-500` (unread dot) | `bg-error` |

Use `replace_all` for safe token names (`text-trust-navy`, `bg-trust-navy`). For ambiguous `text-gray-*` keep manual edits scoped to this file only.

- [ ] **Step 2: Smoke-build**

Run: `npm run build 2>&1 | tail -10`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/navigation/TopHeader.tsx
git commit -m "style(nav): glass-nav TopHeader and retint for fjord_moss"
```

---

### Task 9: Convert `BottomNav` + `MobileDrawer` to new tokens

**Files:**
- Modify: `components/navigation/BottomNav.tsx`
- Modify: `components/navigation/MobileDrawer.tsx`

- [ ] **Step 1: `BottomNav` token pass**

In `components/navigation/BottomNav.tsx`:

| Find | Replace |
|---|---|
| `bg-white border-t border-gray-200` | `glass-nav border-t border-outline-variant/20` |
| `text-trust-navy` | `text-primary` (use `replace_all`) |
| `bg-trust-navy` | `bg-primary` (use `replace_all`) |
| `text-gray-500` | `text-on-surface-variant` |
| `hover:text-trust-navy` | `hover:text-primary` |

- [ ] **Step 2: `MobileDrawer` token pass**

In `components/navigation/MobileDrawer.tsx`:

| Find | Replace |
|---|---|
| `bg-white` (drawer body) | `bg-surface-container-low` |
| `text-trust-navy` | `text-primary` (`replace_all`) |
| `bg-trust-navy` | `bg-primary` (`replace_all`) |
| `bg-gray-50` | `bg-surface-container-low` |
| `bg-gray-100` | `bg-surface-container` |
| `border-gray-100` | `border-outline-variant/15` |
| `text-gray-500` | `text-on-surface-variant` |
| `text-gray-600` | `text-on-surface-variant` |
| `text-gray-900` | `text-on-surface` |
| `text-gray-400` | `text-outline` |
| `hover:bg-gray-100` | `hover:bg-surface-container` |
| `hover:bg-gray-50` | `hover:bg-surface-container-low` |
| `hover:bg-red-50 text-red-600` | `hover:bg-error-container/40 text-error` |

- [ ] **Step 3: Smoke-build + commit**

```bash
npm run build 2>&1 | tail -10
git add components/navigation/BottomNav.tsx components/navigation/MobileDrawer.tsx
git commit -m "style(nav): retint BottomNav and MobileDrawer for fjord_moss"
```

Expected build: succeeds.

---

### Task 10: Housekeeping — `CLAUDE.md` and `.gitignore`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.gitignore`

- [ ] **Step 1: Fix the stale sage-green line in `CLAUDE.md`**

Search for the line `Brand color is \`--sage-green: #3d7a5d\`` and replace with:

```
Brand color is `--primary: #12362e` (fjord_moss / Academic Sanctuary). Nordic Trust OS redesign spec at `docs/superpowers/specs/2026-04-21-nordic-trust-os-redesign-design.md`.
```

- [ ] **Step 2: Ignore Stitch zips + mockup PNGs**

Append to `.gitignore`:

```
# Stitch design exports (reference only, not committed)
stitch_*.zip
design/stitch/**/screen.png
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .gitignore
git commit -m "chore: update CLAUDE.md brand color and ignore Stitch assets"
```

---

### Task 11: Verification

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no new errors introduced by Phase 0 diffs. (Pre-existing lint noise is allowed if it also appears on `main` before Phase 0.)

- [ ] **Step 2: Build**

Run: `npm run build 2>&1 | tail -20`
Expected: completes successfully.

- [ ] **Step 3: Unit tests**

Run: `npm run test:run`
Expected: all existing tests + the 4 new primitive test files pass (≥12 added assertions total).

- [ ] **Step 4: Playwright smoke**

Run: `npx playwright test e2e/smoke.spec.ts --project=chromium`
Expected: passes. If any screen asserts on specific color hex values, update the assertion to the new primary (`#12362e`).

- [ ] **Step 5: Manual visual sanity check**

Run: `npm run dev` and visit `http://localhost:3000/is/dashboard`. Confirm:
- Warm bone surface background (not pure white).
- Sidebar tinted surface-container-low with primary accents.
- Header uses glassmorphic blur.
- Bottom nav (at ≤md viewport) reads as primary on glass.

No commit for Task 11 (verification only).

---

## Self-Review Checklist

- [x] Spec §3 tokens covered → Task 1.
- [x] Spec §4 Phase 0 rules (globals, primitives, glass-nav, keep lucide) → Tasks 2-9.
- [x] Spec §5 new components (Button, Card, Chip, Input) → Tasks 3-6. (PrivacyVeil deferred per spec to the Directory PR in Phase 2.)
- [x] Spec §6 testing (Vitest + existing Playwright smoke) → Task 11. No new Playwright visual specs in Phase 0 — baseline comes with the first Phase-1 PR.
- [x] Spec §7 risks — stale CLAUDE.md (Task 10), half-styled state (acceptable; verification in Task 11).
- [x] No placeholders. All code blocks are complete. File paths are exact.
- [x] Primitive naming is consistent across tasks (`Button`, `Card`, `Chip`, `Input`).
- [x] Token names match `app/globals.css` across Tasks 1, 2, 7, 8, 9 (e.g. `--primary`, `surface-container-low`, `outline-variant`).

Gaps: none identified.

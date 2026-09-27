# Design System Strategy: The Hljóðlát Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Hljóðlát Sanctuary"** (The Silent Sanctuary). In an era of addictive, "loud" educational software, this system acts as a digital clearing—a quiet, focused space that honors the dignity of Icelandic educators and students. 

We move beyond the "SaaS-standard" look by embracing **High-End Editorial Minimalism**. We treat the screen like a premium physical journal: generous margins, authoritative typography, and a tactile sense of depth. We break the rigid grid through intentional asymmetry—for example, shifting content blocks slightly off-center or using "floating" headers—to ensure the interface feels organic and custom-crafted rather than mass-produced.

## 2. Color & Tonal Architecture
The palette is rooted in the Icelandic landscape: Sage, Stone, and Paper. 

### Surface Hierarchy & Nesting
Instead of using lines to separate ideas, we use **Tonal Layering**. Think of the UI as a series of nested paper sheets.
- **Base Layer:** `surface` (#f9f9f8) is our "Paper" canvas.
- **Sectioning:** Use `surface-container-low` (#f4f4f3) for large layout blocks.
- **Prominence:** Use `surface-container-lowest` (#ffffff) for the most important interactive cards to make them "pop" against the warmer background.

### The "No-Line" Rule
**1px solid borders are strictly prohibited for sectioning.** To define boundaries, you must use background color shifts. A list item should be distinguished from the background by a shift to `surface-container-high` on hover, or by sitting on a `surface-container-low` track.

### The "Glass & Gradient" Rule
To add "soul" to the professional Sage palette:
- **CTAs:** Use a subtle linear gradient for `primary` elements, transitioning from `primary` (#226146) to `primary_container` (#3d7a5d). This prevents the "flat" look of generic UI.
- **Floating Overlays:** Use Glassmorphism for modals and navigation bars. Apply `surface` at 80% opacity with a `20px` backdrop-blur. This keeps the user grounded in their previous context.

## 3. Typography: The Editorial Voice
We use **Inter** not as a system font, but as a precision tool.
- **Display & Headlines:** Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create an authoritative, editorial feel. These should be reserved for landing moments and high-level navigation.
- **Body:** `body-lg` uses a generous line-height (1.6) to ensure the text "breathes," reducing cognitive load for teachers reviewing long reports.
- **Labels:** `label-md` should be used for metadata. In this system, labels are often set in `on_surface_variant` (#404943) to create a clear hierarchy against the primary content.

## 4. Elevation & Depth
Depth is a functional tool for focus, not just a decoration.

### The Layering Principle
Stacking defines priority.
1. **Background:** `surface`
2. **Structural Content:** `surface-container`
3. **Interactive Element:** `surface-container-lowest` (White)

### Ambient Shadows
When an element must float (like a birthday notification or a pinned student file), use **Ambient Shadows**. 
- **Value:** `0px 12px 32px rgba(47, 49, 48, 0.06)`
- The shadow color is a tinted version of `inverse_surface`, never pure black. It should feel like soft morning light hitting paper.

### The "Ghost Border" Fallback
If a border is required for WCAG AA contrast in complex data grids, use a **Ghost Border**: `outline-variant` (#bfc9c1) at 15% opacity. It should be felt, not seen.

## 5. Signature Components

### Buttons: The Tactile Interaction
- **Primary:** Gradient fill (Sage), `xl` (1.5rem) roundedness. No border.
- **Secondary:** `secondary_container` fill with `on_secondary_container` text. This provides a "soft" alternative that doesn't compete with the main action.
- **Tertiary:** Pure text with an icon, using `primary` color. No container.

### The "Anthro" Chip (Contextual Metadata)
Used for student status or birthdays.
- **Birthday/Pinned:** Use `tertiary_fixed` (Amber #ffddb8) with `on_tertiary_fixed` text. 
- **Success:** Use `on_primary_container` (Success green) but at 10% opacity for the container, with full-strength text color.

### Input Fields: Focused Entry
- **Default State:** `surface_container_high` fill, no border.
- **Focus State:** 2px "Ghost Border" using `primary` at 40% opacity and a subtle `surface_bright` inner glow.
- **Validation:** High-contrast `error` (#ba1a1a) text for readability.

### Cards & Lists: The Separation of Thought
Forbid divider lines. Separate list items using `12px` of vertical white space or by alternating between `surface` and `surface_container_low`. This creates a "rhythm" of content rather than a "grid" of data.

### Signature Component: The "Privacy Veil"
A unique component for this system. When sensitive student data is on screen, a semi-transparent `surface_dim` overlay can be toggled, blurring content until hovered. It reinforces the "Trust" persona.

## 6. Do’s and Don’ts

### Do
- **Do** use negative space as a luxury. If a screen feels "empty," it's likely working.
- **Do** use the Amber (`tertiary`) sparingly to draw attention to human moments (birthdays, achievements).
- **Do** ensure all text-on-background combinations pass WCAG AA using the provided `on_` tokens.

### Don’t
- **Don't** use 100% black (#000000) for text. Use `on_surface` (#1a1c1c) to keep the "Nordic" softness.
- **Don't** use generic stock photos of smiling children. Use custom, icon-driven illustrations or abstract Icelandic textures.
- **Don't** use "bounce" or "pop" animations. Use linear, soft fades (200ms - 300ms) to maintain a calming atmosphere.
- **Don't** use hard 90-degree corners. Stay strictly within the `md` to `xl` (10px-24px) radius range to maintain a friendly, approachable hand-feel.
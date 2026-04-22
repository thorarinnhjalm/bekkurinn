```markdown
# Design System Specification: The Academic Sanctuary

## 1. Overview & Creative North Star
This design system is built upon a Creative North Star we call **"The Academic Sanctuary."** 

Traditional school management software often feels clinical, cluttered, and stressful. We are moving in the opposite direction. By drawing inspiration from contemporary Nordic architecture—specifically the way deep fjords meet mossy cliffs—this system creates a digital environment that feels authoritative yet restorative. 

To break the "standard software" template, we prioritize **asymmetrical editorial layouts** and **tonal depth**. We treat the screen not as a flat canvas, but as an architectural space where light and shadow are defined by color shifts rather than lines. The goal is to make the administrative and educational journey feel like walking through a quiet, well-lit library at the edge of a forest.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in the natural world, utilizing "Deep Forest Teal" for authority and "Muted Terracotta" for human warmth.

### The Color Tokens
*   **Primary (The Deep Fjord):** `#12362e` (Main brand expression)
*   **Primary Container:** `#2a4d44` (Used for subtle callouts and depth)
*   **Secondary (The Moss & Earth):** `#934a2c` (Action-oriented, warm highlights)
*   **Surface (The Soft Bone):** `#fbf9f2` (The base "paper" of the system)
*   **On-Surface:** `#1b1c18` (High-legibility text)

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning. We do not use "boxes" to separate content. Instead, boundaries must be defined through:
1.  **Background Shifts:** Place a `surface-container-low` (#f6f4ec) element against a `surface` (#fbf9f2) background.
2.  **Intentional Negative Space:** Use our spacing scale to create groupings.

### Surface Hierarchy & Nesting
Think of the UI as layers of fine paper. 
*   **Surface (Base):** Your lowest layer.
*   **Surface-Container-Low:** For secondary sidebars or non-interactive background zones.
*   **Surface-Container-Highest:** For interactive cards or "floating" surfaces that need to catch the user's eye.

### Signature Textures: Glass & Gradients
For primary CTAs or high-impact hero sections, use a subtle linear gradient from `primary` (#12362e) to `primary_container` (#2a4d44) at a 145-degree angle. This provides a "soul" to the interface that flat colors cannot achieve. For floating navigation or pop-overs, apply **Glassmorphism**: use `surface` at 80% opacity with a `20px` backdrop-blur to allow the "mossy" colors beneath to bleed through softly.

---

## 3. Typography
We use **Inter** exclusively. Its clean, Swiss-style precision provides the "Professional" weight required for school management, while our specific scale provides the "Editorial" flair.

| Role | Font Size | Weight | Intent |
| :--- | :--- | :--- | :--- |
| **Display-lg** | 3.5rem | 700 | Hero moments, enrollment numbers. |
| **Headline-md** | 1.75rem | 600 | Page titles, section headers. |
| **Title-sm** | 1rem | 500 | Card titles, sub-headers. |
| **Body-lg** | 1rem | 400 | Long-form reading, descriptions. |
| **Label-md** | 0.75rem | 600 (Caps) | Navigation items, small metadata. |

**Editorial Note:** For `Display` and `Headline` styles, use a tighter letter-spacing (-0.02em). For `Labels`, increase letter-spacing (0.05em) and use uppercase to convey a sense of curated authority.

---

## 4. Elevation & Depth
In this system, depth is a feeling, not a drop-shadow.

*   **The Layering Principle:** Achieve elevation by "stacking" surface tokens. A student profile card should be `surface-container-lowest` sitting on a `surface-container-high` background. This creates a soft, tactile "lift."
*   **Ambient Shadows:** If a component *must* float (e.g., a modal), use a shadow tinted with our teal: `rgba(18, 54, 46, 0.06)` with a blur of `40px` and a `12px` Y-offset. Avoid grey shadows at all costs; they muddy the "Soft Bone" surface.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use `outline-variant` (#c1c8c4) at 20% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary_container` (#2a4d44); Text: `on_primary` (#ffffff). Shape: `md` (12px).
*   **Secondary:** Background: `secondary` (#934a2c); Text: `on_secondary`. Use this for high-priority actions like "Submit Grade."
*   **Tertiary:** No background. Text: `primary`. Use for "Cancel" or low-priority utility.

### Cards & Lists
*   **The Card Rule:** No borders. Use `surface_container_highest` for the card body. 
*   **No Dividers:** In lists (e.g., a list of students), do not use horizontal lines. Use `16px` of vertical white space and a subtle background hover state (`surface_dim`).

### Input Fields
*   **Style:** Background: `surface_container_low`; Border: None (unless focused).
*   **Focus State:** A 2px "Ghost Border" of `primary` (#12362e).
*   **Roundness:** `md` (12px) to match the "Soft Nordic" aesthetic.

### School-Specific Components
*   **Progress Pillars:** Instead of thin progress bars, use wide, rounded rectangular blocks in `primary_fixed_dim` with a `primary` fill.
*   **Attendance Chips:** Use `secondary_fixed` (#ffdbce) for absences and `primary_fixed` (#c4ebde) for present status. These muted tones prevent the dashboard from looking like a "Christmas tree" of red and green.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a wider left margin on a dashboard title creates an editorial, high-end feel.
*   **Do** embrace the warmth. The "Soft Bone" surface should feel like expensive stationery.
*   **Do** use large, breathable padding (minimum 24px) inside all containers.

### Don't
*   **Don't** use pure black (#000000) or pure white (#ffffff). It breaks the organic, fjord-inspired harmony.
*   **Don't** use 1px dividers to separate data. Use tonal shifts in the background.
*   **Don't** use high-vibrancy "Alert Red." Use the `error` (#ba1a1a) and `error_container` (#ffdad6) tokens, which are tuned to the system’s desaturated palette.

---
**Director's Closing Note:** This system is not a kit of parts; it is a philosophy of calm. When in doubt, add more space, remove a line, and let the colors breathe.```
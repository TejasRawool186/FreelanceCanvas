# FREELANCECANVAS DESIGN SYSTEM SPECIFICATION
> Extracted from Reference: https://visual-collaborat.aura.build/
> Aesthetic: Playful Neo-Brutalist Hand-Drawn Whiteboard SaaS

---

## 1. Visual Identity & Design Philosophy
The reference website combines **playful neo-brutalism** with **hand-drawn whiteboard collaboration aesthetics**. 
Key characteristics:
- High contrast, crisp 1.5px to 2px solid black (`#000000`) or charcoal (`#0F172A`) borders.
- Solid offset neo-brutalist drop shadows (`2px 2px 0px #000`, `3px 3px 0px #000`, `4px 4px 0px #000`).
- Two alternating surface themes:
  - **Light Canvas Surface**: Off-white / cream background (`#F8F9FA` or `#FFFFFF`) with subtle dot-matrix canvas grids (`radial-gradient(rgba(0,0,0,0.08) 1.5px, transparent 1.5px)`).
  - **Dark Blueprint Surface**: Deep navy / midnight blueprint background (`#070D1E` or `#061224`) with glowing cyan/electric blue technical blueprint grid lines (`linear-gradient(rgba(0, 153, 255, 0.08) 1px, transparent 1px)`).
- **Hand-drawn accents**: Curved connector arrows, sketchy underlines under key verbs/phrases, scotch masking tape strips on sticky notes, hand-drawn circle highlights, and sparkles.
- **Vibrant Electric Blue Accent** (`#0099FF` / `#00A3FF`) used for active tabs, primary CTAs, underlines, and selection bounding boxes.
- **Collaborative Multi-Cursor Presence**: Wandering live cursor pointers with pastel name tags (e.g. Alex, Sam, Taylor) indicating real-time teamwork.

---

## 2. Color System

### 2.1 Core Brand Colors
| Token | Hex Value | Role |
|-------|-----------|------|
| `--color-primary-blue` | `#0099FF` / `#00A3FF` | Primary button fill, active tab highlight, sketch underlines |
| `--color-primary-hover` | `#0084DE` | Hover state for primary buttons and links |
| `--color-ink-black` | `#000000` | Borders, outlines, offset drop shadows, display headings |
| `--color-charcoal-dark` | `#0F172A` | Primary text, dark accents, badge backgrounds |
| `--color-text-muted` | `#64748B` | Secondary body text, subheadings, labels |
| `--color-text-dim` | `#94A3B8` | Captions, subtle metadata, inactive icons |

### 2.2 Backgrounds & Surfaces
| Token | Hex Value | Role |
|-------|-----------|------|
| `--bg-canvas-light` | `#F8F9FA` / `#FFFFFF` | Light hero, canvas, forms, cards |
| `--bg-blueprint-dark` | `#070D1E` / `#061224` | Blueprint feature sections, how-it-works, testimonials |
| `--bg-blueprint-card` | `#0B162C` | Secondary dark card panels |
| `--border-blueprint` | `rgba(0, 153, 255, 0.12)` | Dark blueprint section grid lines and separators |
| `--border-dark-solid` | `#000000` / `#0F172A` | Crisp solid borders on cards and buttons |
| `--border-light-subtle` | `#E2E8F0` / `#E5E7EB` | Dividers, subtle borders, input outlines |

### 2.3 Collaboration Sticky Note Palette
| Note Type | Background | Border / Accent | Text Dark | Tape Style |
|-----------|------------|-----------------|-----------|------------|
| **Mint Green** | `#BBF7D0` / `#A7F3D0` | `#86EFAC` | `#166534` | Semi-transparent white scotch tape with dashed edges |
| **Pastel Yellow** | `#FEF08A` | `#FDE047` | `#854D0E` | Semi-transparent white scotch tape with dashed edges |
| **Soft Peach / Orange** | `#FED7AA` / `#FDBA74` | `#FDBA74` | `#9A3412` | Semi-transparent white scotch tape with dashed edges |
| **Sky Blue** | `#BAE6FD` / `#E0F2FE` | `#7DD3FC` | `#0369A1` | Semi-transparent white scotch tape with dashed edges |
| **Pastel Pink** | `#FBCFE8` / `#FCE7F3` | `#F472B6` | `#9D174D` | Semi-transparent white scotch tape with dashed edges |
| **Soft Lavender** | `#DDD6FE` / `#EDE9FE` | `#C4B5FD` | `#5B21B6` | Semi-transparent white scotch tape with dashed edges |

### 2.4 Status & Feedback Colors
- **Success**: `#10B981` (Emerald), background `#ECFDF5`, text `#065F46`
- **Warning**: `#F59E0B` (Amber), background `#FFFBEB`, text `#92400E`
- **Error**: `#EF4444` (Crimson), background `#FEF2F2`, text `#991B1B`
- **Info**: `#0099FF` (Electric Blue), background `#E0F2FE`, text `#0369A1`

---

## 3. Typography System

### 3.1 Font Families
1. **Display & Hero Titles**: `'Chewy', cursive, sans-serif`
   - Bubbly, friendly, hand-drawn marker feel.
   - Letter-spacing: `0.02em` to `0.04em`.
   - Used for: Brand logo text, H1 hero ("CANVAS"), section titles ("Everything you need..."), big numbers ("01", "02").
2. **Body & UI Controls**: `'Fredoka', sans-serif`
   - Geometric rounded sans-serif. Highly legible at small sizes while preserving the friendly, approachable brand identity.
   - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).
   - Used for: Navigation links, buttons, body copy, form inputs, tooltips, tabs.
3. **Hand-drawn Sticky Notes & Doodles**: `'Patrick Hand', cursive, sans-serif`
   - Natural handwriting / Sharpie pen marker feel.
   - Used for: Sticky note text, annotated callouts, sketch arrows, hand-drawn tags.
4. **Technical & Code Text**: `'JetBrains Mono', monospace`
   - Monospace typewriter feel.
   - Used for: Footer descriptions, API tokens, terminal logs, pricing metadata.

### 3.2 Scale & Hierarchy
| Level | Font Family | Size | Weight | Line Height | Tracking |
|-------|-------------|------|--------|-------------|----------|
| **Display XXL** | Chewy | 64px–88px | 400 | 1.05 | 0.03em |
| **Display XL** | Chewy | 44px–56px | 400 | 1.15 | 0.02em |
| **H2 Section Title** | Chewy | 32px–40px | 400 | 1.2 | 0.02em |
| **H3 Card Title** | Fredoka | 20px–24px | 700 | 1.3 | -0.01em |
| **H4 Subtitle** | Fredoka | 16px–18px | 600 | 1.4 | 0em |
| **Body Large** | Fredoka | 16px–18px | 400/500 | 1.6 | 0em |
| **Body Regular** | Fredoka | 14px–15px | 400/500 | 1.5 | 0em |
| **Caption / Badge** | Fredoka | 11px–12px | 700 | 1.3 | 0.05em uppercase |
| **Mono Code / Foot**| JetBrains Mono | 12px–13px | 500 | 1.6 | 0em |

---

## 4. Component System

### 4.1 Buttons
- **Primary CTA Button**:
  - Background: `#0099FF`
  - Color: `#000000` or `#FFFFFF` (heavy font weight 800)
  - Border: `2px solid #000000`
  - Shadow: `3px 3px 0px #000000`
  - Border radius: `8px` or `10px`
  - Hover: `transform: translate(-1px, -1px); box-shadow: 4px 4px 0px #000000;`
  - Active: `transform: translate(2px, 2px); box-shadow: 1px 1px 0px #000000;`
- **Secondary White Button**:
  - Background: `#FFFFFF`
  - Color: `#000000`
  - Border: `2px solid #000000`
  - Shadow: `2px 2px 0px #000000`
  - Border radius: `8px`
- **Ghost / Nav Link Button**:
  - Background: Transparent
  - Hover: `rgba(0, 0, 0, 0.05)` or soft blue tint
  - Color: `#0F172A`

### 4.2 Form Inputs & Controls
- **Input Fields**:
  - Background: `#FFFFFF`
  - Border: `2px solid #E2E8F0`
  - Border Radius: `10px`
  - Padding: `12px 16px`
  - Focus State: `border-color: #0099FF; box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.2); outline: none;`
- **Floating Toolbar**:
  - Background: `#FFFFFF`
  - Border: `1.5px solid #E2E8F0`
  - Box Shadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`
  - Border Radius: `14px`
  - Active item: `#0099FF` background with white icon.

### 4.3 Cards & Panels
- **White Feature Card**:
  - Background: `#FFFFFF`
  - Border Radius: `20px`
  - Border: `1px solid rgba(0, 0, 0, 0.06)` or `2px solid #000`
  - Shadow: `0 10px 30px rgba(0, 0, 0, 0.04)`
  - Padding: `24px`
- **Template Card**:
  - Background: `#FFFFFF`
  - Border Radius: `16px`
  - Border: `1.5px solid #E2E8F0`
  - Micro board preview area with pastel sticky notes and mini workflow diagrams.
- **Sticky Note**:
  - Aspect Ratio: Approximately square or 4:3
  - Top Scotch Tape: `width: 50px; height: 18px; background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(2px); border-left: 2px dashed rgba(0,0,0,0.15); border-right: 2px dashed rgba(0,0,0,0.15);`
  - Hover state: `transform: scale(1.04) rotate(0deg); box-shadow: 0 12px 28px rgba(0,0,0,0.15);`

---

## 5. Motion & Animation System
- **Floating Elements**:
  - `@keyframes auraFloat`: Y-axis translation from `0px` to `-8px` with rotation variations over `4.2s` to `5.6s` ease-in-out infinite loop.
- **Wandering Live Cursors**:
  - Simulated real-time collaboration with multi-user cursor paths (`anim-cursor-alex`, `anim-cursor-taylor`, `anim-cursor-sam`).
- **Sketch Underline**:
  - SVG hand-drawn curved wave or smooth 3px stroke with electric blue fill.
- **Transitions**:
  - Default: `all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`
  - Press feedback: `transform: scale(0.98)`
- **Accessibility**:
  - `@media (prefers-reduced-motion: reduce)`: disables all continuous translations and cursor wanders.

---

## 6. Layout Dimensions & Breakpoints
- **Navbar Height**: `68px` sticky top
- **Max Content Container Width**: `1280px` centered with `padding: 0 24px`
- **Breakpoints**:
  - Mobile: `< 768px` (single column cards, collapsible menu, stacked CTAs)
  - Tablet: `768px – 1024px` (2-column grid, responsive toolbar)
  - Desktop: `> 1024px` (3-column feature and template grids, full interactive canvas)

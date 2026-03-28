# Design System — Thinking Map

## Product Context
- **What this is:** Spatial co-thinking tool where AI agent + founder build strategy maps through gesture
- **Who it's for:** Founders and strategists doing discovery/structuring work
- **Space/industry:** Spatial thinking tools (peers: Heptabase, Muse, Kosmik, Scrintal)
- **Project type:** Canvas web app (tldraw-based)

## Aesthetic Direction
- **Direction:** Dark Observatory (warm minimalism on dark canvas)
- **Default theme:** Dark
- **Decoration level:** Intentional (subtle warmth — dark canvas, glass-morphism nodes, grain texture, glowing annotations)
- **Mood:** Calm, focused, premium. Like a thinking observatory at night. Semantic colors glow against the dark surface. Content floats as glass objects.
- **Design risks:**
  - COLOR = MEANING: All UI chrome is warm grayscale. Color only appears for semantic annotations and system states. When you see color, the agent flagged something.
  - AGENT GHOST PRESENCE: During handoff, the agent has subtle visual presence — scanning highlights, ghost outlines that solidify.

## Typography
- **Display/Hero:** Instrument Serif — architectural, precise, premium
  - Cluster labels: 13px / weight 400
  - Empty canvas heading: 22px / weight 400
- **Body:** Inter — clean, neutral, invisible. Lets wildly varying content breathe.
- **UI/Labels:** Inter
- **Data/Tables:** JetBrains Mono (tabular-nums supported)
- **Code:** JetBrains Mono
- **Loading:** Google Fonts — Inter (400,500,600,700) + JetBrains Mono (400,500)
- **Scale:**
  - xs: 10px (node IDs, technical labels)
  - sm: 11.5px (cluster labels, section headers)
  - base: 13px (body, buttons, inputs)
  - md: 13.5px (node content)
  - lg: 14px (default body)
  - Weight: 400 regular, 500 buttons/medium, 600 headers/bold, 700 annotations

## Color

**Principle: Color only has meaning.** All chrome is warm grayscale. Color is reserved for semantic signals.

### Surfaces (dark default)
- Canvas: `#1E1D1B`
- Card/Node fill: `rgba(42, 40, 38, 0.65)` + backdrop-filter blur(12px) (glass)
- Cluster fill: `rgba(42, 40, 38, 0.25)` + backdrop-filter blur(4px) (glass)
- Bottom bar: `rgba(30, 29, 27, 0.85)` + backdrop-filter blur(16px) (glass)
- Canvas grain: SVG noise texture at 3% opacity

### Borders (warm grayscale)
- Light: `#e4e0da`
- Standard: `#d4d0ca`
- Medium: `#b8b4ae`
- Metadata: `#a8a4a0`

### Text (warm grayscale)
- Primary: `#3a3a3a`
- Secondary: `#6b6660`
- Tertiary: `#8b8580`
- Disabled: `#b8b4ae`

### Interactive (warm grayscale — NO decorative color)
- Button primary bg: `#2c2c2c`
- Button primary hover: `#404040`
- Button thinking: `#6b6660`
- Button disabled bg: `#d4d0ca`
- Button disabled text: `#8b8580`
- Button primary text: `#f8f7f4`

### Semantic (THE ONLY COLOR ON SCREEN)
- **Tension:** text `#c4553a`, bg `#fef2f0`, border `#e8c4bc`
- **Insight:** text `#3d7a53`, bg `#eef6f0`, border `#b8d4c2`
- **Question:** text `#8b7e6e`, bg `#f0ebe4`, border `#d4cfc6`
- **Error:** `#D4453A`
- **Warning:** `#C4893A`
- **Focus ring:** `#5B8A72`

### Dark Mode
- Base canvas: `#1E1D1B`
- Surface: `#2A2826`
- Elevated: `#3A3836`
- Border light: `#4A4744`
- Border standard: `#5A5754`
- Text primary: `#E8E5E0`
- Text secondary: `#A8A4A0`
- Text tertiary: `#7A7672`
- Strategy: warm dark grays (5-10% warm saturation), font-weight +1 step
- **Dark mode annotations (saturation -15%):**
  - Tension: text `#B85A4A`, bg `#2E2220`, border `#5A3830`
  - Insight: text `#5A9A6A`, bg `#1E2A22`, border `#3A5A42`
  - Question: text `#9A8E7E`, bg `#2A2620`, border `#5A5444`
- **Dark mode semantic:**
  - Error: `#D45A4A`, Warning: `#C49A4A`, Focus: `#5B9A7A`
- **Annotation glow (dark canvas):**
  - Question: `drop-shadow(0 0 6px rgba(139, 126, 110, 0.4))`
  - Tension: `drop-shadow(0 0 8px rgba(196, 85, 58, 0.5))`
  - Insight: `drop-shadow(0 0 6px rgba(61, 122, 83, 0.4))`

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** Hybrid (freeform canvas + disciplined utility strip)
- **Canvas:** 100% viewport, zero chrome (Muse-style)
- **Bottom bar:** 52px fixed strip, frosted glass, top border
- **Border radius:** sm:4px, md:6px, lg:8px, xl:12px, full:9999px (annotations)
- **Max content width:** n/a (infinite canvas)
- **Persona selector:** Segmented pill control, 28px height, 11px Inter 500, glow active state `box-shadow: 0 0 8px rgba(232, 229, 224, 0.08)`

## Motion
- **Approach:** Minimal-functional + agent ghost presence
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(150ms) medium(300ms) long(500ms)
- **Standard transitions:**
  - Hover states: 150ms
  - Toast appear: 200ms ease-out, translateY 8→0
  - Shape fade-in: 300ms ease-out, scale 0.95→1
  - Tension pulse: 2s infinite, opacity 1→0.55
- **Agent ghost presence (RISK 3):**
  - Scanning highlight: translucent warm glow (#f8f7f4 at 15% opacity) sweeps across clusters, ~3s per sweep
  - Ghost outline: faint dashed border fades in (300ms), solidifies on placement (200ms)
  - Node analysis glow: soft warm shadow on nodes being read (150ms fade-in, 500ms hold, 200ms fade-out)

## Responsive
- **Target:** Desktop-only (v1). Min viewport: 1024×768.
- **Below 1024px:** Show a centered message: "Thinking Map works best on a larger screen." No canvas rendered.
- **Future:** Tablet (iPad landscape) is the next viewport. Touch gesture mapping TBD.

## Accessibility
- **Contrast ratios (WCAG AA, 4.5:1 minimum for text):**
  - *Dark mode (default):*
  - Dark mode primary (#E8E5E0) on canvas (#1E1D1B): 12.1:1 ✓
  - Button text (#f8f7f4) on button bg (#2c2c2c): 11.2:1 ✓
  - *Light mode (alternate):*
  - Primary text (#3a3a3a) on canvas (#f8f7f4): 8.5:1 ✓
  - Secondary text (#6b6660) on canvas (#f8f7f4): 4.7:1 ✓
  - Tertiary text (#8b8580) on canvas (#f8f7f4): 3.5:1 ✗ (non-essential labels only, meets 3:1 large text threshold)
  - Tension text (#c4553a) on tension bg (#fef2f0): 4.6:1 ✓
  - Insight text (#3d7a53) on insight bg (#eef6f0): 4.8:1 ✓
- **Non-color differentiation:** Annotations use distinct icons (? ! •) in addition to color. This is load-bearing for the "color = meaning" principle since colorblind users must distinguish annotation types.
- **Keyboard nav:**
  - Tab cycles through bottom bar: Demo Loader → Text Channel toggle → Handoff → Undo → Last Diff
  - Enter/Space activates focused button
  - Escape closes expanded Text Channel and dismisses toasts
  - Canvas keyboard nav deferred to tldraw defaults (arrow keys to pan, +/- to zoom)
- **Focus ring:** `#5B8A72`, 2px solid, 2px offset. Visible on all interactive elements.
- **Screen reader:** Announce toast content via `role="alert" aria-live="polite"`. Annotation tooltips use `aria-label`.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-28 | Initial design system created | Formalized from existing codebase via /design-consultation |
| 2026-03-28 | Color = meaning risk adopted | Only semantic annotations and system states use color; all chrome is warm grayscale |
| 2026-03-28 | Agent ghost presence risk adopted | Agent gets visual presence during handoff — scanning, ghost outlines, node glow |
| 2026-03-28 | Warm dark mode strategy | Warm dark grays instead of cool/blue-tinted, maintaining architect's desk identity |
| 2026-03-28 | Instrument Serif for display | Reserved for future marketing/landing page use, not current app UI |
| 2026-03-28 | Dark Observatory identity overhaul | Dark canvas by default — semantic colors glow, glass nodes float, grain texture adds physical feel |
| 2026-03-28 | Instrument Serif deployed | Used for cluster labels (13px) and empty canvas heading (22px) |
| 2026-03-28 | Glass-morphism nodes | Translucent nodes with backdrop-filter blur on dark canvas |
| 2026-03-28 | Agent persona selector | Segmented pill control for Strategist / Devil's Advocate / VC Lens modes |
| 2026-03-28 | AI Ghost cursor | Animated cursor overlay during handoff, glides across nodes |
| 2026-03-28 | Tension heartbeat | Nodes connected by tension arrows pulse red glow, speed scales with count |

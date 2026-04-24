---
name: Ronki Mystic Meadow

colors:
  # Surfaces. Warm cream replaces the usual "pure white" chrome and is the
  # canvas the whole app sits on. White #ffffff is reserved for elevated
  # cards so they feel gently lifted off the cream.
  surface: "#fff8f2"
  surface-dim: "#dfd9d2"
  surface-bright: "#fff8f2"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f9f2ec"
  surface-container: "#f4ede6"
  surface-container-high: "#eee7e0"
  surface-container-highest: "#e8e1db"
  surface-variant: "#e8e1db"
  surface-tint: "#396569"

  # Ink. Warm near-black, not pure black. Keeps the cream surface
  # feeling friendly rather than clinical.
  on-surface: "#1e1b17"
  on-surface-variant: "#404849"
  on-background: "#1e1b17"
  background: "#fff8f2"

  # Outlines. AAA 7:1 target on cream.
  outline: "#4d5556"
  outline-variant: "#c0c8c9"
  inverse-surface: "#33302c"
  inverse-on-surface: "#f6f0e9"

  # Primary. Deep teal reads as the adult, trustworthy voice of the
  # product. Used for parent-facing chrome, headings, outlines, and
  # quiet CTAs.
  primary: "#124346"
  on-primary: "#ffffff"
  primary-container: "#2d5a5e"
  on-primary-container: "#a2d0d4"
  primary-fixed: "#bcebef"
  primary-fixed-dim: "#a1cfd3"
  on-primary-fixed: "#002022"
  on-primary-fixed-variant: "#1f4d51"
  inverse-primary: "#a1cfd3"

  # Secondary. Warm gold / mustard. The "reward color". Reserved for
  # earn moments (stars, Funkelzeit, streak milestones, Lagerfeuer glow).
  # Must never be used for danger or alert.
  secondary: "#735c00"
  on-secondary: "#ffffff"
  secondary-container: "#fcd34d"
  on-secondary-container: "#725b00"
  secondary-fixed: "#ffe086"
  secondary-fixed-dim: "#eac33e"
  on-secondary-fixed: "#231b00"
  on-secondary-fixed-variant: "#574500"

  # Tertiary. Forest green. Progress, growth, companion health, nature
  # moments (meadow, moss, expedition returns).
  tertiary: "#004532"
  on-tertiary: "#ffffff"
  tertiary-container: "#005f46"
  on-tertiary-container: "#86d7b6"
  tertiary-fixed: "#a1f3d1"
  tertiary-fixed-dim: "#86d6b6"
  on-tertiary-fixed: "#002116"
  on-tertiary-fixed-variant: "#00513b"

  # Semantic accents.
  emerald: "#34d399"
  emerald-dark: "#059669"

  # Error. Use only for PIN-gated destructive actions and true failure
  # states. Never for streak-breaks or missed quests; those get gentle
  # copy, not red.
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"

  # Painterly atmosphere wash. Used as blurred radial blobs behind the
  # marketing site and the campfire scene. Never as a solid fill.
  wash-mustard: "#fcd34d"
  wash-mustard-soft: "#fde589"
  wash-sage: "#50a082"
  wash-sage-soft: "#7bb89f"
  wash-teal-veil: "rgba(45,90,94,0.08)"

  # Campfire time-of-day band. Drives the Hub's Lagerfeuer gradient and
  # the companion's skin tint. Pick one band per render by clock hour.
  campfire-dawn-top: "#fbcfb7"
  campfire-dawn-mid: "#e7c8a4"
  campfire-day-top: "#e7d8b9"
  campfire-day-mid: "#d4b894"
  campfire-golden-top: "#f2b582"
  campfire-golden-mid: "#d98d55"
  campfire-night-top: "#1a2344"
  campfire-night-mid: "#2b3158"
  ember-core: "#fde68a"
  ember-mid: "#fcd34d"
  ember-edge: "rgba(252,211,77,0)"

typography:
  # Three families, each with a purpose. Do not mix purposes.
  #   Fredoka        : playful display headings (app chrome)
  #   Plus Jakarta   : UI labels, marketing display, nav, buttons
  #   Be Vietnam Pro : body copy, long-form reading, Ratgeber articles
  #
  # Size scale is bumped +2px vs. a standard scale because the primary
  # reader is a first grader (age 6 to 8). 16px is the absolute floor
  # for any character glyph except badges and corner metadata.

  display:
    fontFamily: Fredoka
    fontSize: 32px
    fontWeight: "800"
    lineHeight: 40px
    letterSpacing: -0.02em
    textTransform: none
  display-italic:
    fontFamily: Fredoka
    fontSize: 22.4px
    fontWeight: "800"
    fontStyle: italic
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fredoka
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
    letterSpacing: -0.005em
  headline-md:
    fontFamily: Fredoka
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  title-lg:
    fontFamily: Fredoka
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 30px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28.8px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 19.6px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "700"
    lineHeight: 24px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "700"
    lineHeight: 20px
    letterSpacing: 0.03em
    textTransform: uppercase
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12.8px
    fontWeight: "800"
    lineHeight: 16px
    letterSpacing: 0.08em
    textTransform: uppercase
  mono-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "800"
    lineHeight: 24px
    fontFeatureSettings: '"tnum"'

rounded:
  # Radii are deliberately generous. Pills and large radii are a
  # signature of the brand. There are no sharp corners anywhere.
  none: 0
  sm: 0.625rem      # 10px  : outline buttons, chip badges
  DEFAULT: 1rem     # 16px  : small cards, icon boxes
  md: 1.125rem      # 18px  : mission cards, inputs inside cards
  lg: 1.25rem       # 20px  : standard surface cards
  xl: 1.75rem       # 28px  : overlay / modal cards
  "2xl": 2rem       # 32px  : hero panels, big quest panels
  "3xl": 3rem       # 48px  : rare, full-bleed poster cards
  pill: 9999px      # buttons, stat pills, progress tracks, tabs

spacing:
  # 4px base grid. Touch targets stay at 44px minimum everywhere.
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  "2xl": 24px
  "3xl": 32px
  "4xl": 48px
  "5xl": 64px
  "6xl": 96px
  gutter: 20px        # screen edge padding (mobile)
  margin: 24px        # section-to-section vertical rhythm
  stack: 12px         # inside-card vertical rhythm
  tab-bar-safe: 100px # bottom padding so content clears the tab bar

elevation:
  # Elevation is built from soft, tinted, layered shadows on cream.
  # Never pure black. The tint matches the surface family: teal-blue
  # for cool chrome, warm ochre for quest and reward surfaces.
  #
  # Borders carry the structural weight. Shadows provide the lift.
  #
  # Each level names who uses it, to prevent shadow-sprawl.

  level-0:
    name: Flat
    use: Backgrounds, inline chips, non-lifting elements
    boxShadow: none
  level-1:
    name: Card
    use: Standard surface cards (quests, habits, rewards)
    boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)"
    border: "1.5px solid rgba(0,0,0,0.12)"
  level-2:
    name: Elevated Card
    use: Mission cards, focused hero panels, Ronki status card
    boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)"
    border: "1.5px solid rgba(0,0,0,0.12)"
  level-3:
    name: Floating
    use: Sticky tab bar, transient toasts, banners
    boxShadow: "0 -4px 24px rgba(0,40,120,0.06), 0 2px 8px rgba(0,0,0,0.06)"
    border: "1.5px solid rgba(0,50,150,0.06)"
  level-4:
    name: Overlay
    use: Celebration modals, evolution reveals, BossChest, EggOverlay
    boxShadow: "0 24px 64px rgba(0,0,0,0.20), 0 8px 24px rgba(0,0,0,0.08)"
    border: "none"
  level-glow-reward:
    name: Reward Glow
    use: "Lagerfeuer greet pulse, first-quest celebration, login bonus."
    boxShadow: "0 12px 36px -8px rgba(252,211,77,0.30), 0 0 0 4px rgba(252,211,77,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"
  level-glow-danger:
    name: Alert Glow
    use: "PIN entry failure, parental-gate denial. Never for child-facing mistakes."
    boxShadow: "0 0 0 3px rgba(186,26,26,0.20), 0 4px 16px rgba(186,26,26,0.15)"

shadows:
  # Raw shadow tokens (referenced by elevation roles above). Exposed
  # separately so components can opt out of the borders while keeping
  # the shadow, or vice versa.
  card-soft: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)"
  card-elevated: "0 4px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)"
  tab-bar: "0 -4px 24px rgba(0,40,120,0.06)"
  overlay: "0 24px 64px rgba(0,0,0,0.20), 0 8px 24px rgba(0,0,0,0.08)"
  ember-halo: "0 0 8px rgba(252,211,77,0.7)"
  button-primary: "0 8px 24px rgba(109,40,217,0.25)"
  button-accent: "0 8px 24px rgba(252,211,77,0.40)"
  button-success: "0 4px 16px rgba(52,211,153,0.20)"

motion:
  # Tap, transition, ambient. Every value respects prefers-reduced-motion:
  # everything collapses to 0.01ms except a single fade.
  #
  # The whole app breathes gently at 4 to 6 seconds; that rhythm is a
  # signature. Companion, ember, halo, and campfire all share it so the
  # scene reads as one living picture.

  easing:
    standard: "cubic-bezier(0.45, 0, 0.55, 1)"
    entrance: "cubic-bezier(0.65, 0, 0.35, 1)"
    tap: "ease"
    spring-out: "cubic-bezier(0.34, 1.56, 0.64, 1)"
  duration:
    tap: "120ms"
    color: "150ms"
    view-enter: "200ms"
    progress-fill: "400ms"
    progress-ring: "1200ms"
    celebration: "1500ms"
  ambient-loops:
    companion-breathe: "4.6s"
    hub-halo-pulse: "5.2s"
    ground-pulse: "4.6s"
    ember-rise: "4.5s"
    dream-breathe: "2.8s"
    star-twinkle: "2s"
  interactions:
    tap-scale: "scale(0.96)"
    card-tap-scale: "scale(0.985)"
    tab-active-scale: "scale(1.08)"
    view-enter: "opacity 0→1, translateY(12px → 0)"
    toast-slide: "translateY(-16px → 0), opacity 0→1→0, 1.2s"
    celebration-burst: "scale(0 → 1.5) translateY(-200px) rotate(360deg), 1.5s"

components:
  # Core surfaces. All values are self-contained (no codebase refs).
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    border: "1.5px solid rgba(0,0,0,0.12)"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    boxShadow: "{shadows.card-soft}"
    typography: "{typography.body-md}"
  card-elevated:
    backgroundColor: "{colors.surface-container-lowest}"
    border: "1.5px solid rgba(0,0,0,0.12)"
    rounded: "{rounded.lg}"
    padding: "{spacing.2xl}"
    boxShadow: "{shadows.card-elevated}"

  # Primary CTA. Parent-facing chrome. Never the reward-earning button.
  button-primary:
    backgroundColor: "linear-gradient(135deg,#6D28D9,#A78BFA)"
    textColor: "#ffffff"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "16px 40px"
    minHeight: "52px"
    boxShadow: "{shadows.button-primary}"
    activeTransform: "{motion.interactions.tap-scale}"
  button-secondary:
    backgroundColor: "linear-gradient(135deg,#6D28D9,#A78BFA)"
    textColor: "#ffffff"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    minHeight: "44px"

  # Reward CTA. Gold. Only used when the kid is about to earn something.
  button-accent:
    backgroundColor: "linear-gradient(135deg,#FCD34D,#F59E0B)"
    textColor: "#ffffff"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: "16px 36px"
    minHeight: "52px"
    boxShadow: "{shadows.button-accent}"

  button-success:
    backgroundColor: "linear-gradient(135deg,#34D399,#059669)"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "14px 36px"
    minHeight: "48px"
    boxShadow: "{shadows.button-success}"

  button-ghost:
    backgroundColor: "rgba(255,255,255,0.15)"
    backdropFilter: "blur(8px)"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    minHeight: "48px"

  # Outline buttons. For parental / dev / secondary actions that should
  # not compete with earning buttons.
  button-outline-primary:
    backgroundColor: "rgba(109,40,217,0.10)"
    border: "1.5px solid #6D28D9"
    textColor: "#6D28D9"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "10px"
    minHeight: "44px"
  button-outline-accent:
    backgroundColor: "rgba(252,211,77,0.15)"
    border: "1.5px solid #FCD34D"
    textColor: "#F59E0B"
    rounded: "{rounded.sm}"
    padding: "10px"
    minHeight: "44px"
  button-outline-danger:
    backgroundColor: "rgba(248,113,113,0.10)"
    border: "1.5px solid #F87171"
    textColor: "#F87171"
    rounded: "{rounded.sm}"
    padding: "10px"
    minHeight: "44px"

  button-disabled:
    backgroundColor: "rgba(0,0,0,0.04)"
    textColor: "#94A3B8"
    opacity: 0.4
    rounded: "{rounded.pill}"
    minHeight: "44px"

  # Navigation tabs. Locked tabs dim to 55%; reveal ceremony pulses gold.
  tab-bar:
    backgroundColor: "rgba(255,255,255,0.97)"
    borderTop: "1.5px solid rgba(0,50,150,0.06)"
    boxShadow: "{shadows.tab-bar}"
    padding: "6px 8px env(safe-area-inset-bottom,8px)"
  tab-icon:
    size: "44x44"
    rounded: "14px"
    backgroundColor: "rgba(109,40,217,0.04)"
    border: "1.5px solid rgba(109,40,217,0.06)"
    backdropFilter: "blur(8px)"
    textColor: "#9C977E"
  tab-icon-active:
    backgroundColor: "linear-gradient(135deg,rgba(252,211,77,0.25),rgba(245,158,11,0.15))"
    border: "1.5px solid rgba(245,158,11,0.25)"
    textColor: "#A83E2C"
    transform: "scale(1.08)"
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.80), 0 3px 12px rgba(245,158,11,0.15)"
  tab-label:
    typography: "{typography.label-sm}"
    textColor: "#94A3B8"
  tab-label-active:
    textColor: "#A83E2C"

  # Mission / quest row. The heart of the app.
  mission-card:
    backgroundColor: "#ffffff"
    border: "2.5px solid rgba(180,120,40,0.08)"
    rounded: "{rounded.md}"
    padding: "14px 16px"
    boxShadow: "0 3px 12px rgba(120,80,20,0.06)"
  mission-progress-track:
    backgroundColor: "rgba(180,120,40,0.08)"
    rounded: "{rounded.pill}"
    height: "10px"
  mission-progress-fill:
    backgroundColor: "linear-gradient(90deg,#34D399,#6EE7B7)"
    rounded: "{rounded.pill}"
    transition: "width 400ms ease"
  mission-reward-chip:
    backgroundColor: "rgba(252,211,77,0.12)"
    border: "2px solid rgba(252,211,77,0.30)"
    rounded: "14px"
    padding: "8px 10px"
    minWidth: "56px"

  # Input. iOS auto-zoom is prevented by the 16px minimum font size.
  input:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    padding: "12px 16px"
    minFontSize: "16px"
    focusRing: "2px solid #FCD34D"

  # Overlay / modal. For celebration and redeem moments.
  overlay-backdrop:
    backgroundColor: "rgba(0,0,0,0.60)"
    backdropFilter: "none"
    zIndex: 9990
  overlay-card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "24px"
    maxWidth: "340px"
    boxShadow: "{shadows.overlay}"

  # Stat pill. Glassy over colored hero surfaces.
  stat-pill-glass:
    backgroundColor: "rgba(255,255,255,0.20)"
    backdropFilter: "blur(10px)"
    textColor: "#ffffff"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"

  # Section label. "HEUTE", "QUESTS", "FREUNDE" kind of tag.
  section-label:
    typography: "{typography.label-sm}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"

  # Icon containers.
  icon-box-sm:
    size: "48x48"
    rounded: "14px"
  icon-box-md:
    size: "52x52"
    rounded: "14px"

  # The painterly shell. Applied once at the page root of the marketing
  # site; the app's Hub uses a reduced version (campfire gradient + ember
  # layer) without the dot pattern.
  painterly-shell:
    backgroundColor: "{colors.surface}"
    washes:
      - "radial-gradient blob, mustard #FCD34D → #FDE589 → transparent, blur 100px, 60vh, top-left, opacity 0.50"
      - "radial-gradient blob, sage #7BB89F → #50A082 → transparent, blur 120px, 55vh, mid-right, opacity 0.40"
    dotPattern: "radial dots #2D5A5E + #50A082 at 48px and 32px grids, opacity 0.05, multiply"
    scrollProgressBar: "2px, linear-gradient mustard → sage → teal, origin-left, scaleX by scroll"
---

# Ronki Mystic Meadow

A painterly, kid-gentle companion interface for a German-speaking grade-school child and the parent watching over their shoulder. The design system is a warm cream canvas lit from within by a deep teal voice, a gold reward glow, and forest-green growth. Every surface feels hand-painted; every interaction feels quiet.

## 1. Visual Theme & Atmosphere

Think "watercolor illustration of a small dragon next to a campfire in a meadow, dusk light, hand-lettered title card." That is the north star for every screen.

The product has two paired voices:

- **The app (app.ronki.de)** is the child's home. Warm cream background, very rounded cards, Fredoka display type, playful micro-motion. The Hub's centerpiece is a Lagerfeuer scene with four time-of-day palettes that track the real clock (dawn, day, golden, night). Embers rise. The companion breathes at 4.6 seconds.
- **The website (ronki.de)** is the parent's entry. Same cream and teal, but Plus Jakarta Sans display, mustard and sage wash-blobs on a parchment shell, calm parent-to-parent tone. It reads as the quieter older sibling of the app.

Both share one rule: the page must look like a painting first and a UI second. Hairline borders and soft tinted shadows do the structural work. A dot pattern sits under everything at 5 percent opacity so the surface never looks flat.

The product refuses a few things on principle:

- No dark patterns. No fake scarcity, no streak pressure, no red streak-break alerts.
- No pure black. The ink is warm `#1e1b17`.
- No pure white as a page background. Cream `#fff8f2` is the canvas; white is reserved for lifted cards.
- No sharp corners anywhere. Minimum radius is 10px; the signature is 16 to 28px.

## 2. Color Palette & Roles

The palette is small on purpose. Three pigment families carry meaning:

- **Deep Teal** (`#124346`, container `#2d5a5e`). The voice of the product. Headings, primary outlines, parent-chrome, night-band of the campfire. Feels calm, considered, trustworthy.
- **Warm Gold / Mustard** (`#fcd34d`, fixed `#ffe086`). The reward color. Reserved for earn moments: stars landing, Funkelzeit ticking up, Lagerfeuer greeting glow, reveal ceremonies, login bonus pulse. It must never mean danger. Gold glowing is always good news.
- **Forest Green** (`#004532`, container `#005f46`). Growth, health, progress bars, companion mood "gut", meadow moments.

Surfaces are the warm cream family (`#fff8f2` down to `#dfd9d2`), which gives the whole interface the feel of paper or lightly washed canvas. Ink is the warm near-black `#1e1b17`.

Two painterly wash colors are reserved for atmospheric backgrounds only:

- `wash-mustard #fcd34d` and `wash-sage #50a082` sit as blurred 55 to 60vh radial blobs behind the marketing shell.
- Inside the app, `wash-teal-veil rgba(45,90,94,0.08)` gives the Hub its soft middle-distance depth.

Error red `#ba1a1a` exists and is used for PIN-gated destructive actions or true failure. It is never used for a child missing a quest, a broken streak, or an uncompleted habit. Those get gentle copy, never red.

One exception to the warm palette: the marketing hero (HeroVariantF) flips to a near-black teal `#1a3c3f` background with mustard and sage orbs behind it. That is the only deep surface in the entire product; use it for heroes only.

## 3. Typography Rules

Three typefaces, each locked to one role. Do not mix purposes.

- **Fredoka.** Playful rounded display. The child's voice. Use for: app headings, reward counters, section titles, celebrations. Weights 700 and 800. Never for body copy.
- **Plus Jakarta Sans.** The UI and marketing-display voice. Use for: buttons, tab labels, section eyebrows, marketing H1 to H3, stat pills. Weights 500 to 800. Uppercase at small sizes (labels at 12.8px and 14px) with letter-spacing 0.03em to 0.08em.
- **Be Vietnam Pro.** The reading voice. Use for: paragraph copy, long-form Ratgeber articles, modal body, companion speech bubbles. Weights 400 to 600. Line-height 1.5 to 1.6 for generous reading.

The size scale is bumped two pixels across the board because the primary reader is a first grader (age 6 to 8). **16px is the absolute floor for any character glyph** except corner metadata and counter chips. Body copy lives at 18px with line-height 1.6. H1 is 28px, H2 is 24px, eyebrow labels are 12.8px uppercase.

Because iOS auto-zooms any `input` below 16px, all form inputs render at 16px minimum with `!important`. Do not override.

Tracking is slightly positive (0.01em) on body copy. Early readers parse separated letter-forms faster than kerned ones; this is load-bearing.

Uppercase labels (`label-md`, `label-sm`) are signature. Use them for section tags like "HEUTE", "QUESTS", "FREUNDE". Never uppercase a sentence of body copy.

## 4. Component Stylings

### Cards

White surface on cream background, 1.5px `rgba(0,0,0,0.12)` border, radius 20px (28px for hero panels), soft double shadow `0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)`. Elevated variant doubles the shadow reach. Active state: tap-scale 0.985.

Mission cards are a warmer variant: 2.5px `rgba(180,120,40,0.08)` border, slight ochre tint in the shadow, 18px radius. The border gives them the feel of a quest scroll next to the general cards.

### Buttons

Always pills. Always gradients. Always minimum 44px touch target, 52px for primary.

- **Primary**: violet gradient `#6D28D9 → #A78BFA`, white text, pill, `0 8px 24px rgba(109,40,217,0.25)` shadow. Parent-chrome CTA.
- **Accent**: gold gradient `#FCD34D → #F59E0B`, white text, pill, gold halo shadow. Reserved for earn moments.
- **Success**: emerald gradient `#34D399 → #059669`, pill. Used for confirms after a child-facing completion.
- **Ghost**: translucent white over colored hero, 8px blur, pill.
- **Outline variants** (primary, accent, danger) step down to a 10px radius and 44px min height.

Every interactive element responds to tap with `transform: scale(0.96)` over 120ms. This is global, not per-component. Cards tap softer at 0.985.

### Tab Bar

Fixed bottom, 97 percent white surface, hairline teal-blue top border, safe-area-inset bottom padding. Icons sit in 44x44 rounded-14px containers with a soft violet inset tint. Active tab switches to a mustard gradient tint, scales to 1.08, changes label and icon color to ochre-red `#A83E2C`. Locked tabs dim to 55 percent opacity with a padlock badge; tapping shows a "komm bald zurück" hint sheet instead of hiding them.

### Inputs

16px minimum font size. `surface-container-low #f9f2ec` fill, 16px radius, 2px mustard focus ring with 2px offset. No box shadow. Placeholder in `on-surface-variant`.

### Chips and Labels

Pill chips at 6x14 padding, 14px font, weight 700 to 800. Stat pills that sit on colored hero surfaces use a translucent white `rgba(255,255,255,0.20)` fill with a 10px backdrop-blur so they read cleanly.

### Progress

Tracks are 8 to 10px high, pill-shaped, `rgba(0,0,0,0.06)` fill. Fills are gradients (violet for primary, emerald for success) with a 400ms width transition. The Hub's circular progress ring uses a 1200ms entry with easing `cubic-bezier(0.65, 0, 0.35, 1)`.

### Icon System

Material Symbols Outlined throughout at `FILL 0, wght 400, GRAD 0, opsz 24`. Icon containers are 48x48 or 52x52 rounded-14 boxes. Companion moods and reward states are illustrated (chibi faces, fire-breath puffs) rather than iconified.

## 5. Layout Principles

Mobile-first. The app is a PWA that must work on a cheap Amazon Fire tablet as comfortably as on an iPhone.

- **Screen gutter**: 20px horizontal, 12px top (respects `env(safe-area-inset-top)`).
- **Bottom padding**: 100px so content clears the floating tab bar.
- **Section rhythm**: 24px between peer cards, 32px before a new section header, 48 to 64px between major surfaces.
- **Inside-card rhythm**: 12px stack, 16 to 20px padding.
- **Max content width**: 720px for text-dense views (Ratgeber articles). 480px for centered card columns. Full bleed for the Lagerfeuer scene.
- **Touch targets**: 44px minimum, 52px for primary CTAs. Tab icons are 44x44 with additional padding to reach 52px in practice.

On the marketing site, the hero grid is two columns on `md` and up, single column below. The shell is never full-bleed: it breathes inside a 1152px outer frame with 40px padding at `lg` and up.

## 6. Depth & Elevation

Elevation is built from soft, tinted, layered shadows on a cream canvas. Three rules:

1. **Borders carry structure. Shadows carry lift.** Every card gets a 1.5px `rgba(0,0,0,0.12)` border regardless of shadow level. The shadow only says "this floats slightly."
2. **Tint the shadow, never pure black.** Warm surfaces (mission cards, reward chips) use ochre-tinted shadows `rgba(120,80,20,0.06 to 0.08)`. Cool chrome (tab bar) uses blue-tinted `rgba(0,40,120,0.06)`. This keeps the cream from looking dirty.
3. **Gold halos are reward-only.** The `level-glow-reward` shadow (triple-layered mustard halo, inset highlight) is reserved for celebration moments: first Lagerfeuer arrival, quest completion chest, evolution ceremony. Never decorative.

The elevation ladder:

- **Level 0**: no shadow, flat (backgrounds, chips).
- **Level 1**: standard card.
- **Level 2**: elevated card (hero panels, Ronki status).
- **Level 3**: floating chrome (tab bar, toast, alpha banner).
- **Level 4**: overlay (celebration modals, evolution reveal).
- **Level Glow (reward)**: gold halo. Earning only.
- **Level Glow (danger)**: red halo. PIN-gated parent actions only.

Painterly atmosphere (radial blobs, ember particles, dot pattern, campfire gradient) sits at z-index 0 with `pointer-events: none`. It is never interactive, never load-bearing for meaning, always decorative depth.

## 7. Motion

Motion has one signature rhythm: 4 to 6 seconds, cubic-bezier(0.45, 0, 0.55, 1), infinite. The companion breathes, the Hub halo pulses, the ground pulses, embers rise. All share the same cadence so the scene reads as one living picture instead of five twitchy elements.

Three kinds of motion:

- **Tap feedback**: every button and card scales down between 0.96 and 0.985 over 120ms on `:active`. Global rule.
- **Transitions**: view enter is `opacity 0 → 1, translateY 12px → 0, 200ms ease`. Color changes are 150ms. Progress widths are 400ms. Progress rings are 1200ms.
- **Celebrations**: one-shot scripted motion for earn moments. Ember burst, victory slide-up, boss-chest announce, evolution reveal. These are loud on purpose; they are earned. Toasts slide from `translateY(-16px)` with a 1.2s total arc (enter, hold, fade).

**Prefers-reduced-motion is absolute.** Every animation collapses to 0.01ms; only opacity fades survive. No exceptions.

Fire-breath particles have five flavors keyed to quest type (flame for routines, ember for side quests, sparkle for MINT and daily habits, heart for Freund arcs, rainbow for streak milestones). They are the only particle system that mixes color with celebration; other particles stay gold or white.

## 8. Shape Language

- **Radii**: 10px for outline buttons, 16 to 20px for cards, 28px for modals, pill for buttons and tracks. Minimum radius anywhere is 10px; there are no sharp corners.
- **Corners feel hand-drawn**: every radius in the interface is at least 10px, which reads as "someone painted this" rather than "a developer assembled it."
- **Companion and illustrations** use soft chibi forms (round belly, rounded wings, big eyes) with 6 mood variants (normal, sad, tired, besorgt, gut, magisch) driving face, particle, and scene tint together.

## 9. Do's & Don'ts

**Do**

- Use cream `#fff8f2` as the page surface. White is reserved for lifted cards.
- Layer painterly washes (mustard, sage, teal veil) behind content at 5 to 50 percent opacity with 100 to 120px blur.
- Pill every button. Every button is 44px tall minimum, 52px for the primary.
- Bump every character size to 16px floor. Long-form body is 18px with 1.6 line-height.
- Tint shadows to match the surface family (ochre for warm, blue-teal for cool).
- Use gold only to mean earning.
- Respect `prefers-reduced-motion` completely.
- Keep the three families strictly separated: Fredoka for display, Plus Jakarta Sans for UI labels, Be Vietnam Pro for body.
- Round every illustrated shape. Soft silhouettes everywhere.

**Don't**

- No em-dashes or en-dashes in copy. Use periods, commas, colons, semicolons.
- No pure black, no pure white as a page fill.
- No red for missed quests, broken streaks, or child mistakes. Red is parent-gated failure only.
- No hidden locked tabs. Lock states dim to 55 percent with a padlock; they never disappear.
- No dark patterns. No fake scarcity, no manipulative copy, no streak anxiety.
- No AI-slop vocabulary in any user-facing string: avoid Landscape, Journey, Delve, Realm, Tapestry, navigate, impeccable, seamless, robust, paradigm, leverage, unlock, empower, holistic, synergy.
- No sharp corners. No hairline (under 1px) borders.
- No sub-16px input font sizes. iOS will auto-zoom and break the layout.
- No font mixing across roles. Fredoka in body copy is a bug.

## 10. Responsive Behavior

The app is built mobile-first and stays mobile-first on every screen. It does not grow wider than a phone-shaped column even on desktop.

- **Breakpoints**: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px`. Tailwind defaults.
- **App viewport**: centered column, max `100dvh` tall, `100%` wide, content gutter 20px. No desktop-wide layouts; the app's canvas is the phone shape even on a laptop.
- **Marketing site**: two-column hero at `md` and up, single column below. Content max-width 1152px with 40px outer padding at `lg` and up. Text columns cap at 720px for reading comfort.
- **Tab bar**: fixed, always visible, absorbs `env(safe-area-inset-bottom)`.
- **Alpha banner**: fixed at top, measures itself via ResizeObserver and exposes `--alpha-banner-h` so headers and Hub offsets stay aligned across iOS safe-area variations.
- **Touch targets stay 44px at every breakpoint.** No hover-only affordances; the Fire tablet and iPad do not reliably support hover.
- **Typography does not shrink on small screens.** A 6-year-old reading on a 5-inch phone reads the same 18px as on a 10-inch tablet. The scale bumps up at `sm` for marketing headlines only (hero goes from 2.5rem to 4.5rem at `xl`).

Hyphenation is on (`hyphens: auto`) and long compound German words (`Kinderarzttermin`, `Zähneputzen`) break cleanly. Headlines use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## 11. Accessibility Targets

- Body text contrast 4.5:1 minimum (AA). Outlines and critical UI target 7:1 (AAA) on cream.
- Skip-to-content link in the painterly shell.
- Focus ring: 2px mustard `#fcd34d` with 2px offset, 4px radius.
- All animations collapse under `prefers-reduced-motion: reduce`.
- Form inputs never below 16px (prevents iOS auto-zoom and respects low-vision readers).
- Tap highlights removed globally (`-webkit-tap-highlight-color: transparent`) in favor of the 0.96 scale feedback, which is visible to sighted and kinesthetic users alike.
- Error states are communicated with color plus copy plus icon. Never color alone.

## 12. Agent Prompt Guide

Paste this paragraph when asking for UI in this system.

> Build in the Ronki Mystic Meadow design language: warm cream `#fff8f2` surface, deep teal `#124346` voice, mustard `#fcd34d` reserved for reward and earn moments only, forest green `#004532` for progress and growth. Warm near-black ink `#1e1b17`; never pure black or pure white as fills. Cards are white with a 1.5px `rgba(0,0,0,0.12)` border, 20px radius, soft double shadow `0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)`; elevated variant doubles the reach. Every button is a pill with a gradient fill (violet `#6D28D9 → #A78BFA` for primary, mustard `#FCD34D → #F59E0B` for reward, emerald `#34D399 → #059669` for success), minimum 44px tall, 52px for primary, with a scale-to-0.96 tap feedback over 120ms. Use Fredoka for playful display headings (700 to 800), Plus Jakarta Sans for UI labels and buttons (500 to 800, uppercase with 0.03 to 0.08 tracking at small sizes), and Be Vietnam Pro for body copy (400 to 600, line-height 1.6). 16px font-size floor everywhere; body copy at 18px. Radii are generous: 10px on outline controls, 16 to 28px on cards and modals, pill on buttons and tracks; no sharp corners anywhere. Layer painterly atmosphere underneath: blurred radial blobs (mustard plus sage at 50 and 40 percent opacity, blur 100 to 120px), an optional 5 percent teal dot pattern, and on the Hub a clock-driven Lagerfeuer gradient (dawn peach, day warm, golden amber, night navy) with rising ember particles at 4.5s and a gently breathing companion at 4.6s. Ambient loops and celebrations respect `prefers-reduced-motion: reduce`. Never use red for a child's missed quest; dim locked surfaces to 55 percent with a padlock instead of hiding. No em-dashes, no en-dashes, no AI-slop words (Landscape, Journey, Delve, Realm, Tapestry, navigate, impeccable, seamless, robust, paradigm, leverage, unlock, empower, holistic, synergy). Target a German-speaking grade-school child first and the parent second: calm, playful, hand-painted, quiet.

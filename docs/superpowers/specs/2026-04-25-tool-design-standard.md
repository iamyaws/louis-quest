# Tool Design Standard — `/tools/*` on ronki.de

**Date:** 2026-04-25
**Scope:** Every page under `/tools/` on the marketing site
**Status:** Canonical reference. Read before designing or building a new tool.

---

## Purpose

Four tools shipped (App-Check, Schlafens-Rechner, Familien-Charter, Konsolen-Check). The next four should land on the same standard out of the gate, not after a polish pass.

Every tool follows one principle: **the parent is the assessor, we provide the rahmen.** Tools never make verdicts about apps, kids, or families. They give the parent a structure to reach their own decision and walk away with something they can hold (a permalink, a printable, a share-card).

---

## 1. Shell + Routing

Every tool wraps in `PainterlyShell` and ends in `Footer`. `PageMeta` carries `title`, `description`, and `canonicalPath`.

```tsx
<PainterlyShell>
  <PageMeta title="..." description="..." canonicalPath="/tools/<slug>" />
  <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
    <div className="max-w-3xl mx-auto">{/* tool body */}</div>
  </section>
  <Footer />
</PainterlyShell>
```

**Routes:**

- `/tools` — hub (uses `max-w-4xl` exception)
- `/tools/<slug>` — the tool itself
- `/tools/<slug>/r/:id` — read-only permalink for saved results (used by App-Check; pattern available for any tool that persists)

**Container:**

- `max-w-3xl` (the hub uses `max-w-4xl` only because it is a card grid).
- Hero padding `pt-32 pb-12 sm:pt-40 sm:pb-16`. Same on every tool — do not improvise.
- Horizontal gutter `px-6` everywhere.

---

## 2. Header Grammar

Every tool screen starts with the same three elements, in this order.

**1. Back link** (top, before any motion wrapper):

```tsx
<Link
  to="/tools"
  className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark focus:outline-none focus-visible:text-teal-dark focus-visible:underline underline-offset-4 transition-colors mb-8"
>
  <span aria-hidden>←</span> Werkzeuge
</Link>
```

The label is always `Werkzeuge` (or `Eigenen X starten` on permalink screens).

**2. Eyebrow** (small uppercase tag):

```tsx
<p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
  Werkzeug für Eltern
</p>
```

Eyebrow is `Werkzeug für Eltern` on landing screens, `Schritt X von Y` (or `Schritt X von Y · {appName}`) on multi-step screens, and `Gespeicherte Bewertung` (or similar) on permalink screens.

**3. H1 with italic-sage emphasis** on the key noun:

```tsx
<h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
  Wann muss dein Kind ins <em className="italic text-sage">Bett</em>?
</h1>
```

The italic always sits on **the noun that names what the tool produces** (`Bett`, `prüfen`, `Familien-Medien-Charter`, `denken`). Sub-screens scale down to `text-3xl sm:text-4xl`.

**4. Lead paragraph** (always):

```tsx
<p className="text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
  ...
</p>
```

`max-w-2xl` enforces the two-column-of-prose feel. Never exceed.

---

## 3. Step / Progress Pattern

For multi-step tools (Charter, Konsolen-Check, App-Check quiz):

```tsx
<p className="text-sm text-ink/70">
  Schritt {step + 1} von {STEPS.length} · {STEPS[step].title}
</p>
<div
  className="h-1.5 bg-cream/70 rounded-full overflow-hidden"
  role="progressbar"
  aria-valuenow={step + 1}
  aria-valuemin={1}
  aria-valuemax={STEPS.length}
>
  <motion.div
    className="h-full bg-sage rounded-full"
    initial={false}
    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
    transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }}
  />
</div>
```

**Step body** wraps in `motion.div` keyed by `step` so each step fades up:

```tsx
<motion.div
  key={step}
  initial={reduced ? false : { opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: EASE_OUT }}
>
```

Single-question quizzes (App-Check) use horizontal slide via `direction` (1/-1) so going back doesn't feel like another forward.

---

## 4. Choice-Input Component

Three input shapes, no others. All share the same focus ring and selected-state grammar.

**Pill toggle** (binary mode switches, e.g. AppEntry list-vs-free):

```tsx
<div role="tablist" className="inline-flex rounded-full bg-cream/70 border border-teal/15 p-1">
  <motion.button role="tab" aria-pressed={active} ...>
    {active && (
      <motion.span layoutId={togglePillId} className="absolute inset-0 rounded-full bg-teal" />
    )}
    <span className={active ? 'text-cream' : 'text-teal-dark'}>{label}</span>
  </motion.button>
</div>
```

Use `layoutId` so the active background slides between buttons.

**Compact radio** (small enums like ages 5-9, child count 1-4):

```tsx
<button
  role="radio"
  aria-checked={selected}
  className={`min-w-[3rem] py-2.5 px-3 rounded-xl border-2 font-display font-semibold ... ${
    selected
      ? 'border-teal bg-teal text-cream shadow-sm'
      : 'border-teal/20 bg-cream text-teal-dark hover:border-teal'
  }`}
>
```

**Large choice card** (single radio or multi-checkbox with text labels):

```tsx
<button
  role={multi ? 'checkbox' : 'radio'}
  aria-checked={active}
  className={`w-full text-left rounded-xl border-2 px-5 py-4 ... ${
    active
      ? 'border-teal bg-teal/8 text-teal-dark shadow-sm'
      : 'border-teal/20 bg-cream text-teal-dark hover:border-teal'
  }`}
>
  <span className="flex items-start gap-3">
    <span aria-hidden className="...">{/* checkbox/radio glyph */}</span>
    <span>{label}</span>
  </span>
</button>
```

The selected state is **always**: `border-teal bg-teal/8 text-teal-dark shadow-sm`. Do not invent variants.

**Focus ring is non-negotiable on every button:**
`focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream`.

---

## 5. Result-Card Hierarchy

Result screens have three card tiers. Use them in this order, do not skip.

**Tier 1 — Band card** (the "headline" decision/score). Bigger padding, **tinted background** (not just ringed):

```tsx
<div className="rounded-2xl bg-sage/12 ring-1 ring-inset ring-sage/25 px-7 py-8 sm:px-10 sm:py-10">
  {/* big number / headline / one-line summary */}
</div>
```

Tone classes are sage / mustard / teal-dark — the band picks one based on result severity. Numbers go `text-6xl font-display font-bold tabular-nums text-teal-dark`.

**Tier 2 — Content cards** (per-pattern explanations, action items, list rows):

```tsx
<li className="rounded-xl bg-cream/70 border border-teal/10 p-5 sm:p-6">
  {/* numbered chip + title + body */}
</li>
```

Numbered list items use a sage- or teal-dark- filled circle as the index chip:

```tsx
<span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-dark text-cream font-display font-bold text-sm tabular-nums">
  {i + 1}
</span>
```

**Tier 3 — Closing reframe** (the gut-line at the bottom). Always `bg-teal-dark/8 border border-teal-dark/15`:

```tsx
<div className="rounded-2xl bg-teal-dark/8 border border-teal-dark/15 px-6 py-6 sm:px-8 sm:py-7">
  <p className="font-display font-semibold text-base text-teal-dark leading-relaxed max-w-prose">
    ...
  </p>
</div>
```

This card is the last thing the parent sees on the result screen, before the share-card and disclaimer. It zooms out from the tool to the industry / society level.

---

## 6. Accent Colors

Stick to the brand palette. Each color carries one meaning on the tool surface.

| Color | Use |
| --- | --- |
| `sage` (#50a082) | Positive states, growth, cleared answers, progress fills, "what works" lists |
| `mustard` / `mustard-soft` | Warm attention, reward, vorlesen-style highlight cards. **Never alert.** |
| `teal-dark` | Gravitas, destinations (`Bettzeit` card), closing reframe, primary CTAs |
| `teal` | Eyebrows, links, mid-band tones, selected-state borders |
| `cream` / `cream/70` / `cream/80` | All neutral surfaces, content-card backgrounds |
| `ink/55` to `ink/80` | Body copy text (lighter for hints, darker for body) |

**Do not use** `clay`, red, or any "danger" hue. These tools are not verdicts. Severity is communicated by **list density and copy specificity**, not by alarm color.

The full palette and the "mustard never as alert" rule come from `DESIGN.md` and are load-bearing.

---

## 7. Typography

Locked to two families on the website:

| Family | Use |
| --- | --- |
| `font-display` (Plus Jakarta Sans) | Headings, eyebrows, buttons, big numbers, labels, step titles |
| `font-body` (Be Vietnam Pro) | Body paragraphs, explainer text, italic vignettes |

Rules:

- H1 noun is always wrapped in `<em className="italic text-sage">…</em>`.
- Big numeric displays (scores, times, counts): always `tabular-nums`.
- Eyebrows: `text-xs uppercase tracking-[0.2em] text-teal font-semibold`.
- Body: `text-base sm:text-lg text-ink/75 leading-relaxed`. Never below `text-sm` for read-content.
- Long paragraphs cap at `max-w-prose` so line length stays readable.
- Hyphenation and `text-wrap: balance` (h1/h2/h3) / `text-wrap: pretty` (p) are inherited from `globals.css`. Don't fight them.

---

## 8. Motion Contract

All tools obey the same rules. They live in `lib/motion.ts`.

```tsx
import { EASE_OUT, fadeUp } from '../../lib/motion';
import { motion, useReducedMotion } from 'motion/react';

const reduced = useReducedMotion();
```

**Rules:**

- Every entrance respects `useReducedMotion`. Pattern: `initial={reduced ? false : { opacity: 0, y: 10 }}` and `transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }}`.
- Use `EASE_OUT` from `lib/motion`. Never inline a cubic-bezier.
- `whileInView` (with `viewport={{ once: true, margin: '-10%' }}`) for body sections on long result pages so they have rhythm.
- `animate` for state-change driven motion (step changes, value updates).
- Press feedback on primary buttons: `whileTap={reduced ? undefined : { scale: 0.98 }}`. Quiet, not celebratory.
- List staggers: `delay: i * 0.05` to `0.1`. Never longer.
- Number count-ups (e.g. score) use `useMotionValue` + `animate` with ~700ms duration. Skip entirely under reduced motion.

---

## 9. Accessibility Minimum

Every tool must pass:

- `focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream` on every interactive element.
- `aria-pressed` on toggles, `role="tab"` on tab pills, `role="radio"` / `role="checkbox"` with `aria-checked` on choice cards, `role="radiogroup"` / `role="tablist"` on the container.
- `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` on every progress bar.
- `aria-live="polite"` (or use `role="alert"` for errors) on dynamic regions that update without navigation.
- Minimum 44px touch target on every button (use `py-2.5` minimum, `py-3` for primary).
- Loading states announce via `<span className="sr-only">Lade…</span>` alongside the visual skeleton.
- Text-only escape hatches (e.g. "Weiß ich nicht") on mobile so the primary pair stays visually clean.

---

## 10. Iconography

Inline SVG only. No icon font, no lucide-react.

**Reusable icons live in `components/AppCheck/Icons.tsx`.** Add to that file rather than inlining new SVGs in pages.

Style spec:

- viewBox `0 0 24 24`, `stroke="currentColor"`, `fill="none"`
- `strokeWidth={2}` (or `2.5` for chunkier presence on CTAs)
- `strokeLinecap="round"`, `strokeLinejoin="round"`
- `aria-hidden="true"`, `focusable="false"`

```tsx
<ArrowRight className="transition-transform group-hover:translate-x-0.5" />
```

**Bullet markers** in lead/explainer lists are sage dots:

```tsx
<span aria-hidden className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
```

**No emoji in chrome.** Ronki signature emoji (🐉) is reserved for kid-facing print pieces, never the tool surface.

---

## 11. Copy Voice

Marc's brand-voice rules from `CLAUDE.md` apply to every string:

- **No em-dashes or en-dashes anywhere.** Periods, commas, colons, semicolons.
- **No AI-slop vocab:** Landscape, Journey, Delve, Realm, Tapestry, navigate, impeccable, seamless, robust, paradigm, leverage, unlock, empower, holistic, synergy.
- **No AI-smooth parallel triplets** ("Kein Fluff. Kein Lifehack. Nur was passiert ist."). Prefer slightly stumbling sentences with conversational qualifiers ("ehrlich gesagt", "kurz vorweg", "in der Zeit").
- **German first, du-form, parent-to-parent.** Calm, practical, not startup-y.

**Tool-specific patterns:**

- Result statements use **"Aus deiner Sicht"** framing, never "this app is X" / "your kid needs Y".
- Every tool ends with a closing reframe paragraph that zooms from the tool result to the industry pattern (gut-line, parent-attested, never product-pitch).
- Disclaimers say "Du bewertest, wir geben dir den Rahmen." — see § 13.

After any string change, sweep for em-dashes: `Grep pattern='—'` across touched files.

---

## 12. Share-Out Grammar

Every tool produces **one** parent-to-parent share artifact (currently a 1200×675 PNG, OG aspect). Family of components: `ShareCard`, `CharterShareCard`, `SchlafensShareCard` (all in `components/AppCheck/`).

**Visual grammar (load-bearing, do not improvise):**

- Background: cream `#FDF8F0`
- Top-left mustard glow: radial gradient, `rgba(252,211,77,0.32)` → transparent, ~380px radius
- Bottom-right sage glow: radial gradient, `rgba(80,160,130,0.30)` → transparent, ~420px radius
- Top eyebrow: `RONKI · <TOOL NAME>` in Plus Jakarta 18px 600 weight, teal
- Headline / number block: Plus Jakarta bold, teal-dark, big (56-200px depending on density)
- Bottom strip: solid teal-dark `#0E2A2C`, 64px tall, with `ronki.de/tools/<slug>` left and a tagline right (`rgba(253,248,240,0.7)`)
- DPR 2 for retina + LinkedIn upscale
- `await ensureFontsReady()` before drawing

**Brand-safety check:**

- Every claim on the card is parent-attested (their score, their times, their family name).
- No Ronki-asserted product claim about a specific app or kid.
- Watermark = the brand strip + URL, nothing louder.

For Charter, the A4 portrait `CharterPreview` is a separate artifact (printable, NOT the share card). Both surfaces can coexist.

---

## 13. Legal / Disclaimer

`<ToolDisclaimer variant="..." />` renders at the bottom of every tool screen. Three variants:

| Variant | When | Copy |
| --- | --- | --- |
| `tool` | Live tool surface (landing, entry, quiz, result before save) | "Du bewertest, wir geben dir den Rahmen." |
| `result` | Result screen on the live tool | "Diese Bewertung basiert auf deinen Antworten. Sie ist deine Einschätzung der App-Mechaniken aus deiner Erfahrung, kein verifizierter Test." |
| `saved` | Permalink page for a saved result | "Diese Bewertung gibt die Beobachtungen einer Person wieder. Sie ist keine Aussage von Ronki über die App." |

The disclaimer is `text-sm text-ink/55 italic max-w-prose leading-relaxed`. Never restyle.

**Three persistent legal anchors** stay in the global `Footer`: Impressum, Datenschutz, AGB. No tool overrides.

---

## 14. Consistency Checklist

Run through this before merging a new tool. Every box must tick.

1. ☐ `PainterlyShell` + `PageMeta(canonicalPath)` + `Footer` wrap.
2. ☐ Header: back link → `text-xs uppercase tracking-[0.2em] text-teal font-semibold` eyebrow → H1 with `<em className="italic text-sage">` on the key noun → `max-w-2xl` lead paragraph.
3. ☐ Hero padding `pt-32 pb-12 sm:pt-40 sm:pb-16`. Container `max-w-3xl mx-auto`.
4. ☐ Multi-step tools have `role="progressbar"` with `bg-sage` fill and `Schritt X von Y · {title}` line above.
5. ☐ Selected-state grammar on choice inputs is **exactly** `border-teal bg-teal/8 text-teal-dark shadow-sm` (or the compact `bg-teal text-cream` for radio chips).
6. ☐ Every interactive element has `focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream`.
7. ☐ Result page uses the three-tier card hierarchy: tinted band card → cream content cards → teal-dark/8 closing reframe.
8. ☐ Big numbers and time displays carry `tabular-nums`. Headings use `font-display`, body uses `font-body`.
9. ☐ All motion uses `EASE_OUT` from `lib/motion` and respects `useReducedMotion` (no exceptions). Press scale on primary CTAs is 0.98, never lower.
10. ☐ One share artifact (1200×675 PNG with cream + mustard TL glow + sage BR glow + teal-dark strip) is offered, **and** `<ToolDisclaimer variant="..." />` sits at the bottom of every screen. No em-dashes, no AI-slop vocab.

---

## Adapted by tool / screen example

How the patterns map onto the four shipped tools.

| Pattern | App-Check | Schlafens-Rechner | Familien-Charter | Konsolen-Check |
| --- | --- | --- | --- | --- |
| Shell + container | `max-w-3xl`, full hero padding | same | same | same |
| Header eyebrow | `Werkzeug für Eltern` (landing); `Schritt X von 3 · {appName}` (quiz) | `Werkzeug für Eltern` | `Werkzeug für Eltern` | `Werkzeug für Eltern` |
| H1 italic-sage noun | "App will dein **Kind**?" / "Welche App willst du **prüfen**?" / "Deine **Bewertung**." | "...ins **Bett**?" | "Eure **Familien-Medien-Charter**." | "Vorher **denken**." |
| Step / progress | Slide-direction quiz (10 questions), separate progress bar inside `QuestionScreen` | Single page (no steps) | 6 steps + preview, `bg-sage` progress bar | 6 steps + result, `bg-sage` progress bar |
| Choice input | Pill toggle (curated/free) + dropdown + Yes/No/Unklar buttons (`QuestionScreen`) | Compact radio chips (ages, time input) | `ChoiceGroup` large checkbox cards | `ChoiceGroup` large radio cards |
| Band card | `ResultScore` tinted by score (sage/mustard/serious tones) | "Stunden Schlaf" callout above schedule grid | "Eure Charter-Vorschau" (the A4 preview itself) | "Euer Profil für {Plattform}" headline card |
| Content cards | Per-flagged-question explainer (`bg-cream/70 border-teal/10`) | 4 schedule step cards (sage/mustard/teal-dark backgrounds) | n/a (all input on this surface) | Pro / Kontra / Konfigurations-Checkliste lists |
| Closing reframe | "Was du gerade beobachtet hast, ist nicht die Ausnahme..." | "Das ist ein Vorschlag, kein Dogma..." | n/a (printable IS the artifact) | "Diese Liste ist Anker, kein Vertrag..." |
| Share artifact | `ShareCard` 1200×675 PNG | `SchlafensShareCard` 1200×675 PNG | `CharterShareCard` 1200×675 PNG **plus** A4 print preview | none yet (candidate for next polish pass) |
| Disclaimer variant | `tool` on entry/quiz, `result` on score, `saved` on permalink | `tool` | `tool` | `tool` |
| Permalink path | `/tools/app-check/r/:id` (Supabase-backed) | none (results are pure math, no save) | none (artifact is the print/PNG) | none |

---

## Files to read when in doubt

- `website/src/pages/tools/AppCheck.tsx` — reference for state-machine tools with permalink saves.
- `website/src/pages/tools/SchlafensRechner.tsx` — reference for single-page calculator tools.
- `website/src/pages/tools/FamilienCharter.tsx` — reference for multi-step input + printable artifact tools.
- `website/src/pages/tools/KonsolenCheck.tsx` — reference for multi-step + on-page result tools.
- `website/src/components/AppCheck/ResultScore.tsx` — reference for layered result composition.
- `website/src/components/AppCheck/ShareCard.tsx` — reference for canvas-rendered share PNGs.
- `website/src/components/AppCheck/ToolDisclaimer.tsx` — the three legal variants.
- `website/src/lib/motion.ts` — easing curves and `fadeUp` helper.
- `.basic-memory/DESIGN.md` — palette, typography, motion, do's and don'ts.
- `louis-quest/CLAUDE.md` — brand-voice rules (em-dashes, AI-slop, du-form).

---

# Hub / Index Page Patterns

The §1-§14 rules cover individual tool screens. The next six sections cover the `/tools` hub itself — and any future hub-style listing surface (e.g. a `/ratgeber` redesign, a homepage "featured tools" rail). They were derived from a four-agent audit of `ToolsHub.tsx` on 25 Apr 2026 and codify the carve-outs the standard previously left implicit.

## §15 — Hub / Index Page Variant

A `/tools` index page is its own page type. It sits inside `PainterlyShell`, uses the same hero padding (`pt-32 pb-12 sm:pt-40 sm:pb-16`), and the same `max-w-4xl` exception called out in §1, but it overrides three rules from §2 / §13:

| Rule on tool detail page | On a hub/index page |
| --- | --- |
| Back-link target = `/tools`, label = `Werkzeuge` | Target = `/`, label = `Startseite` |
| Eyebrow = `Werkzeug für Eltern` (singular) | Eyebrow = `Werkzeug für Eltern` (singular, same string) — the H1 plural carries the count |
| `<ToolDisclaimer />` renders at bottom | No disclaimer (the hub makes no per-app claims; per-tool disclaimers fire on the tool detail pages) |

**Apply once per surface that lists tools rather than runs one.** A future `/vorlagen` or `/ratgeber` redesign that uses card-grid composition inherits this rule.

## §16 — Tool-Card Composition

Every card on the hub follows a strict shape:

```
eyebrow (tool name, ALL-CAPS, tracking-[0.18em])
H2 (the tool's own H1 question, abbreviated to ≤ ~12 words, text-2xl)
description (1-2 sentences in Marc-voice, text-sm)
meta line (text-xs, tabular-nums, "<duration> · <output artifact>")
CTA "Werkzeug öffnen" + ArrowRight icon
```

The whole card is a single `<Link>` (entire surface is the hit target — no separate CTA button). Card container uses `rounded-2xl p-7` plus the tone-driven background classes from §17. The 4mm `mustard → sage → teal` ribbon at the top is on by default; it disappears on the `teal` tone variant where it would clash with the inverted background.

**Apply to every card representing a tool, anywhere on the marketing site** — including future homepage "featured tools" placements. Card titles use the parent's question/scenario, not the tool's marketing name (the eyebrow handles naming).

## §17 — Hub Card Tone Rotation

A 2x2 hub grid where every card is the same shape and color reads as a corporate features grid, not a painterly toolbox. Solve by rotating accent tones across the grid:

| Position | Tone | Background |
| --- | --- | --- |
| 1 (top-left) | `cream` | `bg-cream/70 backdrop-blur-sm border border-teal/10` |
| 2 (top-right) | `sage` | `bg-sage/15 ring-1 ring-inset ring-sage/30 border border-transparent` |
| 3 (bottom-left) | `mustard` | `bg-mustard-soft/55 ring-1 ring-inset ring-mustard/35 border border-transparent` |
| 4 (bottom-right) | `teal` | `bg-teal-dark ring-1 ring-inset ring-teal-dark/40 border border-transparent`; eyebrow `text-mustard`, title `text-cream`, description `text-cream/85`, meta `text-cream/55`, CTA `text-mustard` |

Card 4 (`teal`) doubles as the page's required dark-teal anchor (§5) — when the parent's eye lands there last the grid resolves into a real composition. **All four tones are equal in semantic weight** — the rotation is rhythm, not hierarchy. See §20 for the no-featured-card rule.

The tone choice per position is **fixed**: the visual rhythm depends on the same colors landing in the same slots across visits. Don't reassign tones based on tool importance.

## §18 — Tool Meta-Line Format

The `meta` line under each card description is the parent's "what do I get for my time" promise. Format is locked:

```
<duration> · <output artifact>
```

- **Duration** is human-rounded (`30 Sek`, `3 Min`, `5 Min`). Never minutes-with-decimals, never ranges. If a tool genuinely takes 4-7 minutes, round up to `5 Min`.
- **Separator** is the middle dot ` · ` (U+00B7). Never em-dash, never bullet, never hyphen.
- **Output artifact** is the concrete deliverable, named in plain prose: `vier Uhrzeiten + Share-Bild` / `Score + Erklärungen + teilbarer Permalink` / `Druckbar als PDF + Social-Card` / `Pro/Kontra + Plattform-Checkliste`. Use `+` (not `und`) to keep the parallel between artifact components scannable.
- **Class:** `text-xs tabular-nums` plus the tone-driven color from §17 (`text-ink/55` on cream, `text-cream/55` on teal-dark, etc.)

**Apply to every tool card and to the H1-adjacent subhead on individual tool landing pages.** The meta line on the hub card and the meta line on the tool's own landing page should match exactly — drift between them is a content bug.

## §19 — Hub "Vermisst du was?" Closing Block

A hub page ends with a single closing block that doubles as the page's dark-teal anchor (the cards themselves are too small to anchor) and a Marc-voice trust signal. Pattern:

```tsx
<div className="rounded-2xl bg-teal-dark px-7 py-8 sm:px-10 sm:py-9">
  <p className="text-xs uppercase tracking-[0.2em] text-mustard font-semibold mb-3">
    Vermisst du was?
  </p>
  <p className="font-display font-semibold text-base sm:text-lg text-cream leading-relaxed max-w-prose">
    {/* 2-3 sentences in Marc voice, parent-to-parent, ends with a real ask */}
  </p>
  <a href="mailto:hallo@ronki.de" className="... text-mustard ...">
    hallo@ronki.de <ArrowRight />
  </a>
  <p className="mt-4 text-xs text-cream/55">Marc, Vater von Louis (8)</p>
</div>
```

**Apply once per hub.** The "Vater von Louis (8)" credit is the only place on a non-About page where founder-voice is justified — it earns the right to be there because the block is asking parents to co-shape the roadmap. **Do not** use this pattern on tool detail pages (their closing-reframe pattern is different, see §5 Tier-3).

**Resist any "Coming Soon" placeholder cards** in the grid above. The promise of every tile being shippable today is part of the page's trust signal. Roadmap conversation belongs in this block, not in the grid.

## §20 — Equal Tool Treatment (no Featured slot)

On the hub, all tools render with identical structural weight:

- Same card size, same padding, same H2 size
- No "featured", "new", "popular", "beta" badge variants
- No "first-class" position that gets a 2x card or a different layout
- The order of the four cards is intentional but **unsignalled** in the visual treatment

The tone rotation (§17) provides visual rhythm, not hierarchy.

If a featured-tool slot is ever genuinely needed (e.g. a homepage hero that points to one specific tool), it lives on a **different surface** (the homepage), not on the hub. This protects the page's "the parent picks, we don't push" principle — the same principle that earns the right to make anti-engagement claims elsewhere on the site.

**Apply on `/tools` and on any future hub-style listing.** This rule has teeth: any product / marketing pressure to "feature the new tool" gets resolved by adding the featured callout on the homepage, never by deforming the hub grid.

---

## §14 (extended) — Pre-merge consistency checklist for hub pages

In addition to §14 1-10, hub/index pages need:

11. ☐ Back-link target is `/`, label is `Startseite` (per §15).
12. ☐ Eyebrow is `Werkzeug für Eltern` (singular). H1 plural carries the count.
13. ☐ Each card uses the locked tone for its position (§17). Tone classes match the table exactly.
14. ☐ The 4mm gradient ribbon is present on `cream` / `sage` / `mustard` cards, **absent** on the `teal` card.
15. ☐ Card titles are the parent's question, ≤ ~12 words. Card eyebrows hold the tool name.
16. ☐ Meta lines follow `<duration> · <output artifact>` exactly. Middle-dot separator (·), not em-dash.
17. ☐ Each card carries `motion.li` with stagger `delay: 0.08 + index * 0.05`. The grid does not pop in dead.
18. ☐ The closing `Vermisst du was?` block is present, teal-dark, with mustard eyebrow + `Marc, Vater von Louis (8)` credit.
19. ☐ No `<ToolDisclaimer />` (per §15 carve-out).
20. ☐ No "Coming Soon" / placeholder cards in the grid. Roadmap signal belongs in the closing block.

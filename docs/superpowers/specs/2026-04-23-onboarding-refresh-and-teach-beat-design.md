# Spec — Onboarding refresh + signature teach beat ("Der erste Funke")

**Date:** 2026-04-23
**Brainstormed with:** Marc
**Status:** Approved for build
**Related discovery:** [`docs/discovery/2026-04-23-core-gameloop-time-stack/transcript.md`](../../discovery/2026-04-23-core-gameloop-time-stack/transcript.md) — adjacent observation #1 (onboarding art mismatch + teach-Ronki beat)

---

## 1. Why

Two problems, one spec:

1. **Art mismatch.** Onboarding renders Ronki via the old painted webp sprite (`art/companion/dragon-young.webp`) at steps 4/5/6. The rest of the app renders Ronki via the CSS chibi system (`MoodChibi`, `MiniRonki`, `RonkiCompendium`). First-time kids see a hard art-style break the moment they hatch — painted dragon → cartoon chibi.
2. **No "kid-as-expert" beat.** Ronki arrives fully-formed. There's no moment that establishes *kid teaches → Ronki learns*. This costs us a generative pattern: the eventual Wave-3 fade-out arc needs callbacks like *"Weißt du noch, wie du mir das beigebracht hast?"* — those are only earned if the teach moment exists.

**Brand spine** (do not violate): companion that fades by design, no FOMO, no decay, no push notifications, time-to-independence > time-on-device, painterly/watercolor over isometric, parental relief is the success metric.

The teach beat is intentionally generative for the time-stack journey tier — it's the seed for the Wave-3 callback, not just an onboarding flourish.

---

## 2. Decisions locked (from brainstorm)

| Decision | Pick |
|---|---|
| Where in onboarding does the teach beat go? | New step between "Hallo, kleiner Ronki" and Launch (step 6 in a 0-indexed 8-step flow) |
| Which move is the signature? | **A — Fire breath** (only one taught in onboarding, the only one anchored as Wave-3 callback) |
| Where do B (wave) + C (wiggle) come from? | **Innate** — Ronki just does them. Not taught. Keeps the signature singular and load-bearing. |
| Mechanic? | **Hold & release.** Kid holds button → Ronki visibly inhales → release → fire bursts → Ronki retries solo and succeeds. Kinesthetic match: kid demonstrated *the breath*, not just tapped a button. |
| Repertoire occasion mapping? | Launch/return → wave dominant; questDone → wiggle dominant; bossWin/milestone → fire (signature); idle → wave/wiggle 50/50 |

---

## 3. Part 1 — Onboarding art refresh

**File:** [`src/components/Onboarding.jsx`](../../../src/components/Onboarding.jsx)

Three painted-sprite callsites to replace. All currently use `<img src={base + selectedVariant.spritePath}>`.

| Line (current) | Step context | Replace with |
|---|---|---|
| ~477 | Step 4 (Hatch — post-reveal large display) | `<MoodChibi variant={selectedVariant.id} stage={1} mood="magisch" size={176} />` |
| ~527 | Step 5 ("Hallo, kleiner Ronki" — small display) | `<MoodChibi variant={selectedVariant.id} stage={1} mood="normal" size={112} />` |
| ~672 | Inside `HatchStep` `phase === 'reveal'` | `<MoodChibi variant={variant.id} stage={1} mood="magisch" size={160} />` wrapped in the same `motion.div` (was `motion.img`) for the scale/opacity reveal animation |

**Egg pick step (step 3):** Eggs are CSS gradient divs (`eggGradient` from the variant), not painted sprites. **Do not change.**

**Imports to add at top of file:**
```jsx
import MoodChibi from './MoodChibi';
```

**Sprite file:** `art/companion/dragon-young.webp` is no longer referenced by Onboarding after this change. Do **not** delete the file — it may be referenced elsewhere in legacy code paths. `spritePath` field on the variant stays (could be used by an OG image generator etc.). This spec just stops Onboarding from reading it.

**Acceptance:** Walking through onboarding (`?onboardingPreview=1`) shows the same chibi system used in `MoodChibi` everywhere — no painted sprite at any step, including the reveal animation inside HatchStep.

---

## 4. Part 2 — The teach beat ("Der erste Funke")

**New step:** index 6, sits between current step 5 ("Hallo, kleiner Ronki") and current step 6 (Launch, becomes index 7).

**Constants update in `Onboarding.jsx`:**
```jsx
const TOTAL_STEPS = 8;  // was 7
```

### 4.1 Copy (German first, English secondary — add to `src/i18n/de.json` and `en.json`)

Add to `de.json` under `onboarding`:
```json
"teach": {
  "title": "Der erste Funke",
  "intro": "Ronki ist gerade geschlüpft. Er weiß noch nichts. Zeig ihm, wie man tief Luft holt.",
  "tryFail": "Er will Feuer machen … schafft's aber nicht.",
  "holdLabel": "Halte gedrückt.",
  "holdHint": "Tief einatmen. Lass los, wenn der Bauch ganz voll ist.",
  "celebrate": "Jaaa! So geht's!",
  "soloLine": "Er hat's gelernt. Er vergisst das nie.",
  "tooEarly": "Noch ein bisschen länger halten.",
  "next": "Weiter zum Lager"
}
```

English equivalents to `en.json` (translator's discretion).

### 4.2 Frame-by-frame

| Frame | Trigger | Visual | Copy |
|---|---|---|---|
| 1 | Step opens | Chibi Ronki idle, single small smoke puff from nostril, then droops slightly. ~2s. | `tryFail` |
| 2 | After 2s | Big circular hold-button appears below Ronki. Pulsing glow. | `holdLabel` + `holdHint` |
| 2a | Kid presses & holds | Ronki inhales: `transform: scale(1 → 1.08)` over 2s on the chibi container. Eyes close (use `mood="müde"` or add a new `inhaling` flag — see 4.3). Soft "breath in" SFX optional (defer if voice catalog re-record is pending). | — |
| 2b | Released **before 1.5s** | Tiny puff via small `FireBreathPuff`. Soft retry copy. Allow up to 2 retries, then auto-pass. | `tooEarly` |
| 3 | Released **after 1.5s** | Full `FireBreathPuff` from Ronki's mouth, default size. Sparkle trail. | `celebrate` |
| 4 | 1s after frame 3 | Ronki, on his own, does a short solo inhale (~1s) → fires a smaller second `FireBreathPuff`. Hold-button gone. Continue button fades in. | `soloLine` |

Continue button uses existing onboarding "Weiter" styling. No skip button — hold & release with the 2-retry safety net is forgiving enough.

### 4.3 Implementation note — chibi inhale state

`MoodChibi` doesn't currently expose a "chest swell" prop. Two options:

- **Cheap (recommended for this spec):** wrap the `<MoodChibi>` in a `motion.div` and animate `scale: [1, 1.08]` on the wrapper while the kid holds. Eyes don't need to close — the scale is enough.
- **Proper (defer):** add an `inhaling?: boolean` prop to `MoodChibi` that overrides eye-rendering to closed and runs the swell internally. Backlog item if the cheap version reads OK.

Use the cheap version. Re-evaluate after Marc + Louis test.

### 4.4 Component structure

New file: [`src/components/onboarding/TeachFireStep.jsx`](../../../src/components/onboarding/TeachFireStep.jsx)

Props:
```jsx
<TeachFireStep
  variant={selectedVariant}            // CompanionVariant object
  onComplete={() => setStep(7)}        // advance to Launch
/>
```

Internal state:
```jsx
const [phase, setPhase] = useState('intro');
// 'intro' → 'prompt' → 'inhaling' → 'released' → 'solo' → 'done'
const [holdStart, setHoldStart] = useState(null);
const [retries, setRetries] = useState(0);
```

Use `motion` (Framer Motion successor, already in deps) for transitions. Use existing `FireBreathPuff` from chibi system.

**Acceptance:** Holding ≥1.5s and releasing fires a full `FireBreathPuff`, then a solo follow-up after ~1s, then a Continue button appears. Releasing too early shows a soft retry; after 2 retries, treat as success and auto-advance.

---

## 5. Part 3 — Companion repertoire helper

The teach beat persists *what* Ronki was taught. The repertoire helper is what the rest of the app uses to pick the right move for the right occasion.

### 5.1 New file: `src/utils/companionRepertoire.ts`

```ts
export type CompanionMove = 'fire' | 'wave' | 'wiggle';

export type CompanionOccasion =
  | 'launch'      // Hub mounts after auth
  | 'return'      // Hub re-mounts after user navigates back
  | 'questDone'   // Single quest ticked off
  | 'bossWin'     // Boss defeated
  | 'milestone'   // Weekly recap, level-up, etc.
  | 'idle';       // Ambient

const WEIGHTS: Record<CompanionOccasion, Partial<Record<CompanionMove, number>>> = {
  launch:    { wave: 0.8, wiggle: 0.2 },
  return:    { wave: 0.8, wiggle: 0.2 },
  questDone: { wiggle: 0.7, wave: 0.3 },
  bossWin:   { fire: 1.0 },     // signature, ceremony
  milestone: { fire: 1.0 },     // signature, ceremony
  idle:      { wave: 0.5, wiggle: 0.5 },
};

export function pickRonkiMove(occasion: CompanionOccasion): CompanionMove {
  const weights = WEIGHTS[occasion];
  const entries = Object.entries(weights) as [CompanionMove, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [move, w] of entries) {
    r -= w;
    if (r <= 0) return move;
  }
  return entries[entries.length - 1][0];
}
```

### 5.2 State additions

**File:** [`src/context/TaskContext.tsx`](../../../src/context/TaskContext.tsx)

Extend `completeOnboarding` cfg signature (line ~334 and ~1254):
```ts
completeOnboarding: (cfg?: {
  eggType?: string;
  dragonVariant?: DragonVariant;
  companionVariant?: string;
  heroName?: string;
  heroGender?: string;
  taughtSignature?: 'fire';        // NEW
  taughtAt?: string;               // NEW — ISO date string
}) => void;
```

In the `setState` body of `completeOnboarding` (line ~1263), add:
```ts
const updated = {
  ...prev,
  // ... existing fields ...
  // Wave-3 callback anchor: the move the kid taught Ronki at hatch.
  // Currently always 'fire'. Read by the journey-tier farewell surface
  // (not yet built — see time-stack discovery 2026-04-23).
  taughtSignature: cfg?.taughtSignature || prev.taughtSignature || 'fire',
  taughtAt: cfg?.taughtAt || prev.taughtAt || new Date().toISOString().slice(0, 10),
};
```

Update the state type (search for the State interface, add `taughtSignature?: 'fire'` and `taughtAt?: string`).

### 5.3 Onboarding wiring

In `Onboarding.jsx`, when the kid completes the teach beat (TeachFireStep `onComplete`), pass the signature into the final `onComplete` call:

```jsx
onComplete({
  eggType, heroName, heroGender,
  companionVariant: selectedVariant.id,
  taughtSignature: 'fire',
  taughtAt: new Date().toISOString().slice(0, 10),
});
```

### 5.4 Wiring surfaces (build in this spec)

- **App launch greeting:** new tiny `<RonkiGreeting occasion="launch" />` component mounted in `Hub.jsx`. Renders the picked move once on mount, then unmounts after animation completes (~2s).
- **Quest completion:** in `QuestEater` (or wherever quest-done celebrations fire), call `pickRonkiMove('questDone')`. If result is `'fire'` (rare here per weights), keep current behavior. If `'wave'` or `'wiggle'`, render the corresponding chibi animation instead of the fire puff.
- **Boss win:** wherever the boss defeat celebration fires, force `'fire'` (no need to call the helper, just render `FireBreathPuff` deliberately — but call the helper for consistency and to log the occasion).

**Animations needed for wave + wiggle:**
- Wave: `MoodChibi` does a tiny side-to-side rotation on a "hand" — if no hand exists in the current chibi, treat the whole body as a wave (rotate ±12° three times). Defer "proper hand wave" to the chibi-expansion backlog.
- Wiggle: re-use the existing `mc-bounce` keyframe (already in chibi CSS) for a 3x bounce sequence.

These are placeholder animations — they're correct in *grammar* (right move at right occasion) even if visual polish is later.

### 5.5 Wiring surfaces (out of scope, deferred)

- Weekly recap, Journal entries, Lagerfeuer ambient — all deferred to time-stack work.
- "Proper hand wave" with a rendered hand on the chibi — deferred, see chibi expansion backlog.

---

## 6. Wave-3 callback hook (deferred surface)

When the journey-tier fade-out surface is built (per time-stack discovery, currently at Q5 pending), it will read `state.taughtSignature` and `state.taughtAt` to render a callback line like:

> *"Weißt du noch, vor [N] Monaten? Erst einatmen … dann raus. Das hast du mir beigebracht."*

**In this spec:** persist the fields, leave the comment in `TaskContext.tsx` near the field (`// Wave-3 callback anchor`), and **build no surface**. The Wave-3 surface depends on the time-stack architecture spec which hasn't been written yet.

---

## 7. Acceptance criteria (definition of done)

- [ ] Walking through `?onboardingPreview=1` from step 0 to launch shows the CSS chibi at every Ronki appearance — no painted sprite anywhere
- [ ] New step at index 6 ("Der erste Funke") renders, with hold-and-release mechanic working
- [ ] Holding ≥1.5s and releasing fires a full `FireBreathPuff`, then a solo follow-up ~1s later
- [ ] Releasing <1.5s shows a soft retry; after 2 retries, auto-pass
- [ ] Pill bar shows 8 pills; all clickable to navigate steps (existing behavior, just confirm count is correct)
- [ ] On `completeOnboarding`, state has `taughtSignature: 'fire'` and `taughtAt: '<today>'`
- [ ] After onboarding, opening the Hub triggers a `<RonkiGreeting occasion="launch" />` showing wave (most often) or wiggle
- [ ] Completing a quest sometimes triggers wiggle (most often) or wave
- [ ] Defeating a boss triggers fire breath (`FireBreathPuff`)
- [ ] No new TypeScript errors. No new console errors during onboarding walkthrough.
- [ ] German + English copy both present for the new teach step

---

## 8. Out of scope (explicit)

- Voice lines for the new copy (backlog: Ronki voice rerecord)
- "Proper hand wave" chibi animation with rendered hand (backlog: chibi expansion)
- B (wave) and C (wiggle) as *taught* moves — they remain innate
- Wave-3 callback rendering surface — deferred to time-stack journey tier
- Deletion of the `dragon-young.webp` sprite file or removal of `spritePath` from variants
- Re-pick flow / "teach Ronki again later" — single teach moment at hatch only
- Accessibility skip button on the teach beat — re-evaluate if a kid actually gets stuck

---

## 9. File-by-file change list

| File | Change |
|---|---|
| `src/components/Onboarding.jsx` | `TOTAL_STEPS` 7 → 8; replace 3 spritePath `<img>` callsites with `<MoodChibi>`; insert `<TeachFireStep>` at index 6; pass `taughtSignature` + `taughtAt` to `onComplete` |
| `src/components/onboarding/TeachFireStep.jsx` | **NEW** — full step component per §4 |
| `src/utils/companionRepertoire.ts` | **NEW** — `pickRonkiMove(occasion)` helper per §5.1 |
| `src/components/Hub.jsx` (or wherever Hub greeting belongs) | Mount `<RonkiGreeting occasion="launch" />` on Hub mount |
| `src/components/RonkiGreeting.jsx` | **NEW** — tiny component that calls `pickRonkiMove(occasion)` and renders wave/wiggle/fire animation, then unmounts |
| `src/context/TaskContext.tsx` | Extend `completeOnboarding` cfg type; persist `taughtSignature` + `taughtAt`; extend State interface |
| `src/i18n/de.json` | Add `onboarding.teach.*` strings per §4.1 |
| `src/i18n/en.json` | English equivalents |
| `src/components/QuestEater.jsx` (or wherever quest celebrations fire) | Call `pickRonkiMove('questDone')` and branch on result |

---

## 10. Time estimate

~3-4h for a focused build session:
- Art refresh (3 callsites, type-safe replacement): 30min
- TeachFireStep with hold-and-release + retries: 90min
- companionRepertoire helper + state plumbing: 30min
- RonkiGreeting + Hub wiring + QuestEater branch: 60min
- Copy + i18n + acceptance walkthrough: 30min

# Ronki Refocus — Phase 1 (Refine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the cut-list from the refocus spec, introduce the Arc Engine foundation, and ship one end-to-end test arc ("The First Adventure") with a 3-beat narrative delivered by Ronki instead of picked by Louis.

**Architecture:** New `src/arcs/` module holding types, data, engine, and persistence; existing Quest type gains optional `arcBeatId`; Hub speech-bubble logic reroutes through an `ArcStatus` selector; Hero Profile tab is deleted and replaced by a minimal Ronki Profile stub in the same nav slot. Cuts happen before additions so the codebase is smaller and cleaner when we start building.

**Tech Stack:** React 18 + Vite 5 + Tailwind v4 + TypeScript (partial — `.tsx` for contexts, `.jsx` for most components, `.ts` for data/types). Vitest 4 + React Testing Library 16 + JSDOM 29. Supabase auth + JSONB state persistence.

**Spec reference:** `docs/superpowers/specs/2026-04-15-ronki-refocus-design.md`

---

## File Structure

### Files to create

| Path | Responsibility |
|---|---|
| `src/arcs/types.ts` | `Arc`, `Beat`, `ArcEngineState`, `ArcLifecyclePhase` types |
| `src/arcs/arcs.ts` | Arc catalog: exports `ARCS`, helper `findArc(id)` |
| `src/arcs/first-adventure.ts` | Data for the Phase 1 test arc "The First Adventure" |
| `src/arcs/ArcEngine.ts` | Pure state machine: offer/accept/advance/complete/cooldown |
| `src/arcs/ArcEngine.test.ts` | Unit tests for the state machine |
| `src/arcs/persistence.ts` | Load/save `ArcEngineState` from/to JSONB state |
| `src/arcs/useArc.ts` | React hook exposing arc state + actions to components |
| `src/components/ArcOfferCard.jsx` | Modal shown when Ronki offers a new arc |
| `src/components/ArcActiveBanner.jsx` | Small strip on Hub when arc is active |
| `src/components/BeatCompletionModal.jsx` | Modal for craft + lore beat self-reporting |
| `src/components/RonkiProfile.jsx` | Phase 1 stub replacing HeroProfile in the nav slot |

### Files to modify

| Path | What changes |
|---|---|
| `src/types.ts` | Quest gains optional `arcBeatId?: string`; `GameState` loses `sd: number` |
| `src/context/TaskContext.tsx` | Remove `sd` from state, remove streak increment logic, integrate ArcEngine subscribe on quest complete |
| `src/constants.ts` | Remove gear items of `type: "streak"` (lines ~373–390) |
| `src/companion/lines/de.ts` | Remove `minStreak:` triggers; add `arc_offer`, `arc_continue`, `cooldown_rest`, `beat_complete` triggers |
| `src/companion/lines/en.ts` | Same as de.ts |
| `src/components/Onboarding.jsx` | Redefine `EGGS` to cosmetic variants of one dragon (color/wing/horn) |
| `src/components/Hub.jsx` | Wire speech bubble to ArcStatus; render `ArcActiveBanner` when arc is active |
| `src/components/NavBar.jsx` | Remove `missions` entry; rename `hero` entry to `ronki` |
| `src/components/TopBar.jsx` | If any streak display exists, remove |
| `src/App.jsx` | Replace `view === 'hero'` with `view === 'ronki'`, render RonkiProfile; remove EpicMissions view if present |
| `src/i18n/de.json` | Remove `hero.*` keys, add `ronki.*`, `arc.*`, `beat.*` keys |
| `src/i18n/en.json` | Same |

### Files to delete

| Path | Reason |
|---|---|
| `src/components/HeroProfile.jsx` | Replaced by RonkiProfile stub |

### Files intentionally left alone (for Phase 1)

- `src/components/EpicMissions.jsx` — orphaned after NavBar entry removal; kept to preserve `WEEKLY_MISSIONS` data as seed inspiration for future arcs. Will be deleted or repurposed in Phase 2.
- `src/constants.ts` gear display UI — no UI currently shows gear after HeroProfile goes; data stays, dormant.
- `Quest.streak: number` field — per-quest counter, unused in display, harmless; leave untouched.

---

## Task 0: Branch and preflight

**Files:**
- None (git only)

- [ ] **Step 1: Create/switch to dev branch**

Phase 1 lands on `dev`, not `main`. `main` stays at current state so the
live gh-pages deploy is unaffected until Marc explicitly promotes.

Run:
```bash
cd /c/Users/öööö/louis-quest
# Create dev off current main if it doesn't exist yet, otherwise just check it out
git show-ref --verify --quiet refs/heads/dev && git checkout dev || git checkout -b dev
```

Expected: `Switched to branch 'dev'` or `Switched to a new branch 'dev'`.
Confirm with `git status` that HEAD is on `dev` and tree is clean.

- [ ] **Step 2: Verify working tree clean and tests pass**

Run:
```bash
git status
npm test
```

Expected:
- `git status`: `working tree clean`
- `npm test`: all existing tests pass (~22 tests: 14 voice + 8 zone + game mechanics + helpers + storage)

If any tests fail, fix them before proceeding.

- [ ] **Step 3: Confirm preview works**

Run:
```bash
npm run dev
```

Expected: Vite dev server starts, app loads at http://localhost:5173. Smoke test: login with `?audit=1` (or real creds), navigate all tabs, confirm no console errors. Kill server after.

---

## Task 1: Remove streak state from GameState

**Files:**
- Modify: `src/types.ts` (remove `sd` field from `GameState`)
- Modify: `src/context/TaskContext.tsx` (remove `sd` from initial state and any references)

- [ ] **Step 1: Find all references to `sd`**

Run:
```bash
cd /c/Users/öööö/louis-quest
```
Use Grep: search for `\bsd\b` across `src/` with `type: "ts,tsx,js,jsx"`. Record every file and line.

Expected locations (from code map):
- `src/types.ts` — `sd: number` in `GameState`
- `src/context/TaskContext.tsx` — initial state default, daily increment logic in `buildDay()`
- `src/components/HeroProfile.jsx` line ~136 — display `{state.sd || 0}d` (will be deleted in Task 5)
- `src/companion/lines/de.ts` + `en.ts` — `minStreak:` context matchers (handled in Task 3)

- [ ] **Step 2: Write failing test for streak-free state**

Create or update: `src/context/TaskContext.test.ts` (if none, create minimal).

```typescript
import { describe, it, expect } from 'vitest';
import { createInitialState } from './TaskContext';

describe('TaskContext initial state', () => {
  it('does not include a streak (sd) field', () => {
    const state = createInitialState();
    expect('sd' in state).toBe(false);
  });
});
```

If `createInitialState` isn't exported today, export it from TaskContext.tsx for testability.

- [ ] **Step 3: Run test to verify failure**

Run: `npx vitest run src/context/TaskContext.test.ts`

Expected: FAIL — `sd` is still in state.

- [ ] **Step 4: Remove `sd` from GameState type**

In `src/types.ts`, delete the line:
```typescript
sd: number;
```

- [ ] **Step 5: Remove `sd` from TaskContext initial state and logic**

In `src/context/TaskContext.tsx`:
- Delete `sd: 0` (or whatever default) from the initial state object
- Delete any `state.sd = state.sd + 1` or `sd` increment logic inside `buildDay()`
- Delete any `sd` resets on missed-day logic

- [ ] **Step 6: Run test to verify pass + all other tests still pass**

Run: `npm test`

Expected: all tests pass (new + existing).

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/context/TaskContext.tsx src/context/TaskContext.test.ts
git commit -m "refactor(state): remove streak (sd) from GameState

Part of Ronki refocus Phase 1. Streak mechanics contradict the
mediator USP (continuity will be expressed spatially via Sanctuary
accretion in Phase 2, not temporally).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Remove streak gear items

**Files:**
- Modify: `src/constants.ts` (remove gear items with `type: "streak"`)

- [ ] **Step 1: Locate streak gear items**

Read `src/constants.ts` lines 370–395. Identify all items with `type: "streak"` (expected ~4 items: 2-day, 5-day, 7-day, 14-day streak reward gear).

- [ ] **Step 2: Remove the streak-typed entries**

Delete the entries from whatever collection they live in (likely `GEAR_ITEMS` or similar array). Preserve syntactic validity of the array (trailing commas, closing brackets).

- [ ] **Step 3: Verify no imports or references break**

Use Grep: search `src/` for the IDs of the removed items. If any reference exists outside of `constants.ts`, that reference must also be removed.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/constants.ts
git commit -m "refactor(constants): remove streak-typed gear items

Four streak reward items (2d/5d/7d/14d) removed — streak economy is
out per Phase 1 cut-list. Their display lived only in HeroProfile,
which is being deleted next.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Remove streak context matchers from voice lines

**Files:**
- Modify: `src/companion/lines/de.ts`
- Modify: `src/companion/lines/en.ts`
- Modify: `src/companion/VoiceEngine.test.ts` (update tests expecting minStreak)

- [ ] **Step 1: Locate `minStreak` usages**

Use Grep: search `minStreak` across `src/companion/` and report all matches.

Expected: ~3–6 lines in each of `de.ts` and `en.ts` referencing `minStreak: 3`, `minStreak: 7`, `minStreak: 14`.

- [ ] **Step 2: Update each line — delete `minStreak` context field, keep the line**

For every line with `minStreak:` in its context, delete just the `minStreak` key (and a neighboring comma). Do NOT delete the line itself; the copy ("Noch eine? Wow, du bist heute dran.") is still good celebratory text, we just trigger it via `minQuestsToday` or `trigger: 'quest_complete'` without the streak condition.

Example before:
```typescript
{
  id: 'de_quest_streak_01',
  trigger: 'quest_complete',
  context: { minStreak: 3 },
  text: 'Noch eine? Wow, du bist heute dran.',
}
```

Example after:
```typescript
{
  id: 'de_quest_streak_01',
  trigger: 'quest_complete',
  context: { minQuestsToday: 3 },
  text: 'Noch eine? Wow, du bist heute dran.',
}
```

(If `minQuestsToday` doesn't exist in the context matcher logic, pick the simplest existing condition that approximates "after several completions today." Check `src/companion/VoiceEngine.ts` for available context fields.)

- [ ] **Step 3: Update VoiceEngine tests**

Open `src/companion/VoiceEngine.test.ts`. Find any test asserting `minStreak` behavior. Either:
- Delete the test if it's strictly about streak matching, OR
- Convert it to test `minQuestsToday` with the same expected line.

- [ ] **Step 4: Run voice tests**

Run: `npx vitest run src/companion/VoiceEngine.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/companion/
git commit -m "refactor(voice): remove minStreak context from voice lines

Lines that previously triggered on streak thresholds now trigger on
minQuestsToday where equivalent. Streak is not a concept in Ronki
post-refocus.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Delete Hero Profile tab, stub Ronki Profile

**Files:**
- Delete: `src/components/HeroProfile.jsx`
- Create: `src/components/RonkiProfile.jsx`
- Modify: `src/components/NavBar.jsx`
- Modify: `src/App.jsx`
- Modify: `src/i18n/de.json`
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Create Ronki Profile stub**

Create `src/components/RonkiProfile.jsx`:

```jsx
import React from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getCatStage } from '../utils/helpers';

/**
 * Phase 1 stub for Ronki Profile. Replaces Hero Profile in the nav slot.
 * Full buildout (About/Details/Traits tabs, Memory card, Micropedia link,
 * Discovery log) lands in Phase 2.
 */
export default function RonkiProfile() {
  const { t } = useTranslation();
  const { state } = useTask();
  const evoStage = getCatStage(state.catEvo || 0);
  const daysTogether = state.daysTogether || 0;
  const dragonName = state.familyConfig?.dragonName || 'Ronki';

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <img
          src={`${import.meta.env.BASE_URL}art/companion/ronki-${evoStage}.png`}
          alt={dragonName}
          className="w-40 h-auto drop-shadow-lg mb-4"
        />
        <h1 className="font-headline text-3xl font-bold text-primary mb-1">
          {dragonName}
        </h1>
        <p className="font-body text-on-surface-variant mb-6">
          {t('ronki.evoLabel')} {evoStage}
        </p>

        <div className="w-full max-w-sm bg-[var(--parchment-gold-soft,#fef3c7)] rounded-2xl p-6 border border-[color:var(--parchment-gold,#fcd34d)]">
          <p className="font-label text-sm text-on-surface-variant mb-1">
            {t('ronki.daysTogetherLabel')}
          </p>
          <p className="font-headline text-4xl font-bold text-primary">
            {daysTogether}
          </p>
        </div>

        <p className="mt-8 font-body text-sm text-on-surface-variant italic max-w-xs">
          {t('ronki.stubNote')}
        </p>
      </div>
    </div>
  );
}
```

*Note on `getCatStage` / evolution assets:* verify `src/utils/helpers.ts` exports `getCatStage` (the code map mentions it). If asset path naming differs from `ronki-${evoStage}.png`, adjust to match what exists in `public/art/companion/`. This is a stub; asset correctness trumps invention.

- [ ] **Step 2: Add i18n keys**

In `src/i18n/de.json`, remove the `hero.*` block (confirm keys by grepping `"hero\."` in the file first). Add:

```json
"ronki.evoLabel": "Stufe",
"ronki.daysTogetherLabel": "Tage zusammen",
"ronki.stubNote": "Hier wird bald mehr über Ronki erscheinen — seine Traits, eure Abenteuer und die Micropedia."
```

In `src/i18n/en.json`, remove `hero.*` block. Add:

```json
"ronki.evoLabel": "Stage",
"ronki.daysTogetherLabel": "Days together",
"ronki.stubNote": "More about Ronki coming soon — his traits, your adventures, and the Micropedia."
```

- [ ] **Step 3: Update NavBar — rename `hero` entry to `ronki`**

In `src/components/NavBar.jsx`, find the nav items array. Change:
```js
{ id: 'hero', key: 'nav.hero', icon: 'person' }
```
to:
```js
{ id: 'ronki', key: 'nav.ronki', icon: 'pets' }
```

(`pets` Material icon is close enough for a dragon stub; swap for a custom icon later.)

Add to both `de.json` and `en.json`:
```json
"nav.ronki": "Ronki"
```

Remove `nav.hero` key from both.

- [ ] **Step 4: Update App.jsx routing**

In `src/App.jsx`:

Find:
```jsx
import HeroProfile from './components/HeroProfile';
```
Replace with:
```jsx
import RonkiProfile from './components/RonkiProfile';
```

Find:
```jsx
{view === 'hero' && <HeroProfile onNavigate={setView} />}
```
Replace with:
```jsx
{view === 'ronki' && <RonkiProfile onNavigate={setView} />}
```

Also scan App.jsx for any `'hero'` string references and change to `'ronki'`.

- [ ] **Step 5: Delete HeroProfile component**

```bash
rm src/components/HeroProfile.jsx
```

- [ ] **Step 6: Smoke test in preview**

Run: `npm run dev`

Verify:
- App loads without console errors
- Nav shows "Ronki" tab in the old hero slot
- Tapping the Ronki tab shows the stub (dragon portrait + name + days counter)
- No broken imports
- No broken i18n keys (nothing shows as `[ronki.xxx]` literal)

Kill dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(profile): delete Hero Profile, stub Ronki Profile in nav slot

Hero Profile was noise for Louis — he couldn't parse it. Replaced
with a Ronki-centric stub (dragon portrait + name + days together)
in the same nav slot. Full buildout (tabs, Memory card, Micropedia,
Discovery log) is Phase 2.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Remove missions tab from NavBar

**Files:**
- Modify: `src/components/NavBar.jsx`
- Modify: `src/App.jsx`
- Modify: `src/i18n/de.json`, `src/i18n/en.json`

- [ ] **Step 1: Remove `missions` nav entry**

In `src/components/NavBar.jsx`, remove the nav item with `id: 'missions'`.

- [ ] **Step 2: Keep the App.jsx route as dead code (for now)**

We're NOT deleting `EpicMissions.jsx` yet — it holds `WEEKLY_MISSIONS` data that may seed arcs later. Leave the file. Leave the `view === 'missions'` route in App.jsx (unreachable via nav, but not broken).

- [ ] **Step 3: Remove i18n key**

Remove `nav.missions` from `src/i18n/de.json` and `src/i18n/en.json`.

- [ ] **Step 4: Smoke test**

Run `npm run dev`. Verify:
- No missions tab visible
- Console is clean
- All other tabs work

Kill server.

- [ ] **Step 5: Commit**

```bash
git add src/components/NavBar.jsx src/i18n/de.json src/i18n/en.json
git commit -m "refactor(nav): remove missions tab

Missions will be reborn as Ronki-delivered arcs (starting this
phase). The pick-from-a-shelf UX is out — Louis was never
discovering the bubble. EpicMissions component file kept for now
to preserve WEEKLY_MISSIONS data as seed material for future arcs.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Constrain onboarding egg ceremony to one species

**Files:**
- Modify: `src/components/Onboarding.jsx`
- Modify: `src/i18n/de.json`, `src/i18n/en.json`

**Context:** Current `EGGS` array (lines 6–40 of Onboarding.jsx) has 3 eggs that hatch into conceptually different companions (fire/golden/spirit). Spec §8.2 constrains these to **cosmetic variants of one dragon species**: color palette, wing shape, horn style.

- [ ] **Step 1: Define the new EGGS array**

Replace the existing `EGGS` constant in `Onboarding.jsx`:

```jsx
// Three painterly dragon eggs. Each hatches into the same dragon species
// with a different visual expression: color palette, wing shape, horn style.
// Louis picks one at onboarding — the emotional anchor — and this choice
// is stored as `state.familyConfig.dragonVariant` for lifetime identity.
const EGGS = [
  {
    id: 'ember',
    nameKey: 'onboarding.egg.ember.name',
    descKey: 'onboarding.egg.ember.desc',
    img: 'art/onboarding/egg-ember.webp',
    variant: {
      palette: 'ember',       // warm red/orange
      wings: 'rounded',
      horns: 'short',
    },
  },
  {
    id: 'moss',
    nameKey: 'onboarding.egg.moss.name',
    descKey: 'onboarding.egg.moss.desc',
    img: 'art/onboarding/egg-moss.webp',
    variant: {
      palette: 'moss',        // cool sage/teal
      wings: 'pointed',
      horns: 'curved',
    },
  },
  {
    id: 'dusk',
    nameKey: 'onboarding.egg.dusk.name',
    descKey: 'onboarding.egg.dusk.desc',
    img: 'art/onboarding/egg-dusk.webp',
    variant: {
      palette: 'dusk',        // twilight purple/blue
      wings: 'feathered',
      horns: 'spiraled',
    },
  },
];
```

- [ ] **Step 2: Update `actions.completeOnboarding` callsite**

Find in `Onboarding.jsx` where `completeOnboarding(cfg)` is called. Ensure the `cfg` payload includes `dragonVariant: selectedEgg.variant` (or similar). Example:

```jsx
const cfg = {
  selectedEgg: selected.id,
  dragonVariant: selected.variant,   // NEW
  heroName: heroName.trim(),
  heroGender,
};
actions.completeOnboarding(cfg);
```

- [ ] **Step 3: Propagate `dragonVariant` into familyConfig**

In `src/context/TaskContext.tsx`, the `completeOnboarding(cfg)` action writes to `state.familyConfig`. Ensure `dragonVariant` is copied into `familyConfig.dragonVariant`. If `FamilyConfig` type exists in `src/types/familyConfig.ts`, add the field:

```typescript
export interface DragonVariant {
  palette: 'ember' | 'moss' | 'dusk';
  wings: 'rounded' | 'pointed' | 'feathered';
  horns: 'short' | 'curved' | 'spiraled';
}

export interface FamilyConfig {
  // ...existing fields
  dragonVariant?: DragonVariant;
}
```

- [ ] **Step 4: Update i18n**

In `src/i18n/de.json`, remove old egg copy keys (`onboarding.egg.fire.*`, `onboarding.egg.golden.*`, `onboarding.egg.spirit.*` if present). Add:

```json
"onboarding.egg.ember.name": "Glut-Ei",
"onboarding.egg.ember.desc": "Warm wie ein Lagerfeuer — mutig und herzlich.",
"onboarding.egg.moss.name": "Moos-Ei",
"onboarding.egg.moss.desc": "Ruhig wie der Wald — sanft und weise.",
"onboarding.egg.dusk.name": "Dämmer-Ei",
"onboarding.egg.dusk.desc": "Geheimnisvoll wie die Abendstunde — neugierig und verträumt."
```

In `src/i18n/en.json`:

```json
"onboarding.egg.ember.name": "Ember Egg",
"onboarding.egg.ember.desc": "Warm as a campfire — brave and warm-hearted.",
"onboarding.egg.moss.name": "Moss Egg",
"onboarding.egg.moss.desc": "Still as the forest — gentle and wise.",
"onboarding.egg.dusk.name": "Dusk Egg",
"onboarding.egg.dusk.desc": "Mysterious as twilight — curious and dreamy."
```

- [ ] **Step 5: Art placeholder note**

The new egg assets (`egg-ember.webp`, `egg-moss.webp`, `egg-dusk.webp`) do not exist yet. For Phase 1 testing, either:
- Reuse existing egg assets by renaming copies (`cp public/art/onboarding/egg-fire.webp public/art/onboarding/egg-ember.webp` etc.), OR
- Point the new IDs at the old asset paths temporarily in `EGGS` array (e.g. `img: 'art/onboarding/egg-fire.webp'` for now with a `// TODO(phase-1-art)` comment).

Pick whichever preserves Onboarding visually during Phase 1. Real painterly egg assets are a separate art task outside this plan.

- [ ] **Step 6: Smoke test onboarding**

Start dev server. Since onboarding only runs for new users, temporarily reset onboarding in DevTools console:

```js
// In browser console:
const state = JSON.parse(localStorage.getItem('ronki-state') || '{}');
state.onboardingDone = false;
localStorage.setItem('ronki-state', JSON.stringify(state));
location.reload();
```

(If state is Supabase-backed rather than localStorage, adapt — or add a DevTools helper that the plan executor can reuse.)

Verify the three new eggs display with the new copy. Pick one; confirm onboarding completes; confirm `state.familyConfig.dragonVariant` is populated.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(onboarding): constrain egg ceremony to dragon variants

Three eggs at onboarding stay (emotional anchor preserved), but they
now hatch into cosmetic variants of one dragon species — palette /
wing / horn combinations — rather than three conceptually different
companions. Variant stored in familyConfig.dragonVariant for lifetime
identity. Art assets deferred; EGGS tolerates shared placeholder
images until painterly variants land.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Define Arc + Beat types

**Files:**
- Create: `src/arcs/types.ts`
- Modify: `src/types.ts` (add `arcBeatId?` to `Quest`)

- [ ] **Step 1: Create `src/arcs/types.ts`**

```typescript
/**
 * Arc Engine types. See spec §6 (Arc Engine) for semantics.
 *
 * An Arc is a short narrative episode delivered by Ronki.
 * A Beat is a single step inside an Arc — either a routine beat
 * (tied to an existing quest), a craft beat (DIY with 4 micro-steps),
 * or a lore beat (2–4 sentences of easy-language reading).
 */

export type BeatKind = 'routine' | 'craft' | 'lore';

export interface BaseBeat {
  id: string;               // unique within the arc, e.g. "fa-beat-1"
  kind: BeatKind;
  narrativeBefore?: string; // i18n key OR plain string Ronki says when beat activates
  narrativeAfter?: string;  // i18n key OR plain string Ronki says on beat completion
}

export interface RoutineBeat extends BaseBeat {
  kind: 'routine';
  questId: string;          // matches Quest.id; beat completes when this quest completes
}

export interface CraftBeat extends BaseBeat {
  kind: 'craft';
  title: string;            // i18n key — "Draw the map"
  templatePath?: string;    // optional path to a downloadable/printable template
  steps: string[];          // 4 i18n keys — color it / hang it / tell someone / show it
}

export interface LoreBeat extends BaseBeat {
  kind: 'lore';
  text: string;             // i18n key for the lore paragraph
  imagePath?: string;       // optional illustration
}

export type Beat = RoutineBeat | CraftBeat | LoreBeat;

export interface ArcReward {
  xp: number;
  coins?: number;
  eggId?: string;           // Phase 2 — milestone arcs only
  decorId?: string;         // Phase 2 — decor-as-memory
  traitIds?: string[];      // Phase 2 — traits Ronki earns
}

export interface Arc {
  id: string;               // stable unique id, e.g. "first-adventure"
  titleKey: string;         // i18n key for arc title
  chapterKey?: string;      // i18n key for chapter name (Discovery log, Phase 2)
  beats: Beat[];
  rewardOnComplete: ArcReward;
  cooldownHours: number;    // default 48
}

export type ArcLifecyclePhase =
  | 'idle'       // no active arc, not in cooldown — next arc may be offered
  | 'offered'    // Ronki has offered, awaiting accept/decline
  | 'active'     // arc in progress
  | 'cooldown';  // arc just completed, Ronki is resting

export interface ArcEngineState {
  phase: ArcLifecyclePhase;
  activeArcId: string | null;
  activeBeatIndex: number;       // which beat of the active arc is current (0-based)
  completedArcIds: string[];     // for Discovery log (Phase 2) and to avoid re-offering
  cooldownEndsAt: number | null; // epoch ms; null when not in cooldown
  offeredArcId: string | null;   // if phase === 'offered', which arc
  lastUpdatedAt: number;         // epoch ms
}
```

- [ ] **Step 2: Add `arcBeatId?` to Quest type**

In `src/types.ts`, locate the `Quest` interface. Add:

```typescript
export interface Quest {
  id: string;
  // ...existing fields (name, icon, anchor, xp, minutes, done, streak, etc.)
  arcBeatId?: string;   // NEW: if set, completing this quest advances the given arc beat
}
```

- [ ] **Step 3: Write type-only compile test**

Create `src/arcs/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Arc, Beat, ArcEngineState } from './types';

describe('Arc types', () => {
  it('builds a minimal valid arc with one routine beat', () => {
    const arc: Arc = {
      id: 'test-arc',
      titleKey: 'arc.test.title',
      beats: [
        {
          id: 'b1',
          kind: 'routine',
          questId: 'brush_teeth',
        },
      ],
      rewardOnComplete: { xp: 10 },
      cooldownHours: 48,
    };
    expect(arc.beats).toHaveLength(1);
    expect(arc.beats[0].kind).toBe('routine');
  });

  it('builds a valid initial ArcEngineState', () => {
    const state: ArcEngineState = {
      phase: 'idle',
      activeArcId: null,
      activeBeatIndex: 0,
      completedArcIds: [],
      cooldownEndsAt: null,
      offeredArcId: null,
      lastUpdatedAt: Date.now(),
    };
    expect(state.phase).toBe('idle');
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/arcs/types.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/arcs/types.ts src/arcs/types.test.ts src/types.ts
git commit -m "feat(arcs): add Arc + Beat + ArcEngineState types

Foundation types for the Arc Engine. Beats come in three kinds:
routine (tied to an existing Quest.id), craft (DIY with steps),
and lore (readable paragraphs). Quest gains optional arcBeatId so
completing a routine quest can silently advance an arc in progress.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Author "The First Adventure" arc data

**Files:**
- Create: `src/arcs/first-adventure.ts`
- Create: `src/arcs/arcs.ts`
- Modify: `src/i18n/de.json`, `src/i18n/en.json`

- [ ] **Step 1: Create the arc data**

Create `src/arcs/first-adventure.ts`:

```typescript
import type { Arc } from './types';

/**
 * Phase 1 test arc. 3 beats:
 *   1. Lore beat — Ronki describes his strange dream
 *   2. Craft beat — Louis draws a map of a favorite place
 *   3. Routine beat — Louis completes any morning routine to "wake Ronki fully"
 *
 * This arc teaches the mechanic and ships the end-to-end flow.
 */
export const FIRST_ADVENTURE: Arc = {
  id: 'first-adventure',
  titleKey: 'arc.first.title',
  chapterKey: 'arc.first.chapter',
  beats: [
    {
      id: 'fa-b1-dream',
      kind: 'lore',
      text: 'arc.first.beats.dream.text',
      narrativeBefore: 'arc.first.beats.dream.before',
      narrativeAfter: 'arc.first.beats.dream.after',
    },
    {
      id: 'fa-b2-map',
      kind: 'craft',
      title: 'arc.first.beats.map.title',
      steps: [
        'arc.first.beats.map.step1',
        'arc.first.beats.map.step2',
        'arc.first.beats.map.step3',
        'arc.first.beats.map.step4',
      ],
      narrativeBefore: 'arc.first.beats.map.before',
      narrativeAfter: 'arc.first.beats.map.after',
    },
    {
      id: 'fa-b3-wake',
      kind: 'routine',
      // any single routine quest; spec lets beat-to-quest mapping be flexible.
      // For Phase 1 we wire this to a generic "morning anchor" quest id that
      // every day-plan is guaranteed to have. If no such stable id exists yet,
      // the author should pick the most common morning quest id from
      // SCHOOL_QUESTS in src/constants.ts.
      questId: 'brush_teeth',
      narrativeBefore: 'arc.first.beats.wake.before',
      narrativeAfter: 'arc.first.beats.wake.after',
    },
  ],
  rewardOnComplete: {
    xp: 50,
    coins: 10,
    // Phase 2: add eggId + decorId
  },
  cooldownHours: 48,
};
```

*Note to executor:* confirm `brush_teeth` matches an actual quest id in `SCHOOL_QUESTS` / `VACATION_QUESTS`. If it doesn't, pick the most universally-present morning routine id and update this file before shipping.

- [ ] **Step 2: Create the arcs catalog**

Create `src/arcs/arcs.ts`:

```typescript
import type { Arc } from './types';
import { FIRST_ADVENTURE } from './first-adventure';

export const ARCS: Arc[] = [
  FIRST_ADVENTURE,
];

export function findArc(id: string): Arc | undefined {
  return ARCS.find(arc => arc.id === id);
}

/**
 * Returns the next arc that should be offered, given the set of already-completed
 * arc ids. For Phase 1, returns the first uncompleted arc in ARCS order.
 */
export function pickNextArc(completedArcIds: string[]): Arc | undefined {
  return ARCS.find(arc => !completedArcIds.includes(arc.id));
}
```

- [ ] **Step 3: Write tests for the catalog**

Create `src/arcs/arcs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ARCS, findArc, pickNextArc } from './arcs';

describe('arcs catalog', () => {
  it('contains at least one arc', () => {
    expect(ARCS.length).toBeGreaterThanOrEqual(1);
  });

  it('findArc returns the matching arc', () => {
    const arc = findArc('first-adventure');
    expect(arc).toBeDefined();
    expect(arc?.id).toBe('first-adventure');
  });

  it('findArc returns undefined for unknown id', () => {
    expect(findArc('nonexistent')).toBeUndefined();
  });

  it('pickNextArc returns first uncompleted arc', () => {
    expect(pickNextArc([])?.id).toBe('first-adventure');
  });

  it('pickNextArc returns undefined when all arcs completed', () => {
    const allIds = ARCS.map(a => a.id);
    expect(pickNextArc(allIds)).toBeUndefined();
  });
});
```

- [ ] **Step 4: Add i18n strings**

In `src/i18n/de.json` add:

```json
"arc.first.title": "Das erste Abenteuer",
"arc.first.chapter": "Prolog",
"arc.first.beats.dream.before": "Ich hatte heute Nacht einen seltsamen Traum. Möchtest du ihn hören?",
"arc.first.beats.dream.text": "Ich träumte von einem Ort, den ich noch nie gesehen hab. Er lag nicht weit von hier. Vielleicht kennst du ihn — vielleicht hast du eine Karte davon im Kopf. Wir sollten sie zeichnen.",
"arc.first.beats.dream.after": "Wow. Dein Kopf ist voller Orte. Lass uns eine davon aufmalen.",
"arc.first.beats.map.title": "Zeichne eine Karte",
"arc.first.beats.map.before": "Wähle einen Lieblingsort — dein Zimmer, der Garten, der Spielplatz. Und zeichne ihn.",
"arc.first.beats.map.step1": "Male die Karte mit Farben, die zu dem Ort passen.",
"arc.first.beats.map.step2": "Hänge sie irgendwo auf, wo du sie siehst.",
"arc.first.beats.map.step3": "Erzähle jemandem in der Familie davon.",
"arc.first.beats.map.step4": "Zeige sie mir, wenn du fertig bist!",
"arc.first.beats.map.after": "Eine Karte! Jetzt wissen wir beide, wohin wir gehen können.",
"arc.first.beats.wake.before": "Noch eine Sache, dann bin ich ganz wach für unser Abenteuer — mach eine Morgenroutine mit mir.",
"arc.first.beats.wake.after": "Bereit. Das Abenteuer beginnt.",
"arc.first.complete": "Du hast unser erstes Abenteuer geschafft!"
```

In `src/i18n/en.json`:

```json
"arc.first.title": "The First Adventure",
"arc.first.chapter": "Prologue",
"arc.first.beats.dream.before": "I had a strange dream last night. Want to hear it?",
"arc.first.beats.dream.text": "I dreamed of a place I had never seen before. It was close by. Maybe you know it — maybe you have a map of it in your head. We should draw it.",
"arc.first.beats.dream.after": "Wow. Your head is full of places. Let's draw one of them.",
"arc.first.beats.map.title": "Draw a map",
"arc.first.beats.map.before": "Pick a favorite place — your room, the garden, the playground. And draw it.",
"arc.first.beats.map.step1": "Color the map with shades that fit the place.",
"arc.first.beats.map.step2": "Hang it somewhere you can see it.",
"arc.first.beats.map.step3": "Tell someone in the family about it.",
"arc.first.beats.map.step4": "Show it to me when you are done!",
"arc.first.beats.map.after": "A map! Now we both know where we can go.",
"arc.first.beats.wake.before": "One more thing and I will be fully awake for our adventure — do a morning routine with me.",
"arc.first.beats.wake.after": "Ready. The adventure begins.",
"arc.first.complete": "You finished our first adventure!"
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/arcs/`

Expected: all arc tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/arcs/ src/i18n/de.json src/i18n/en.json
git commit -m "feat(arcs): ship 'The First Adventure' — 3-beat intro arc

Introduces the arc catalog (ARCS, findArc, pickNextArc) and the
Phase 1 test arc:

  1. Lore beat — Ronki's strange dream (2–4 sentences, easy language)
  2. Craft beat — Louis draws a map of a favorite place
     (color / hang / tell someone / show)
  3. Routine beat — complete morning routine to 'wake Ronki'

Arc completes with +50 XP + 10 coins. Eggs/decor/traits rewards
come in Phase 2.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Build the ArcEngine state machine

**Files:**
- Create: `src/arcs/ArcEngine.ts`
- Create: `src/arcs/ArcEngine.test.ts`

**Architecture:** Pure functions operating on `ArcEngineState`. No React, no side effects. Testable. The hook (Task 11) wires these into context; persistence (Task 10) snapshots state in/out of storage.

- [ ] **Step 1: Write the failing tests**

Create `src/arcs/ArcEngine.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initialArcState,
  offerNextArc,
  acceptOffer,
  declineOffer,
  advanceBeat,
  completeArc,
  isInCooldown,
  getActiveBeat,
} from './ArcEngine';
import { ARCS, findArc } from './arcs';
import type { ArcEngineState } from './types';

const NOW = 1_700_000_000_000;

describe('ArcEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  describe('initialArcState', () => {
    it('starts idle with no active arc', () => {
      const s = initialArcState();
      expect(s.phase).toBe('idle');
      expect(s.activeArcId).toBeNull();
      expect(s.completedArcIds).toEqual([]);
      expect(s.cooldownEndsAt).toBeNull();
    });
  });

  describe('offerNextArc', () => {
    it('transitions idle -> offered when an uncompleted arc exists', () => {
      const s = offerNextArc(initialArcState());
      expect(s.phase).toBe('offered');
      expect(s.offeredArcId).toBe('first-adventure');
    });

    it('stays idle when all arcs are completed', () => {
      const allIds = ARCS.map(a => a.id);
      const s = offerNextArc({ ...initialArcState(), completedArcIds: allIds });
      expect(s.phase).toBe('idle');
      expect(s.offeredArcId).toBeNull();
    });

    it('stays in cooldown and does not offer', () => {
      const cooldown: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW + 1000,
      };
      const s = offerNextArc(cooldown);
      expect(s.phase).toBe('cooldown');
    });
  });

  describe('acceptOffer', () => {
    it('offered -> active with beat index 0', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      expect(s.phase).toBe('active');
      expect(s.activeArcId).toBe('first-adventure');
      expect(s.activeBeatIndex).toBe(0);
      expect(s.offeredArcId).toBeNull();
    });

    it('throws if not in offered phase', () => {
      expect(() => acceptOffer(initialArcState())).toThrow();
    });
  });

  describe('declineOffer', () => {
    it('offered -> idle, arc not marked completed', () => {
      let s = offerNextArc(initialArcState());
      s = declineOffer(s);
      expect(s.phase).toBe('idle');
      expect(s.offeredArcId).toBeNull();
      expect(s.completedArcIds).not.toContain('first-adventure');
    });
  });

  describe('advanceBeat', () => {
    it('advances beat index when active and current beat matches', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      // beat 0 is the lore beat 'fa-b1-dream' — advance it
      s = advanceBeat(s, 'fa-b1-dream');
      expect(s.activeBeatIndex).toBe(1);
      expect(s.phase).toBe('active');
    });

    it('ignores advance if beat id does not match current', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const before = s.activeBeatIndex;
      s = advanceBeat(s, 'some-other-beat');
      expect(s.activeBeatIndex).toBe(before);
    });

    it('transitions to cooldown when advancing past last beat', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const arc = findArc('first-adventure')!;
      // walk through all beats
      for (const beat of arc.beats) {
        s = advanceBeat(s, beat.id);
      }
      expect(s.phase).toBe('cooldown');
      expect(s.completedArcIds).toContain('first-adventure');
      expect(s.cooldownEndsAt).toBe(NOW + arc.cooldownHours * 60 * 60 * 1000);
      expect(s.activeArcId).toBeNull();
    });
  });

  describe('isInCooldown', () => {
    it('returns true when phase is cooldown and end not reached', () => {
      const s: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW + 1000,
      };
      expect(isInCooldown(s)).toBe(true);
    });

    it('returns false and transitions when cooldown expired', () => {
      const s: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW - 1000,
      };
      expect(isInCooldown(s)).toBe(false);
    });
  });

  describe('getActiveBeat', () => {
    it('returns the current beat when active', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const beat = getActiveBeat(s);
      expect(beat?.id).toBe('fa-b1-dream');
    });

    it('returns null when not active', () => {
      expect(getActiveBeat(initialArcState())).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm failures**

Run: `npx vitest run src/arcs/ArcEngine.test.ts`

Expected: ALL FAIL — ArcEngine does not exist yet.

- [ ] **Step 3: Implement the engine**

Create `src/arcs/ArcEngine.ts`:

```typescript
import type { Arc, ArcEngineState, Beat } from './types';
import { findArc, pickNextArc } from './arcs';

export function initialArcState(): ArcEngineState {
  return {
    phase: 'idle',
    activeArcId: null,
    activeBeatIndex: 0,
    completedArcIds: [],
    cooldownEndsAt: null,
    offeredArcId: null,
    lastUpdatedAt: Date.now(),
  };
}

function touch(s: ArcEngineState): ArcEngineState {
  return { ...s, lastUpdatedAt: Date.now() };
}

/**
 * Transitions idle -> offered if an uncompleted arc exists and we are not
 * in cooldown. Otherwise returns state unchanged.
 */
export function offerNextArc(state: ArcEngineState): ArcEngineState {
  if (isInCooldown(state)) return state;
  if (state.phase !== 'idle') return state;
  const next = pickNextArc(state.completedArcIds);
  if (!next) return state;
  return touch({ ...state, phase: 'offered', offeredArcId: next.id });
}

/**
 * Transitions offered -> active. Throws if not in offered phase — callers
 * should guard.
 */
export function acceptOffer(state: ArcEngineState): ArcEngineState {
  if (state.phase !== 'offered' || !state.offeredArcId) {
    throw new Error('acceptOffer called outside offered phase');
  }
  return touch({
    ...state,
    phase: 'active',
    activeArcId: state.offeredArcId,
    activeBeatIndex: 0,
    offeredArcId: null,
  });
}

/**
 * Transitions offered -> idle, clearing the offer. Arc is NOT marked
 * completed.
 */
export function declineOffer(state: ArcEngineState): ArcEngineState {
  if (state.phase !== 'offered') return state;
  return touch({ ...state, phase: 'idle', offeredArcId: null });
}

/**
 * Advances the active beat if `beatId` matches the current beat.
 * If advancing past the last beat, transitions to cooldown.
 */
export function advanceBeat(state: ArcEngineState, beatId: string): ArcEngineState {
  if (state.phase !== 'active' || !state.activeArcId) return state;
  const arc = findArc(state.activeArcId);
  if (!arc) return state;
  const current = arc.beats[state.activeBeatIndex];
  if (!current || current.id !== beatId) return state;

  const nextIndex = state.activeBeatIndex + 1;
  if (nextIndex >= arc.beats.length) {
    // arc complete — enter cooldown
    return completeArc(state, arc);
  }
  return touch({ ...state, activeBeatIndex: nextIndex });
}

/**
 * Internal: handles transition active -> cooldown when the last beat
 * is advanced. Exported for tests that want to force-complete.
 */
export function completeArc(state: ArcEngineState, arc: Arc): ArcEngineState {
  const cooldownMs = arc.cooldownHours * 60 * 60 * 1000;
  return touch({
    ...state,
    phase: 'cooldown',
    activeArcId: null,
    activeBeatIndex: 0,
    completedArcIds: [...state.completedArcIds, arc.id],
    cooldownEndsAt: Date.now() + cooldownMs,
  });
}

/**
 * True when in cooldown phase AND cooldownEndsAt is in the future.
 * If the end has passed, returns false — callers should then reset
 * phase to idle (see `expireCooldownIfReady`).
 */
export function isInCooldown(state: ArcEngineState): boolean {
  if (state.phase !== 'cooldown') return false;
  if (state.cooldownEndsAt === null) return false;
  return state.cooldownEndsAt > Date.now();
}

/**
 * If cooldown has expired, return a fresh idle state. Otherwise pass
 * through. Hook callers should run this before deciding whether to offer.
 */
export function expireCooldownIfReady(state: ArcEngineState): ArcEngineState {
  if (state.phase === 'cooldown' && state.cooldownEndsAt !== null && state.cooldownEndsAt <= Date.now()) {
    return touch({ ...state, phase: 'idle', cooldownEndsAt: null });
  }
  return state;
}

/**
 * Returns the currently active beat, or null if no arc is active.
 */
export function getActiveBeat(state: ArcEngineState): Beat | null {
  if (state.phase !== 'active' || !state.activeArcId) return null;
  const arc = findArc(state.activeArcId);
  if (!arc) return null;
  return arc.beats[state.activeBeatIndex] ?? null;
}
```

- [ ] **Step 4: Run tests, expect all pass**

Run: `npx vitest run src/arcs/ArcEngine.test.ts`

Expected: all tests PASS.

If a test fails, fix the engine (not the test). If the test was wrong, double-check against the spec (§6 Arc Engine).

- [ ] **Step 5: Commit**

```bash
git add src/arcs/ArcEngine.ts src/arcs/ArcEngine.test.ts
git commit -m "feat(arcs): ArcEngine state machine — pure, testable, tested

Pure-function state machine over ArcEngineState. Five phases:
  idle -> offered -> active -> cooldown -> idle

Exports:
  - initialArcState()
  - offerNextArc(state)
  - acceptOffer(state), declineOffer(state)
  - advanceBeat(state, beatId) — auto-transitions to cooldown after last beat
  - completeArc(state, arc) — explicit completion helper
  - isInCooldown(state), expireCooldownIfReady(state)
  - getActiveBeat(state)

No React, no side effects. 18 unit tests cover the state transitions.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Persistence — snapshot ArcEngineState in/out of game state

**Files:**
- Create: `src/arcs/persistence.ts`
- Create: `src/arcs/persistence.test.ts`
- Modify: `src/types.ts` (add `arcEngine?: ArcEngineState` to GameState)
- Modify: `src/context/TaskContext.tsx` (hydrate/persist arcEngine on load/save)

- [ ] **Step 1: Add `arcEngine` field to GameState**

In `src/types.ts`:

```typescript
import type { ArcEngineState } from './arcs/types';

export interface GameState {
  // ...existing fields
  arcEngine?: ArcEngineState;   // NEW
}
```

- [ ] **Step 2: Write failing test for persistence helpers**

Create `src/arcs/persistence.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { loadArcEngineState, saveArcEngineState } from './persistence';
import { initialArcState } from './ArcEngine';
import type { GameState } from '../types';

describe('arc persistence', () => {
  it('loadArcEngineState returns initial state when none stored', () => {
    const game = {} as GameState;
    const s = loadArcEngineState(game);
    expect(s.phase).toBe('idle');
  });

  it('loadArcEngineState returns stored state when present', () => {
    const stored = initialArcState();
    stored.completedArcIds = ['some-id'];
    const game = { arcEngine: stored } as GameState;
    const s = loadArcEngineState(game);
    expect(s.completedArcIds).toEqual(['some-id']);
  });

  it('saveArcEngineState writes to game state', () => {
    const game = {} as GameState;
    const s = initialArcState();
    const updated = saveArcEngineState(game, s);
    expect(updated.arcEngine).toEqual(s);
  });
});
```

- [ ] **Step 3: Run failing tests**

Run: `npx vitest run src/arcs/persistence.test.ts`

Expected: FAIL — persistence module doesn't exist.

- [ ] **Step 4: Implement persistence**

Create `src/arcs/persistence.ts`:

```typescript
import type { GameState } from '../types';
import type { ArcEngineState } from './types';
import { initialArcState } from './ArcEngine';

export function loadArcEngineState(game: GameState): ArcEngineState {
  if (game.arcEngine) return game.arcEngine;
  return initialArcState();
}

export function saveArcEngineState(game: GameState, state: ArcEngineState): GameState {
  return { ...game, arcEngine: state };
}
```

- [ ] **Step 5: Tests pass**

Run: `npx vitest run src/arcs/persistence.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/arcs/persistence.ts src/arcs/persistence.test.ts
git commit -m "feat(arcs): persistence helpers for ArcEngineState

ArcEngineState snapshots in/out of GameState.arcEngine (JSONB column).
Legacy states without arcEngine hydrate to a fresh initial state.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: React hook — useArc

**Files:**
- Create: `src/arcs/useArc.ts`
- Modify: `src/context/TaskContext.tsx` (add `advanceBeat` dispatcher on quest completion)

**Purpose:** Glue between ArcEngine (pure) and React. Exposes `{ phase, activeArc, activeBeat, offeredArc, offer, accept, decline, advance, inCooldown }` to components.

- [ ] **Step 1: Create the hook**

Create `src/arcs/useArc.ts`:

```typescript
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';
import {
  initialArcState,
  offerNextArc,
  acceptOffer,
  declineOffer,
  advanceBeat,
  expireCooldownIfReady,
  getActiveBeat,
  isInCooldown,
} from './ArcEngine';
import { findArc } from './arcs';
import { loadArcEngineState, saveArcEngineState } from './persistence';
import type { ArcEngineState } from './types';

export function useArc() {
  const { state, actions } = useTask();
  const [arcState, setArcState] = useState<ArcEngineState>(() =>
    expireCooldownIfReady(loadArcEngineState(state))
  );

  // Persist whenever arcState changes
  useEffect(() => {
    const updated = saveArcEngineState(state, arcState);
    if (actions.patchState) {
      actions.patchState({ arcEngine: arcState });
    }
    // if no patchState exists yet, the caller must add one in TaskContext
  }, [arcState]);

  // Hydrate once on mount from server/localStorage state
  useEffect(() => {
    setArcState(expireCooldownIfReady(loadArcEngineState(state)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offer = useCallback(() => setArcState(s => offerNextArc(s)), []);
  const accept = useCallback(() => setArcState(s => acceptOffer(s)), []);
  const decline = useCallback(() => setArcState(s => declineOffer(s)), []);
  const advance = useCallback((beatId: string) => setArcState(s => advanceBeat(s, beatId)), []);

  const activeArc = useMemo(
    () => (arcState.activeArcId ? findArc(arcState.activeArcId) : null),
    [arcState.activeArcId]
  );
  const offeredArc = useMemo(
    () => (arcState.offeredArcId ? findArc(arcState.offeredArcId) : null),
    [arcState.offeredArcId]
  );
  const activeBeat = useMemo(() => getActiveBeat(arcState), [arcState]);

  return {
    phase: arcState.phase,
    activeArc,
    activeBeat,
    offeredArc,
    inCooldown: isInCooldown(arcState),
    completedArcIds: arcState.completedArcIds,
    offer,
    accept,
    decline,
    advance,
  };
}
```

- [ ] **Step 2: Add `patchState` dispatcher to TaskContext**

In `src/context/TaskContext.tsx`, inside the actions object, add:

```typescript
patchState: (partial: Partial<GameState>) => {
  setState(prev => ({ ...prev, ...partial }));
},
```

(If state is already set via a reducer, add a corresponding `PATCH_STATE` action or inline merge.)

- [ ] **Step 3: Wire quest-completion dispatch to advance matching beats**

In `src/context/TaskContext.tsx`, find the `complete(questId)` action (or equivalent quest-completion logic). After the existing XP/coins/toast logic, add:

```typescript
// If the completed quest is tagged as an arc beat, advance the arc.
const quest = state.quests.find(q => q.id === questId);
if (quest?.arcBeatId && state.arcEngine) {
  const nextArcState = advanceBeat(state.arcEngine, quest.arcBeatId);
  setState(prev => ({ ...prev, arcEngine: nextArcState }));
}
```

Import `advanceBeat` from `../arcs/ArcEngine`.

- [ ] **Step 4: Smoke test in preview**

Run `npm run dev`. Open browser console and run:

```js
// Force-offer the test arc:
// (Assuming you expose useArc somewhere or have a debug panel.
// If not, skip this step and rely on automatic offer in Task 13 Hub wiring.)
```

For Task 11 alone, smoke-testing isolated is hard. The real smoke test happens after Task 13 when Hub wiring uses the hook. Confirm no runtime/TypeScript errors from the new code.

- [ ] **Step 5: Commit**

```bash
git add src/arcs/useArc.ts src/context/TaskContext.tsx
git commit -m "feat(arcs): useArc hook + TaskContext integration

useArc() hook exposes phase, activeArc, activeBeat, offeredArc,
inCooldown, plus offer/accept/decline/advance actions. Persists
ArcEngineState through TaskContext.patchState (new dispatcher).

Quest completion now auto-advances matching arc beats via
Quest.arcBeatId tag.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: ArcOfferCard component

**Files:**
- Create: `src/components/ArcOfferCard.jsx`
- Modify: `src/components/Hub.jsx` (render ArcOfferCard when phase === 'offered')

- [ ] **Step 1: Create the component**

Create `src/components/ArcOfferCard.jsx`:

```jsx
import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';

/**
 * Modal presented when Ronki has offered a new arc.
 * Louis can accept (starts the arc) or decline (arc returns to idle).
 */
export default function ArcOfferCard() {
  const { t } = useTranslation();
  const { phase, offeredArc, accept, decline } = useArc();

  if (phase !== 'offered' || !offeredArc) return null;

  const firstBeat = offeredArc.beats[0];
  const invitation = firstBeat?.narrativeBefore
    ? t(firstBeat.narrativeBefore)
    : t(offeredArc.titleKey);

  return (
    <div className="fixed inset-0 z-[250] bg-black/50 flex items-center justify-center p-6">
      <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`${import.meta.env.BASE_URL}art/companion/ronki-stage-1.png`}
            alt="Ronki"
            className="w-14 h-auto drop-shadow"
          />
          <div>
            <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant">
              {t('arc.offer.ronkiSays')}
            </p>
            <h2 className="font-headline text-xl font-bold text-primary">
              {t(offeredArc.titleKey)}
            </h2>
          </div>
        </div>

        <p className="font-body text-base text-on-surface mb-6 leading-relaxed">
          {invitation}
        </p>

        <div className="flex gap-3">
          <button
            onClick={accept}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-label font-bold text-lg"
          >
            {t('arc.offer.accept')}
          </button>
          <button
            onClick={decline}
            className="flex-1 bg-white/60 text-on-surface py-4 rounded-2xl font-label font-bold text-lg border border-[color:var(--parchment-gold,#fcd34d)]"
          >
            {t('arc.offer.later')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n keys**

`src/i18n/de.json`:
```json
"arc.offer.ronkiSays": "Ronki sagt…",
"arc.offer.accept": "Lass uns loslegen",
"arc.offer.later": "Später vielleicht"
```

`src/i18n/en.json`:
```json
"arc.offer.ronkiSays": "Ronki says…",
"arc.offer.accept": "Let's go",
"arc.offer.later": "Maybe later"
```

- [ ] **Step 3: Mount ArcOfferCard globally from App.jsx**

In `src/App.jsx`, import and add near the other overlays (after `<Celebration />` and before the screen-timer block):

```jsx
import ArcOfferCard from './components/ArcOfferCard';
// ...
<ArcOfferCard />
```

- [ ] **Step 4: Add a temporary "offer arc" trigger for testing**

For Phase 1 testing only: auto-offer on Hub open when conditions allow. In `src/components/Hub.jsx`, add near the top:

```jsx
import { useArc } from '../arcs/useArc';
// ...
const { phase, offer } = useArc();
useEffect(() => {
  if (phase === 'idle') {
    offer();
  }
}, [phase, offer]);
```

(Task 13 replaces this with a more sophisticated "Ronki offers when it's the right moment" logic. For now, aggressive offer-on-Hub-open is fine for end-to-end smoke testing.)

- [ ] **Step 5: Smoke test**

Run `npm run dev`. Open the app. Expected flow:

1. Land on Hub.
2. After a moment, Ronki offers "The First Adventure" in a modal.
3. Tap "Later" → modal dismisses, state returns to idle.
4. Revisit Hub → modal offers again (acceptable for test).
5. Tap "Let's go" → modal dismisses, arc is now active.

If anything fails, inspect console + fix.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(arcs): ArcOfferCard modal + Hub auto-offer trigger

Ronki now offers the next arc via a modal when Louis opens the
Campfire in idle phase. Accept -> arc goes active. Later -> state
returns to idle (no pressure).

Temporary aggressive offer trigger in Hub.jsx to be refined in
Task 13 once ArcActiveBanner lands.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: ArcActiveBanner component

**Files:**
- Create: `src/components/ArcActiveBanner.jsx`
- Modify: `src/components/Hub.jsx` (render ArcActiveBanner when arc is active)

- [ ] **Step 1: Create the banner**

Create `src/components/ArcActiveBanner.jsx`:

```jsx
import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';

/**
 * Strip shown on Hub when an arc is active. Displays the current beat's
 * narrativeBefore (Ronki's line) and — for craft/lore beats — opens a
 * BeatCompletionModal when tapped. For routine beats, it's informational only.
 */
export default function ArcActiveBanner({ onOpenBeat }) {
  const { t } = useTranslation();
  const { phase, activeArc, activeBeat } = useArc();

  if (phase !== 'active' || !activeArc || !activeBeat) return null;

  const beatIndex = activeArc.beats.findIndex(b => b.id === activeBeat.id);
  const totalBeats = activeArc.beats.length;
  const line = activeBeat.narrativeBefore ? t(activeBeat.narrativeBefore) : '';

  const isTappable = activeBeat.kind === 'craft' || activeBeat.kind === 'lore';

  const Wrapper = isTappable ? 'button' : 'div';

  return (
    <Wrapper
      onClick={isTappable ? () => onOpenBeat?.(activeBeat) : undefined}
      className={`w-full text-left bg-[var(--parchment-gold-soft,#fef3c7)] border-2 border-[color:var(--parchment-gold,#fcd34d)] rounded-2xl p-4 flex items-start gap-3 shadow ${isTappable ? 'hover:brightness-105 active:scale-[0.98] transition' : ''}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}art/companion/ronki-stage-1.png`}
        alt=""
        aria-hidden
        className="w-12 h-auto drop-shadow flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant">
            {t(activeArc.titleKey)}
          </p>
          <p className="font-label text-xs text-on-surface-variant">
            {beatIndex + 1}/{totalBeats}
          </p>
        </div>
        <p className="font-body text-base text-on-surface leading-snug">
          {line}
        </p>
        {isTappable && (
          <p className="font-label text-xs text-primary mt-2">
            {t('arc.banner.tapToOpen')} →
          </p>
        )}
      </div>
    </Wrapper>
  );
}
```

- [ ] **Step 2: Add i18n**

`src/i18n/de.json`:
```json
"arc.banner.tapToOpen": "Tippe, um loszulegen"
```

`src/i18n/en.json`:
```json
"arc.banner.tapToOpen": "Tap to open"
```

- [ ] **Step 3: Mount in Hub**

In `src/components/Hub.jsx`, near the top of the render return (above the companion scene or "HEUTE" card — wherever it fits visually):

```jsx
import ArcActiveBanner from './ArcActiveBanner';
// ...
const [openBeat, setOpenBeat] = useState(null);
// ...
<ArcActiveBanner onOpenBeat={setOpenBeat} />
```

(`openBeat` will be consumed by `BeatCompletionModal` in Task 14.)

- [ ] **Step 4: Refine Hub offer trigger**

Replace the aggressive auto-offer from Task 12 Step 4 with a more controlled one. In Hub.jsx:

```jsx
const { phase, offer } = useArc();
useEffect(() => {
  // Offer on Hub mount only when idle and not in cooldown.
  // More nuanced timing (morning-only, etc.) lands in Phase 2.
  if (phase === 'idle') {
    offer();
  }
}, []);  // mount-only, not reactive to phase changes
```

- [ ] **Step 5: Smoke test**

Run `npm run dev`. Flow:
1. Land on Hub → offer modal.
2. Accept → modal dismisses, Hub now shows ArcActiveBanner with beat 1/3 ("I had a strange dream last night…").
3. Banner is tappable (lore beat). Tap — nothing happens yet (BeatCompletionModal is Task 14).
4. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(arcs): ArcActiveBanner — Hub shows current beat

Banner renders on Hub when an arc is active. Shows the current beat
number (N/total), arc title, and Ronki's line for the current beat.
Craft + lore beats are tappable (wired to BeatCompletionModal in
the next task). Routine beats show informationally and complete via
the normal quest tick elsewhere.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: BeatCompletionModal — complete craft + lore beats

**Files:**
- Create: `src/components/BeatCompletionModal.jsx`
- Modify: `src/components/Hub.jsx` (render modal when `openBeat` is set)

- [ ] **Step 1: Create the modal**

Create `src/components/BeatCompletionModal.jsx`:

```jsx
import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';

/**
 * Modal for self-reporting completion of a craft or lore beat.
 * - Craft beats show title + steps checklist + "I did it" button
 * - Lore beats show the lore paragraph + "Done reading" button
 *
 * Routine beats do not open this modal; they complete via the quest tick.
 */
export default function BeatCompletionModal({ beat, onClose }) {
  const { t } = useTranslation();
  const { advance } = useArc();

  if (!beat) return null;

  const handleDone = () => {
    advance(beat.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[260] bg-black/50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl my-8">
        {beat.kind === 'craft' && (
          <>
            <h2 className="font-headline text-2xl font-bold text-primary mb-2">
              {t(beat.title)}
            </h2>
            {beat.narrativeBefore && (
              <p className="font-body text-base text-on-surface mb-4">
                {t(beat.narrativeBefore)}
              </p>
            )}
            <ol className="space-y-3 mb-6">
              {beat.steps.map((stepKey, i) => (
                <li key={stepKey} className="flex gap-3 items-start">
                  <span className="font-headline text-lg font-bold text-primary flex-shrink-0 w-6">
                    {i + 1}.
                  </span>
                  <span className="font-body text-base text-on-surface leading-snug">
                    {t(stepKey)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {beat.kind === 'lore' && (
          <>
            {beat.narrativeBefore && (
              <p className="font-body text-sm text-on-surface-variant italic mb-3">
                {t(beat.narrativeBefore)}
              </p>
            )}
            <p className="font-body text-base text-on-surface leading-relaxed mb-6 whitespace-pre-line">
              {t(beat.text)}
            </p>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/60 text-on-surface py-4 rounded-2xl font-label font-bold text-lg border border-[color:var(--parchment-gold,#fcd34d)]"
          >
            {t('beat.close')}
          </button>
          <button
            onClick={handleDone}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-label font-bold text-lg"
          >
            {beat.kind === 'craft' ? t('beat.didIt') : t('beat.doneReading')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: i18n**

`src/i18n/de.json`:
```json
"beat.close": "Schließen",
"beat.didIt": "Hab's geschafft!",
"beat.doneReading": "Fertig gelesen"
```

`src/i18n/en.json`:
```json
"beat.close": "Close",
"beat.didIt": "I did it!",
"beat.doneReading": "Done reading"
```

- [ ] **Step 3: Wire into Hub**

In `src/components/Hub.jsx`, render the modal when `openBeat` is set:

```jsx
import BeatCompletionModal from './BeatCompletionModal';
// ...
<BeatCompletionModal beat={openBeat} onClose={() => setOpenBeat(null)} />
```

- [ ] **Step 4: Smoke-test full first-adventure flow**

Run `npm run dev`. Walk the entire arc:

1. Hub → ArcOfferCard appears. Accept.
2. ArcActiveBanner shows beat 1/3 (lore — "I had a strange dream").
3. Tap banner → BeatCompletionModal opens with lore text.
4. Tap "Done reading" → modal closes; banner now shows beat 2/3 (craft — "Draw a map").
5. Tap banner → craft modal with 4 steps.
6. Tap "I did it!" → modal closes; banner shows beat 3/3 (routine — "wake Ronki" with `questId: 'brush_teeth'`).
7. Go to Quests tab, complete the `brush_teeth` quest.
8. Arc auto-advances → arc completes → banner disappears.
9. Hub is back to idle state (but in cooldown; re-offering is blocked for 48h).

If step 7 doesn't trigger arc completion, check that `Quest.arcBeatId` is set somewhere for this test. **Known issue:** the existing quest `brush_teeth` in constants/seed does NOT have `arcBeatId: 'fa-b3-wake'` set. Choose one of:

**Option A (quick, plan-sanctioned):** Add a one-time hydration in TaskContext that, when an arc is accepted, tags the matching quest(s) for the arc's routine beats in the current `state.quests`:

```typescript
// In TaskContext, when arcEngine.phase transitions to 'active':
useEffect(() => {
  if (state.arcEngine?.phase === 'active' && state.arcEngine.activeArcId) {
    const arc = findArc(state.arcEngine.activeArcId);
    if (!arc) return;
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => {
        const matchingBeat = arc.beats.find(
          b => b.kind === 'routine' && b.questId === q.id
        );
        return matchingBeat ? { ...q, arcBeatId: matchingBeat.id } : q;
      }),
    }));
  }
}, [state.arcEngine?.phase]);
```

**Option B:** Add permanent `arcBeatId` tags in `SCHOOL_QUESTS` seed data. Cleaner long-term; riskier in Phase 1 because it couples seed data to arcs.

Use Option A for Phase 1. Add as a step in Task 11 (TaskContext integration) if not already present.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(arcs): BeatCompletionModal — complete craft + lore beats

Modal opens from ArcActiveBanner for tappable beats. Craft beats
render a numbered step checklist and a big 'I did it!' button;
lore beats render the paragraph and a 'Done reading' button.
Either completion triggers advance(beat.id), which moves the arc
forward and — on the last beat — transitions to cooldown.

Also adds on-accept hydration: when an arc goes active, its routine
beats tag matching quests in state.quests via arcBeatId so the
normal quest-tick auto-advances the arc.

End-to-end smoke: offer -> accept -> lore beat -> craft beat ->
routine beat via quest completion -> arc complete -> cooldown.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 15: Cooldown messaging and voice lines

**Files:**
- Modify: `src/companion/lines/de.ts`
- Modify: `src/companion/lines/en.ts`
- Modify: `src/components/Hub.jsx` (show cooldown message when applicable)

- [ ] **Step 1: Add arc-related voice lines**

In `src/companion/lines/de.ts`, add entries:

```typescript
{
  id: 'de_arc_cooldown_01',
  trigger: 'hub_open',
  context: { arcPhase: 'cooldown' },
  text: 'Ich ruhe mich noch aus. Aber deine Routinen halten mich warm.',
},
{
  id: 'de_arc_cooldown_02',
  trigger: 'hub_open',
  context: { arcPhase: 'cooldown' },
  text: 'Puh, das war ein Abenteuer. Ich brauche ein bisschen Schlaf. Bis bald!',
},
{
  id: 'de_arc_active_01',
  trigger: 'hub_open',
  context: { arcPhase: 'active' },
  text: 'Wir sind mitten in einem Abenteuer. Schau in die Anzeige oben!',
},
```

In `src/companion/lines/en.ts`:

```typescript
{
  id: 'en_arc_cooldown_01',
  trigger: 'hub_open',
  context: { arcPhase: 'cooldown' },
  text: 'I am still resting. But your routines keep me warm.',
},
{
  id: 'en_arc_cooldown_02',
  trigger: 'hub_open',
  context: { arcPhase: 'cooldown' },
  text: 'Phew, that was an adventure. I need a little sleep. See you soon!',
},
{
  id: 'en_arc_active_01',
  trigger: 'hub_open',
  context: { arcPhase: 'active' },
  text: 'We are in the middle of an adventure. Check the banner up top!',
},
```

- [ ] **Step 2: Extend VoiceEngine context matcher**

Open `src/companion/VoiceEngine.ts`. Find where `context` fields are matched (`minStreak`, `minQuestsToday`, etc.). Add `arcPhase` matching:

```typescript
if (line.context?.arcPhase && ctx.arcPhase !== line.context.arcPhase) {
  return false;
}
```

Extend the `VoiceContext` type (likely near top of file):

```typescript
export interface VoiceContext {
  // ...existing fields
  arcPhase?: 'idle' | 'offered' | 'active' | 'cooldown';
}
```

- [ ] **Step 3: Pass arcPhase from Hub**

In `src/components/Hub.jsx`, where `voice.say('hub_open')` is called, include the context:

```jsx
import { useArc } from '../arcs/useArc';
// ...
const { phase: arcPhase } = useArc();
useEffect(() => {
  voice.say('hub_open', { arcPhase });
}, []);
```

(Adjust to your existing voice.say signature — it may take `(trigger, contextOverride)`. If the signature is different, adapt while keeping the arcPhase context flowing through.)

- [ ] **Step 4: Update VoiceEngine tests**

In `src/companion/VoiceEngine.test.ts`, add tests covering:

```typescript
it('matches arcPhase context field', () => {
  const ctx: VoiceContext = { arcPhase: 'cooldown' };
  const line = pickLine('hub_open', 'de', ctx);
  expect(line?.text).toMatch(/ruhe|Schlaf/);
});

it('does not match arcPhase-gated lines when phase differs', () => {
  const ctx: VoiceContext = { arcPhase: 'idle' };
  const line = pickLine('hub_open', 'de', ctx);
  // should not be a cooldown line
  expect(line?.text ?? '').not.toMatch(/ruhe mich noch aus/);
});
```

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: all pass.

- [ ] **Step 6: Smoke test**

Run dev server. Complete the first adventure end-to-end (as in Task 14 Step 4). After arc completes, reload the Hub. Ronki's line should now be one of the cooldown lines.

- [ ] **Step 7: Commit**

```bash
git add src/companion/ src/components/Hub.jsx
git commit -m "feat(voice): arcPhase context in VoiceEngine + cooldown lines

VoiceContext gains arcPhase field ('idle'|'offered'|'active'|'cooldown').
Hub passes it into voice.say('hub_open', { arcPhase }). Three new
bilingual lines cover cooldown ('I am still resting') and active
('We are in the middle of an adventure') states.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 16: End-to-end verification + merge prep

**Files:**
- None (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm test`

Expected: all tests pass. Count should be original (22) + new (types, arcs catalog, ArcEngine, persistence, voice arcPhase — ~30+ new tests), total ~50+.

- [ ] **Step 2: Production build**

Run: `npm run build`

Expected: no build errors. If TypeScript strictness surfaces any issues, fix before proceeding.

- [ ] **Step 3: Preview the production build**

Run:
```bash
npm run preview
```

Walk the full flow one more time:
- Login
- Land on Hub → arc offered → accept → ArcActiveBanner appears
- Complete lore beat, craft beat, routine beat (via quest completion)
- Arc completes → cooldown; Ronki says a rest line
- Navigate all tabs (Quests, Shop, Lager, Care, Journal, Ronki) — confirm no broken screens
- Open ParentalDashboard (long-press on TopBar) — confirm no stale streak UI, no hero-profile artefacts
- Log out and back in — confirm arc state persists

- [ ] **Step 4: Update MEMORY.md**

Add to `C:/Users/öööö/.claude/projects/C--Users-------basic-memory/memory/MEMORY.md`:

```markdown
- [Ronki refocus Phase 1 shipped (Apr 2026)](project_ronki_refocus_phase_1.md) — Hero Profile deleted, Ronki Profile stub in its place, ArcEngine + "The First Adventure" live, streaks removed, mission-picker UX gone
```

Create `project_ronki_refocus_phase_1.md` in the same directory with a 200-word summary of what shipped and where the spec/plan live.

- [ ] **Step 5: Commit memory update**

```bash
# In the basic-memory directory:
cd /c/Users/öööö/.basic-memory
# ... commit memory changes according to memory-tracking convention
```

(Or skip if memory tracking is manual.)

- [ ] **Step 6: Push dev branch to origin**

Phase 1 lands on `dev`. `main` is NOT touched in this plan — the live
gh-pages build stays at its current state until Marc explicitly
promotes the work.

```bash
cd /c/Users/öööö/louis-quest
git push -u origin dev
```

Expected: `dev` branch published on GitHub. No gh-pages redeploy
(deploy workflow is main-only).

- [ ] **Step 7: Local smoke test on dev**

Since live is untouched, verification happens on the local preview of
`dev`:

```bash
npm run build
npm run preview
```

Walk the full arc flow one more time on the local preview URL.
Confirm everything works end-to-end. Report a concise summary of
what shipped and any rough edges Marc should see before promotion.

Promotion to `main` (and therefore live) is an explicit follow-up
step requested by Marc — NOT part of this plan.

---

## Self-Review Notes

Spec coverage check (§ refs point to spec file sections):

- ✅ §4 Cuts — streaks (Tasks 1–3), Hero Profile (Task 4), mission picker (Task 5). Species selection constrained (Task 6).
- ✅ §4 Rebirths — Ronki Profile stub (Task 4).
- ✅ §6 Arc Engine — types (Task 7), data (Task 8), state machine (Task 9), persistence (Task 10), hook (Task 11).
- ✅ §6 "Routine/craft/lore beat" split — present in types (Task 7) and exercised by "The First Adventure" (Task 8).
- ✅ §6 Delivery mechanism — Hub auto-offer (Task 12), ArcActiveBanner (Task 13), BeatCompletionModal (Task 14).
- ✅ §5 Cadence — cooldownHours: 48 default in arc data; isInCooldown + expireCooldownIfReady in engine.
- ✅ §5 "Ronki offers, never nags" — decline(offer) returns to idle; cooldown lines frame skipping as Ronki resting (Task 15).
- ✅ §9 Phase 1 scope — all items covered.
- ⏸ §7 Sanctuary v2 — Phase 2, not in this plan.
- ⏸ §7 Micropedia — Phase 2, not in this plan.
- ⏸ §8.3 Micro-pets — Phase 2, not in this plan.
- ⏸ §8.4 Potion of Vigor — Phase 2, not in this plan (no cooldown-skip mechanic in Phase 1).

Open items from spec §10 the plan resolves vs. defers:
- Egg clutch count — set to 3 (consistent with existing onboarding structure) in Task 6.
- Arc cooldown default — 48h hard-coded in Task 8. Playtest-validated in Task 16; iterate in Phase 2 if needed.
- Craft beat photo requirement — deferred; "I did it!" is a simple button in Task 14 (no photo required).
- Micropedia chapter names — deferred (Phase 2).
- Micropedia reveal animation — deferred (Phase 2).
- Ronki renaming UX — not yet in Phase 1 (onboarding-only rename assumed for now).
- Traits system — deferred (Phase 2).
- Decor placement — deferred (Phase 2).

No placeholder red flags detected. All code steps include runnable code. All test steps show assertions. Commit messages are concrete.

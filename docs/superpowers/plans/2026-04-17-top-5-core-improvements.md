# Top 5 Core Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 5 highest-ROI improvements to Ronki: mood-aware voice, operational traits, reliable arc offering, end-of-day ritual, and earned (not given) Micropedia creatures.

**Architecture:** Five loosely-coupled features, each enhancing an existing system. #1–3 enrich existing voice/arc/trait infrastructure (light touch). #4 adds a new ritual component wired into Hub. #5 refactors Micropedia discovery from hardcoded seed to state-driven unlocks.

**Tech Stack:** React 18 + Vite 5, TypeScript (hooks/context), JSX (components), Vitest for unit tests, localStorage for persistence, existing ElevenLabs audio pipeline.

---

## Feature Overview & Dependencies

| # | Feature | Files Touched | Depends On |
|---|---------|---------------|------------|
| 1 | Mood-aware Ronki | `useVoice.ts`, `lines/de.ts` | — |
| 2 | Traits operational | `types.ts`, `VoiceEngine.ts`, `useVoice.ts`, `useArc.ts`, `TaskContext.tsx`, `RonkiProfile.jsx`, `lines/de.ts` | — |
| 3 | Arcs reliably offer | `ArcEngine.ts`, arc files, `Hub.jsx`, `useArc.ts` | — |
| 4 | End-of-day ritual | `EveningRitual.jsx` (new), `Hub.jsx`, `TaskContext.tsx`, narrator audio | #1 benefits from mood |
| 5 | Micropedia earned | `Micropedia.jsx`, `useMicropediaDiscovery.ts` (new), `TaskContext.tsx`, `CreatureDiscoveryToast.jsx` (new) | — |

**Execution order:** 1 → 2 → 3 → 5 → 4. #4 last because it references mood/traits and is the most cross-cutting.

---

## Feature 1: Mood-Aware Ronki

**Why:** `state.moodAM` is collected but currently unused. `pickLine()` already filters by `ctx.mood`, and `useVoice.ts` has `mood: null // wired in 1b from Buch mood` as a TODO. Some voice lines already have `mood` fields defined in types but no lines use them. This is plumbing, not new infrastructure.

**Files:**
- Modify: `src/companion/useVoice.ts:100-110` (pass `state.moodAM` into VoiceContext)
- Modify: `src/companion/lines/de.ts` (add `mood` tag to 15-20 existing lines)
- Modify: `src/companion/VoiceEngine.test.ts` (verify mood filter doesn't over-exclude)

### Task 1.1: Wire moodAM into VoiceContext

- [ ] **Step 1: Read current useVoice.ts to confirm structure**

Run: `grep -n "mood:\|moodAM" src/companion/useVoice.ts`
Expected: line ~106 shows `mood: null, // wired in 1b from Buch mood`

- [ ] **Step 2: Map state.moodAM index to MoodTag**

The mood values come from `state.moodAM` as an integer 0-5. The `MoodTag` type is `'traurig' | 'besorgt' | 'okay' | 'gut' | 'magisch' | 'müde'`. The existing `MOOD_EMOJIS` array in `constants.ts` confirms the order: `['😢', '😕', '😐', '🙂', '😊', '🤩']`. This gives us:
- 0 → `traurig`
- 1 → `besorgt`
- 2 → `okay`
- 3 → `gut`
- 4 → `magisch` (🤩)
- 5 → `müde`

Wait — check `constants.ts` to confirm index 5 is "müde" not something else.

Run: `grep -n "MOOD_EMOJIS\|MOOD_LABELS" /c/Users/öööö/louis-quest/src/constants.ts`
If MOOD_EMOJIS has 6 entries and labels map to the MoodTag type, use this mapping.

- [ ] **Step 3: Add mood mapping helper to useVoice.ts**

Edit `src/companion/useVoice.ts` — find the line `mood: null, // wired in 1b from Buch mood` and replace the block.

**Before (around line 100-110):**
```ts
const ctx: VoiceContext = {
  trigger,
  timeOfDay: timeOfDay(),
  weather: weatherTag(weather),
  mood: null, // wired in 1b from Buch mood
  stage: stageTag(s.catEvo || 0),
  ...
};
```

**After:**
```ts
const MOOD_INDEX_TO_TAG: (import('./types').MoodTag | null)[] = [
  'traurig', 'besorgt', 'okay', 'gut', 'magisch', 'müde',
];

function moodFromState(s: any): import('./types').MoodTag | null {
  // Prefer PM mood if set (later in the day = more current), fall back to AM
  const idx = s.moodPM ?? s.moodAM;
  if (idx === null || idx === undefined) return null;
  return MOOD_INDEX_TO_TAG[idx] ?? null;
}
```

Then change the `mood: null` line to `mood: moodFromState(s),`.

Add the helper at the top of the file (right after imports, before `useVoice` function).

- [ ] **Step 4: Commit the wiring**

```bash
git add src/companion/useVoice.ts
git commit -m "feat: wire state.moodAM into voice context (mood-aware Ronki part 1)"
```

### Task 1.2: Tag existing voice lines with mood

- [ ] **Step 1: Read current lines**

Run: `head -60 /c/Users/öööö/louis-quest/src/companion/lines/de.ts`
Expected: ~60 voice lines, none with `mood` field

- [ ] **Step 2: Add mood-specific variants**

Edit `src/companion/lines/de.ts`. Add these new lines at the end of the file (before the closing `];`):

```ts
  // ═══════════════════════════════════════
  // MOOD-AWARE — soft responses when Louis is down, upbeat when happy
  // Only fire when mood context matches. Don't override greetings;
  // these are supplemental alternates that pickLine can select.
  // ═══════════════════════════════════════
  { id: 'de_mood_sad_01',   text: 'Hey... ich bin heute auch ein bisschen leise. Sollen wir zusammen sein?', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'de_mood_sad_02',   text: 'Manchmal sind Tage einfach so. Ich bin da.', triggers: ['hub_open'], mood: ['traurig'] },
  { id: 'de_mood_sad_03',   text: 'Ich hab dich gesehen. Du bist stark, auch wenn es sich nicht so anfühlt.', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'de_mood_sad_04',   text: 'Weißt du was hilft? Eine Umarmung. Ich kann leider keine geben — aber stell dir eine vor.', triggers: ['hub_open', 'sanctuary_open'], mood: ['traurig'] },
  { id: 'de_mood_tired_01', text: 'Ich gähne auch. Lass uns heute langsam machen.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'de_mood_tired_02', text: 'Müde sein ist okay. Dann ruhen wir uns aus.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'de_mood_happy_01', text: 'Wow! Du strahlst heute! Was ist passiert?', triggers: ['hub_open'], mood: ['magisch', 'gut'] },
  { id: 'de_mood_happy_02', text: 'Ich spüre deine gute Laune. Bin mit angesteckt!', triggers: ['hub_open'], mood: ['magisch'] },
  { id: 'de_mood_happy_03', text: 'So ein schöner Tag in dir! Nimmst du mich mit?', triggers: ['hub_open', 'sanctuary_open'], mood: ['magisch', 'gut'] },
  { id: 'de_mood_okay_01',  text: 'Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.', triggers: ['hub_open'], mood: ['okay'] },
  { id: 'de_mood_worried_01', text: 'Ist was passiert? Du kannst mir erzählen — oder einfach da sein.', triggers: ['hub_open'], mood: ['besorgt'] },
  { id: 'de_mood_worried_02', text: 'Ich bin leise. Dann ist der Kopf freier.', triggers: ['hub_open'], mood: ['besorgt'] },
```

- [ ] **Step 3: Verify the structure is valid TypeScript**

Run: `cd /c/Users/öööö/louis-quest && npx tsc --noEmit src/companion/lines/de.ts 2>&1 | head -10`
Expected: no errors (or "cannot compile" if strict — that's fine since it's TS-as-input-to-tsc)

- [ ] **Step 4: Generate audio for the new lines (optional but recommended)**

Run the ElevenLabs batch generator for the 12 new lines. Script pattern — save as `/tmp/mood_lines.py`:

```python
import json, os, time, urllib.request
API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')
VOICE_ID = 'N2lVS1w4EtoT3dr4eOWO'  # Callum — Ronki
OUT_DIR = '/c/Users/öööö/louis-quest/public/audio/ronki'
VS = {'stability': 0.50, 'similarity_boost': 0.70, 'style': 0.55}
LINES = {
  'de_mood_sad_01':    'Hey... ich bin heute auch ein bisschen leise. Sollen wir zusammen sein?',
  'de_mood_sad_02':    'Manchmal sind Tage einfach so. Ich bin da.',
  'de_mood_sad_03':    'Ich hab dich gesehen. Du bist stark, auch wenn es sich nicht so anfühlt.',
  'de_mood_sad_04':    'Weißt du was hilft? Eine Umarmung. Ich kann leider keine geben — aber stell dir eine vor.',
  'de_mood_tired_01':  'Ich gähne auch. Lass uns heute langsam machen.',
  'de_mood_tired_02':  'Müde sein ist okay. Dann ruhen wir uns aus.',
  'de_mood_happy_01':  'Wow! Du strahlst heute! Was ist passiert?',
  'de_mood_happy_02':  'Ich spüre deine gute Laune. Bin mit angesteckt!',
  'de_mood_happy_03':  'So ein schöner Tag in dir! Nimmst du mich mit?',
  'de_mood_okay_01':   'Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.',
  'de_mood_worried_01':'Ist was passiert? Du kannst mir erzählen — oder einfach da sein.',
  'de_mood_worried_02':'Ich bin leise. Dann ist der Kopf freier.',
}
for lid, text in LINES.items():
  out = f'{OUT_DIR}/{lid}.mp3'
  if os.path.exists(out) and os.path.getsize(out) > 1000: continue
  payload = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': VS}).encode('utf-8')
  req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}', data=payload,
    headers={'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
  with urllib.request.urlopen(req, timeout=30) as resp:
    with open(out, 'wb') as f: f.write(resp.read())
  print(f'OK {lid}')
  time.sleep(0.6)
```

Run: `cd /c/Users/öööö/louis-quest && set -a; source .env; set +a; PYTHONIOENCODING=utf-8 python3 /tmp/mood_lines.py`
Expected: 12 `OK ...` lines

- [ ] **Step 5: Commit**

```bash
git add src/companion/lines/de.ts public/audio/ronki/de_mood_*.mp3
git commit -m "feat: add 12 mood-aware voice lines (sad/tired/happy/worried/okay)"
```

### Task 1.3: Test the mood filter

- [ ] **Step 1: Check existing VoiceEngine test structure**

Run: `cat /c/Users/öööö/louis-quest/src/companion/VoiceEngine.test.ts 2>/dev/null | head -30 || echo "no test file"`

If no test file exists, skip to Step 3.

- [ ] **Step 2: Add a mood filter test (if test file exists)**

Append to `src/companion/VoiceEngine.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickLine } from './VoiceEngine';
import type { VoiceLine, VoiceContext } from './types';

describe('pickLine mood filtering', () => {
  const lines: VoiceLine[] = [
    { id: 'generic', text: 'hi', triggers: ['hub_open'] },
    { id: 'sad',     text: 'sad', triggers: ['hub_open'], mood: ['traurig'] },
    { id: 'happy',   text: 'yay', triggers: ['hub_open'], mood: ['magisch'] },
  ];

  const baseCtx: VoiceContext = {
    trigger: 'hub_open',
    timeOfDay: 'morning',
    weather: null,
    mood: null,
    stage: 'baby',
    questsCompletedToday: 0,
    lang: 'de',
  };

  it('includes mood-tagged lines when mood matches', () => {
    const picked = pickLine({ ...baseCtx, mood: 'traurig' }, lines, {});
    // should be able to pick either generic or sad
    expect(['generic', 'sad']).toContain(picked?.id);
  });

  it('excludes mood-tagged lines when mood does not match', () => {
    const picked = pickLine({ ...baseCtx, mood: 'magisch' }, lines, {});
    // should pick generic or happy, never sad
    expect(picked?.id).not.toBe('sad');
  });

  it('excludes mood-tagged lines when mood is null', () => {
    const picked = pickLine({ ...baseCtx, mood: null }, lines, {});
    // only generic should be eligible (mood-tagged requires mood set)
    expect(picked?.id).toBe('generic');
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `cd /c/Users/öööö/louis-quest && npx vitest run src/companion/ 2>&1 | tail -15`
Expected: All pass (or skip if no test file was created)

- [ ] **Step 4: Manual verification in dev**

Start dev server: `npx vite --port 5173` (or use existing preview)
Open app, set mood to 😢 (traurig) in Daily Check-in on Hub. Navigate away and back. Ronki's next voice line should have a softer tone. Check audio playback in browser devtools Network tab — should fetch `de_mood_sad_*.mp3`.

- [ ] **Step 5: Commit**

```bash
git add src/companion/VoiceEngine.test.ts
git commit -m "test: verify mood-aware voice line filtering"
```

---

## Feature 2: Traits Operational

**Why:** Traits exist in the arc reward spec (`Arc.rewardOnComplete.traitIds`) but are never actually added to state, never unlock voice content, and never shown as earned. They're a defined concept with zero mechanical effect.

**Files:**
- Modify: `src/companion/types.ts` (add `traits?: string[]` to `VoiceLine`, add `earnedTraits: string[]` to `VoiceContext`)
- Modify: `src/companion/VoiceEngine.ts` (filter lines by earned traits)
- Modify: `src/companion/useVoice.ts` (pass `state.earnedTraits` into context)
- Modify: `src/context/TaskContext.tsx` (add `earnedTraits: string[]` to state + persist + setter)
- Modify: `src/arcs/useArc.ts` (on arc complete, add `traitIds` to state.earnedTraits)
- Modify: `src/components/RonkiProfile.jsx` (read from state.earnedTraits instead of milestone inference)
- Modify: `src/companion/lines/de.ts` (add trait-gated identity lines)

### Task 2.1: Extend types

- [ ] **Step 1: Read current types**

Run: `sed -n '30,50p' /c/Users/öööö/louis-quest/src/companion/types.ts`
Expected: `VoiceLine` interface with `mood?: MoodTag[]` etc.

- [ ] **Step 2: Add traits field to VoiceLine + earnedTraits to VoiceContext**

Edit `src/companion/types.ts`. Find `VoiceLine`:

**Before:**
```ts
export interface VoiceLine {
  id: string;
  text: string;
  triggers: Trigger[];
  timeOfDay?: TimeOfDay[];
  weather?: WeatherTag[];
  mood?: MoodTag[];
  stage?: StageTag[];
  minQuestsToday?: number;
  careAction?: CareAction[];
  arcPhase?: ArcLifecyclePhase;
}
```

**After:**
```ts
export interface VoiceLine {
  id: string;
  text: string;
  triggers: Trigger[];
  timeOfDay?: TimeOfDay[];
  weather?: WeatherTag[];
  mood?: MoodTag[];
  stage?: StageTag[];
  minQuestsToday?: number;
  careAction?: CareAction[];
  arcPhase?: ArcLifecyclePhase;
  /** Require at least one of these traits to be earned for this line to fire. */
  requiredTraits?: string[];
}
```

Find `VoiceContext`:

**Before:**
```ts
export interface VoiceContext {
  trigger: Trigger;
  timeOfDay: TimeOfDay;
  weather: WeatherTag | null;
  mood: MoodTag | null;
  stage: StageTag;
  questsCompletedToday: number;
  careAction?: CareAction;
  arcPhase?: ArcLifecyclePhase;
  lang: Lang;
}
```

**After:**
```ts
export interface VoiceContext {
  trigger: Trigger;
  timeOfDay: TimeOfDay;
  weather: WeatherTag | null;
  mood: MoodTag | null;
  stage: StageTag;
  questsCompletedToday: number;
  careAction?: CareAction;
  arcPhase?: ArcLifecyclePhase;
  lang: Lang;
  /** Trait IDs Louis has earned from completed arcs. */
  earnedTraits: string[];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/companion/types.ts
git commit -m "feat(types): add requiredTraits to VoiceLine + earnedTraits to VoiceContext"
```

### Task 2.2: Add filter to VoiceEngine

- [ ] **Step 1: Read current matcher**

Run: `sed -n '10,40p' /c/Users/öööö/louis-quest/src/companion/VoiceEngine.ts`
Expected: sees `line.mood`, `line.weather` etc. checks in a `matches` function

- [ ] **Step 2: Add requiredTraits check**

Edit `src/companion/VoiceEngine.ts`. Find the block starting with `if (line.mood) {` and add after it (before the closing of the match function):

```ts
  // Trait gate — if line requires traits, at least one must be earned
  if (line.requiredTraits && line.requiredTraits.length > 0) {
    const earned = ctx.earnedTraits || [];
    const hasAny = line.requiredTraits.some(t => earned.includes(t));
    if (!hasAny) return false;
  }
```

- [ ] **Step 3: Run existing tests**

Run: `cd /c/Users/öööö/louis-quest && npx vitest run src/companion/ 2>&1 | tail -10`
Expected: existing tests still pass (new field optional, defaults to empty array is safe since we check length)

- [ ] **Step 4: Add trait filter test**

Append to `src/companion/VoiceEngine.test.ts` (or create it if missing):

```ts
describe('pickLine trait gating', () => {
  const lines: VoiceLine[] = [
    { id: 'generic',   text: 'hi', triggers: ['hub_open'] },
    { id: 'brave',     text: 'you are brave', triggers: ['hub_open'], requiredTraits: ['brave'] },
    { id: 'gentle',    text: 'so gentle', triggers: ['hub_open'], requiredTraits: ['gentle'] },
  ];
  const baseCtx: VoiceContext = {
    trigger: 'hub_open', timeOfDay: 'morning', weather: null, mood: null,
    stage: 'baby', questsCompletedToday: 0, lang: 'de', earnedTraits: [],
  };

  it('excludes trait-gated lines when trait not earned', () => {
    const picked = pickLine(baseCtx, lines, {});
    expect(picked?.id).toBe('generic');
  });

  it('includes trait-gated lines when trait earned', () => {
    const picked = pickLine({ ...baseCtx, earnedTraits: ['brave'] }, lines, {});
    expect(['generic', 'brave']).toContain(picked?.id);
    expect(picked?.id).not.toBe('gentle');
  });
});
```

Run: `npx vitest run src/companion/ 2>&1 | tail -15`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/companion/VoiceEngine.ts src/companion/VoiceEngine.test.ts
git commit -m "feat: trait gating in voice line picker"
```

### Task 2.3: Persist earnedTraits in TaskState

- [ ] **Step 1: Read the TaskState interface**

Run: `sed -n '27,90p' /c/Users/öööö/louis-quest/src/context/TaskContext.tsx`
Find the `TaskState` interface.

- [ ] **Step 2: Add earnedTraits field**

Edit `src/context/TaskContext.tsx`. Find line (~68) with `birthdayEpic: { done: string[]; completed: boolean };` and add right after:

```ts
  earnedTraits: string[];
```

Then find the default state initialization (around line ~200):

```ts
    birthdayEpic: { done: [], completed: false },
```

Add after it:

```ts
    earnedTraits: [],
```

Then find the raw-state hydration (around line ~300):

```ts
          birthdayEpic: raw.birthdayEpic || { done: [], completed: false },
```

Add after it:

```ts
          earnedTraits: raw.earnedTraits || [],
```

- [ ] **Step 3: Verify no runtime crashes**

Run: `cd /c/Users/öööö/louis-quest && npx vite build 2>&1 | tail -5`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): persist earnedTraits: string[]"
```

### Task 2.4: Wire earnedTraits through useVoice

- [ ] **Step 1: Read useVoice context construction**

Run: `sed -n '95,125p' /c/Users/öööö/louis-quest/src/companion/useVoice.ts`

- [ ] **Step 2: Add earnedTraits to ctx**

In the `say` callback's `ctx: VoiceContext = { ... }` block, add:

```ts
        earnedTraits: s.earnedTraits || [],
```

- [ ] **Step 3: Commit**

```bash
git add src/companion/useVoice.ts
git commit -m "feat: pass earnedTraits into VoiceContext"
```

### Task 2.5: Grant traits on arc completion

- [ ] **Step 1: Read useArc advance logic**

Run: `sed -n '40,65p' /c/Users/öööö/louis-quest/src/arcs/useArc.ts`

- [ ] **Step 2: Wire trait grant**

In `useArc.ts` `advance` callback, find the `justCompleted` block and extend it:

**Before:**
```ts
  const advance = useCallback((beatId: string) => setArcState(s => {
    const prev = s;
    const next = advanceBeat(s, beatId);
    // Play Drachenmutter outro when arc just completed
    const justCompleted = next.completedArcIds.length > prev.completedArcIds.length;
    if (justCompleted) {
      const lastId = next.completedArcIds[next.completedArcIds.length - 1];
      const narr = ARC_NARRATOR[lastId];
      if (narr) VoiceAudio.playNarrator(narr.outro, 1200);
    }
    return next;
  }), []);
```

**After:**
```ts
  const advance = useCallback((beatId: string) => setArcState(s => {
    const prev = s;
    const next = advanceBeat(s, beatId);
    const justCompleted = next.completedArcIds.length > prev.completedArcIds.length;
    if (justCompleted) {
      const lastId = next.completedArcIds[next.completedArcIds.length - 1];
      const narr = ARC_NARRATOR[lastId];
      if (narr) VoiceAudio.playNarrator(narr.outro, 1200);
      // Grant traits from arc reward
      const arc = findArc(lastId);
      const traitIds = arc?.rewardOnComplete?.traitIds || [];
      if (traitIds.length > 0) {
        // Read current from state, add new ones dedup'd, persist
        const currentTraits = (state as any)?.earnedTraits || [];
        const merged = Array.from(new Set([...currentTraits, ...traitIds]));
        actions.patchState({ earnedTraits: merged } as any);
      }
    }
    return next;
  }), [state, actions]);
```

Note: need to verify `actions` and `state` are available in scope. If not, read the top of `useArc.ts` to see what's destructured from `useTask()`.

- [ ] **Step 3: Verify**

Run: `cd /c/Users/öööö/louis-quest && npx vite build 2>&1 | tail -5`
Expected: builds

- [ ] **Step 4: Commit**

```bash
git add src/arcs/useArc.ts
git commit -m "feat: grant arc traits into state.earnedTraits on completion"
```

### Task 2.6: RonkiProfile reads from state.earnedTraits

- [ ] **Step 1: Read current traits logic**

Run: `grep -n "TRAIT_POOL\|earnedTraits" /c/Users/öööö/louis-quest/src/components/RonkiProfile.jsx | head -10`
Expected: sees `earnedTraits = TRAIT_POOL.filter(tr => tr.when(state))` — the old milestone-based inference.

- [ ] **Step 2: Add dual-source resolution**

Edit `src/components/RonkiProfile.jsx`. Find:

```jsx
  const earnedTraits = TRAIT_POOL.filter(tr => tr.when(state));
```

Replace with:

```jsx
  const stateTraits = state.earnedTraits || [];
  // Combine: traits granted by arcs (state) + milestone-inferred (legacy visual feedback)
  const earnedTraits = TRAIT_POOL.filter(tr => stateTraits.includes(tr.id) || tr.when(state));
```

- [ ] **Step 3: Verify no duplicates in render**

The filter is `OR` — if a trait is both in `stateTraits` AND its `when()` returns true, `filter` will include it once. No dedup needed.

Run: `grep -n "earnedTraits\.map\|earnedTraits\.length" /c/Users/öööö/louis-quest/src/components/RonkiProfile.jsx`
Expected: renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/RonkiProfile.jsx
git commit -m "feat: RonkiProfile shows state.earnedTraits + milestone fallbacks"
```

### Task 2.7: Add trait-gated voice lines

- [ ] **Step 1: Append identity-language lines to de.ts**

Edit `src/companion/lines/de.ts`. Add before closing `];`:

```ts
  // ═══════════════════════════════════════
  // TRAIT-GATED — identity language (Atomic Habits)
  // Unlock after earning the named trait from an arc completion
  // ═══════════════════════════════════════
  { id: 'de_trait_brave_01',     text: 'Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.', triggers: ['hub_open', 'quest_complete'], requiredTraits: ['brave'] },
  { id: 'de_trait_brave_02',     text: 'Mutig sein heißt nicht, keine Angst zu haben. Du weißt das.', triggers: ['hub_open'], requiredTraits: ['brave'] },
  { id: 'de_trait_gentle_01',    text: 'Deine Ruhe tut allen gut. Auch mir.', triggers: ['hub_open', 'sanctuary_open'], requiredTraits: ['gentle'] },
  { id: 'de_trait_patient_01',   text: 'Du wartest geduldig — das können nicht alle. Ich lerne von dir.', triggers: ['hub_open'], requiredTraits: ['patient'] },
  { id: 'de_trait_mapmaker_01',  text: 'Der Kartenmacher ist zurück! Was entdeckst du heute?', triggers: ['hub_open'], requiredTraits: ['mapmaker'] },
  { id: 'de_trait_curious_01',   text: 'Du stellst immer die besten Fragen. Was fragst du dich heute?', triggers: ['idle'], requiredTraits: ['curious'] },
  { id: 'de_trait_multi_01',     text: 'Du hast schon so viele Wesenszüge. Du wirst ein großer Held.', triggers: ['hub_open'], requiredTraits: ['brave', 'gentle', 'patient', 'mapmaker'] },
```

- [ ] **Step 2: Generate audio for these 7 lines (pattern from Task 1.2 Step 4)**

Use the same ElevenLabs script with LINES dict updated. Skip if cost is a concern for now.

- [ ] **Step 3: Commit**

```bash
git add src/companion/lines/de.ts public/audio/ronki/de_trait_*.mp3
git commit -m "feat: 7 trait-gated identity-language voice lines (Atomic Habits)"
```

---

## Feature 3: Arcs Reliably Offer

**Why:** `useArc.ts` currently only calls `offer()` on Hub mount. After the first arc completes, there's a 48-hour cooldown. Combined with the `phase === 'idle'` check and per-arc cooldowns, offers rarely fire. Louis can go a week without seeing a new arc.

**Strategy:**
1. Reduce per-arc cooldown from 48h → 24h (research says 3-4 arcs/week is right for 6-year-olds)
2. Offer automatically on Hub mount IF: phase is idle AND engine cooldown is expired AND there's an uncompleted arc in `ARCS`
3. Add a persistent ArcActiveBanner to Hub when phase is active (already exists — verify it's visible)
4. Add "next arc unlocks in X hours" subtle hint on Hub when in cooldown

**Files:**
- Modify: `src/arcs/first-adventure.ts`, `src/arcs/listening-game.ts`, `src/arcs/ronkis-garden.ts`, `src/arcs/weather-walker.ts` (change `cooldownHours: 48` → `24`)
- Modify: `src/arcs/useArc.ts` (verify `offer()` triggers on hub_open)
- Modify: `src/components/Hub.jsx` (ensure ArcActiveBanner shows, add cooldown hint)

### Task 3.1: Shorten arc cooldowns

- [ ] **Step 1: Update all 4 arcs**

Run 4 sed commands:

```bash
cd /c/Users/öööö/louis-quest
sed -i 's/cooldownHours: 48/cooldownHours: 24/' src/arcs/first-adventure.ts src/arcs/listening-game.ts src/arcs/ronkis-garden.ts src/arcs/weather-walker.ts
```

- [ ] **Step 2: Verify change**

Run: `grep "cooldownHours" src/arcs/*.ts | grep -v test`
Expected: 4 arcs all show `cooldownHours: 24`

- [ ] **Step 3: Run arc engine tests**

Run: `npx vitest run src/arcs/ 2>&1 | tail -10`
Expected: tests pass (cooldown value isn't hardcoded in tests beyond referencing `arc.cooldownHours`)

- [ ] **Step 4: Commit**

```bash
git add src/arcs/*.ts
git commit -m "feat: arc cooldowns 48h → 24h for more frequent offers"
```

### Task 3.2: Make offer() trigger reliably

- [ ] **Step 1: Check current Hub arc offer call**

Run: `grep -n "offer()\|arcPhase\|useArc" /c/Users/öööö/louis-quest/src/components/Hub.jsx | head -10`
Expected: `useArc()` imported, `offer()` called in useEffect on mount

- [ ] **Step 2: Verify the mount-offer logic**

Run: `sed -n '50,60p' /c/Users/öööö/louis-quest/src/components/Hub.jsx`
Expected (approximately):
```js
useEffect(() => {
  if (arcPhase === 'idle') {
    offer();
  }
}, []);  // mount-only
```

If the logic is correct, move on. If not, fix to match above.

- [ ] **Step 3: Upgrade the condition to also check expired cooldown**

Edit the useEffect. Replace with:

```js
  const { phase: arcPhase, offer, offeredArc, activeArc, inCooldown } = useArc();
  useEffect(() => {
    // Offer a new arc when: nothing active, no pending offer, not in cooldown
    if (arcPhase === 'idle' && !offeredArc) {
      offer();
    }
  }, [arcPhase, offeredArc, offer]);
```

Note: `offer()` inside the engine is a no-op if still in cooldown (see ArcEngine.ts `isInCooldown` check at line 25), so this is safe.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hub.jsx
git commit -m "feat: arc offering triggers whenever Hub sees idle phase + no pending offer"
```

### Task 3.3: Visible "Next arc in..." hint on Hub

- [ ] **Step 1: Find ArcActiveBanner or add cooldown banner**

Run: `grep -n "ArcActiveBanner\|inCooldown" /c/Users/öööö/louis-quest/src/components/Hub.jsx | head -5`

- [ ] **Step 2: Add a cooldown hint near the companion**

Below `<ArcActiveBanner onOpenBeat={setOpenBeat} />` (~line 150 of Hub.jsx), insert:

```jsx
        {/* Arc cooldown hint — only shown when in cooldown */}
        {inCooldown && !activeArc && !offeredArc && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
               style={{ background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.25)', width: 'fit-content' }}>
            <span className="text-base">💤</span>
            <span className="font-label text-xs text-on-surface-variant">
              {lang === 'de' ? 'Ronki ruht sich aus. Bald gibt es ein neues Abenteuer.' : 'Ronki is resting. A new adventure soon.'}
            </span>
          </div>
        )}
```

- [ ] **Step 3: Destructure `inCooldown` and `activeArc` in Hub**

Verify the Hub destructures: `const { phase: arcPhase, offer, offeredArc, activeArc, inCooldown } = useArc();` (matches Task 3.2).

- [ ] **Step 4: Commit**

```bash
git add src/components/Hub.jsx
git commit -m "feat: arc cooldown hint on Hub when Ronki is resting between adventures"
```

---

## Feature 4: End-of-Day Ritual

**Why:** The app has no closing ritual. Louis finishes his evening/bedtime routine and the screen just sits there. Habit research says rituals anchor behaviors. A 30-second closing sequence (Ronki curls up, Louis records a highlight, Drachenmutter says Gute Nacht) is high-impact.

**Files:**
- Create: `src/components/EveningRitual.jsx` (the 30-second sequence)
- Modify: `src/components/Hub.jsx` (wire the trigger)
- Modify: `src/context/TaskContext.tsx` (track `eveningRitualCompletedAt`)
- Generate: 3 new Drachenmutter narrator audio files

### Task 4.1: Add ritual state to TaskContext

- [ ] **Step 1: Read current state shape**

Run: `grep -n "bedtimeDone\|eveningRitual\|totalTaskDays" /c/Users/öööö/louis-quest/src/context/TaskContext.tsx | head -10`

- [ ] **Step 2: Add eveningRitualCompletedAt field**

Edit `src/context/TaskContext.tsx`. In the TaskState interface (~line 68), add after `earnedTraits`:

```ts
  /** ISO date (YYYY-MM-DD) when evening ritual was last completed. Resets daily. */
  eveningRitualCompletedAt?: string;
```

In the default state init (~line 200), add:

```ts
    eveningRitualCompletedAt: undefined,
```

In raw-state hydration (~line 300):

```ts
          eveningRitualCompletedAt: raw.eveningRitualCompletedAt || undefined,
```

- [ ] **Step 3: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): eveningRitualCompletedAt — one-per-day bedtime ritual marker"
```

### Task 4.2: Generate Drachenmutter bedtime audio

- [ ] **Step 1: Create script**

Save as `/tmp/ritual_audio.py`:

```python
import json, os, urllib.request, time
API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')
VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'  # Bella — Drachenmutter
OUT_DIR = '/c/Users/öööö/louis-quest/public/audio/narrator'
VS = {'stability': 0.75, 'similarity_boost': 0.65, 'style': 0.30}
LINES = {
  'ritual_start':  "Der Tag neigt sich. Ronki ist müde von all den Abenteuern... und du vielleicht auch.",
  'ritual_ask':    "Erzähl mir eins noch: Was war heute schön? Irgendetwas Kleines reicht.",
  'ritual_goodnight': "Schlaf gut, kleiner Held. Morgen wartet wieder ein Abenteuer. Träum süß.",
}
for lid, text in LINES.items():
  out = f'{OUT_DIR}/{lid}.mp3'
  if os.path.exists(out) and os.path.getsize(out) > 1000:
    print(f'skip {lid}'); continue
  payload = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': VS}).encode('utf-8')
  req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}', data=payload,
    headers={'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
  with urllib.request.urlopen(req, timeout=30) as resp:
    with open(out, 'wb') as f: f.write(resp.read())
  print(f'OK {lid} ({os.path.getsize(out)//1024}K)')
  time.sleep(0.6)
```

- [ ] **Step 2: Run it**

```bash
cd /c/Users/öööö/louis-quest && set -a; source .env; set +a; PYTHONIOENCODING=utf-8 python3 /tmp/ritual_audio.py
```
Expected: 3 `OK ...` lines

- [ ] **Step 3: Commit audio files**

```bash
git add public/audio/narrator/ritual_*.mp3
git commit -m "feat: 3 Drachenmutter bedtime ritual audio lines"
```

### Task 4.3: Build EveningRitual component

- [ ] **Step 1: Create file**

Create `src/components/EveningRitual.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import VoiceAudio from '../utils/voiceAudio';
import SFX from '../utils/sfx';
import CooldownButton from './CooldownButton';

/**
 * EveningRitual — 30-second end-of-day closing sequence.
 *
 * Flow:
 *  1. Drachenmutter: "Der Tag neigt sich..." (intro)
 *  2. Drachenmutter: "Was war heute schön?" → Louis types 1-3 words (or skips)
 *  3. Drachenmutter: "Schlaf gut..." (goodnight)
 *  4. Fade out → close
 *
 * State: when completed, writes state.eveningRitualCompletedAt = today's date.
 * Parent (Hub) should only mount this when:
 *   - It's evening time (after 18:00)
 *   - Bedtime quests are done (or at least evening quests)
 *   - eveningRitualCompletedAt !== today
 */
const base = import.meta.env.BASE_URL;
const DRAGON_ART = ['dragon-egg', 'dragon-baby', 'dragon-young', 'dragon-majestic', 'dragon-legendary'];

export default function EveningRitual({ stage = 1, onClose }) {
  const { state, actions } = useTask();
  const { lang } = useTranslation();
  const [phase, setPhase] = useState('intro'); // intro | ask | write | goodnight | done
  const [highlight, setHighlight] = useState('');
  const startedRef = useRef(false);

  // Play intro audio on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    VoiceAudio.playNarrator('ritual_start', 600);
    const t = setTimeout(() => setPhase('ask'), 5200);
    return () => clearTimeout(t);
  }, []);

  // Play ask audio when entering ask phase
  useEffect(() => {
    if (phase === 'ask') {
      VoiceAudio.playNarrator('ritual_ask', 400);
      const t = setTimeout(() => setPhase('write'), 3800);
      return () => clearTimeout(t);
    }
    if (phase === 'goodnight') {
      VoiceAudio.playNarrator('ritual_goodnight', 300);
      const t = setTimeout(() => {
        finish();
      }, 4800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const saveAndAdvance = () => {
    const entry = highlight.trim();
    if (entry) {
      // Save to journal as a gratitude entry for today
      const today = new Date().toISOString().slice(0, 10);
      const existing = state?.journalGratitude || [];
      if (!existing.includes(entry)) {
        actions.patchState({ journalGratitude: [...existing, entry] });
      }
    }
    setPhase('goodnight');
  };

  const finish = () => {
    const today = new Date().toISOString().slice(0, 10);
    actions.patchState({ eveningRitualCompletedAt: today });
    SFX.play('chime');
    onClose?.();
  };

  const artFile = DRAGON_ART[stage] || 'dragon-baby';

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(160deg, #0a0a2e 0%, #1a0f3a 50%, #2d1b4e 100%)' }}>
      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
               style={{
                 width: 2, height: 2,
                 top: `${Math.random() * 60}%`,
                 left: `${Math.random() * 100}%`,
                 background: 'white',
                 opacity: 0.3 + Math.random() * 0.4,
                 boxShadow: '0 0 4px white',
                 animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
               }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-md">
        {/* Sleeping Ronki */}
        <div className="w-40 h-40 rounded-full overflow-hidden mb-6 relative"
             style={{ border: '2px solid rgba(252,211,77,0.35)', boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
          <img src={`${base}art/companion/${artFile}.webp`} alt=""
               className="w-full h-full object-cover"
               style={{ filter: 'brightness(0.7) saturate(0.8)' }} />
        </div>

        {phase === 'intro' && (
          <>
            <p className="font-body text-lg text-white/70 italic leading-relaxed">
              Der Tag neigt sich...
            </p>
          </>
        )}

        {phase === 'ask' && (
          <>
            <p className="font-body text-lg text-white/70 italic leading-relaxed">
              Was war heute schön?
            </p>
          </>
        )}

        {phase === 'write' && (
          <>
            <h2 className="font-headline font-bold text-2xl text-white mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Was war heute schön?
            </h2>
            <input type="text"
                   value={highlight}
                   onChange={e => setHighlight(e.target.value)}
                   maxLength={60}
                   placeholder="Zum Beispiel: Eis gegessen..."
                   className="w-full px-5 py-4 rounded-2xl font-body text-base text-on-surface outline-none mb-4"
                   style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(252,211,77,0.4)' }}
                   autoFocus />
            <div className="flex gap-3 w-full">
              <button onClick={() => setPhase('goodnight')}
                className="flex-1 py-3 rounded-full font-label font-bold text-sm text-white/60"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                Nichts heute
              </button>
              <button onClick={saveAndAdvance}
                className="flex-1 py-3 rounded-full font-label font-bold text-sm"
                style={{ background: '#fcd34d', color: '#725b00' }}>
                Speichern ✨
              </button>
            </div>
          </>
        )}

        {phase === 'goodnight' && (
          <>
            <p className="font-body text-lg text-white/80 italic leading-relaxed mb-4">
              Schlaf gut, kleiner Held.
            </p>
            <p className="font-label text-xs text-white/40 uppercase tracking-widest">
              Drück irgendwo, um zu schließen
            </p>
            <button onClick={finish} className="absolute inset-0" aria-label="close" />
          </>
        )}
      </div>

      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit component**

```bash
git add src/components/EveningRitual.jsx
git commit -m "feat: EveningRitual component — 30-second bedtime closing with Drachenmutter"
```

### Task 4.4: Wire ritual trigger in Hub

- [ ] **Step 1: Import EveningRitual in Hub**

Edit `src/components/Hub.jsx`. Add near other component imports:

```jsx
import EveningRitual from './EveningRitual';
```

- [ ] **Step 2: Add trigger state and condition**

Inside the Hub component, add near other `useState`:

```jsx
  const [showEveningRitual, setShowEveningRitual] = useState(false);

  // Trigger evening ritual when: evening + all-done + hasn't happened today yet
  useEffect(() => {
    const hour = new Date().getHours();
    const today = new Date().toISOString().slice(0, 10);
    const alreadyDone = state?.eveningRitualCompletedAt === today;
    const bedtimeDone = (state?.quests || []).filter(q => q.anchor === 'bedtime' && !q.sideQuest).every(q => q.done);
    const hasBedtimeQuests = (state?.quests || []).some(q => q.anchor === 'bedtime' && !q.sideQuest);
    if (hour >= 18 && hasBedtimeQuests && bedtimeDone && !alreadyDone && !showEveningRitual) {
      setShowEveningRitual(true);
    }
  }, [state?.quests, state?.eveningRitualCompletedAt]);
```

- [ ] **Step 3: Render the ritual**

Near the bottom of the Hub return (before closing `</div>`), add:

```jsx
      {showEveningRitual && (
        <EveningRitual
          stage={getCatStage(state?.catEvo || 0)}
          onClose={() => setShowEveningRitual(false)}
        />
      )}
```

- [ ] **Step 4: Verify imports**

Check `getCatStage` is imported at the top of Hub.jsx (it already should be for the companion section).

Run: `grep "getCatStage" /c/Users/öööö/louis-quest/src/components/Hub.jsx | head -2`

- [ ] **Step 5: Verify build**

Run: `cd /c/Users/öööö/louis-quest && npx vite build 2>&1 | tail -5`
Expected: builds successfully

- [ ] **Step 6: Commit**

```bash
git add src/components/Hub.jsx
git commit -m "feat: wire EveningRitual trigger into Hub (evening + bedtime-done + once/day)"
```

---

## Feature 5: Micropedia Earned, Not Given

**Why:** All 9 seed creatures are visible from Day 1 — no dopamine of discovery. Research says reward moments compound. Tie each creature to a real action so Louis has a reason to engage with every system.

**Strategy:**
- Remove always-visible SEED_CREATURES
- Define DISCOVERY_TRIGGERS: each creature has a `condition(state)` function
- Add `useMicropediaDiscovery` hook that runs each render, unlocks creatures on condition match
- Show a toast when a new creature is found (CreatureDiscoveryToast)

**Files:**
- Modify: `src/components/Micropedia.jsx` (use state.micropediaDiscovered, remove always-visible seed)
- Create: `src/hooks/useMicropediaDiscovery.ts` (discovery logic + triggers)
- Create: `src/components/CreatureDiscoveryToast.jsx` (celebration overlay)
- Modify: `src/context/TaskContext.tsx` (ensure micropediaDiscovered exists)
- Modify: `src/App.jsx` (mount the discovery hook at app level)

### Task 5.1: Define discovery triggers

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useMicropediaDiscovery.ts`:

```ts
import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';

/**
 * useMicropediaDiscovery — unlocks creatures when their condition is met.
 * Runs whenever state changes. Idempotent — once unlocked, stays unlocked.
 *
 * Each creature in CREATURE_TRIGGERS has:
 *   - id: matches the creature ID in Micropedia SEED_CREATURES
 *   - condition: a pure function of state that returns true when this creature
 *     should be discoverable.
 *
 * When a new creature is unlocked, we push it to state.micropediaDiscovered
 * AND fire a callback (onDiscover) so UI can toast.
 */

export interface DiscoveryTrigger {
  id: string;
  condition: (state: any) => boolean;
  chapter: 'forest' | 'sky' | 'water' | 'dream' | 'hearth';
}

export const CREATURE_TRIGGERS: DiscoveryTrigger[] = [
  // Forest — earned by doing daily tasks
  { id: 'forest_0', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 1 },
  { id: 'forest_1', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 3 },
  { id: 'forest_2', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 10 },
  { id: 'forest_3', chapter: 'forest', condition: s => (s.arcEngine?.completedArcIds || []).includes('first-adventure') },
  // Sky — weather-driven
  { id: 'sky_0', chapter: 'sky', condition: s => (s.viewsVisited || []).includes('games') },
  // Water — care-driven
  { id: 'water_0', chapter: 'water', condition: s => (s.dailyWaterCount || 0) >= 6 },
  { id: 'water_1', chapter: 'water', condition: s => (s.journalHistory || []).length >= 1 },
  { id: 'water_2', chapter: 'water', condition: s => (s.catFed && s.catPetted && s.catPlayed) },
  { id: 'water_3', chapter: 'water', condition: s => (s.bossTrophies || []).length >= 1 },
  // Dream — reflection-driven
  { id: 'dream_0', chapter: 'dream', condition: s => s.moodAM !== null && s.moodAM !== undefined },
  { id: 'dream_1', chapter: 'dream', condition: s => (s.journalHistory || []).length >= 3 },
  { id: 'dream_2', chapter: 'dream', condition: s => (s.arcEngine?.completedArcIds || []).length >= 2 },
  // Hearth — relationship-driven
  { id: 'hearth_0', chapter: 'hearth', condition: s => (s.totalTaskDays || 0) >= 3 },
];

type DiscoveredEntry = { id: string; chapter: string; discoveredAt: string };

export function useMicropediaDiscovery(onDiscover?: (id: string) => void) {
  const { state, actions } = useTask();

  useEffect(() => {
    if (!state) return;
    const discovered: DiscoveredEntry[] = state.micropediaDiscovered || [];
    const discoveredIds = new Set(discovered.map(d => d.id));
    const newOnes = CREATURE_TRIGGERS.filter(t => !discoveredIds.has(t.id) && t.condition(state));

    if (newOnes.length === 0) return;

    const now = new Date().toISOString();
    const next = [
      ...discovered,
      ...newOnes.map(t => ({ id: t.id, chapter: t.chapter, discoveredAt: now })),
    ];
    actions.patchState({ micropediaDiscovered: next } as any);

    // Notify UI of the first new discovery (toast one at a time to not overwhelm)
    if (onDiscover && newOnes.length > 0) {
      onDiscover(newOnes[0].id);
    }
  }, [state, actions, onDiscover]);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /c/Users/öööö/louis-quest && npx tsc --noEmit 2>&1 | grep -i "useMicropediaDiscovery\|error" | head -10`
Expected: no errors in this file specifically

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMicropediaDiscovery.ts
git commit -m "feat: useMicropediaDiscovery hook with 13 creature triggers"
```

### Task 5.2: Add state field for discovered creatures

- [ ] **Step 1: Check if field exists**

Run: `grep "micropediaDiscovered" /c/Users/öööö/louis-quest/src/context/TaskContext.tsx | head -3`

If it exists, skip to 5.3.

- [ ] **Step 2: Add field to TaskState**

Edit `src/context/TaskContext.tsx`. Add to the TaskState interface (near `earnedTraits`):

```ts
  /** Creatures discovered via useMicropediaDiscovery. One entry per unlock. */
  micropediaDiscovered?: Array<{ id: string; chapter: string; discoveredAt: string }>;
```

Add default init:

```ts
    micropediaDiscovered: [],
```

Add raw-state hydration:

```ts
          micropediaDiscovered: raw.micropediaDiscovered || [],
```

- [ ] **Step 3: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): micropediaDiscovered array for creature unlock tracking"
```

### Task 5.3: Build CreatureDiscoveryToast

- [ ] **Step 1: Create the toast component**

Create `src/components/CreatureDiscoveryToast.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import VoiceAudio from '../utils/voiceAudio';
import SFX from '../utils/sfx';

const base = import.meta.env.BASE_URL;

// Mirror of SEED_CREATURES in Micropedia.jsx — for name/art lookup
const CREATURE_META = {
  forest_0: { name: { de: 'Glutfunke', en: 'Emberspark' },     art: 'art/micropedia/creatures/creature-1.webp' },
  forest_1: { name: { de: 'Moostänzer', en: 'Mossdancer' },    art: 'art/micropedia/creatures/creature-2.webp' },
  forest_2: { name: { de: 'Knorrbart', en: 'Gnarlfang' },      art: 'art/micropedia/creatures/creature-3.webp' },
  forest_3: { name: { de: 'Rotling', en: 'Redling' },          art: 'art/micropedia/creatures/creature-6.webp' },
  sky_0:    { name: { de: 'Sturmflügel', en: 'Stormwing' },    art: 'art/micropedia/creatures/creature-8.webp' },
  water_0:  { name: { de: 'Perlenfisch', en: 'Pearlfish' },    art: 'art/micropedia/creatures/creature-water-1.webp' },
  water_1:  { name: { de: 'Wellentänzer', en: 'Wavedancer' },  art: 'art/micropedia/creatures/creature-water-2.webp' },
  water_2:  { name: { de: 'Muscheljuwel', en: 'Shellgem' },    art: 'art/micropedia/creatures/creature-water-3.webp' },
  water_3:  { name: { de: 'Nebelkrabbe', en: 'Mistcrab' },     art: 'art/micropedia/creatures/creature-water-4.webp' },
  dream_0:  { name: { de: 'Lichtflüstern', en: 'Glowwhisper' },art: 'art/micropedia/creatures/creature-4.webp' },
  dream_1:  { name: { de: 'Nachtflügel', en: 'Nightwing' },    art: 'art/micropedia/creatures/creature-9.webp' },
  dream_2:  { name: { de: 'Sternenschatten', en: 'Starshadow' },art: 'art/micropedia/creatures/creature-10.webp' },
  hearth_0: { name: { de: 'Goldauge', en: 'Goldeye' },         art: 'art/micropedia/creatures/creature-7.webp' },
};

/**
 * CreatureDiscoveryToast — celebration overlay when a new creature is unlocked.
 * Auto-dismisses after 4 seconds unless tapped.
 */
export default function CreatureDiscoveryToast({ creatureId, onDismiss }) {
  const { lang } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!creatureId) return;
    setVisible(true);
    SFX.play('coin');
    VoiceAudio.play('de_discover_creature', 500);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [creatureId]);

  if (!creatureId) return null;
  const meta = CREATURE_META[creatureId];
  if (!meta) return null;

  const name = meta.name[lang] || meta.name.de;

  return (
    <div onClick={onDismiss}
         className="fixed inset-x-0 top-16 z-[700] flex justify-center px-6 pointer-events-auto"
         style={{ transform: visible ? 'translateY(0)' : 'translateY(-20px)', opacity: visible ? 1 : 0, transition: 'all 0.3s ease' }}>
      <div className="rounded-2xl p-4 flex items-center gap-3 max-w-sm w-full"
           style={{
             background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
             boxShadow: '0 12px 32px rgba(252,211,77,0.4), 0 4px 0 #d4a830',
             border: '2px solid rgba(161,98,7,0.2)',
           }}>
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
          <img src={base + meta.art} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#78350f' }}>
            {lang === 'de' ? 'Neu entdeckt!' : 'Newly found!'}
          </p>
          <p className="font-headline font-bold text-lg truncate" style={{ color: '#451a03' }}>
            {name} 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CreatureDiscoveryToast.jsx
git commit -m "feat: CreatureDiscoveryToast — animated celebration overlay"
```

### Task 5.4: Mount discovery hook + toast at app level

- [ ] **Step 1: Wire into App.jsx**

Edit `src/App.jsx`. Add imports near the top:

```jsx
import { useMicropediaDiscovery } from './hooks/useMicropediaDiscovery';
import CreatureDiscoveryToast from './components/CreatureDiscoveryToast';
```

In `AppContent()` (the main component that uses `useTask`), add state and wire the hook:

```jsx
  const [discoveryToast, setDiscoveryToast] = useState(null);
  useMicropediaDiscovery((id) => setDiscoveryToast(id));
```

Near the bottom of the return (before closing `</div>`), render the toast:

```jsx
      {discoveryToast && (
        <CreatureDiscoveryToast
          creatureId={discoveryToast}
          onDismiss={() => setDiscoveryToast(null)}
        />
      )}
```

- [ ] **Step 2: Verify**

Run: `cd /c/Users/öööö/louis-quest && npx vite build 2>&1 | tail -5`
Expected: builds

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: mount Micropedia discovery hook at app level with discovery toast"
```

### Task 5.5: Remove always-visible seed from Micropedia

- [ ] **Step 1: Read current Micropedia discovery logic**

Run: `sed -n '85,110p' /c/Users/öööö/louis-quest/src/components/Micropedia.jsx`
Expected: sees `const discovered = [...SEED_CREATURES, ...dynamicDiscovered.filter(...)]`

- [ ] **Step 2: Change to state-only source**

Edit `src/components/Micropedia.jsx`. Find:

```jsx
  // Merge seed creatures (always visible in Phase 1) with future arc discoveries
  const dynamicDiscovered = state?.micropediaDiscovered || [];
  const discovered = [...SEED_CREATURES, ...dynamicDiscovered.filter(d => !SEED_CREATURES.find(s => s.id === d.id))];
```

Replace with:

```jsx
  // Only creatures Louis has actually discovered via useMicropediaDiscovery
  const dynamicDiscovered = state?.micropediaDiscovered || [];
  // Enrich each discovered ID with full creature data (name, art, flavor) from SEED_CREATURES lookup
  const discovered = dynamicDiscovered
    .map(d => {
      const seed = SEED_CREATURES.find(s => s.id === d.id);
      return seed ? { ...seed, discoveredAt: d.discoveredAt } : null;
    })
    .filter(Boolean);
```

- [ ] **Step 3: Seed existing users via a migration**

In `TaskContext.tsx`, add to the state hydration step (where we already check `_v2_economy_reset`):

Run: `grep -n "_v2_economy_reset" /c/Users/öööö/louis-quest/src/context/TaskContext.tsx | head -5`

If there's a similar migration pattern, follow it. Otherwise, just skip — existing users will start with an empty discoveries list and unlock creatures as they re-engage. This is acceptable because Louis is the only user and he can re-earn them quickly.

- [ ] **Step 4: Test**

Start dev server, open Micropedia. Should show ~0 creatures initially (empty silhouettes), then over time as state matches triggers (totalTasksDone >= 1 etc.), creatures appear one by one with toasts.

- [ ] **Step 5: Commit**

```bash
git add src/components/Micropedia.jsx
git commit -m "feat: Micropedia shows only discovered creatures (no more always-visible seed)"
```

---

## Integration & Deploy

### Task 6.1: Verify all features together

- [ ] **Step 1: Run full build**

Run: `cd /c/Users/öööö/louis-quest && npx vite build 2>&1 | tail -10`
Expected: build succeeds with no errors

- [ ] **Step 2: Run tests**

Run: `cd /c/Users/öööö/louis-quest && npx vitest run 2>&1 | tail -15`
Expected: all tests pass

- [ ] **Step 3: Check for any lingering issues**

Run: `cd /c/Users/öööö/louis-quest && grep -rn "TODO\|FIXME" src/companion src/arcs src/hooks/useMicropedia* src/components/EveningRitual.jsx src/components/CreatureDiscoveryToast.jsx 2>/dev/null | grep -v "\.test\.\|node_modules"`

Expected: no new TODOs introduced by this plan

### Task 6.2: Push to production

- [ ] **Step 1: Final commit + push**

```bash
cd /c/Users/öööö/louis-quest
git push origin main
```

- [ ] **Step 2: Watch the deploy**

Run: `gh run watch --exit-status 2>&1 | tail -5`
Expected: workflow success

- [ ] **Step 3: Smoke-test live**

Open https://iamyaws.github.io/Ronki/ in a fresh browser window. Verify:
- Mood-aware lines fire when mood is set
- Traits appear in RonkiProfile after completing an arc
- Arc cooldown hint shows when resting
- EveningRitual triggers after bedtime quests + past 18:00
- Micropedia starts mostly empty, creatures unlock with progress

---

## Self-Review Checklist

**Spec coverage:**
- ✅ #1 Mood-aware Ronki — Tasks 1.1–1.3
- ✅ #2 Traits operational — Tasks 2.1–2.7
- ✅ #3 Arcs reliably offer — Tasks 3.1–3.3
- ✅ #4 End-of-day ritual — Tasks 4.1–4.4
- ✅ #5 Micropedia earned — Tasks 5.1–5.5

**Type consistency:**
- `MoodTag` used consistently from `types.ts` in useVoice + lines + VoiceEngine
- `earnedTraits: string[]` consistent in TaskState, VoiceContext, useArc, RonkiProfile
- `micropediaDiscovered` shape `{id, chapter, discoveredAt}` consistent in hook + toast + Micropedia

**Known trade-offs / acceptable simplifications:**
- Feature 5 removes existing users' always-visible seed creatures. Louis will re-discover them via triggers (~5 min of activity). Acceptable for a single-user app at this stage.
- Feature 2 combines state-traits with milestone-inferred traits in RonkiProfile so earned arc traits and legacy inferred traits both show. Avoids losing the existing "brave/gentle" inference logic while enabling arc-driven grants.
- Feature 3 uses a 24h cooldown that research supports for 3-4 arcs/week. If feels too frequent in testing, bump individual arcs back to 36h.
- Feature 4 triggers on `hour >= 18 && bedtime-done`. If Louis finishes evening routine at 5pm, the ritual won't fire that day — acceptable because the purpose is the closing association with bedtime, not rewarding early completion.
- Audio generation for new voice lines (Task 1.2 Step 4, Task 2.7 Step 2) uses ElevenLabs API. Skip if cost is a concern; the text lines still work (just no audio playback for those IDs until generated).

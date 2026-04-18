# Wave 2 Pilot Implementation Plan — Forest Pilzhüter

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the reusable Freunde reunion arc system + the Forest Pilzhüter arc end-to-end. All 18 Freunde stay under one name; the 5 reunion-arc Freunde are invisible in the grid until Louis unlocks their story.

**Architecture:** Extends the existing Arc Engine (`src/arcs/`) with a 4th `lore` callback beat. Adds two new TaskState fields. Reuses existing `ArcOfferCard` on the Hub with Freund-specific branding. Promotes the Freunde entry point in RonkiProfile from button to hero card.

**Spec:** `docs/superpowers/specs/2026-04-18-wave2-freunde-design.md`

**Execution order (3 phases, dispatched as subagents):**
1. **Phase A — Backend + data:** Types, TaskState, Freunde data file, Pilzhüter arc, unlock logic, callback scheduling, Drachenmutter audio
2. **Phase B — Beat + Hub UI:** Baum-Pose craft beat component, ArcOfferCard Freund-reunion branch
3. **Phase C — Navigation promotion:** RonkiProfile hero card

Each phase is one subagent (same pattern as Wave 1).

---

## Portrait / art fallback policy

Pilzhüter's painted portrait is deferred until Marc picks an art source. For the pilot:

- **Path in code:** `public/art/freunde/pilzhueter.webp` (assumed file; component handles missing file gracefully)
- **Fallback:** If the image 404s, render an earthy-green circular placeholder with the `forest` material icon (mirrors existing Micropedia grid fallback pattern at lines 248-256 of current `Micropedia.jsx`). Color: `#059669` (forest chapter color).
- **Baum-Pose illustration:** Pure SVG in the Baum-Pose beat component — kid silhouette, arms up as branches, one foot on the opposite leg. No external asset needed.

Once Marc provides the painted portrait, it drops into `public/art/freunde/pilzhueter.webp` with no code change.

---

## Phase A — Backend + data

**Files:**
- Modify: `src/arcs/types.ts`
- Modify: `src/context/TaskContext.tsx`
- Create: `src/data/freunde.ts`
- Create: `src/arcs/freund-pilzhueter.ts`
- Modify: `src/i18n/de.json`
- Modify: `src/i18n/en.json`
- Modify: `src/hooks/useSpecialQuests.ts`
- Create: `scripts/gen-pilzhueter-audio.py`
- Create: 4 × `public/audio/narrator/arc_pilzhueter_*.mp3`

### Task A.1 — Extend Arc type with optional freundId

- [ ] **Step 1: Add `freundId?: string` to Arc interface**

In `src/arcs/types.ts`, after the existing Arc fields:

```ts
  /** When set, this arc is a Freund reunion arc. Drives Hub card branding and
   *  Freunde-specific completion tracking. */
  freundId?: string;
```

Additive, non-breaking. Existing arcs continue to work.

- [ ] **Step 2: Commit**

```bash
git add src/arcs/types.ts
git commit -m "feat(arcs): add optional freundId to Arc type"
```

### Task A.2 — Add Freund state to TaskContext

- [ ] **Step 1: Extend TaskState interface in `src/context/TaskContext.tsx`**

Near the existing Freunde/Micropedia state additions:

```ts
  /** Freund reunion arcs Louis has completed end-to-end (all 4 beats). */
  freundArcsCompleted?: string[];
  /** Scheduled callback beats waiting to fire 5-7 days after beat 3. */
  freundCallbacksPending?: Array<{ freundId: string; triggerAt: string }>;
```

- [ ] **Step 2: Add defaults + hydration**

`createInitialState`:
```ts
    freundArcsCompleted: [],
    freundCallbacksPending: [],
```

Raw-state hydration:
```ts
          freundArcsCompleted: raw.freundArcsCompleted || [],
          freundCallbacksPending: raw.freundCallbacksPending || [],
```

- [ ] **Step 3: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): freundArcsCompleted + freundCallbacksPending"
```

### Task A.3 — Freunde data file

- [ ] **Step 1: Create `src/data/freunde.ts`**

```ts
/** Freunde — the 5 reunion-arc friends, one per Micropedia chapter.
 *  Pilot: only Pilzhüter has a complete arc in `src/arcs/freund-pilzhueter.ts`.
 *  The rest are metadata stubs — names, chapters, skills reserved.
 */

import type { ChapterId } from './creatures';

export interface FreundMeta {
  id: string;
  chapter: ChapterId;
  name: { de: string; en: string };
  portrait: string; // path relative to BASE_URL
  skillName: { de: string; en: string };
  /** Number of creatures discovered in this chapter that unlocks the reunion. */
  unlockThreshold: number;
  /** Whether this Freund's arc is built and shippable. Pilot = pilzhueter only. */
  implemented: boolean;
}

export const FREUNDE: FreundMeta[] = [
  {
    id: 'pilzhueter',
    chapter: 'forest',
    name: { de: 'Der Pilzhüter', en: 'The Mushroom Keeper' },
    portrait: 'art/freunde/pilzhueter.webp',
    skillName: { de: 'Baum-Pose', en: 'Tree Pose' },
    unlockThreshold: 2,
    implemented: true,
  },
  {
    id: 'windreiterin',
    chapter: 'sky',
    name: { de: 'Die Windreiterin', en: 'The Wind Rider' },
    portrait: 'art/freunde/windreiterin.webp',
    skillName: { de: 'Box-Atmung', en: 'Box Breathing' },
    unlockThreshold: 3,
    implemented: false,
  },
  {
    id: 'tiefentaucher',
    chapter: 'water',
    name: { de: 'Der Tiefentaucher', en: 'The Deep Diver' },
    portrait: 'art/freunde/tiefentaucher.webp',
    skillName: { de: 'Gefühle benennen', en: 'Naming feelings' },
    unlockThreshold: 2,
    implemented: false,
  },
  {
    id: 'sternenweberin',
    chapter: 'dream',
    name: { de: 'Die Sternenweberin', en: 'The Star Weaver' },
    portrait: 'art/freunde/sternenweberin.webp',
    skillName: { de: 'Kurze Meditation', en: 'Brief meditation' },
    unlockThreshold: 3,
    implemented: false,
  },
  {
    id: 'lichtbringerin',
    chapter: 'hearth',
    name: { de: 'Die Lichtbringerin', en: 'The Lightbringer' },
    portrait: 'art/freunde/lichtbringerin.webp',
    skillName: { de: 'Freundschaftsregeln', en: 'Friendship rules' },
    unlockThreshold: 4,
    implemented: false,
  },
];

export const FREUND_BY_ID: Map<string, FreundMeta> = new Map(FREUNDE.map(f => [f.id, f]));
export const FREUND_BY_CHAPTER: Map<string, FreundMeta> = new Map(FREUNDE.map(f => [f.chapter, f]));
```

- [ ] **Step 2: Commit**

```bash
git add src/data/freunde.ts
git commit -m "feat: Freunde metadata — 5 archetypes, Pilzhüter implemented"
```

### Task A.4 — Pilzhüter arc definition

- [ ] **Step 1: Create `src/arcs/freund-pilzhueter.ts`**

```ts
import type { Arc } from './types';

/**
 * Freund arc: Pilzhüter — Ronki's reunion with the old forest guide.
 * 4 beats: Reunion (lore) → Baum-Pose (craft) → Real Life tie-in (routine)
 *         → Callback (lore, fires 5-7 days after beat 3).
 *
 * The callback beat is scheduled in TaskState.freundCallbacksPending by
 * useSpecialQuests when beat 3 completes.
 */
export const FREUND_PILZHUETER: Arc = {
  id: 'freund-pilzhueter',
  titleKey: 'arc.pilzhueter.title',
  chapterKey: 'arc.pilzhueter.chapter',
  freundId: 'pilzhueter',
  beats: [
    {
      id: 'pil-b1-reunion',
      kind: 'lore',
      text: 'arc.pilzhueter.beats.reunion.text',
      narrativeBefore: 'arc.pilzhueter.beats.reunion.before',
      narrativeAfter: 'arc.pilzhueter.beats.reunion.after',
    },
    {
      id: 'pil-b2-pose',
      kind: 'craft',
      title: 'arc.pilzhueter.beats.pose.title',
      steps: [
        'arc.pilzhueter.beats.pose.step1',
        'arc.pilzhueter.beats.pose.step2',
        'arc.pilzhueter.beats.pose.step3',
        'arc.pilzhueter.beats.pose.step4',
      ],
      narrativeBefore: 'arc.pilzhueter.beats.pose.before',
      narrativeAfter: 'arc.pilzhueter.beats.pose.after',
    },
    {
      id: 'pil-b3-realife',
      kind: 'routine',
      questId: 's3', // Zähne putzen (morning), same quest first-adventure ties to
      narrativeBefore: 'arc.pilzhueter.beats.realife.before',
      narrativeAfter: 'arc.pilzhueter.beats.realife.after',
    },
    {
      id: 'pil-b4-callback',
      kind: 'lore',
      text: 'arc.pilzhueter.beats.callback.text',
      narrativeBefore: 'arc.pilzhueter.beats.callback.before',
      narrativeAfter: 'arc.pilzhueter.beats.callback.after',
    },
  ],
  rewardOnComplete: {
    xp: 60,
    coins: 15,
    traitIds: ['gentle', 'patient'],
  },
  cooldownHours: 24,
};
```

- [ ] **Step 2: Register the arc**

Find the existing arc registry (grep for the other 4 arcs imported together — likely in `src/arcs/index.ts` or wherever `FIRST_ADVENTURE` is re-exported). Add `FREUND_PILZHUETER` to the exports and to any ALL_ARCS array if one exists.

- [ ] **Step 3: Commit**

```bash
git add src/arcs/freund-pilzhueter.ts src/arcs/index.ts
git commit -m "feat: Pilzhüter reunion arc definition (4 beats)"
```

### Task A.5 — i18n strings for Pilzhüter arc

- [ ] **Step 1: Add German strings to `src/i18n/de.json`**

Find the existing `arc.*` strings (search for `"arc.first.title"` or `"arc.weather.title"`). Add a new block alongside:

```json
"arc.pilzhueter.title": "Der Pilzhüter",
"arc.pilzhueter.chapter": "Ein alter Freund kehrt zurück",
"arc.pilzhueter.beats.reunion.text": "Er hat dich wiedergefunden.",
"arc.pilzhueter.beats.reunion.before": "Ich muss dir was erzählen... Als ich ganz klein war, hab ich mich im Wald verlaufen. Zwischen den großen Wurzeln.",
"arc.pilzhueter.beats.reunion.after": "Der Pilzhüter hat mich gefunden. Er hat mir den Weg gezeigt. Wir wurden Freunde. Aber dann ist der Wald gewachsen... und wir haben uns aus den Augen verloren. Bis heute.",
"arc.pilzhueter.beats.pose.title": "Die Baum-Pose",
"arc.pilzhueter.beats.pose.step1": "Stell dich hin wie ein Baum. Beide Füße fest auf dem Boden.",
"arc.pilzhueter.beats.pose.step2": "Heb einen Fuß und leg ihn an dein anderes Bein.",
"arc.pilzhueter.beats.pose.step3": "Streck die Arme hoch — das sind deine Äste.",
"arc.pilzhueter.beats.pose.step4": "Atme tief. Halte. Du bist ein Baum.",
"arc.pilzhueter.beats.pose.before": "Der Pilzhüter möchte dir was zeigen. Er sagt: wenn sich alles zu groß anfühlt, kannst du ein Baum werden. Probier mit mir!",
"arc.pilzhueter.beats.pose.after": "Mein erster Versuch... ich bin umgefallen. Aber es hat sich gut angefühlt. Danke, Pilzhüter.",
"arc.pilzhueter.beats.realife.before": "Der Pilzhüter hat einen Wunsch. Probier die Baum-Pose morgen früh, vor dem Zähneputzen. Nur einmal. Nur für dich.",
"arc.pilzhueter.beats.realife.after": "Du hast es gemacht! Ich hab's gespürt.",
"arc.pilzhueter.beats.callback.text": "Er hat nach dir gefragt.",
"arc.pilzhueter.beats.callback.before": "Hey... der Pilzhüter war gerade hier. Er hat gefragt, wie es dir geht.",
"arc.pilzhueter.beats.callback.after": "Er sagt: du musst nicht jeden Tag ein Baum sein. Aber wenn sich die Welt mal zu groß anfühlt... weißt du, was du tun kannst."
```

- [ ] **Step 2: Add English strings to `src/i18n/en.json`**

Match the same keys, English translations.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/de.json src/i18n/en.json
git commit -m "feat: i18n strings for Pilzhüter arc"
```

### Task A.6 — Generate Drachenmutter audio for 4 beats

- [ ] **Step 1: Create `scripts/gen-pilzhueter-audio.py`**

Follow the pattern from `scripts/gen-ritual-audio.py` and `scripts/gen-stamina-audio.py`:

```python
import json, os, urllib.request, time

API_KEY = ''
with open(r'C:\Users\öööö\louis-quest\.env', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY=') or line.startswith('VITE_ELEVENLABS_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip('"').strip("'")
            break

VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'  # Bella — Drachenmutter
OUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\narrator'
VS = {'stability': 0.75, 'similarity_boost': 0.65, 'style': 0.30}

LINES = {
  'arc_pilzhueter_b1_intro':  'Ich muss dir was erzählen. Als Ronki ganz klein war, hat er sich im Wald verlaufen. Zwischen den großen Wurzeln. Da kam ein alter Pilzhüter und hat ihn gefunden. Der Pilzhüter hat ihm den Weg gezeigt, und sie wurden Freunde. Dann ist der Wald gewachsen, und sie haben sich aus den Augen verloren. Bis heute.',
  'arc_pilzhueter_b2_gift':   'Der Pilzhüter möchte euch etwas schenken. Er sagt: wenn sich alles zu groß anfühlt, könnt ihr ein Baum werden. Probiert es gemeinsam aus.',
  'arc_pilzhueter_b3_realife': 'Der Pilzhüter hat einen Wunsch für dich. Probier die Baum-Pose morgen früh, vor dem Zähneputzen. Nur einmal. Nur für dich.',
  'arc_pilzhueter_b4_callback': 'Der Pilzhüter war heute hier. Er hat nach dir gefragt, und er hat eine Botschaft hinterlassen: du musst nicht jeden Tag ein Baum sein. Aber wenn sich die Welt mal zu groß anfühlt, weißt du, was du tun kannst.',
}

for lid, text in LINES.items():
    out = os.path.join(OUT_DIR, f'{lid}.mp3')
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

- [ ] **Step 2: Run the script**

```bash
cd "C:/Users/öööö/louis-quest" && PYTHONIOENCODING=utf-8 python scripts/gen-pilzhueter-audio.py
```

Expected: 4 `OK` lines, 4 mp3 files > 20KB each.

- [ ] **Step 3: Commit audio + script**

```bash
git add public/audio/narrator/arc_pilzhueter_*.mp3 scripts/gen-pilzhueter-audio.py
git commit -m "feat: Drachenmutter narrator audio for Pilzhüter arc (4 beats)"
```

### Task A.7 — Unlock trigger + callback scheduling in useSpecialQuests

- [ ] **Step 1: Read current `src/hooks/useSpecialQuests.ts`**

Understand the existing side-effect hook pattern.

- [ ] **Step 2: Add Freund unlock logic**

Append a new effect that:
1. For each `FREUNDE[i]` where `implemented && !state.freundArcsCompleted.includes(f.id)`:
   - Count discovered creatures in that chapter: `(state.micropediaDiscovered || []).filter(d => d.chapter === f.chapter).length`
   - If count >= f.unlockThreshold AND the arc isn't already offered/active AND onboarding was done at least 1 day ago:
     - Offer the arc via the Arc Engine (call whatever function offers arcs — check `src/arcs/useArc.ts` for the offer action)

- [ ] **Step 3: Add callback scheduling**

Watch arc beat 3 completion. When the routine beat (`pil-b3-realife`) completes:
```ts
const scheduleAt = new Date(Date.now() + (5 + Math.random() * 2) * 24 * 3600 * 1000).toISOString();
actions.patchState({
  freundCallbacksPending: [...(state.freundCallbacksPending || []), { freundId: 'pilzhueter', triggerAt: scheduleAt }],
});
```

On each effect run, check `freundCallbacksPending` for items where `triggerAt <= now`. For each:
- Re-offer the arc, starting at beat 4 (the callback `lore` beat)
- When beat 4 completes, remove from `freundCallbacksPending` and add to `freundArcsCompleted`

Implementation detail: the existing Arc Engine may not support "start at beat N". If not, the callback can be modeled as a separate single-beat lore event offered via the same mechanism. Plan-phase implementer decides the cleanest shape.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSpecialQuests.ts
git commit -m "feat: Freund unlock trigger + callback scheduling in useSpecialQuests"
```

---

## Phase B — Beat UI + Hub reunion card

### Task B.1 — BaumPoseBeat component

- [ ] **Step 1: Create `src/components/BaumPoseBeat.jsx`**

A craft-beat component that renders:
- A big illustrated tree-pose SVG (kid silhouette: arms up as branches, one foot on the opposite calf)
- A 30-second hold timer with visible progress ring
- Ronki-alongside animation (small Ronki figure doing the pose, wobbling)
- "Halte die Pose... du bist ein Baum" text
- "Fertig!" button to complete the beat

Full component (adapt existing beat rendering conventions — look at `src/arcs/useArc.ts` and how craft beats are currently rendered):

```jsx
import React, { useState, useEffect, useRef } from 'react';

export default function BaumPoseBeat({ onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, secondsLeft]);

  const pct = ((30 - secondsLeft) / 30) * 100;
  const done = started && secondsLeft <= 0;

  return (
    <div className="flex flex-col items-center px-6 py-8">
      <TreePoseSVG wobble={started && !done} />
      <p className="font-headline font-bold text-xl text-on-surface mt-6 text-center"
         style={{ fontFamily: 'Fredoka, sans-serif' }}>
        {!started ? 'Bereit, ein Baum zu werden?' : done ? 'Gut gemacht!' : 'Halte die Pose...'}
      </p>
      <p className="font-body text-sm text-on-surface-variant mt-2 text-center max-w-xs">
        {!started ? 'Heb einen Fuß. Streck die Arme hoch. Atme tief.' : done ? 'Du bist ein Baum.' : 'Du bist ein Baum.'}
      </p>

      {/* Timer ring */}
      {started && (
        <div className="relative w-32 h-32 mt-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(5,150,105,0.15)" strokeWidth="8" />
            <circle cx="64" cy="64" r="58" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (pct / 100) * 364.4}
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline font-bold text-4xl text-[#059669] tabular-nums"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {secondsLeft}
            </span>
          </div>
        </div>
      )}

      {!started ? (
        <button onClick={() => setStarted(true)}
          className="mt-8 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px]"
          style={{ background: '#059669', color: 'white', boxShadow: '0 6px 18px rgba(5,150,105,0.35)' }}>
          Ich bin bereit
        </button>
      ) : done ? (
        <button onClick={onComplete}
          className="mt-8 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px]"
          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 18px rgba(252,211,77,0.4)' }}>
          Fertig ✨
        </button>
      ) : null}
    </div>
  );
}

function TreePoseSVG({ wobble }) {
  return (
    <svg viewBox="0 0 200 260" className="w-40 h-52"
         style={wobble ? { animation: 'treeWobble 3s ease-in-out infinite' } : undefined}>
      {/* Arms up as branches */}
      <path d="M 100 90 L 60 30" stroke="#065f46" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 100 90 L 140 30" stroke="#065f46" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Small branches */}
      <path d="M 70 45 L 55 50" stroke="#065f46" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 130 45 L 145 50" stroke="#065f46" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Leaves clusters */}
      <circle cx="55" cy="25" r="14" fill="#10b981" opacity="0.85" />
      <circle cx="145" cy="25" r="14" fill="#10b981" opacity="0.85" />
      <circle cx="42" cy="50" r="9" fill="#10b981" opacity="0.7" />
      <circle cx="158" cy="50" r="9" fill="#10b981" opacity="0.7" />
      {/* Head */}
      <circle cx="100" cy="90" r="22" fill="#fcd34d" />
      {/* Smile */}
      <path d="M 92 92 Q 100 98 108 92" stroke="#725b00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="93" cy="85" r="2" fill="#725b00" />
      <circle cx="107" cy="85" r="2" fill="#725b00" />
      {/* Body/trunk */}
      <path d="M 100 112 L 100 180" stroke="#92400e" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Standing leg */}
      <path d="M 100 180 L 100 230" stroke="#92400e" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Raised leg — foot against calf */}
      <path d="M 100 180 L 118 200 L 100 210" stroke="#92400e" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ground */}
      <ellipse cx="100" cy="240" rx="40" ry="4" fill="#78350f" opacity="0.2" />
      <style>{`
        @keyframes treeWobble {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
      `}</style>
    </svg>
  );
}
```

- [ ] **Step 2: Wire into craft beat rendering**

Find where craft beats are currently rendered (probably `src/components/BeatCompletionModal.jsx` or similar). If the beat's arc has `freundId === 'pilzhueter'` AND the beat's kind is `craft`, render `<BaumPoseBeat onComplete={...} />` instead of the default step list.

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/BaumPoseBeat.jsx src/components/BeatCompletionModal.jsx
git commit -m "feat: BaumPoseBeat component — 30s tree-pose craft beat for Pilzhüter arc"
```

### Task B.2 — ArcOfferCard branding for Freund reunions

- [ ] **Step 1: Read current `src/components/ArcOfferCard.jsx`**

- [ ] **Step 2: Add Freund-aware branding**

When the offered arc has a `freundId`:
- Lookup `FREUND_BY_ID.get(arc.freundId)` from `src/data/freunde.ts`
- Show the Freund's portrait (with fallback to chapter icon)
- Replace the generic "Ein Abenteuer wartet" / "Tap to start" copy with something reunion-flavored:
  - Headline: `{freund.name[lang]} ist wieder da`
  - Subcopy: `Ronki hat einen alten Freund wiedergefunden`
- Chapter color accents (e.g. forest green for Pilzhüter)

Fallback (no freundId): existing arc offer card unchanged.

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/ArcOfferCard.jsx
git commit -m "feat: ArcOfferCard — Freund-reunion branding when arc has freundId"
```

---

## Phase C — RonkiProfile navigation promotion

### Task C.1 — Freunde hero card

- [ ] **Step 1: Read current `src/components/RonkiProfile.jsx`**

Find where the Freunde / Micropedia entry point currently lives (small button).

- [ ] **Step 2: Replace with hero card**

Above the existing traits/stats area, add a hero card:

```jsx
{/* Freunde entry point — prominent */}
<button
  onClick={() => onNavigate('micropedia')}
  className="w-full rounded-2xl p-4 mb-5 active:scale-[0.98] transition-transform text-left"
  style={{
    background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
    border: '1.5px solid rgba(252,211,77,0.3)',
    boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
  }}
>
  <div className="flex items-center gap-3 mb-2">
    <span className="material-symbols-outlined text-2xl" style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>
      groups
    </span>
    <div className="flex-1">
      <h3 className="font-headline font-bold text-base text-on-surface">
        {lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}
      </h3>
      <p className="font-label text-xs text-on-surface-variant">
        {totalFound} / {totalCreatures} {lang === 'de' ? 'entdeckt' : 'found'}
      </p>
    </div>
    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
  </div>
  {/* Recent portraits preview */}
  <div className="flex gap-2 mt-1">
    {recentFreunde.slice(0, 4).map(f => (
      <div key={f.id} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/60">
        <img src={base + f.art} alt="" className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
</button>
```

Where:
- `recentFreunde` = `(state.micropediaDiscovered || []).slice(-4).map(d => SEED_BY_ID.get(d.id)).filter(Boolean)`
- Imports: `SEED_BY_ID` from `../data/creatures`

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/RonkiProfile.jsx
git commit -m "feat: promote Freunde entry to hero card in RonkiProfile"
```

---

## Final phase — QA + ship

### Task F.1 — Full build + tests

- [ ] **Step 1: Build**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
```

- [ ] **Step 2: Tests**

```bash
cd "C:/Users/öööö/louis-quest" && npx vitest run 2>&1 | tail -10
```

Expected: all tests pass (48/48 from Wave 1 baseline).

### Task F.2 — Spec compliance + code quality review

- [ ] **Step 1: Dispatch spec reviewer** against `docs/superpowers/specs/2026-04-18-wave2-freunde-design.md`

- [ ] **Step 2: Dispatch code quality reviewer** (superpowers:code-reviewer) against the Wave 2 commits

- [ ] **Step 3: Apply fixes, re-verify**

### Task F.3 — Push to production

```bash
cd "C:/Users/öööö/louis-quest" && git push origin main 2>&1 | tail -5
cd "C:/Users/öööö/louis-quest" && gh run list --branch main --limit 2 2>&1 | head -5
```

---

## Self-review

**Spec coverage:**
- Path C hybrid ✓ (Phase A.3 data, Phase B arc hookup)
- 4-beat arc ✓ (Task A.4)
- Pilzhüter only, others stubbed ✓ (Task A.3)
- Drachenmutter voice ✓ (Task A.6)
- Unlock trigger (2 Forest creatures) ✓ (Task A.7)
- Callback 5-7 days later ✓ (Task A.7)
- Hub reunion card via ArcOfferCard branch ✓ (Task B.2)
- Nav promotion B (hero card) ✓ (Task C.1)
- No visual distinction in Freunde grid ✓ (no Micropedia changes)

**Placeholder scan:** None. Portrait fallback documented (Task A.3 + Phase A portrait policy section).

**Type consistency:** `freundId` added to Arc interface (A.1), used consistently in arc file (A.4), lookups (Phase B).

**Scope:** Focused on pilot. Other 4 Freunde metadata stubs only.

**Effort:** ~2 days, matching spec.

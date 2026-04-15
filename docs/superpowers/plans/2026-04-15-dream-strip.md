# Dream Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Louis taps Ronki on the Hub while a dream indicator glows, a full-screen dark overlay slides in with 1–3 wordless painterly panels — Ronki's visual impressions of what Louis did the previous day. No text. Pure color and shape. Ghibli's silent moments, not a storybook.

**Architecture:** A pure-function highlight selector (`src/dream/`) converts a day-end snapshot into an ordered `DreamHighlight[]` (boss → arc → quests → care → ambient fallback, capped at 3). TaskContext gains two daily boolean flags set during `complete()`, snapshotted and reset during `applyDayTransition()`. Hub shows a pulsing ring on the campfire scene when an unseen dream exists; tapping it opens the `DreamStrip` overlay.

**Tech Stack:** React 18, Tailwind v4 CSS vars (`--color-primary` = `#124346`, `--color-secondary-container` = `#fcd34d`, `--color-surface` = `#fff8f2`), CSS keyframe animations (no motion library needed), Vitest 4.

---

## File Structure

| Action   | Path                                     | Responsibility                                                           |
|----------|------------------------------------------|--------------------------------------------------------------------------|
| Create   | `src/dream/types.ts`                     | `DreamPanelKind`, `DreamHighlight`, `DreamHighlightsData`, `PrevDaySnapshot` |
| Create   | `src/dream/dreamHighlights.ts`           | `buildHighlights(snap)` — pure function, no side effects                 |
| Create   | `src/dream/dreamHighlights.test.ts`      | Unit tests for selection logic                                           |
| Create   | `src/components/DreamStrip.jsx`          | Full-screen overlay + all 5 CSS panel scenes                             |
| Modify   | `src/context/TaskContext.tsx`            | 3 new state fields; `complete()` tracking; day-transition snapshot       |
| Modify   | `src/types.ts`                           | Add 3 optional fields to `GameState`                                     |
| Modify   | `src/index.css`                          | 5 new `@keyframes` for panel + indicator animations                      |
| Modify   | `src/components/Hub.jsx`                 | Dream indicator ring, tap handler, `DreamStrip` rendering                |
| Modify   | `src/i18n/de.json` + `en.json`           | One aria-label key: `dream.dismiss`                                      |

---

## Task 0 — Dream types

**Files:**
- Create: `src/dream/types.ts`

- [ ] **Step 1: Write the types file**

```typescript
// src/dream/types.ts

export type DreamPanelKind = 'boss' | 'arc' | 'quests' | 'care' | 'ambient';

export interface DreamHighlight {
  kind: DreamPanelKind;
}

/** Snapshot of yesterday's state — captured at day transition before reset. */
export interface PrevDaySnapshot {
  bossKilledToday: boolean;
  allCareDone: boolean;      // catFed && catPetted && catPlayed
  allQuestsDone: boolean;    // all main quests done
  arcBeatAdvancedToday: boolean;
}

export interface DreamHighlightsData {
  highlights: DreamHighlight[];
  capturedAt: number;   // epoch ms
  seen: boolean;        // indicator clears once the strip is dismissed
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd ~/louis-quest && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors (or only pre-existing errors unrelated to this file)

- [ ] **Step 3: Commit**

```bash
cd ~/louis-quest
git add src/dream/types.ts
git commit -m "feat(dream): DreamHighlight + PrevDaySnapshot types"
```

---

## Task 1 — buildHighlights pure function + tests

**Files:**
- Create: `src/dream/dreamHighlights.ts`
- Create: `src/dream/dreamHighlights.test.ts`

- [ ] **Step 1: Write the failing tests first**

```typescript
// src/dream/dreamHighlights.test.ts
import { describe, it, expect } from 'vitest';
import { buildHighlights } from './dreamHighlights';
import type { PrevDaySnapshot } from './types';

const empty: PrevDaySnapshot = {
  bossKilledToday: false,
  allCareDone: false,
  allQuestsDone: false,
  arcBeatAdvancedToday: false,
};

describe('buildHighlights', () => {
  it('returns 1 ambient panel when nothing notable happened', () => {
    const result = buildHighlights(empty);
    expect(result.highlights).toHaveLength(1);
    expect(result.highlights[0].kind).toBe('ambient');
  });

  it('marks seen as false on creation', () => {
    const result = buildHighlights(empty);
    expect(result.seen).toBe(false);
  });

  it('sets capturedAt to approximately now', () => {
    const before = Date.now();
    const result = buildHighlights(empty);
    const after = Date.now();
    expect(result.capturedAt).toBeGreaterThanOrEqual(before);
    expect(result.capturedAt).toBeLessThanOrEqual(after);
  });

  it('includes boss panel when boss was killed', () => {
    const result = buildHighlights({ ...empty, bossKilledToday: true });
    expect(result.highlights.map(h => h.kind)).toContain('boss');
  });

  it('includes arc panel when arc beat was advanced', () => {
    const result = buildHighlights({ ...empty, arcBeatAdvancedToday: true });
    expect(result.highlights.map(h => h.kind)).toContain('arc');
  });

  it('includes quests panel when all quests done', () => {
    const result = buildHighlights({ ...empty, allQuestsDone: true });
    expect(result.highlights.map(h => h.kind)).toContain('quests');
  });

  it('includes care panel when all care done', () => {
    const result = buildHighlights({ ...empty, allCareDone: true });
    expect(result.highlights.map(h => h.kind)).toContain('care');
  });

  it('does NOT include ambient when at least one highlight exists', () => {
    const result = buildHighlights({ ...empty, allCareDone: true });
    expect(result.highlights.map(h => h.kind)).not.toContain('ambient');
  });

  it('orders by emotional weight: boss first, then arc, quests, care', () => {
    const result = buildHighlights({
      bossKilledToday: true,
      arcBeatAdvancedToday: true,
      allQuestsDone: true,
      allCareDone: true,
    });
    expect(result.highlights[0].kind).toBe('boss');
    expect(result.highlights[1].kind).toBe('arc');
    expect(result.highlights[2].kind).toBe('quests');
    // care (4th) is dropped — cap at 3
    expect(result.highlights).toHaveLength(3);
  });

  it('caps at 3 panels even when all 4 highlights are present', () => {
    const result = buildHighlights({
      bossKilledToday: true,
      arcBeatAdvancedToday: true,
      allQuestsDone: true,
      allCareDone: true,
    });
    expect(result.highlights).toHaveLength(3);
  });

  it('returns exactly 2 panels when two highlights present', () => {
    const result = buildHighlights({ ...empty, bossKilledToday: true, allCareDone: true });
    expect(result.highlights).toHaveLength(2);
    expect(result.highlights[0].kind).toBe('boss');
    expect(result.highlights[1].kind).toBe('care');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/louis-quest && npx vitest run src/dream/dreamHighlights.test.ts 2>&1 | tail -10`
Expected: FAIL — "Cannot find module './dreamHighlights'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/dream/dreamHighlights.ts
import type { DreamHighlight, DreamHighlightsData, PrevDaySnapshot } from './types';

/**
 * Convert a day-end snapshot into an ordered highlight list.
 * Ordered by emotional weight: boss → arc → quests → care.
 * Falls back to a single ambient panel if nothing notable happened.
 * Capped at 3 panels.
 */
export function buildHighlights(snap: PrevDaySnapshot): DreamHighlightsData {
  const ordered: DreamHighlight[] = [];

  if (snap.bossKilledToday)     ordered.push({ kind: 'boss' });
  if (snap.arcBeatAdvancedToday) ordered.push({ kind: 'arc' });
  if (snap.allQuestsDone)        ordered.push({ kind: 'quests' });
  if (snap.allCareDone)          ordered.push({ kind: 'care' });

  const highlights = ordered.length > 0
    ? ordered.slice(0, 3)
    : [{ kind: 'ambient' as const }];

  return {
    highlights,
    capturedAt: Date.now(),
    seen: false,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/louis-quest && npx vitest run src/dream/dreamHighlights.test.ts 2>&1 | tail -10`
Expected: `Test Files  1 passed (1)` — all 12 tests green

- [ ] **Step 5: Commit**

```bash
cd ~/louis-quest
git add src/dream/dreamHighlights.ts src/dream/dreamHighlights.test.ts
git commit -m "feat(dream): buildHighlights pure function with full test coverage"
```

---

## Task 2 — Extend TaskState, GameState, and createInitialState

**Files:**
- Modify: `src/context/TaskContext.tsx` — interface + createInitialState + hydration
- Modify: `src/types.ts` — GameState interface

**Context:** `TaskState` is defined at line ~24 in TaskContext.tsx. `createInitialState()` is at line ~140. Hydration from `raw` (a `GameState`) is at line ~235. `GameState` is in `src/types.ts` at line 172.

- [ ] **Step 1: Add import for DreamHighlightsData to TaskContext.tsx**

Find the import block at lines 2–8 in `src/context/TaskContext.tsx`. It currently has:
```typescript
import type { ArcEngineState, RoutineBeat } from '../arcs/types';
```
Add after it:
```typescript
import type { DreamHighlightsData, PrevDaySnapshot } from '../dream/types';
import { buildHighlights } from '../dream/dreamHighlights';
```

- [ ] **Step 2: Add 3 fields to TaskState interface**

In `src/context/TaskContext.tsx`, find the `TaskState` interface (line ~24). After `arcEngine?: ArcEngineState;` (line ~68) add:
```typescript
  bossKilledToday?: boolean;
  arcBeatAdvancedToday?: boolean;
  dreamHighlights?: DreamHighlightsData;
```

- [ ] **Step 3: Add 3 fields to createInitialState()**

In `src/context/TaskContext.tsx`, find `createInitialState()` (line ~140). After `arcEngine: initialArcState(),` (line ~186) add:
```typescript
    bossKilledToday: false,
    arcBeatAdvancedToday: false,
    // dreamHighlights is undefined until first day transition
```

- [ ] **Step 4: Add 3 fields to the raw-hydration block**

In `src/context/TaskContext.tsx`, find the hydration block around line ~239 where `raw.bossTrophies` is read. After the `bossTrophies` line add:
```typescript
          bossKilledToday: raw.bossKilledToday ?? false,
          arcBeatAdvancedToday: raw.arcBeatAdvancedToday ?? false,
          dreamHighlights: raw.dreamHighlights,
```

- [ ] **Step 5: Add 3 fields to GameState in src/types.ts**

In `src/types.ts`, after `arcEngine?: ArcEngineState;` (line ~261) add:
```typescript
  bossKilledToday?: boolean;
  arcBeatAdvancedToday?: boolean;
  dreamHighlights?: DreamHighlightsData;
```

Also add the import for `DreamHighlightsData` at the top of `src/types.ts` (after any existing arc imports):
```typescript
import type { DreamHighlightsData } from './dream/types';
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd ~/louis-quest && npx tsc --noEmit 2>&1 | head -30`
Expected: no new errors from the added fields

- [ ] **Step 7: Commit**

```bash
cd ~/louis-quest
git add src/context/TaskContext.tsx src/types.ts
git commit -m "feat(dream): extend TaskState + GameState with dream tracking fields"
```

---

## Task 3 — Track boss kill and arc beat in complete()

**Files:**
- Modify: `src/context/TaskContext.tsx` — `complete()` callback

**Context:** `complete()` is at line ~447. The boss-kill branch is at lines ~490–497:
```typescript
        if (boss.hp <= 0) {
          const bd = BOSSES.find(b => b.id === boss!.id);
          const defenseBonus = Math.floor(gearDefense / 5);
          if (bd) hp += bd.reward.hp + defenseBonus;
          screenMin += 3;
          if (!bossTrophies.includes(boss.id)) bossTrophies.push(boss.id);
        }
```
The arc-beat branch is at lines ~565–569:
```typescript
      let arcEngine = prev.arcEngine ?? initialArcState();
      if (q.arcBeatId) {
        arcEngine = advanceBeat(arcEngine, q.arcBeatId);
      }
```
The return is at line ~571:
```typescript
      return { ...prev, quests, dt, hp, drachenEier: screenMin, xp: newXp, boss, bossTrophies, bossDmgToday, orbs, heroStats, totalTasksDone, unlockedBadges, arcEngine };
```

- [ ] **Step 1: Declare local tracking variables**

Inside the `setState(prev => { ... })` callback in `complete()`, near the top where `bossTrophies` is declared (line ~470), add two lines:
```typescript
      let bossKilledToday = prev.bossKilledToday ?? false;
      let arcBeatAdvancedToday = prev.arcBeatAdvancedToday ?? false;
```

- [ ] **Step 2: Set bossKilledToday on boss defeat**

Inside the `if (boss.hp <= 0)` block (lines ~490–497), after `bossTrophies.push(boss.id)`, add:
```typescript
          bossKilledToday = true;
```

The block should now look like:
```typescript
        if (boss.hp <= 0) {
          const bd = BOSSES.find(b => b.id === boss!.id);
          const defenseBonus = Math.floor(gearDefense / 5);
          if (bd) hp += bd.reward.hp + defenseBonus;
          screenMin += 3;
          if (!bossTrophies.includes(boss.id)) bossTrophies.push(boss.id);
          bossKilledToday = true;
        }
```

- [ ] **Step 3: Set arcBeatAdvancedToday when a beat actually advances**

Replace the arc-beat block (lines ~565–569) with:
```typescript
      let arcEngine = prev.arcEngine ?? initialArcState();
      if (q.arcBeatId) {
        const prevIndex = arcEngine.activeBeatIndex;
        const prevCompleted = arcEngine.completedArcIds.length;
        arcEngine = advanceBeat(arcEngine, q.arcBeatId);
        if (
          arcEngine.activeBeatIndex !== prevIndex ||
          arcEngine.completedArcIds.length !== prevCompleted
        ) {
          arcBeatAdvancedToday = true;
        }
      }
```

- [ ] **Step 4: Include new fields in the return**

Change the return statement (line ~571) from:
```typescript
      return { ...prev, quests, dt, hp, drachenEier: screenMin, xp: newXp, boss, bossTrophies, bossDmgToday, orbs, heroStats, totalTasksDone, unlockedBadges, arcEngine };
```
to:
```typescript
      return { ...prev, quests, dt, hp, drachenEier: screenMin, xp: newXp, boss, bossTrophies, bossDmgToday, orbs, heroStats, totalTasksDone, unlockedBadges, arcEngine, bossKilledToday, arcBeatAdvancedToday };
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd ~/louis-quest && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 6: Commit**

```bash
cd ~/louis-quest
git add src/context/TaskContext.tsx
git commit -m "feat(dream): track bossKilledToday + arcBeatAdvancedToday in complete()"
```

---

## Task 4 — Day-transition snapshot

**Files:**
- Modify: `src/context/TaskContext.tsx` — `applyDayTransition()`

**Context:** `applyDayTransition()` is at line ~338. `allDoneYesterday` is already computed at line ~351. The return object starts at line ~418.

- [ ] **Step 1: Compute the dream snapshot before the return**

In `applyDayTransition()`, just before the `return {` at line ~418, add:
```typescript
    // ── Dream Strip snapshot ──
    // Capture yesterday's highlights before the daily reset so DreamStrip
    // can show Ronki's impressions when Louis opens the app tomorrow.
    const dreamSnap: PrevDaySnapshot = {
      bossKilledToday: s.bossKilledToday ?? false,
      allCareDone: Boolean(s.catFed && s.catPetted && s.catPlayed),
      allQuestsDone: allDoneYesterday,
      arcBeatAdvancedToday: s.arcBeatAdvancedToday ?? false,
    };
    const dreamHighlights = buildHighlights(dreamSnap);
```

- [ ] **Step 2: Include dream fields in the return and reset the daily flags**

In the `return { ...s, ... }` block (line ~418), add three new keys after `gamesPlayedToday: [],`:
```typescript
      dreamHighlights,
      bossKilledToday: false,
      arcBeatAdvancedToday: false,
```

The relevant portion of the return should now look like:
```typescript
    return {
      ...s,
      quests,
      sm: newSm,
      chestsClaimed,
      activeMissions,
      completedMissions,
      lastDate: today(),
      dt: 0,
      moodAM: null,
      moodPM: null,
      dailyWaterCount: 0,
      boss: assignBoss(s?.catEvo || 0),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      loginBonusClaimed: false,
      journalMemory: '',
      journalGratitude: [],
      journalDayEmoji: null,
      journalAchievements: [],
      journalHistory,
      journalSaved: false,
      bossDmgToday: 0,
      gamesPlayedToday: [],
      dreamHighlights,
      bossKilledToday: false,
      arcBeatAdvancedToday: false,
    };
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd ~/louis-quest && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 4: Run all tests**

Run: `cd ~/louis-quest && npx vitest run 2>&1 | tail -15`
Expected: all existing tests pass + dreamHighlights tests still green

- [ ] **Step 5: Commit**

```bash
cd ~/louis-quest
git add src/context/TaskContext.tsx
git commit -m "feat(dream): capture day-end snapshot in applyDayTransition"
```

---

## Task 5 — CSS keyframes

**Files:**
- Modify: `src/index.css`

**Context:** Existing `@keyframes` end around line 267 (`progress-ring-fill`). Add the new ones after that block.

- [ ] **Step 1: Append 5 new keyframes after progress-ring-fill**

At the end of the `@keyframes` section in `src/index.css` (after line ~268), add:

```css
/* ── Dream Strip animations ── */
@keyframes dream-pulse-ring {
  0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 0.75; transform: translate(-50%, -50%) scale(1.06); }
}

@keyframes dream-dissolve {
  0%, 100% { opacity: 0.9; transform: scale(1) rotate(0deg); }
  50%       { opacity: 0.5; transform: scale(0.91) rotate(1.5deg); }
}

@keyframes dream-spark {
  0%, 100% { opacity: 0;   transform: scale(0.5) translateY(0); }
  30%       { opacity: 1;   transform: scale(1)   translateY(-5px); }
  70%       { opacity: 0.5; transform: scale(0.7) translateY(-9px); }
}

@keyframes dream-float {
  0%, 100% { transform: translateY(0)    rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(3deg); }
}

@keyframes dream-breathe {
  0%, 100% { transform: scale(1);    opacity: 0.55; }
  50%       { transform: scale(1.14); opacity: 1; }
}
```

- [ ] **Step 2: Verify dev server picks them up**

Run: `cd ~/louis-quest && npx vite build --mode development 2>&1 | tail -5`
Expected: builds without CSS errors

- [ ] **Step 3: Commit**

```bash
cd ~/louis-quest
git add src/index.css
git commit -m "feat(dream): CSS keyframes for panel + indicator animations"
```

---

## Task 6 — DreamStrip component

**Files:**
- Create: `src/components/DreamStrip.jsx`

The component renders a full-screen dark overlay with 1–3 stacked panels. All scene art is inline (pure CSS, no images). Tapping anywhere dismisses.

- [ ] **Step 1: Create the component**

```jsx
// src/components/DreamStrip.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

// ─── Scene art components ────────────────────────────────────────────────────
// All art is pure CSS — no images. Silhouettes, gradients, glows, keyframes.
// Every aria-hidden element is decorative; accessibility is on the outer button.

function BossScene() {
  const SPARKS = [
    { top: '33%', left: '40%' }, { top: '26%', left: '54%' },
    { top: '41%', left: '63%' }, { top: '21%', left: '47%' },
    { top: '30%', left: '34%' }, { top: '24%', left: '67%' },
  ];
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 55%, #140808 0%, #060610 100%)' }}
    >
      {/* Boss silhouette — organic blob, dissolving */}
      <div style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)' }}>
        <div
          aria-hidden="true"
          style={{
            width: 72, height: 90,
            borderRadius: '48% 52% 44% 56% / 60% 44% 56% 40%',
            background: 'rgba(6,2,4,0.96)',
            animation: 'dream-dissolve 4s ease-in-out infinite',
          }}
        />
      </div>
      {/* Sparks */}
      {SPARKS.map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute', top: pos.top, left: pos.left,
            width: i % 3 === 0 ? 4 : 3, height: i % 3 === 0 ? 4 : 3,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#fcd34d' : '#f97316',
            boxShadow: `0 0 ${5 + i * 2}px ${2 + i}px ${i % 2 === 0 ? 'rgba(252,211,77,0.65)' : 'rgba(249,115,22,0.65)'}`,
            animation: `dream-spark ${0.9 + (i * 0.37) % 1.1}s ease-in-out infinite ${(i * 0.19).toFixed(2)}s`,
          }}
        />
      ))}
      {/* Ronki watching — teal teardrop at bottom */}
      <div
        aria-hidden="true"
        style={{
          marginBottom: '18%',
          width: 28, height: 36,
          borderRadius: '50% 50% 40% 40%',
          background: 'rgba(18,67,70,0.9)',
          boxShadow: '0 0 16px 6px rgba(94,234,212,0.14)',
        }}
      />
    </div>
  );
}

function ArcScene() {
  const STARS = [[18, 62], [44, 18], [72, 74], [82, 33], [14, 44]];
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: 'linear-gradient(160deg, #0c1830 0%, #0e2234 55%, #112030 100%)' }}
    >
      {/* Floating triangle — dream map */}
      <div style={{ position: 'absolute', top: '27%', left: '34%' }}>
        <div
          aria-hidden="true"
          style={{
            width: 0, height: 0,
            borderLeft: '19px solid transparent', borderRight: '19px solid transparent',
            borderBottom: '32px solid rgba(252,211,77,0.65)',
            animation: 'dream-float 3.8s ease-in-out infinite',
          }}
        />
      </div>
      {/* Floating page */}
      <div style={{ position: 'absolute', top: '21%', right: '27%' }}>
        <div
          aria-hidden="true"
          style={{
            width: 26, height: 34,
            background: 'rgba(255,248,242,0.11)',
            border: '1px solid rgba(255,248,242,0.18)',
            borderRadius: 2,
            transform: 'rotate(15deg)',
            animation: 'dream-float 4.5s ease-in-out infinite 1.2s',
          }}
        />
      </div>
      {/* Star dots */}
      {STARS.map(([t, l], i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute', top: `${t}%`, left: `${l}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: 'rgba(255,255,255,0.38)',
            animation: `dream-spark ${1.6 + i * 0.28}s ease-in-out infinite ${(i * 0.42).toFixed(2)}s`,
          }}
        />
      ))}
      {/* Ronki silhouette */}
      <div
        aria-hidden="true"
        style={{
          marginBottom: '20%',
          width: 24, height: 32,
          borderRadius: '50% 50% 42% 42%',
          background: 'rgba(18,67,70,0.88)',
          boxShadow: '0 0 12px 4px rgba(94,234,212,0.1)',
        }}
      />
    </div>
  );
}

function CareScene() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 56%, #0e1e14 0%, #060e0a 100%)' }}
    >
      {/* Radiating glow rings */}
      {[144, 104, 72].map((size, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(252,211,77,${0.07 - i * 0.015})`,
            animation: `dream-breathe ${3.2 + i * 0.55}s ease-in-out infinite ${(i * 0.75).toFixed(2)}s`,
          }}
        />
      ))}
      {/* Central warm glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 82, height: 82, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,211,77,0.22) 0%, transparent 70%)',
          animation: 'dream-breathe 3.2s ease-in-out infinite',
        }}
      />
      {/* Ronki curled up — warm oval */}
      <div
        aria-hidden="true"
        style={{
          width: 46, height: 32, borderRadius: '50%',
          background: 'rgba(18,67,70,0.88)',
          boxShadow: '0 0 28px 12px rgba(252,211,77,0.13), 0 0 8px 2px rgba(94,234,212,0.18)',
        }}
      />
    </div>
  );
}

function QuestsScene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(to top, #050c12 0%, #0c1e30 30%, #1a465a 60%, #3a7070 78%, rgba(253,230,138,0.55) 100%)',
      }}
    >
      {/* Sun glow at top */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 110, borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(253,230,138,0.82) 0%, rgba(252,211,77,0.28) 48%, transparent 70%)',
          filter: 'blur(14px)',
        }}
      />
      {/* Horizon line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '30%', left: 0, right: 0, height: 1,
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      {/* Ronki — tiny silhouette at horizon, facing the light */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '29%', left: '50%', transform: 'translateX(-50%)',
          width: 13, height: 20,
          borderRadius: '50% 50% 42% 42%',
          background: 'rgba(4,8,12,0.95)',
        }}
      />
    </div>
  );
}

function AmbientScene() {
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: '#04090c' }}
    >
      {/* Single rising ember */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: 'radial-gradient(circle, #fde68a 0%, #fcd34d 60%, transparent 100%)',
          boxShadow: '0 0 14px 6px rgba(252,211,77,0.42)',
          animation: 'ember-rise 5.5s ease-out infinite',
        }}
      />
      {/* Sleeping Ronki — horizontal oval */}
      <div
        aria-hidden="true"
        style={{
          marginBottom: '30%',
          width: 44, height: 28, borderRadius: '50%',
          background: 'rgba(18,67,70,0.52)',
        }}
      />
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function DreamPanel({ kind, index, total, visible }) {
  const delay = 180 + index * 220;
  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity 520ms ease ${delay}ms, transform 520ms ease ${delay}ms`,
        borderBottom: index < total - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        minHeight: 0,
      }}
    >
      {kind === 'boss'    && <BossScene />}
      {kind === 'arc'     && <ArcScene />}
      {kind === 'care'    && <CareScene />}
      {kind === 'quests'  && <QuestsScene />}
      {kind === 'ambient' && <AmbientScene />}
    </div>
  );
}

// ─── DreamStrip overlay ───────────────────────────────────────────────────────

export default function DreamStrip({ highlights, onDismiss }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer one frame so the enter transition fires after mount.
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 360);
  };

  return (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label={t('dream.dismiss')}
      className="fixed inset-0 z-[600] flex flex-col w-full"
      style={{
        background: 'rgba(4,9,12,0.97)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 360ms ease',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
      }}
    >
      {highlights.map((h, i) => (
        <DreamPanel
          key={h.kind + i}
          kind={h.kind}
          index={i}
          total={highlights.length}
          visible={visible}
        />
      ))}
      {/* Wordless tap hint — a small horizontal bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          width: 32, height: 2, borderRadius: 1,
          background: 'rgba(255,255,255,0.18)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 600ms ease 700ms',
        }}
      />
    </button>
  );
}
```

- [ ] **Step 2: Add i18n keys**

In `src/i18n/de.json`, add near other dream/arc keys (e.g., after `arc.` keys):
```json
  "dream.dismiss": "Traumbilder schließen",
```

In `src/i18n/en.json`:
```json
  "dream.dismiss": "Close dream impressions",
```

- [ ] **Step 3: Verify TypeScript/build**

Run: `cd ~/louis-quest && npx vite build --mode development 2>&1 | grep -E 'error|Error|warn' | head -10`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
cd ~/louis-quest
git add src/components/DreamStrip.jsx src/i18n/de.json src/i18n/en.json
git commit -m "feat(dream): DreamStrip overlay with 5 CSS art panel scenes"
```

---

## Task 7 — Hub integration

**Files:**
- Modify: `src/components/Hub.jsx`

**Context:** Hub.jsx. The campfire scene is at lines 138–185 (`<section className="relative flex flex-col items-center pt-2 pb-4">`). The companion section IIFE starts at line 118.

- [ ] **Step 1: Import DreamStrip**

At the top of `src/components/Hub.jsx`, add after the `BeatCompletionModal` import (line ~15):
```jsx
import DreamStrip from './DreamStrip';
```

- [ ] **Step 2: Add dream state and derived values**

In `Hub`, after the `[openBeat, setOpenBeat]` state (line ~62), add:
```jsx
  const [showDream, setShowDream] = useState(false);
  const pendingDream = Boolean(state?.dreamHighlights && !state.dreamHighlights.seen);
```

- [ ] **Step 3: Add a tap handler for the campfire section**

After the line `const [showDream, setShowDream] = useState(false);`, add:
```jsx
  const handleCampfireTap = () => {
    if (pendingDream) setShowDream(true);
  };
```

- [ ] **Step 4: Add onClick + dream indicator to the campfire section**

Find the `<section className="relative flex flex-col items-center pt-2 pb-4">` tag (line ~139). Change it to:
```jsx
            <section
              className="relative flex flex-col items-center pt-2 pb-4"
              onClick={handleCampfireTap}
              style={{ cursor: pendingDream ? 'pointer' : 'default' }}
            >
```

Then inside that section, after the closing `</div>` of the campfire image wrapper (line ~170), before the stage nameplate `<div>` (line ~172), add:
```jsx
              {/* Dream indicator — pulsing ring when unseen highlights exist */}
              {pendingDream && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: '56%', aspectRatio: '1',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(252,211,77,0.5)',
                    pointerEvents: 'none',
                    animation: 'dream-pulse-ring 2.8s ease-in-out infinite',
                  }}
                />
              )}
```

- [ ] **Step 5: Render DreamStrip when open**

At the very end of the Hub component's return, before the final `</div>` (line ~last), add:
```jsx
      {showDream && state?.dreamHighlights && (
        <DreamStrip
          highlights={state.dreamHighlights.highlights}
          onDismiss={() => {
            setShowDream(false);
            actions.patchState({
              dreamHighlights: { ...state.dreamHighlights, seen: true },
            });
          }}
        />
      )}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd ~/louis-quest && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 7: Run all tests**

Run: `cd ~/louis-quest && npx vitest run 2>&1 | tail -10`
Expected: all tests green

- [ ] **Step 8: Commit**

```bash
cd ~/louis-quest
git add src/components/Hub.jsx
git commit -m "feat(dream): Hub dream indicator ring + DreamStrip open/dismiss"
```

---

## Self-Review

### 1. Spec coverage

| Requirement | Task |
|---|---|
| Dream indicator — gentle pulse on Hub | Task 7 (pulsing ring on campfire section) |
| Louis taps Ronki → screen dims | Task 7 (DreamStrip fixed overlay at 97% opacity) |
| 1–3 painterly panels slide in | Task 6 (staggered translateY entrance) |
| No text | Task 6 (all scenes are pure CSS shapes, no text nodes) |
| Boss defeated panel | Task 6 (BossScene) |
| Arc beat completed panel | Task 6 (ArcScene) |
| All care done panel | Task 6 (CareScene) |
| All quests done panel | Task 6 (QuestsScene) |
| Ordinary day ambient panel | Task 6 (AmbientScene) |
| Selection ordered by emotional weight | Task 1 (buildHighlights: boss → arc → quests → care) |
| Always at least 1 panel | Task 1 (ambient fallback) |
| Cap at 3 panels | Task 1 |
| Trigger: previous day's highlights | Tasks 2–4 (snapshot in applyDayTransition) |
| Indicator clears after seen | Task 7 (patchState seen: true on dismiss) |
| Painterly dark aesthetic | Task 6 (deep teal/navy gradients, warm gold accents) |
| Ghibli silhouette Ronki | Task 6 (simple teardrop/oval CSS shapes in teal) |

### 2. Placeholder scan

None found. Every step contains actual code.

### 3. Type consistency

- `DreamPanelKind` defined in Task 0, used in Tasks 1 and 6. ✓
- `DreamHighlightsData` defined in Task 0, added to TaskState in Task 2, passed to DreamStrip in Task 7. ✓
- `PrevDaySnapshot` defined in Task 0, imported in Task 2 (TaskContext), used in buildHighlights in Task 1. ✓
- `buildHighlights` imported in Task 2 (TaskContext imports), called in Task 4. ✓
- `bossKilledToday` / `arcBeatAdvancedToday`: declared in Task 2, set in Task 3, reset in Task 4, read in Task 4. ✓
- `patchState` used in Task 7 — already exists in TaskContext (`actions.patchState`). ✓

---

Plan complete and saved to `docs/superpowers/plans/2026-04-15-dream-strip.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, spec + quality review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

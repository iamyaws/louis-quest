# Wave 2 Pilot — Freunde reunion arcs (Forest Pilzhüter)

**Date:** 2026-04-18
**Scope:** Pilot one deep-friend reunion arc (Forest / Pilzhüter) and the reusable system behind it. Ship, let Louis live with it 1-2 weeks, then decide whether to build the other 4.

**Design lineage:** Path C of three Wave 2 options. Creatures remain collectibles; a small subset (5, one per chapter) additionally trigger multi-beat reunion arcs with real-life skill teaching. Wave 3 (RPG wind-down, Ronki fade-out) is parked until we see Louis's response to this pilot.

---

## Product principles

1. **Unified vocabulary.** All Freunde (18 total) are called "Freunde". No naming tier, no "Super-Freunde", no Weggefährten. Louis's existing mental model stays intact.
2. **Reunion framing.** Every deep-friend arc opens with the same premise: Ronki and this Freund knew each other before, lost contact, now they've found each other again. Shared history = instant emotional weight from beat one.
3. **Skill + life tie-in.** Each arc teaches a concrete skill (breathing, yoga pose, meditation, communication), then asks Louis to use it in real life by tying the final beat to an existing daily routine.
4. **Callback matters.** The emotional lift comes from the Freund returning a week later to check in. Most apps teach a skill and forget. Ronki's Freund comes back.
5. **Hub-as-campfire.** The reunion moment — first time Louis meets the Freund — appears as a Hub event card, same slot as `ArcOfferCard` uses for existing arcs. Afterwards the Freund lives in the normal Freunde grid; no persistent UI takeover.
6. **No new voices.** Drachenmutter narrates all Freund arcs for now. Shared voice reduces art/voice budget and keeps the app's audio identity coherent. Revisit if Louis responds well.
7. **No visual distinction in the grid.** The 5 reunion-arc Freunde look identical to the other 13 in the Micropedia grid. The arc is the surprise — tapping one of the 5 for the first time (once unlocked) launches the 4-beat arc instead of the detail modal.

---

## System architecture

### The 5 Freund archetypes (1 per chapter)

Full roster — not all built in this pilot, but locked so the system accommodates them.

| Chapter | Freund | Reunion story (seed) | Skill taught |
|---------|--------|---------------------|--------------|
| **Forest** | **Der Pilzhüter** — elder, wise, gentle | Ronki got lost in the forest as a hatchling. Pilzhüter showed him the way home. They lost touch when the forest grew. | **Baum-Pose** (kids yoga, grounding when overwhelmed) |
| **Sky** | **Die Windreiterin** — playful, brave | They flew together above the clouds; a storm separated them. | **Box-Atmung** (4-4-4-4 breathing) |
| **Water** | **Der Tiefentaucher** — quiet, deep-feeling | They played in the streams as little ones; Tiefentaucher went to the lake depths. | **Gefühle benennen** (naming feelings, water as metaphor) |
| **Dream** | **Die Sternenweberin** — imaginative | They shared dreams as hatchlings; she went to the Sternenmeer. | **Kurze Meditation** (2-min "landing thoughts like stars") |
| **Hearth** | **Die Lichtbringerin** — warm, wise | Ronki's oldest Freund. Always nearby in childhood. | **Freundschaftsregeln** (apologizing, listening, reaching out) |

**Pilot: Pilzhüter only.** The other 4 are lore scaffolding — names, premises, and skills are reserved so the system is consistent when we build them later.

### Arc shape (reused across all 5)

Same skeleton. Each Freund arc has exactly 4 beats:

| Beat | Kind | What happens |
|------|------|--------------|
| **1. Reunion** | `lore` | Drachenmutter narrates how Ronki knew this Freund and how they found each other again. Painted card in the existing arc-beat UI. |
| **2. Skill Gift** | `craft` | The Freund teaches Louis the skill through an interactive 1-2 minute beat. For Pilzhüter: Louis tries the Baum-Pose while Ronki tries alongside (illustrated guide + countdown). |
| **3. Real Life** | `routine` | Louis does the skill tied to an existing daily quest. For Pilzhüter: "Vor dem Zähneputzen, probier die Baum-Pose." Beat completes when the paired quest (`s3` / `v3`) completes that day. |
| **4. Callback** | `lore` | 5-7 days later, Drachenmutter narrates the Freund returning to check in. "Pilzhüter hat nach dir gefragt..." Short, warm, no new skill. |

This uses the **existing Arc Engine** (`src/arcs/*.ts`) with no type changes. The only addition is the 4th `lore` beat — current arcs have 3 beats; Freund arcs have 4. The engine already supports this count.

### Data model additions

```ts
// src/arcs/types.ts — extend Arc interface (additive, non-breaking)
export interface Arc {
  // ...existing fields
  freundId?: string;        // ties this arc to a Freund (enables introspection)
}

// src/context/TaskContext.tsx — TaskState additions
export interface TaskState {
  // ...existing fields
  /** Completed reunion arcs per Freund. Enables "introduce only once" logic. */
  freundArcsCompleted?: string[];  // e.g. ['freund-pilzhueter']
  /** Scheduled callback beats: { freundId, triggerAt ISO } */
  freundCallbacksPending?: Array<{ freundId: string; triggerAt: string }>;
}
```

No changes to the Micropedia / creature state. No changes to the existing 13 creatures.

### Unlock trigger

Forest Pilzhüter arc unlocks when:
- Louis has discovered **2 Forest creatures** in the Micropedia AND
- It's been at least 1 full day since onboarding (don't overwhelm first-day)

Check runs in `useSpecialQuests` hook (already called in App.jsx). If unlock condition met AND arc not yet completed AND not currently offered → push a new arc offer via the existing Arc Engine.

### Callback scheduling

When beat 3 (Real Life) completes, schedule beat 4 (Callback) for 5-7 days later:
```ts
actions.patchState({
  freundCallbacksPending: [
    ...existing,
    { freundId: 'pilzhueter', triggerAt: <now + 5..7 days ISO> },
  ],
});
```

On each `useSpecialQuests` check, if `triggerAt <= now` → re-offer this arc starting at beat 4. When beat 4 completes, remove from `freundCallbacksPending` and add arc to `freundArcsCompleted`.

### Hub event — the reunion moment

The reunion beat (beat 1) gets special Hub treatment **only on first offer**. We reuse `ArcOfferCard`:
- Same visual slot on the Hub
- Custom copy: instead of generic "Ein Abenteuer wartet", the card shows the Freund's portrait with "Ronki hat {Pilzhüter} wiedergefunden"
- Tapping the card advances the arc normally (enters the Reunion beat flow)
- Dismissing the card behaves like existing arc dismissal (re-offered on next Hub open)

No new Hub component — just `ArcOfferCard` gets a `freundId` branch that swaps headline/portrait.

### Navigation (B in our pick)

Current: Micropedia is reached via Ronki profile → "Freunde" button.

Wave 2 change: **make the Freunde button prominent.**
- Move it from its current small button to a hero card at the top of RonkiProfile
- Card shows: 4 most-recently-discovered Freunde portraits + "{N} / 18 entdeckt" counter
- Tapping the card navigates to Micropedia (same as today, just much more visible)

No new nav tab. No new route. Just UI surgery inside RonkiProfile.

---

## What the pilot ships

### Code
- **New file:** `src/arcs/freund-pilzhueter.ts` — the arc definition (4 beats)
- **New file:** `src/data/freunde.ts` — the 5 Freund archetypes (metadata: id, chapter, name, portrait path, chapter color). Only Pilzhüter has a complete arc entry; others are metadata stubs.
- **New file:** `src/components/FreundIntroCard.jsx` — the Hub event card variant (can be implemented as a branch inside existing `ArcOfferCard` or a new component — spec'd at plan phase)
- **New file:** `src/components/BaumPoseBeat.jsx` — the Skill Gift interaction (illustrated tree pose + 30s hold timer + Ronki trying alongside animation)
- **Modified:** `src/context/TaskContext.tsx` — add `freundArcsCompleted` and `freundCallbacksPending` state with hydration
- **Modified:** `src/arcs/types.ts` — add optional `freundId?: string` to Arc interface
- **Modified:** `src/hooks/useSpecialQuests.ts` — add Freund unlock trigger + callback scheduling logic
- **Modified:** `src/components/RonkiProfile.jsx` — promote the Freunde entry point to a hero card

### Content
- **Lore:** 4 beats of Drachenmutter narration for Pilzhüter. Written in Marc's voice (match existing Drachenmutter arc narration). Target: ~3 sentences per beat.
- **Pilzhüter portrait:** 1 painted character art piece. Earthy greens/browns, mossy beard, kind face. Uses existing art style.
- **Baum-Pose illustration:** 1 simple illustration showing the pose — kid silhouette, arms up as branches, one foot on opposite leg. Clear and inviting.
- **Drachenmutter voice lines:** 4 new narrator audio files (`arc_pilzhueter_b1_intro.mp3` etc.), ElevenLabs Bella voice, real umlauts, matches existing arc narrator tone.

### Copy direction (for spec review)

Example Beat 1 (Reunion) Drachenmutter narration:

> "Vor langer Zeit war Ronki ganz klein. Einmal hat er sich im Wald verlaufen — zwischen den großen Wurzeln. Ein alter Pilzhüter hat ihn gefunden, ihm den Weg gezeigt, und dann sind sie Freunde geworden. Dann ist der Wald gewachsen, und sie haben sich aus den Augen verloren. Bis heute. Louis, kannst du Ronki helfen, den Pilzhüter wiederzufinden?"

(Marc reviews and adjusts voice during plan phase.)

### Cut scope — explicitly NOT in pilot

- The other 4 Freund arcs (Windreiterin, Tiefentaucher, Sternenweberin, Lichtbringerin) — spec'd as roster but not implemented
- Per-Freund unique voices — all narrated by Drachenmutter
- Visual distinction in the Freunde grid for the 5 reunion-arc Freunde
- A top-level "Freunde" nav tab
- Post-callback lifecycle (does the Freund return a third time? future wave)

---

## Verification plan (after ship)

1. Louis discovers 2 Forest creatures → reunion offer appears on Hub
2. He taps through all 4 beats over the course of a week
3. Marc observes:
   - Did Louis complete the Baum-Pose beat? How long did he hold the pose?
   - Did he try the pose before Zähneputzen the next day?
   - Did he remember the Pilzhüter by name in conversation?
   - Did the callback beat land 5-7 days later?
   - Did he ask "will there be more Freunde?"

Those five signals decide Wave 3's scope.

---

## Estimated effort

| Piece | Effort |
|-------|-------:|
| Arc + data files, TaskState additions, types | 2-3 h |
| FreundIntroCard on Hub + ArcOfferCard branch | 2-3 h |
| Baum-Pose beat component (illustration + timer + animation) | 3-4 h |
| Drachenmutter lore writing + voice generation | 2 h |
| Pilzhüter portrait commission / art | external (ask Marc for source) |
| RonkiProfile nav promotion | 1 h |
| Testing + review + ship | 2 h |
| **Total (minus portrait art)** | **12-15 h / 2 days** |

---

## Self-review

**Placeholders:** None — every code path is concrete.
**Contradictions:** None — additive to existing arc engine and state.
**Scope:** Focused. 1 full arc + the system for 4 more.
**Ambiguity:** Portrait source unknown (ask Marc). Copy drafts reviewed at plan phase.

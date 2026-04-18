# Parent-Creatable Quest-Lines — Design

**Date:** 2026-04-18
**Top 10 rank:** #6 (9 impact, 3-4d effort, Med risk)

**Goal:** Let Marc create personalized quest-lines in the ParentalDashboard (PIN-gated) that appear as multi-day experiences in Louis's normal quest list. Turns the app from a fixed toy into a family tool that responds to what's happening in Louis's real life.

**Design principles:**
1. **Low friction for parents.** Templates + fill-in-the-blanks, not blank-page freeform. Marc creates a quest-line in < 2 min.
2. **Invisible authoring UX for Louis.** He never sees the parent dashboard. The quest-line appears as a normal quest.
3. **PoemQuest is the proven pattern.** Don't reinvent — generalize it.
4. **Onboard Louis once** with a warm message explaining the parent-zone exists. Then it recedes.

---

## The 3 templates

### T1 — Lern-Projekt 📚
*"Mein Referat", "Das Einmaleins", "Gedicht lernen", "Englische Wörter"*

- **Schedule kind:** `daily` (fixed day-by-day)
- **Default duration:** 7 days
- **Parent fills:** title ("Meerschweinchen-Referat"), optional subtitle, optional target date
- **Generated day sequence:**
  1. *"Worum geht's?"* — Sammle Fragen zu {topic} mit Mama/Papa.
  2. *"Hauptpunkte aufschreiben"* — Was willst du wissen? Was willst du sagen?
  3. *"Erste Übung"* — Lies einmal laut vor.
  4. *"Zweite Übung"* — Noch einmal, diesmal ohne nachschauen.
  5. *"Ronki vortragen"* — Trag es Ronki vor. Er hört gut zu.
  6. *"Generalprobe"* — Noch einmal üben. Morgen ist der Tag.
  7. *"Der große Tag!"* — Du schaffst das. Ronki glaubt an dich.

### T2 — Ereignis-Vorbereitung 🎁
*"Oma's Geburtstag", "Klassenausflug", "Zahnarzt", "Familienfeier"*

- **Schedule kind:** `target-date` (countdown-driven)
- **Duration:** derived from days-until-target (min 3, max 14)
- **Parent fills:** event title ("Oma's Geburtstag"), target date (required), optional prep-items list
- **Generated day sequence:** scaffolded around the target date. Last 3 days always escalate anticipation:
  - `T-2`: *"Noch zwei Tage..."*
  - `T-1`: *"Morgen ist es soweit."*
  - `T-0`: *"Heute ist der Tag!"*
  - Earlier days use generic prep prompts ("Eine Idee sammeln", "Vorbereiten"). If parent added prep-items, those fill the early slots.

### T3 — Neue Fertigkeit 🌱
*"Schwimmen lernen", "Fahrrad fahren", "Schnürsenkel binden"*

- **Schedule kind:** `milestones` (no fixed calendar)
- **Duration:** flexible (weeks)
- **Parent fills:** skill title, 4-6 milestone labels (e.g., "Erste Meter ohne Schwimmflügel", "Durch das ganze Becken", "Vom Beckenrand springen")
- **Louis's view:** milestones as checkboxes, hit in any order at child's pace. No "today's step" pressure — just a list.
- **Celebration:** on completing all milestones, same pattern as T1/T2.

---

## Data model

### TaskState additions (`src/context/TaskContext.tsx`)

```ts
export interface TaskState {
  // ...existing
  /** Parent-created quest-lines. Lifecycle: draft → active → completed. */
  parentQuestLines?: ParentQuestLine[];
  /** Set to true after Louis dismisses the one-time parent-zone intro overlay. */
  louisSeenParentIntro?: boolean;
}

export interface ParentQuestLine {
  id: string;                               // uuid
  templateId: 'learn' | 'event' | 'skill';
  title: string;                            // shown to Louis
  subtitle?: string;                        // optional secondary line
  emoji?: string;                           // defaults to template emoji
  createdAt: string;                        // ISO
  targetDate?: string;                      // ISO date (event template only)
  days: QuestLineDay[];                     // resolved at create-time
  completedDayIds: string[];
  completed: boolean;
  completedAt?: string;
  archived?: boolean;                       // parent soft-delete
}

export interface QuestLineDay {
  id: string;                               // stable per-day identifier
  dayNumber: number;                        // 1-based (or ignored for milestones)
  icon?: string;
  title: string;                            // kid-facing
  description: string;
  isMilestone?: boolean;                    // for T3
}
```

### Template definitions (`src/data/questLineTemplates.ts`) — new file

```ts
export interface QuestLineTemplate {
  id: 'learn' | 'event' | 'skill';
  emoji: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  scheduleKind: 'daily' | 'target-date' | 'milestones';
  defaultDurationDays?: number;
  dayGenerator: (input: QuestLineInput) => QuestLineDay[];
}

export interface QuestLineInput {
  title: string;
  subtitle?: string;
  targetDate?: string;
  milestones?: string[];  // T3 only
  prepItems?: string[];   // T2 only
}
```

Three templates exported as `TEMPLATES: QuestLineTemplate[]`. Each has a pure `dayGenerator` function that produces the `QuestLineDay[]` from parent input.

---

## UI components

### 1. `ParentIntroOverlay.jsx` (new) — for Louis

One-time Hub overlay shown when `louisSeenParentIntro !== true` AND state is loaded.

```
┌─────────────────────────────┐
│      [Drachenmutter         │
│       portrait]             │
│                             │
│  Ah, hier gibts noch was    │
│  für Mama & Papa.           │
│                             │
│  Leider komplett            │
│  langweilig für euch        │
│  Kinder. Aber dennoch       │
│  wichtig!                   │
│                             │
│     [ Verstanden ]          │
└─────────────────────────────┘
```

Tap "Verstanden" → `actions.patchState({ louisSeenParentIntro: true })` → overlay disappears forever.

Warm copy, Drachenmutter voice (uses existing narrator file if we generate one, otherwise text-only for now).

### 2. `QuestLineEditor.jsx` (new) — for Parents

Accessed via a new tab in ParentalDashboard labeled **"Quest-Linien"**.

**Tab content:**
- **Active quest-lines** (list of `parentQuestLines` where `!completed && !archived`)
- **+ Neue Quest-Linie** primary CTA
- **Abgeschlossen** collapsible (list of completed)
- **Archiviert** collapsible (list of archived, with restore option)

**"+ Neue" flow:**
- Step 1: Template picker (3 cards, one per template, with emoji + description)
- Step 2: Template-specific form
  - T1 form: title, subtitle (optional), target date (optional)
  - T2 form: title, target date (required, defaults to 7 days from now), prep-items (optional, up to 3 lines)
  - T3 form: title, 4-6 milestone labels (dynamic list, add/remove)
- Step 3: Preview — shows the generated day sequence
- Step 4: Save → adds to `parentQuestLines` as active

**Edit/delete existing:**
- Tap an existing quest-line → same form, pre-filled. Saving regenerates days (risky if Louis already completed some — confirm override).
- Trash icon → soft-delete (archived: true).

### 3. `QuestLineView.jsx` (new) — for Louis

Patterned on the existing `PoemQuest.jsx`. Generalized to accept any `ParentQuestLine` via route param.

```
┌──────────────────────────┐
│ ← Zurück                 │
│                          │
│ 🎁 Oma's Geburtstag      │
│ Noch 4 Tage              │
│                          │
│ ━━━━━━━━━━━░░░░░  3 / 7  │
│                          │
│ Heute:                   │
│ ┌────────────────────┐   │
│ │ 🎨 Karte basteln   │   │
│ │ Nimm Buntstifte... │   │
│ │   [ Gemacht ✓ ]    │   │
│ └────────────────────┘   │
│                          │
│ Bald:                    │
│  Day 4 — Geschenk ein... │
│  Day 5 — Alles fertig... │
│  Day 6 — Morgen!         │
│                          │
│ [Celebration on complete]│
└──────────────────────────┘
```

For milestone-based (T3): no "today", just a list of checkboxes.

### 4. Louis's quest list entry — modify existing

Each active `ParentQuestLine` appears at the top of Louis's quest view as a highlighted quest card:
- Emoji + title
- Progress bar (X / N)
- Today's step title
- Tap navigates to `QuestLineView` for that quest-line

Implementation: new `QuestLineCard.jsx` rendered above the normal quest groups in `TaskList.jsx`.

---

## Edge cases + decisions

### What happens when a day's date passes?

**T1 (Lern-Projekt):** Day N stays "today's day" until completed or the parent manually skips. No hard dates. Avoids frustration.

**T2 (Event):** Days tie to actual calendar dates counted back from target. If today is past target date → quest-line auto-completes. Past-dated steps are marked "verpasst" (missed) but don't block.

**T3 (Skill):** No dates. Always just the milestone list.

### Parent edits an active quest-line

Opens a confirm dialog: *"Diese Quest-Linie ist aktiv. Änderungen an den Tagen gehen verloren. Louis's Fortschritt bleibt."*

Safer default: parents can always edit title/subtitle/emoji freely. Editing day structure shows the warning.

### Parent deletes

Soft-delete only (archived: true). Louis's progress preserved for memory. A "Wiederherstellen" option in the archived list.

### What if Louis has completed the whole quest-line?

Shows celebration (existing `Celebration` component) with custom title. After celebration, the quest-line moves to "Abgeschlossen" in the parent dashboard. Louis can tap to revisit (read-only) for nostalgia.

### Rewards on completion

- Default: `+100 HP` + small XP bonus (matches PoemQuest pattern)
- Parent MAY opt to customize in the form (future; MVP = default reward)

### Multiple active quest-lines?

Yes, up to 3. Shown stacked in Louis's quest view. No limit-enforcement UI; just a soft guideline in the parent form ("Zu viele gleichzeitig können überfordern").

---

## Out of scope (follow-ups)

- **Custom template creation** — parents can't define new template shapes, only fill in the 3 provided
- **Shared quest-lines across families** — no social/import layer
- **Rich prep-item editing for T2** — max 3 items, simple text
- **Drachenmutter voice narration for parent-created content** — text-only for now (adding voice means ElevenLabs generation on device, complex)
- **Custom completion rewards** — fixed +100 HP for MVP
- **Website "/eltern" section** — separate follow-on wave; announces the feature to new users but doesn't gate shipping

---

## Risk assessment

**Med risk** (matches the Top 10 rating) primarily because of:
1. **Runtime UI generation** — quest-line content is data-driven, not hardcoded like PoemQuest. More edge cases.
2. **Parent UX complexity** — 3 templates × form variations × preview + edit flow = 8-12 screens total.
3. **State migrations** — new TaskState fields need hydration; existing users shouldn't see broken state.

Mitigated by:
- Copy the PoemQuest pattern directly for the Louis-facing runtime
- Ship MVP with just T1 (Lern-Projekt) fully built, T2/T3 as follow-ups within the same wave
- Additive state changes, backward-compatible

---

## Self-review

**Placeholder scan:** ✓ All template copy drafted; day generators defined.
**Contradictions:** ✓ None with existing Arc Engine or quest system — new `parentQuestLines` lives alongside.
**Scope:** Focused. 3 templates, 1 parent authoring flow, 1 Louis runtime view, 1 onboarding overlay.
**Ambiguity flagged:**
- Do we ship all 3 templates at once, or T1 first? (Leaning: all 3 in one wave, but T1 gets the most testing)
- Voice narration for parent-created content? (Skipping for MVP — text only)
- Website section? (Separate wave — Marc agreed)

# Parent-Creatable Quest-Lines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Spec:** `docs/superpowers/specs/2026-04-18-parent-quest-lines-design.md`

**Goal:** Ship the parent quest-line authoring system + Louis's runtime view + one-time parent-zone intro overlay for Louis. 3 templates (Lern-Projekt / Ereignis-Vorbereitung / Neue Fertigkeit).

**Architecture:** Net-new `parentQuestLines` array on TaskState. Templates live in `src/data/questLineTemplates.ts` as pure data + `dayGenerator` functions. UI splits into three surfaces: `QuestLineEditor` (Parent Dashboard tab), `QuestLineView` (Louis runtime, patterned on PoemQuest), `QuestLineCard` (entry in Louis's quest list), `ParentIntroOverlay` (one-time Hub message).

**Execution order — 4 phases, dispatched as subagents:**
1. **Phase A — Data + types + templates** (backend-only; no UI wiring)
2. **Phase B — Parent authoring UI** (QuestLineEditor in ParentalDashboard)
3. **Phase C — Louis's runtime** (QuestLineView + QuestLineCard in quest list)
4. **Phase D — Louis's onboarding overlay** (ParentIntroOverlay)

Each phase is one subagent. Same rhythm as Waves 1 & 2.

---

## Phase A — Data + templates

**Files:**
- Create: `src/data/questLineTemplates.ts`
- Modify: `src/context/TaskContext.tsx` (add `parentQuestLines`, `louisSeenParentIntro`)

### Task A.1 — TaskState additions

- [ ] **Step 1: Extend TaskState**

Add to `src/context/TaskContext.tsx`:

```ts
/** Parent-created quest-lines. Lifecycle: active → completed → (optionally) archived. */
parentQuestLines?: ParentQuestLine[];
/** Set once Louis dismisses the parent-zone intro overlay. */
louisSeenParentIntro?: boolean;
```

Plus exported types (define at top of file near existing TaskState):

```ts
export interface ParentQuestLine {
  id: string;
  templateId: 'learn' | 'event' | 'skill';
  title: string;
  subtitle?: string;
  emoji?: string;
  createdAt: string;
  targetDate?: string;
  days: QuestLineDay[];
  completedDayIds: string[];
  completed: boolean;
  completedAt?: string;
  archived?: boolean;
}

export interface QuestLineDay {
  id: string;
  dayNumber: number;
  icon?: string;
  title: string;
  description: string;
  isMilestone?: boolean;
}
```

Add defaults in `createInitialState`:

```ts
parentQuestLines: [],
louisSeenParentIntro: false,
```

Add hydration fallbacks:

```ts
parentQuestLines: raw.parentQuestLines || [],
louisSeenParentIntro: raw.louisSeenParentIntro ?? false,
```

- [ ] **Step 2: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): parentQuestLines + louisSeenParentIntro"
```

### Task A.2 — Template definitions

- [ ] **Step 1: Create `src/data/questLineTemplates.ts`**

```ts
import type { QuestLineDay } from '../context/TaskContext';

export interface QuestLineInput {
  title: string;
  subtitle?: string;
  targetDate?: string;     // ISO date (T2 only)
  prepItems?: string[];    // T2 only — up to 3
  milestones?: string[];   // T3 only — 4-6 labels
}

export interface QuestLineTemplate {
  id: 'learn' | 'event' | 'skill';
  emoji: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  scheduleKind: 'daily' | 'target-date' | 'milestones';
  defaultDurationDays?: number;
  dayGenerator: (input: QuestLineInput) => QuestLineDay[];
}

function uid(): string {
  return `ql_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// T1 — Lern-Projekt
export const LEARN_TEMPLATE: QuestLineTemplate = {
  id: 'learn',
  emoji: '📚',
  title: { de: 'Lern-Projekt', en: 'Learning Project' },
  description: {
    de: 'Für Referate, Einmaleins, Gedichte lernen — alles, was Übung braucht.',
    en: 'Presentations, multiplication tables, poems — anything that needs practice.',
  },
  scheduleKind: 'daily',
  defaultDurationDays: 7,
  dayGenerator: ({ title }) => {
    const topic = title || 'dein Thema';
    return [
      { id: uid(), dayNumber: 1, icon: '🔍', title: 'Worum geht\'s?',       description: `Sammle Fragen zu ${topic} mit Mama oder Papa.` },
      { id: uid(), dayNumber: 2, icon: '✍️', title: 'Hauptpunkte',          description: 'Was willst du wissen? Was willst du sagen? Schreib es auf.' },
      { id: uid(), dayNumber: 3, icon: '🗣️', title: 'Erste Übung',          description: 'Lies einmal laut vor.' },
      { id: uid(), dayNumber: 4, icon: '💪', title: 'Zweite Übung',         description: 'Noch einmal, diesmal ohne nachschauen.' },
      { id: uid(), dayNumber: 5, icon: '🐉', title: 'Ronki vortragen',      description: 'Trag es Ronki vor. Er hört gut zu.' },
      { id: uid(), dayNumber: 6, icon: '🎭', title: 'Generalprobe',         description: 'Noch einmal üben. Morgen ist der Tag.' },
      { id: uid(), dayNumber: 7, icon: '🌟', title: 'Der große Tag!',        description: 'Du schaffst das. Ronki glaubt an dich.' },
    ];
  },
};

// T2 — Ereignis-Vorbereitung
export const EVENT_TEMPLATE: QuestLineTemplate = {
  id: 'event',
  emoji: '🎁',
  title: { de: 'Ereignis-Vorbereitung', en: 'Event Preparation' },
  description: {
    de: 'Für Geburtstage, Klassenausflüge, Familienfeiern — Countdown bis zum Tag.',
    en: 'Birthdays, school trips, family events — countdown to the big day.',
  },
  scheduleKind: 'target-date',
  dayGenerator: ({ targetDate, prepItems = [] }) => {
    if (!targetDate) return [];
    const target = new Date(targetDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const daysUntil = Math.max(0, Math.round((target.getTime() - now.getTime()) / (24 * 3600 * 1000)));
    const duration = Math.min(14, Math.max(3, daysUntil + 1));
    const days: QuestLineDay[] = [];
    // Prep items fill early days if provided
    const prepSlots = Math.max(0, duration - 3);
    for (let i = 0; i < prepSlots; i++) {
      const prepTitle = prepItems[i] || 'Vorbereiten';
      const prepDesc = prepItems[i]
        ? `Heute: ${prepItems[i]}.`
        : 'Eine kleine Vorbereitung für den großen Tag.';
      days.push({ id: uid(), dayNumber: i + 1, icon: '📝', title: prepTitle, description: prepDesc });
    }
    // Always end with the same 3-day countdown
    days.push({ id: uid(), dayNumber: duration - 2, icon: '⏳', title: 'Noch zwei Tage...',   description: 'Der Tag kommt näher. Freu dich schon drauf?' });
    days.push({ id: uid(), dayNumber: duration - 1, icon: '🌙', title: 'Morgen ist es soweit.', description: 'Alles bereit? Heute Abend nochmal kurz durchdenken.' });
    days.push({ id: uid(), dayNumber: duration,     icon: '🎉', title: 'Heute ist der Tag!',   description: 'Hab einen wunderbaren Tag!' });
    return days;
  },
};

// T3 — Neue Fertigkeit
export const SKILL_TEMPLATE: QuestLineTemplate = {
  id: 'skill',
  emoji: '🌱',
  title: { de: 'Neue Fertigkeit', en: 'New Skill' },
  description: {
    de: 'Für Schwimmen, Fahrrad fahren, Schnürsenkel binden — Meilensteine in deinem Tempo.',
    en: 'Swimming, cycling, tying shoelaces — milestones at your own pace.',
  },
  scheduleKind: 'milestones',
  dayGenerator: ({ milestones = [] }) => {
    return milestones.map((label, i) => ({
      id: uid(),
      dayNumber: i + 1,
      icon: ['🌱', '🌿', '🌳', '🌟', '✨', '🏆'][i] || '🎯',
      title: label,
      description: 'Wenn du das geschafft hast, hak es ab.',
      isMilestone: true,
    }));
  },
};

export const QUEST_LINE_TEMPLATES: QuestLineTemplate[] = [LEARN_TEMPLATE, EVENT_TEMPLATE, SKILL_TEMPLATE];
export const TEMPLATE_BY_ID: Map<string, QuestLineTemplate> = new Map(QUEST_LINE_TEMPLATES.map(t => [t.id, t]));
```

- [ ] **Step 2: Write basic unit tests**

Create `src/data/questLineTemplates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LEARN_TEMPLATE, EVENT_TEMPLATE, SKILL_TEMPLATE } from './questLineTemplates';

describe('questLineTemplates', () => {
  it('LEARN_TEMPLATE generates 7 days with topic injected', () => {
    const days = LEARN_TEMPLATE.dayGenerator({ title: 'Meerschweinchen' });
    expect(days).toHaveLength(7);
    expect(days[0].description).toContain('Meerschweinchen');
    expect(days[0].dayNumber).toBe(1);
    expect(days[6].dayNumber).toBe(7);
  });

  it('EVENT_TEMPLATE generates countdown ending in "Heute ist der Tag"', () => {
    const target = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    const days = EVENT_TEMPLATE.dayGenerator({ title: 'Oma', targetDate: target });
    expect(days.length).toBeGreaterThanOrEqual(3);
    expect(days[days.length - 1].title).toContain('Heute');
    expect(days[days.length - 2].title).toContain('Morgen');
  });

  it('SKILL_TEMPLATE generates one day per milestone with isMilestone=true', () => {
    const days = SKILL_TEMPLATE.dayGenerator({ title: 'Schwimmen', milestones: ['A', 'B', 'C'] });
    expect(days).toHaveLength(3);
    expect(days.every(d => d.isMilestone === true)).toBe(true);
    expect(days.map(d => d.title)).toEqual(['A', 'B', 'C']);
  });

  it('EVENT_TEMPLATE returns empty array without targetDate', () => {
    const days = EVENT_TEMPLATE.dayGenerator({ title: 'Oma' });
    expect(days).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd "C:/Users/öööö/louis-quest" && npx vitest run src/data/questLineTemplates
```

Expected: 4/4 passing.

- [ ] **Step 4: Commit**

```bash
git add src/data/questLineTemplates.ts src/data/questLineTemplates.test.ts
git commit -m "feat: 3 quest-line templates (learn / event / skill) + day generators"
```

### Task A.3 — Actions for parent quest-lines

- [ ] **Step 1: Add actions to TaskContext**

Near existing actions in `src/context/TaskContext.tsx`:

```ts
const createQuestLine = useCallback((ql: ParentQuestLine) => {
  setState(prev => {
    if (!prev) return prev;
    return { ...prev, parentQuestLines: [...(prev.parentQuestLines || []), ql] };
  });
}, []);

const updateQuestLine = useCallback((id: string, patch: Partial<ParentQuestLine>) => {
  setState(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, ...patch } : q),
    };
  });
}, []);

const completeQuestLineDay = useCallback((questLineId: string, dayId: string) => {
  setState(prev => {
    if (!prev) return prev;
    const updated = (prev.parentQuestLines || []).map(q => {
      if (q.id !== questLineId) return q;
      if (q.completedDayIds.includes(dayId)) return q;
      const newDone = [...q.completedDayIds, dayId];
      const allDone = newDone.length >= q.days.length;
      return {
        ...q,
        completedDayIds: newDone,
        completed: allDone,
        completedAt: allDone ? new Date().toISOString() : q.completedAt,
      };
    });
    return { ...prev, parentQuestLines: updated };
  });
}, []);

const archiveQuestLine = useCallback((id: string) => {
  setState(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, archived: true } : q),
    };
  });
}, []);
```

Add to TaskActions interface:

```ts
createQuestLine: (ql: ParentQuestLine) => void;
updateQuestLine: (id: string, patch: Partial<ParentQuestLine>) => void;
completeQuestLineDay: (questLineId: string, dayId: string) => void;
archiveQuestLine: (id: string) => void;
```

Add all four to the value object passed to the provider.

- [ ] **Step 2: Commit**

```bash
git add src/context/TaskContext.tsx
git commit -m "feat(state): quest-line actions (create/update/completeDay/archive)"
```

---

## Phase B — Parent authoring UI

### Task B.1 — Explore ParentalDashboard

- [ ] **Step 1: Read `src/components/ParentalDashboard.jsx`** to understand current tab/section structure.

- [ ] **Step 2: Identify where to add the new "Quest-Linien" tab.**

Modify Parental Dashboard to add a new section or tab. If it's tab-based, add a tab. If it's a flat list of sections, add a section with the Quest-Linien editor.

### Task B.2 — Build QuestLineEditor

- [ ] **Step 1: Create `src/components/QuestLineEditor.jsx`**

Main editor component with three states: `list` (default), `picking-template`, `editing-form`. Sub-components:
- Template picker (3 cards)
- Form: `QuestLineForm` (template-aware — T1, T2, or T3 form variant)
- Preview: shows generated days from dayGenerator
- List of existing quest-lines with edit/archive controls

Detailed requirements (component subagent should read spec § "UI components" for full picture):
- Template picker: 3 cards in a vertical list. Each card shows emoji + title + description. Tap to select.
- T1 form: title (text, required), subtitle (text, optional), target date (date picker, optional)
- T2 form: title (text, required), target date (date picker, required, defaults to +7 days), prep-items (up to 3 text inputs, optional)
- T3 form: title (text, required), milestones (dynamic list, min 4 max 6, text inputs with add/remove buttons)
- Preview: shows generated days below the form. Updates live as parent types.
- Save button: validates required fields, calls `actions.createQuestLine(newQL)` or `actions.updateQuestLine(id, patch)`, returns to list view.
- Edit existing: tap on a list item → same form, pre-filled. Save patches via `updateQuestLine`.
- Archive: trash icon on list items → `archiveQuestLine(id)`.

- [ ] **Step 2: Wire into ParentalDashboard**

Add new tab/section "Quest-Linien" that renders `<QuestLineEditor />`.

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/QuestLineEditor.jsx src/components/ParentalDashboard.jsx
git commit -m "feat: QuestLineEditor in ParentalDashboard — 3-template authoring flow"
```

---

## Phase C — Louis's runtime

### Task C.1 — QuestLineView (generalized PoemQuest)

- [ ] **Step 1: Read `src/components/PoemQuest.jsx`** as the reference pattern.

- [ ] **Step 2: Create `src/components/QuestLineView.jsx`**

Accepts a `questLineId` prop (or reads from URL), looks up the quest-line from `state.parentQuestLines`, renders:
- Header: emoji + title + subtitle
- Progress bar (X / N)
- For daily templates: "Heute" card with current day + description + complete button
- For milestone templates: all milestones as a checkbox list
- "Bald" section: upcoming days (read-only peek)
- Back button
- Celebration on all-done (reuse Celebration component or pattern from PoemQuest)

Tap "Gemacht ✓" → calls `actions.completeQuestLineDay(questLineId, dayId)`. On completion of last day: show celebration, then navigate back.

Handling edge cases:
- Quest-line not found → back to quest list silently
- Already completed → show completion state (read-only review)
- Archived → show "Diese Quest-Linie wurde archiviert" with back button

- [ ] **Step 3: Wire routing in App.jsx**

Add a new view `questline` that takes a quest-line ID. Similar to how PoemQuest is wired. Add a state for `activeQuestLineId`:

```jsx
const [activeQuestLineId, setActiveQuestLineId] = useState(null);
// ...
{view === 'questline' && activeQuestLineId && (
  <QuestLineView
    questLineId={activeQuestLineId}
    onBack={() => { setActiveQuestLineId(null); setView('quests'); }}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/QuestLineView.jsx src/App.jsx
git commit -m "feat: QuestLineView — generalized PoemQuest runtime for parent quest-lines"
```

### Task C.2 — QuestLineCard in quest list

- [ ] **Step 1: Create `src/components/QuestLineCard.jsx`**

A highlighted card that renders above the normal quest groups in `TaskList`. Shows:
- Emoji + title (larger text)
- Progress bar
- Today's step title (for daily) OR "X / N Meilensteine" (for milestones)
- Subtle chevron indicating tappable
- Tap → navigates to QuestLineView for that quest-line

Props: `questLine: ParentQuestLine, onOpen: (id: string) => void`

- [ ] **Step 2: Integrate into TaskList.jsx**

At the top of TaskList's render, iterate over `(state.parentQuestLines || []).filter(q => !q.completed && !q.archived)`. For each, render `<QuestLineCard questLine={q} onOpen={openQuestLine} />`.

Where `openQuestLine` comes from a prop or context — App.jsx passes it down:

```jsx
{view === 'quests' && <TaskList onNavigate={setView} onOpenQuestLine={(id) => {
  setActiveQuestLineId(id);
  setView('questline');
}} />}
```

Cap display at 3 active quest-lines (extra logic inside the filter).

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/QuestLineCard.jsx src/components/TaskList.jsx src/App.jsx
git commit -m "feat: QuestLineCard — active parent quest-lines appear at top of quest list"
```

---

## Phase D — ParentIntroOverlay

### Task D.1 — The one-time overlay

- [ ] **Step 1: Create `src/components/ParentIntroOverlay.jsx`**

Modal-style overlay shown ONCE on Hub when `!state.louisSeenParentIntro`. Warm design:
- Semi-transparent backdrop
- Card with Drachenmutter portrait (use existing `/art/companion/drachenmutter.webp` if exists, else fallback)
- Two-line copy:
  - Line 1: "Ah, hier gibts noch was für Mama & Papa."
  - Line 2: "Leider komplett langweilig für euch Kinder. Aber dennoch wichtig!"
- Primary button: "Verstanden"
- Tap → `actions.patchState({ louisSeenParentIntro: true })` + overlay disappears

Detail: only show after onboarding is done AND at least some engagement (skip if first day). Gate: `state.onboardingDone && (totalTasksDone || 0) >= 3`. Avoid overwhelming the first session.

- [ ] **Step 2: Mount in App.jsx**

Near `<CompanionToast />`:

```jsx
{state && state.onboardingDone && !state.louisSeenParentIntro && (state.totalTasksDone || 0) >= 3 && view === 'hub' && (
  <ParentIntroOverlay />
)}
```

- [ ] **Step 3: Build + commit**

```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
git add src/components/ParentIntroOverlay.jsx src/App.jsx
git commit -m "feat: ParentIntroOverlay — one-time Hub message for Louis explaining the parent-zone"
```

---

## Final QA

### Task F.1 — Build + tests

- [ ] **Build:**
```bash
cd "C:/Users/öööö/louis-quest" && npx vite build 2>&1 | tail -5
```

- [ ] **Tests:**
```bash
cd "C:/Users/öööö/louis-quest" && npx vitest run 2>&1 | tail -10
```

Expected: all tests pass, 4 new quest-line template tests added.

### Task F.2 — Code review

Dispatch `superpowers:code-reviewer` subagent with the commits from Phases A–D.

### Task F.3 — Apply review fixes + push

- Apply critical/important issues
- `git push origin main`
- `gh run list --branch main --limit 2` to verify deploy

---

## Self-review

**Spec coverage:** ✓ All 3 templates (Phase A.2), parent authoring (Phase B), Louis runtime (Phase C), onboarding overlay (Phase D).
**Placeholder scan:** No TBDs. Template day generators have full copy. Component code delegated to subagent but with exact specs.
**Type consistency:** `ParentQuestLine` + `QuestLineDay` defined in Phase A.1, imported consistently throughout.
**Ambiguity:** Tab vs section in ParentalDashboard — implementer decides based on current structure (read first).

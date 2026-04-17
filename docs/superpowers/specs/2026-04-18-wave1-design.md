# Wave 1 — Tactical Polish (5 features)

**Date:** 2026-04-18
**Context:** Louis is using Ronki daily. Five distinct pain points observed — each small in code lift, high behavior-shaping value, zero risk to existing systems. Ships as one batch before the bigger Freunde rework (Wave 2) and RPG wind-down (Wave 3).

**Product direction (locked earlier):** Ronki's RPG layer is frozen. No new bosses, no new evolution, no combat language. Freunde (creatures) become the product's beating heart. Wave 1 preserves existing systems while laying groundwork for the new direction.

---

## Feature 1: Stamina for minigames

### Why
Louis plays one minigame after another, chasing coins and screen-minutes. No natural stopping point. Creates a negative loop (rushed play → guilty parent stopping him → tears). Solution: Ronki himself gets tired. The child doesn't hear "NO," he hears "Ronki is tired, let's do something else."

### What
- New state: `ronkiStamina` (0-5), `ronkiStaminaUpdatedAt` (ISO timestamp)
- Starts the day at 5
- Each completed minigame costs 1 stamina
- Recharges +1 stamina per 40 minutes of real time (computed lazily on read)
- At stamina 2: MiniGames screen shows a gentle warning — "Ronki wird müde" banner
- At stamina 0: game tiles are dimmed + non-interactive, Ronki says (voice line): "Ich bin ganz platt. Kannst du ein bisschen ohne mich spielen?" with icon showing a sleeping Ronki and countdown "Erholt sich in 38 Min"
- Override: Parental Dashboard has a "Ronki füttern" button that restores full stamina (for parents who've judged that Louis has earned a heroic session)

### What it's NOT
- NOT a punishment mechanic. The copy celebrates rest.
- NOT connected to coin cost or XP. Screen-time economy stays unchanged.
- NOT persistent between days in a grudging way — each morning Ronki wakes up fresh (stamina = 5 if last updated before today).

### Files
- `src/context/TaskContext.tsx` — add state, daily-reset logic, `consumeStamina()` action
- `src/hooks/useRonkiStamina.ts` (new) — hook returning `{ current, max, recharging, nextRechargeMin }`
- `src/components/MiniGames.jsx` — dim tiles + banner when low
- `src/components/StaminaExhausted.jsx` (new) — overlay when stamina = 0
- `src/components/ParentalDashboard.jsx` — add "Ronki füttern" button
- `src/companion/lines/de.ts` — add 3 stamina-state voice lines
- `public/audio/ronki/de_stamina_*.mp3` (3 files via ElevenLabs, Callum voice)

---

## Feature 2: Screen-time voice alerts (50/20/10)

### Why
Current ScreenTimer runs silently. When time ends, it just ends — no warning, no emotional landing, no way for Louis to prepare. Kid needs spoken warnings to practice transitioning.

### What
Voice triggers at:
- **50% remaining** — Ronki: "Wir haben noch ein bisschen Zeit zusammen. Worauf hast du Lust?"
- **20% remaining** — Ronki: "Gleich ist unsere Zeit um. Willst du noch etwas Besonderes machen?"
- **10% remaining** — Ronki: "Noch eine Minute, dann ist Pause. Du machst das super."
- **Done (0%)** — Ronki: "Gut gemacht! Bis später." + gentle chime

Plus a small visible tick-counter on the timer itself so Louis knows how much is left without relying only on audio.

### Design decisions
- Use existing VoiceAudio infrastructure (already has mute support)
- Use Callum voice (Ronki's main voice) — NOT Drachenmutter. This is Ronki pacing with Louis, not mother-authority.
- 50% threshold only fires if the original duration was ≥ 10 min (short sessions skip the 50% to avoid clutter)
- Fire once per threshold per session (dedupe on same-second re-renders)

### Files
- `src/components/ScreenTimer.jsx` — add threshold-fire logic using existing useEffect on `secondsLeft`
- `src/companion/lines/de.ts` — add 4 screen-time voice lines
- `public/audio/ronki/de_screentime_*.mp3` (4 files)

---

## Feature 3: Tooth-brushing guide screen

### Why
Current "Zähne putzen" just runs a 3-minute silent timer. Louis doesn't know what to do during it, gets bored, sometimes just stands around waiting for it to end. A guide teaches the skill while passing the time.

### What
During the tooth-brushing quest timer:
1. A rotating series of 5-6 illustrated "zones" cycling every ~30 seconds:
   - Oben rechts außen (upper right outside)
   - Oben links außen (upper left outside)
   - Oben hinten (upper back / biting surface)
   - Unten rechts außen
   - Unten links außen
   - Unten hinten / Zunge (tongue)
2. For each zone: a stylized mouth SVG with the current zone highlighted
3. Short kid-friendly motion hint: "Kleine Kreise" / "Rauf und runter" / "Sanft die Zunge abbürsten"
4. Countdown timer below ("Noch 45 Sekunden")
5. Cheerful progress: after each zone, a tiny badge lights up ("1 von 6 ✓")

### Design decisions
- SVG illustrations, not WebP. Tiny file size, scales crisp, easy to highlight zones dynamically.
- Zone sequence mirrors Zahnärzte-recommended pattern: start outside, work in.
- No sound for Wave 1 (user explicitly deferred voice/sfx here).
- Only fires during the bedtime `s12 Zähne putzen` quest (and `v10` on weekends). Other timed quests unaffected.

### Files
- `src/components/ToothBrushGuide.jsx` (new)
- `src/assets/toothZones.svg` or inline SVG paths per zone in component
- Wire into `src/components/TaskList.jsx` timer-active section where `Zähne putzen` quest is running

---

## Feature 4: Feedback reporter (Supabase + Resend email)

### Why
Louis is the only tester. When something confuses him, Marc has to remember what it was and file it mentally. A 1-tap "something was weird" button captures context while it's fresh. Testers shouldn't need to see Marc's personal phone number.

### What
- Button in **Parental Dashboard** labeled "Feedback senden"
- Tapping opens a small modal with:
  - A textarea for the feedback message
  - A hidden auto-captured context block (screen, Ronki stage, catEvo, timestamp, user_id) shown read-only in a collapsible "Kontext" section
  - Two buttons: "Abbrechen" / "Senden"
- On "Senden": INSERT into Supabase `feedback` table
- Shows "Danke! ✓" confirmation for 2s, then closes modal
- If Supabase request fails, queues the feedback in `localStorage` under `ronki_feedback_queue` and retries on next app load

### Supabase table schema
```sql
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  message text not null,
  screen text,
  ronki_stage int,
  cat_evo int,
  app_version text,
  created_at timestamptz default now()
);

-- RLS: authenticated users can insert their own feedback
alter table public.feedback enable row level security;
create policy "Users can insert own feedback" on public.feedback
  for insert to authenticated
  with check (auth.uid() = user_id);
```

Marc views all feedback in Supabase dashboard → Table Editor → `feedback`.

### Design decisions
- **Privacy:** Marc's personal info never exposed to testers. Auth user ID is auto-captured server-side.
- **Offline resilience:** Failed inserts queued in localStorage (array of feedback objects), retried on app load.
- **Parental Dashboard only** — this is for parents, not Louis.
- **No reply mechanism.** If Marc wants to follow up, he does so through separate channels (email).
- **No attachments** — keep it simple. Plain text feedback.

### Email notification layer
- Supabase Database Webhook on INSERT to `feedback` table
- Triggers an Edge Function that calls the Resend API
- Email sent FROM `feedback@ronki.de` TO `hallo@ronki.de` (which forwards to Marc's personal inbox)
- Email body includes the feedback message + auto-captured context (screen, Ronki stage, cat_evo, timestamp, user_id) + a direct link to the Supabase dashboard row

### Ship sequencing (Path A)
- **Today:** Supabase table + client modal + retry queue (everything except email)
- **Tomorrow (after DNS propagates):** Edge Function + Resend wiring

Marc's parallel tasks (unblocked):
1. Sign up at resend.com (free)
2. Verify `ronki.de` domain via 3 DNS records (SPF, DKIM, DMARC — values from Resend dashboard)
3. Generate a Resend API key
4. Add it as a Supabase secret named `RESEND_API_KEY`

### Files
- Supabase: new `feedback` table migration + database webhook
- Supabase Edge Function: `supabase/functions/feedback-notify/index.ts` (ships tomorrow)
- `src/utils/feedback.ts` (new) — submit + retry queue logic
- `src/components/FeedbackModal.jsx` (new) — the textarea + send UI
- `src/components/ParentalDashboard.jsx` — add button that opens the modal
- Retry queue hook wired into `src/App.jsx` (fires on mount)

---

## Feature 5: Freunde detail view — content + likes + effects

### Why
Louis loves the Freunde (creatures). Taps them often. Current detail view shows a name and one sad line of flavor. No sense that these are real friends Ronki met. Bringing them to life compounds the product's collect/experience/memories vision.

### What

**Added content fields per creature (all in German, all editable later):**
- `ronkiNote` — One sentence in Ronki's voice about the friend
- `favoritePlace` — One short string (e.g. "Unter Pilzen")
- `favoriteFood` — One short string (e.g. "Glühwürmchen-Honig")
- `funFacts` — Array of 2-3 kid-friendly trivia strings
- `howMet` — 2-3 sentences describing how Ronki first met them (ties to the discovery trigger — e.g. Forest_0 "on your first mission")
- `secret` — One line ("Wenn niemand hinsieht, singt er.")
- `likes` — Array of 3-5 things they like
- `dislikes` — Array of 2-3 things they don't like
- `discoveryDate` — Already in state (`state.micropediaDiscovered[i].discoveredAt`), rendered as "Entdeckt am 14. April 2026"

**Visual effects (no sound per user direction):**
- Portrait has a subtle 3s breathing animation (CSS `transform: scale(1) → scale(1.02)`)
- Chapter-specific ambient behind portrait:
  - **forest:** 3 drifting leaf SVGs fading in/out
  - **water:** expanding ripple circles
  - **dream:** twinkling stars
  - **hearth:** rising embers
  - **sky:** slow cloud drift
- On modal open: portrait fades in with a 400ms soft glow pulse
- "NEU" pulsing badge shows for 24h after first discovery

**Visual layout (revised detail modal):**
```
┌─────────────────────────────────┐
│      [Large portrait with       │
│       ambient chapter effect]   │
├─────────────────────────────────┤
│  🌿 WALD                        │
│  Glutfunke                      │
│  Entdeckt am 14. April 2026     │
│                                 │
│  💬 "Der ist mein bester        │
│     Pilzfreund..."              │
│                                 │
│  📖 Wie wir uns trafen          │
│  [2-3 sentences]                │
│                                 │
│  🏠 Lieblingsort: Unter Pilzen  │
│  🍯 Lieblingsessen: Honig       │
│                                 │
│  ✨ Wusstest du schon?          │
│  • Fun fact 1                   │
│  • Fun fact 2                   │
│                                 │
│  ❤️ Mag: Regen, Pilze, Lachen   │
│  🚫 Mag nicht: Lärm             │
│                                 │
│  🤫 Geheimnis: [one line]       │
└─────────────────────────────────┘
```

### Authoring approach
I'll draft all 13 creatures' content in Marc's voice, matching existing flavor-line tone. Marc reviews the draft; the data lives in `src/data/creatures.ts` so edits are one-word-changes in a single file.

Example draft for `forest_0` Glutfunke:
```ts
{
  id: 'forest_0',
  ronkiNote: 'Das ist Glutfunke. Wir haben zusammen die erste Höhle gefunden.',
  favoritePlace: 'Unter alten Eichen',
  favoriteFood: 'Glühwürmchen-Honig',
  funFacts: [
    'Sein Schweif glüht, wenn er sich freut.',
    'Er kann 10 Minuten ganz still sitzen.',
  ],
  howMet: 'Ich war auf meiner ersten Mission im Wald. Er saß auf einem Pilz und hat mir den Weg gezeigt. Seitdem treffen wir uns oft.',
  secret: 'Er singt manchmal ganz leise für sich.',
  likes: ['warmes Licht', 'Pilze', 'deine Stimme'],
  dislikes: ['laute Geräusche', 'nasse Pfoten'],
}
```

### Files
- `src/data/creatures.ts` (new) — single source of truth for all creature content
- `src/components/Micropedia.jsx` — rewrite detail modal to consume new fields
- `src/components/ChapterAmbient.jsx` (new) — 5 chapter-specific CSS/SVG ambient effects
- `src/components/Micropedia.jsx` — add "NEU" badge logic

---

## Cross-cutting concerns

### Build & tests
- Each feature gets its own commit(s)
- Vitest unit tests only for logic-heavy pieces (stamina calculation, screen-time threshold firing)
- UI components manually verified via `npm run dev` preview
- All existing 44 tests must still pass

### Voice audio
- Items 1 & 2 need ElevenLabs generation (stamina + screen-time). Use Callum voice (`N2lVS1w4EtoT3dr4eOWO`).
- Same UTF-8 + real-umlaut discipline we established last session.
- All audio commits batch-commit to avoid N small commits for N lines.

### State migrations
- Both new state fields (`ronkiStamina`, `ronkiStaminaUpdatedAt`) get hydration fallbacks (`raw.X ?? default`).
- No breaking changes to existing state shape.

### Risk assessment
- **Stamina + screen-time** change user behavior. Test manually for a day before shipping to Louis. Feedback reporter helps if something feels off.
- **Tooth-brushing** is additive — worst case it doesn't render and nothing breaks.
- **Freunde detail** is an info-density increase. Risk: too much text for a 6-year-old. Mitigation: kept each field short, lots of icons, clear hierarchy.

---

## Out of scope (Wave 2 / Wave 3)

Explicitly NOT in Wave 1:
- Promoting Freunde to navigation (Wave 2)
- Freunde discovery mechanic redesign (Wave 2)
- Skills friends teach (meditation/breathing/yoga) (Wave 2)
- Fading-companion curve design (Wave 3)
- Boss / evolution deprecation (Wave 3)

---

## Self-review

**Placeholder scan:** ✓ No TBDs, all spec values concrete.
**Contradictions:** ✓ None — stamina doesn't conflict with existing coin/XP flows.
**Scope:** ✓ Five items, all independent, each ~0.5-1 day.
**Ambiguity:** ✓ Two defaults flagged (stamina ceiling, feedback WhatsApp). User will confirm or push back.

# Ronki · Roadmap

Living PM document for the Ronki product. Updated at the start + end of
every sprint, and whenever a major call shifts the plan. This is the
canonical "what we're doing and what's next" surface — backlog notes in
`.basic-memory/Ronki/` keep the deep context; this file picks the
actual battles.

**Cadence.** Sprints are loose (roughly a week, shaped by Marc's
availability with Louis). Each sprint the "Now" block gets picked from
"Next," "Shipped" rolls cards over from "Now," and "Next" + "Later" get
a short re-prioritisation pass.

**Current branch.** `experiment/drachennest` — the Hub-as-Ronki's-room
reframe. If it tests well with Louis, it graduates to `dev` + `main`.

---

## North Star

1. **Care is the loop, routines are the medium.** The kid thinks "I'm
   taking care of Ronki" — the morning checklist falls out of that. If
   a mechanic doesn't reinforce this, it doesn't ship.
2. **Fade by design.** We are a transition companion, not a retention
   product. The testimonial we want is the parent saying "he doesn't
   reach for it as much anymore." That constrains every reward loop.
3. **Kid-safe, parent-visible.** No dark patterns. Everything that
   touches screen time, streaks, or emotional language goes through the
   parental dashboard first.

---

## Now — Sprint "Drachennest prototype" (24 Apr 2026)

Goal: **Louis tests the reframed Hub tomorrow.** Stunning enough on
first open that he doesn't need a tour.

| Card | Status | Notes |
|---|---|---|
| Drachennest worktree + deploy isolation | ✅ shipped | Branch `experiment/drachennest`, namespaced storage (`hdx2_drachennest`), mirror CI workflow to `/experiment/` subfolder, local preview wired via Claude Preview. |
| Hub → RoomHub reframe (v1) | ✅ shipped | `src/components/drachennest/RoomHub.jsx` replaces the old Hub when `?legacyHub=1` is absent. 3-arc vitals ring, care verbs, speech bubble all wired to `state.ronkiVitals` via `actions.careForRonki`. |
| RoomHub polish v2 (Laden lineage) | ✅ shipped | Square painterly stage, painted hills, time-of-day window with sun/moon/stars, sit-bob, sparkles, wall-scroll preview with anchor counts, object row (Truhe / Buch / Spielzeug / Karte), expedition hint when morning+bedtime done. |
| Vitals arcs visibly wrap Ronki | ✅ shipped | Stage measured via `ResizeObserver`; chibi sized to 82% of stage so the ring reads as a halo, not a distant frame. |
| Scene palettes (dawn / day / dusk / night) | ✅ shipped | `pickTimeOfDay()` switches automatically; `?time=<tone>` forces for QA. Dawn reworked to soft apricot/mint so it doesn't read as autumn dirt. |
| Auth + onboarding bypass for local preview | ✅ shipped | Stub user in `AuthContext` when `VITE_SUPABASE_URL` is unset; `ExperimentAutoPrime` primes `kidIntroSeen` / `parentOnboardingDone` / `onboardingDone` so the app boots straight to RoomHub. |
| Ronki ask-voice on quests | ✅ shipped | `ronkiAsk` field added to `SCHOOL_QUESTS` (13 lines, Marc's voice rules). Not surfaced in TaskList yet — see Next. |
| ROADMAP.md as recurring artifact | ✅ shipped | This file. |
| Marc QA pass (vitals icons clipped, low Ronki, dead pills, window portal) | ✅ shipped | All four flagged in the first hands-on look got fixed in one drop. Full notes in the commit. |
| **Reise / Expedition surface (DN-02 v1)** | ✅ shipped | Full state machine (home / leaving / away / waiting), painterly campfire scene, glowing diary, modal with memento + Morgenwald banner + progress bar, Naturtagebuch shelf with 8-slot memento grid + Seiten list. One biome (Morgenwald), eight memento types, one per return. Trigger wired: morning ritual at 100% sets expedition.state to 'leaving'. The Karte tile + the painted window in RoomHub both open the surface. `?expedition=home\|leaving\|away\|waiting` forces a state for QA, and a DEV state-cycler bar floats over the surface so any state is one tap away. |

### Blocking for Louis's test

- [ ] Commit + push `experiment/drachennest` so the GitHub Pages mirror
      builds at `/Ronki/experiment/` as the backup URL if local preview
      isn't reachable.
- [ ] Smoke test: tap care verb → vital ticks up; complete morning quest
      → hunger bumps 12; reopen → vitals persist (`hdx2_drachennest`).
- [ ] Take polaroid screenshots of the 4 scene tones for the sprint log.

---

## Next — picked for the following sprint

High-confidence cards we want to start within a sprint or two. In
priority order.

| ID | Card | Est. | Dependency |
|---|---|---|---|
| DN-01 | **Surface `ronkiAsk` in TaskList** | ~1h | RoomHub live. Ronki's voice carries through the whole loop rather than stopping at the room door. Show the ask line beneath each quest tile; fade on complete. |
| DN-02b | **Reise polish + multi-biome unlock** | ~4h | The v1 surface ships with one biome (Morgenwald). Next pass adds the night-streifzug state, a second biome unlock when the kid hits 12 mementos in Morgenwald, the actual scrap-page mosaic that grows in the diary banner over time, and a notification dot on the RoomHub Karte tile when expedition.state is 'waiting'. |
| DN-03 | **Progressive Hub disclosure** | ~90m | Gate the object row + expedition hint by `totalTasksDone` (0/3/5/10). Hector + Louis both flagged the dense Hub on first entry. See backlog note. |
| DN-04 | **Ronki status chip (TopBar)** | ~45m | Wrap PinnedRonki in a progress ring driven by today's pct + thread ronkiMood so face/particles match. Ships without event pulses in v1. |
| DN-05 | **Kinder-Yoga pose as first emotional tool** | ~4h | Start with Löwen-Pose for "besorgt." One pose in the existing tool slot; full Yoga-Reise surface deferred until we've watched Louis engage. |
| DN-06 | **Ronki-Ausmalbild reward delivery** | ~3h | 50-star reward has no visible payoff today. Add 2-3 line-art scenes + post-redeem modal with Drucken / Handy ausmalen. See backlog note. |

---

## Later — bigger bets, not yet started

Design-complete or near-design-complete, waiting on either capacity,
observation of Louis's current use, or a stronger signal that they move
the north-star metrics.

- **Ronki expeditions + world map** — phased build (plumbing → content
  → map → polish, ~10-13h). Defer until DN-02 + one more emotional
  tool ships. See `project_ronki_expeditions.md`.
- **Emotional tool library (3 remaining)** — Kraftwort / Gedanken-Wolken
  / Stein-und-Gummi. Box-Atmung + Drei-Danke already shipped. See
  `project_emotional_tool_library.md`.
- **Chibi expansion (Teen + Legend stages, wings from hatch, 3 moods,
  random hatching traits)** — 576 unique Ronki combinations. Full impl
  plan in `backlog_ronki_chibi_expansion.md`.
- **MINT crystal-sorter rework** — Louis rated "super boring" (23 Apr).
  Pitches in `backlog_mint_crystal_game_rework.md`. Top picks:
  Kristall-Kette / Campfire Visitors / Cave Mining.
- **Sterne/Funkelzeit deduction animation** — redeem currently snaps
  the counter; needs a sparkle-fly-outward motion mirroring QuestEater.
  Small but the spend beat feels hollow without it.
- **Fire-breath animation variations** — single-flame puff gets boring
  after 20+ completions. 4-5 contextual variants by quest type.
- **Weather-gated Sonnencreme** — include s6b only on sunny mornings
  with "heute extra wichtig" hint; skip year-round. Teaches contextual
  relevance. ~1-2h.
- **Fire tablet support** — most kids have Amazon Fire / Android, not
  iPhones. Layout + performance + multi-profile implications. Deferred
  until we've stabilised the core loop on Louis's device.

---

## Parked

Explicitly deprioritised. Re-enter via an unpause decision, not drift.

- **Arc offer rework** — "Das erste Abenteuer" banner + broken
  "Vielleicht später" button. Paused Apr 2026 pending an
  adventure-delivery timing decision.
- **Onboarding chibi refresh + "Der erste Funke" teach beat** — spec
  at `docs/superpowers/specs/2026-04-23-onboarding-refresh-and-teach-beat-design.md`.
  Paused while the prototype uses the bypass. Re-enter when
  Drachennest graduates.
- **Egg system / useEggSystem** — spawner disabled. No more egg
  triggers. Kept in source for history.

---

## Shipped (last 10 sprints, rolling)

Short rollup of notable drops so we don't lose the through-line when
memory compacts.

- **Sprint 22 Apr 2026** — habits sparkle, Ronki status chip scaffold,
  organic mood triggers, Drei-Danke tool, Ausmalbild MVP. Retro +
  QA fixes in `sprint_log_2026_04_22.md`.
- **Ronki website launch (20 Apr 2026)** — 7-article Ratgeber,
  Ritual/Routine repositioning, beta launch state, /installieren, site
  feedback form, 10 per-page Midjourney OG images, multi-child
  screener, Impressum KI-Transparenz. Voice split C/B by page.
- **Ronki-Sammelbuch public compendium (24 Apr)** — `/?compendium=1`
  page, 6 variants × 6 stages × 6 moods, kid-friendly styling, exempt
  from AuthGate. `project_ronki_sammelbuch.md`.

---

## How we use this file

- **Starting a sprint.** Move 1-3 cards from Next into Now. Update
  their Status to the real gerund ("writing," "testing," "blocked on
  X"). Don't pick more than we can finish — half-done cards drift.
- **Ending a sprint.** Move finished cards from Now to Shipped with a
  one-line outcome. Carry unfinished cards forward with a note on
  what's left.
- **Mid-sprint discovery.** A new card goes to Next by default. It
  only jumps to Now if it blocks something already in Now, or if Marc
  explicitly decides it belongs.
- **Backlog notes stay in basic-memory.** This file links out; it
  doesn't duplicate. If a card needs more than 2 lines of context
  here, the real spec lives in `.basic-memory/Ronki/` or
  `docs/superpowers/specs/`.

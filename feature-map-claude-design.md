# Ronki · Feature Map for Claude Design

A running list of features we'd want to enrich with a deeper Claude
Design pass when we have the token budget for it. The implementation
stays in this repo; this file just names the bets and what kind of
treatment each one needs, so when a design session opens up we know
what to point at.

**How to read this.** Each entry has a *thrust* (what's actually being
designed, in one line), a *current state* (what ships today on
`experiment/drachennest`), and a *target* (what a deeper Claude Design
pass should produce). Cards are roughly priority-ordered from
"highest emotional payoff with least token spend" to "biggest scope,
needs a real session." Anything ✅ shipped here only counts as v1
shipped — the entry stays because there's still more to design.

**Rule.** Don't open a Claude Design session for a card unless its
*current state* is real code we can iterate against, or a written
spec. Cold-starting visual exploration in design tooling without a
target file to compare against burns tokens for low signal.

---

## Tier 1 — small, high-payoff polish (one design session each)

### CD-01 · Naturtagebuch banner artwork
- **Thrust.** Per-memento painterly banner art instead of the generic
  green gradient placeholder we ship today.
- **Current state.** The diary modal banner is a CSS gradient with
  three radial-gradient "bushes" stamped on it. Same banner for every
  Morgenwald find.
- **Target.** Eight banner illustrations, one per memento (Ahornblatt
  / Feder / Bachstein / Eichenblatt / Eichel / roter Pilz /
  Schneckenhaus / Moosbüschel). Painterly watercolor style matching
  the prototype's room palette. Each banner reads like a painted
  postcard from the place described in the quote, not a stock
  texture. Optional bonus: subtle parallax layers (sky / midground /
  foreground) so the modal opens with a shallow depth animation.
- **Why this is Tier 1.** The diary modal is the moment-of-payoff for
  the whole expedition loop. The current banner under-delivers on
  that beat. Per-memento art turns it from "a card opens" into
  "Ronki brought you a place."

### CD-02 · MoodChibi expansion (Teen + Legend stages, 3 new moods)
- **Thrust.** Two new evolution stages and three new mood states for
  the chibi system, plus the wings-from-hatch decision Marc flagged.
- **Current state.** 4 stages (Egg / Baby / Jungtier / Stolz), 6
  moods. CSS dragon, all hand-drawn. `MoodChibi.jsx` exists.
- **Target.** Backlog `backlog_ronki_chibi_expansion.md` already has
  the full spec (Teen + Legend, wings from stage 1, three more moods
  happy / nachdenklich / gelangweilt, four random hatching traits =
  576 unique combinations). Claude Design's job: produce the visual
  references for each new state and each trait variant so the SVG
  port is straightforward.
- **Why Tier 1.** The chibi is on every screen. Each new stage
  rewards real engagement and gives parents a visible "he's
  growing" signal that maps to days-since-onboarding.

### CD-03 · Care verb reactions
- **Thrust.** Per-verb Ronki reaction animations + voice lines instead
  of the shared "+N" floating heart.
- **Current state.** Tap care verb → vital ticks up → generic floating
  heart on the verb button. No voice, no chibi reaction.
- **Target.** Three short reaction loops per verb: Füttern (Ronki
  munches with sound effects), Streicheln (eyes squint, blush),
  Spielen (small jump or tail wag). One voice line per verb,
  rotated so it doesn't repeat tap-after-tap. Tied to mood: a
  "besorgt" Ronki reacts more subtly than a "magisch" one. The
  mood-coupling is the hardest part — Claude Design can spec the
  decision matrix.

### CD-04 · Sterne / Funkelzeit deduction animation
- **Thrust.** Make the spend beat feel tangible. When Louis redeems a
  reward, the counter currently snaps; we want a tick-down with
  sparkles flying outward, mirroring the earn-side QuestEater
  motion.
- **Current state.** Plain numerical counter. Already in backlog as
  `backlog_claim_deduction_animation.md`.
- **Target.** Motion spec + reference clips for the sparkle-out beat,
  including the timing curve and how many sparkles per N stars
  spent. Should match the warmth of the QuestEater beat so earn and
  spend feel like the same family of moments.

---

## Tier 2 — medium-scope features needing real visual exploration

### CD-05 · Multi-biome world map (DN-02b)
- **Thrust.** The Karte tile currently lands on the Expedition
  surface, which only knows about Morgenwald. The follow-up needs a
  proper world map that grows as biomes unlock.
- **Current state.** `ScrapMap` component inside `Expedition.jsx`
  shows a small painterly preview map of one biome. No multi-biome
  navigation yet. Two old IAMYAWS map images sit in
  `.basic-memory/Ronki/image/map/old/` as visual reference.
- **Target.** A scrollable / pannable hand-drawn world map with 4-6
  biomes (Morgenwald / Sandküste / Hochmoor / Sterntal / etc.).
  Locked biomes show as fog or unrolled-but-faint regions.
  Unlocking ties to memento-count thresholds in the source biome.
  Hover or tap states reveal each biome's character. Painterly
  watercolor matching the campfire scene's palette. Claude Design
  produces the master illustration plus the unlock-state overlays.

### CD-06 · Ronki-Yoga-Reise surface
- **Thrust.** The 12-pose progression surface from
  `project_ronki_yoga_reise_sketch.md`. Drachenmutter as host, 12
  emotion-adjacent animals.
- **Current state.** Spec exists, no code yet. Backlog item
  `backlog_ronki_yoga.md` covers the framing decision; the project
  doc has the layout sketch.
- **Target.** Visual treatment for the surface itself (the grid of 12
  animals as a progression card), the "Drachenmutter shows you the
  pose" beat, and per-pose reference frames (Ronki demonstrating
  each animal's pose in his chibi style). The pose frames are the
  expensive part — twelve separate illustrations in a consistent
  style. Better to ship one (Löwen-Pose) as part of the Tier-1
  emotional-tool work first, then commission the rest only if the
  loop tests well.

### CD-07 · Emotional tool library — three remaining tools
- **Thrust.** Build out the "Louis teaches Ronki self-regulation"
  mechanic with three more tools: Kraftwort / Gedanken-Wolken /
  Stein-und-Gummi.
- **Current state.** Box-Atmung + Drei-Danke shipped. The other
  three are spec'd in `project_emotional_tool_library.md`.
- **Target.** Per-tool visual + motion treatment matching the
  intimate scale of the existing two. Each tool needs a hero
  illustration, a 3-step flow, and the closing beat where Ronki
  visibly gets calmer. Claude Design's job: hero illustrations and
  the closing-beat reaction frames.

### CD-08 · Onboarding refresh + "Der erste Funke" teach beat
- **Thrust.** Replace the painted onboarding sprites with the chibi
  system and add the new hold-and-release teach beat that anchors
  the Wave-3 callback.
- **Current state.** Spec at
  `docs/superpowers/specs/2026-04-23-onboarding-refresh-and-teach-beat-design.md`.
  Currently bypassed in the prototype via `ExperimentAutoPrime`.
- **Target.** Visual exploration of the "Der erste Funke" interaction
  itself: how the hold gesture reads, what the release beat looks
  like, and how `taughtSignature` + `taughtAt` get a visible payoff
  later (the callback). This one's two design surfaces really —
  the immediate teach beat and the callback moment, days apart.

---

## Tier 3 — large, foundational design that needs a real session

### CD-09 · Ronki voice redesign
- **Thrust.** Audit existing voicelines (keep / rewrite / delete),
  pick a proper voice, re-render the full catalog before unmuting
  default.
- **Current state.** Reference voices exist for Ronki + 7 Freunde +
  Drachenmutter in `reference_voice_casting.md`. Many lines drift
  toward AI-smelling three-beat fragments. Mute is the current
  default.
- **Target.** This is half writing and half audio direction — Claude
  Design isn't the right surface for the ElevenLabs casting work,
  but it IS the right surface for the per-character visual identity
  that the voice has to match. So the design half here is: pin down
  each Freund's chibi-style portrait + their gesture vocabulary,
  then write the voice rules from the visual language. Pair with
  `feedback_no_ai_writing.md` rules.

### CD-10 · Mood animation library
- **Thrust.** Per-mood idle loops + scene reactions for all six
  emotions, expanding the current 4-state MiniRonki.
- **Current state.** Backlog item `backlog_ronki_mood_animations.md`.
  4 of 6 moods have idle animations today (in `MoodChibi.jsx`).
- **Target.** Two more idle loops (Traurig / Magisch had drafts;
  Tired / Müde needs work; Besorgt could use a more readable
  fidget). Plus scene-level reactions: the room itself responds to
  mood, not just the chibi — overcast tint when sad, golden glow
  when magisch, slight blur when tired. This couples to CD-11
  (weather scene) so they should be designed together.

### CD-11 · Weather-aware Ronki scene
- **Thrust.** Wire real device-location weather into the campfire
  scene as a subtle atmosphere layer. Drizzle on rain days, sun
  beams on clear days, fog on overcast. Mood always wins over
  weather.
- **Current state.** Backlog `backlog_weather_aware_ronki.md`. Not
  built. The room currently has 4 time-of-day palettes (dawn / day
  / dusk / night) but no weather overlay.
- **Target.** Visual exploration of how rain / fog / clear / wind
  composite over the existing time-of-day scene without breaking
  the painterly look. Hardest part is the priority rule: a sad
  Ronki on a sunny day should still feel sad — the weather can't
  steamroller the mood signal.

### CD-12 · Begleiter Polish nice-to-haves
- **Thrust.** The four small Begleiter Polish ideas in
  `backlog_begleiter_polish_ideas.md`: ambient bg blobs on mood
  card, profile-card Ronki quips, evolution-stage label, redesigned
  Helden-Kodex / Chronik card.
- **Current state.** Backlog only.
- **Target.** Each is a small visual rev. Could batch into one
  session.

---

## How this list relates to ROADMAP.md

ROADMAP.md is the *execution* surface — it picks battles for the
current sprint and what's queued next. This file is the *visual
ambition* surface — it tracks where we'd push design quality if
budget allowed, regardless of whether the underlying feature is in
flight this week. A card can sit in CD-XX for months without being
worked because the underlying feature isn't in active development;
that's fine. When ROADMAP picks a feature up, we cross-reference
back here to decide whether to also open a design session for it.

**Two cards link directly today.** ROADMAP DN-02b (Reise polish +
multi-biome unlock) maps to CD-05 (multi-biome world map). ROADMAP
DN-05 (Kinder-Yoga first pose) maps to CD-06 (Yoga-Reise surface).

---

## How to use this file

- **Adding a card.** New observation about where design depth would
  pay off → add to the right tier with thrust / current / target.
  Default tier is 2 unless it clearly fits Tier 1 (small scope, big
  emotional payoff) or Tier 3 (foundational, multi-session).
- **Opening a Claude Design session.** Pick a card. Read its
  *current state* and *target* aloud to yourself. If the current
  state is "spec only" and there's no code or visual to compare
  against, write a tighter spec first or pick a different card.
  The session prompt is "here's what ships today, here's the gap
  named in the target — explore."
- **Closing the loop.** When a design pass lands, leave the card
  here but mark its *current state* with a date and a note on
  what shipped. Don't delete it — most of these cards have a v2
  iteration in them.

# Wave 2.5 — Gefühlsecke + Forscher-Ecke (2 MINT games) Design

**Date:** 2026-04-19
**Goal:** Two warm nooks on the Hub — one for emotions, one for brain-play discovery. Both autonomy-first, no daily rotation pressure, tied to existing collection logic.

**Context:** DreamStrip just deprecated. Sprites (transparent creature portraits) just shipped. This wave adds the first major kid-facing surfaces since Wave 2.

---

## 1. Gefühlsecke (Feelings Corner)

### Why
A 6-year-old's biggest developmental job is naming feelings. Ronki already has tools that teach this (Baum-Pose for grounding, Box-Atmung for overwhelm, drawing for sadness) — but they're buried inside Freund arcs, only available during those multi-day windows. Gefühlsecke surfaces them on demand, always, so Louis can reach them in the actual moment he's overwhelmed.

### UX
- **Entry point:** small heart icon in Hub's top-right corner (next to time/weather). Always visible, subtle.
- **Tap →** fullscreen overlay: *"Wie fühlst du dich gerade?"*
- **5 emoji choices** (big, tappable cards):
  - 😊 Gut
  - 😤 Wütend / Aufgeregt
  - 😢 Traurig
  - 😰 Ängstlich / Überfordert
  - 😴 Müde
- **Tap an emotion →** Ronki offers a matching tool (ONE tool per emotion, can expand later):
  - 😊 Gut: *"Schön! Lass uns kurz feiern"* → tiny celebration animation + "Ronki freut sich mit dir!"
  - 😤 Wütend: *"Komm, wir atmen zusammen"* → Box-Atmung (4-4-4-4, full 2 cycles = ~32s, same UX as Box-breathing beat when Windreiterin ships)
  - 😢 Traurig: *"Das darf sein. Erzähl mir davon."* → open a simplified journal entry (just one text field: "Was ist los?") → save to `journalGratitude` OR a new `feelingsLog`
  - 😰 Ängstlich: *"Lass uns ein Baum werden"* → Baum-Pose mini (30s hold, same component as Pilzhüter beat)
  - 😴 Müde: *"Das versteh ich. Hier sind kleine, ruhige Ideen"* → static card with 3 quiet suggestions (Buch anschauen, dem Fenster zuhören, eine Zeichnung machen)
- Close button always accessible

### State
```ts
// TaskState additions
feelingsLog?: Array<{ ts: string; feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede'; note?: string }>;
```

Every use logs a `feelingsLog` entry with timestamp + chosen feeling. Parents can see patterns over time (future ParentalDashboard feature, not in this wave).

### Components
- **New:** `src/components/Gefuehlsecke.jsx` — 2-mode fullscreen overlay (picker → tool)
- **New:** `src/components/GefuehlsecheHeart.jsx` — the heart icon trigger (mount in Hub top-right)
- **Reuse:** BaumPoseBeat (already exists from Pilzhüter arc) for 😰 flow
- **Reuse:** Celebration component for 😊 tiny celebration

### Voice / copy
All German, kid-friendly, no em-dashes. Ronki's warm-peer tone. Example transitions Drachenmutter-less (Ronki speaks, not Drachenmutter — Gefühlsecke is kid-driven).

### Out of scope
- Parental dashboard patterns view (future wave)
- Custom parent-added suggestions per feeling
- Scheduling/reminders ("time to check in with feelings")

---

## 2. Forscher-Ecke (Explorer Corner) — scaffolding + 2 games

### Why
Five brain-play games teach early STEM concepts (counting, pattern matching, logic, balance, categorization) through Freund-led discovery. Not a game arcade — a research-lab framing. Each game unlocks a badge; completing all 5 unlocks a special creature. After completion, games migrate to regular Mini-Spiele section with stamina costs.

**"MINT" is an internal category name** (parents see it in ParentalDashboard); Louis sees "Forscher-Ecke" everywhere.

### UX — discovery phase

- **Hub section:** a new themed block appears on Hub (between the Freunde hero card preview and the main Campfire area, or somewhere prominent). Styled as a small "Forscher-Werkstatt" card:
  ```
  🔬 Forscher-Ecke
  2 / 5 Knobel-Abenteuer entdeckt
  [ 5 slot thumbnails, locked/unlocked/played ]
  ```
- **Tapping an unlocked-but-unplayed slot →** Freund intro ("Baumbart hat was für dich...") → game launches
- **Tapping an already-played slot →** game launches directly (no intro again)
- **Tapping a locked slot →** hint: "Erst wenn du {Host-Freund} kennenlernst."
- **All 5 complete →** Forscher-Ecke collapses, games migrate to Mini-Spiele, Forscher-Funkel creature unlocks

### Game → Freund host pairings

| Game ID | Name | Host Freund | Host Prerequisite | Badge ID |
|---------|------|-------------|-------------------|----------|
| `zahlenjagd` | Zahlenjagd | Sturmflügel (sky_0) | sky_0 discovered | `badge_mint_zahlen` |
| `muster-memory` | Muster-Memory | Baumbart (forest_4) | forest_4 discovered | `badge_mint_muster` |
| `wurzel-labyrinth` | Wurzel-Labyrinth | Pilz-Jeti (forest_6) | forest_6 discovered | `badge_mint_labyrinth` (Wave 2.6) |
| `pilz-waage` | Pilz-Waage | Pilzhüter (via pilzhueter Freund arc) | pilzhueter arc completed | `badge_mint_waage` (Wave 2.6) |
| `kristall-sortierer` | Kristall-Sortierer | Mr. Shroom (forest_5) | forest_5 discovered | `badge_mint_kristall` (Wave 2.7) |

Unlock prerequisites chain neatly with existing discovery triggers so there's no new gating mechanic to add. Louis naturally unlocks MINT games as he progresses through Freunde discovery.

### State additions
```ts
// TaskState
mintBadgesEarned?: string[];  // e.g. ['badge_mint_zahlen']
mintGamesPlayed?: string[];   // first-play tracker (separate from badges for future-proofing)
forscherFunkelUnlocked?: boolean; // set true when all 5 badges earned
// NOTE: the 2 other fields we'll need in Wave 2.7 for auto-migration:
// - mintAllComplete?: boolean  (derived or stored)
// - migrateMintToGames?: boolean (feature flag for lifecycle migration)
```

### Forscher-Funkel creature
Special rare creature unlocked when all 5 MINT badges earned. Not tied to a chapter — rendered separately in a "Besondere" / "Forscher" mini-chapter in Micropedia. Art TBD in Wave 2.7.

### Components this wave (2.5)
- **New:** `src/components/ForscherEcke.jsx` — Hub section + 5 slot grid
- **New:** `src/components/FreundIntroModal.jsx` — shared Freund-hosts-a-game intro screen (reusable for all 5)
- **New:** `src/components/ZahlenjagdGame.jsx` — game 1
- **New:** `src/components/MusterMemoryGame.jsx` — game 2
- **New:** `src/data/mintGames.ts` — game metadata + badge definitions
- **Modify:** `src/context/TaskContext.tsx` — state additions + `claimMintBadge` action
- **Modify:** `src/components/Hub.jsx` — mount ForscherEcke
- **Modify:** `src/App.jsx` — route handling for 2 new game views

### Zahlenjagd — Game 1

**Mechanic:** Clone of Starfall's falling-object engine. Objects are numbers (1-20) instead of stars. Target number shown at top: "Fang die 7!" Louis taps falling numbers that match. Wrong answers cost lives.

**Progression:**
- Level 1: single digits, slow fall
- Level 2: two-digit match ("Fang die 12")
- Level 3: simple arithmetic — "Fang die Lösung von 3+4"
- Level 4: subtraction
- Level 5: bonus level

**Freund intro (Sturmflügel hosts):**
- Painting: Sturmflügel pointing at stars in sky
- Line: *"Ich zähle die Sterne am Himmel. Kannst du mir helfen?"*
- Tap *"Ja!"* → game starts

**Badge award:** after first-completed level 1 → `badge_mint_zahlen` unlocked + Ronki voice line.

### Muster-Memory — Game 2

**Mechanic:** Simon-Says-style sequence repeat. Baumbart shows a pattern of 3-5 forest elements (🍃 🌰 🍂 🌲 🍄), Louis taps them back in order. Each level adds one more.

**Progression:**
- Level 1: 3-item sequences
- Level 2: 4-item sequences
- Level 3: 5-item sequences (boss level)

**Freund intro (Baumbart hosts):**
- Painting: Baumbart with forest elements around him
- Line: *"Die Jahreszeiten folgen einem Muster. Schaust du mit mir?"*
- Tap *"Ja!"* → game starts

**Badge award:** after first-completed sequence at level 1 → `badge_mint_muster` unlocked.

### Out of scope (pushed to 2.6/2.7)
- Wurzel-Labyrinth, Pilz-Waage, Kristall-Sortierer
- Forscher-Funkel creature art + Micropedia "Besondere" chapter
- Auto-migration to Mini-Spiele (game registry refactor)

---

## 3. Acceptance criteria

- [ ] Gefühlsecke heart icon appears on Hub top-right
- [ ] Tap cycles through picker → tool correctly for all 5 emotions
- [ ] Each interaction logs to `feelingsLog`
- [ ] Forscher-Ecke section appears on Hub
- [ ] Slot states reflect host-Freund discovery (locked / unlocked / played)
- [ ] Zahlenjagd + Muster-Memory games render + play correctly
- [ ] First play of each game adds its badge to `mintBadgesEarned`
- [ ] Build clean, tests pass (154/154+), sprites load, no regressions in existing flows

---

## Self-review

**Spec coverage:** ✓ Gefühlsecke full-spec + Forscher-Ecke scaffolding + 2 games.
**Placeholder scan:** No TBDs that block execution (Forscher-Funkel art TBD but pushed to Wave 2.7).
**Scope:** Aggressive for one wave — 2 new major UIs + 2 game components. Acceptable because Zahlenjagd reuses Starfall engine and Muster-Memory is simple sequence logic.
**Ambiguity:** Forscher-Funkel location in Micropedia (own chapter vs inline?) — decided Wave 2.7.
**Risk:** Double gating — MINT games depend on Freund discovery which depends on task progression. Louis early in the app might see 0/5 unlocked. Acceptable if the section copy makes this clear ("Entdecke erst einen Freund...").

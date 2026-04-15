# Ronki Refocus — Design Spec

**Date:** 2026-04-15
**Author:** Marc (product) + Claude (collaborator)
**Status:** Draft for review

---

## 1. Context & Motivation

Ronki has been built for a year as a gamified quest/companion PWA for Louis (7yo). Recent observation of Louis's behavior, combined with a deep look at **Finch** as the closest adjacent competitor (adult self-care companion), surfaced that Ronki's real job-to-be-done is neither "Finch for kids" nor "Zelda for kids." It is something the benchmark does not own.

### What Louis's behavior has been telling us

- He jumps on the app to **explore what's new**. (Discovery, not streak-pressure, is the daily hook.)
- He follows the quests — routines are internalizing "with and without the app."
- The **dragon is an emotional anchor**; he checks on him daily.
- The **Hero Profile tab is noise** — he cannot parse it. We overbuilt.
- **Special/narrative quests** (e.g. brother's birthday) outperform routine quests emotionally.
- **Low-dopamine mini-games** (Memory) hold him; we don't need flashier loops.
- Parent-reported benefit: *"counteracts lots of conversations and discussions… smoothens communication, builds confidence in taking care of himself."* This is the USP no competitor owns.

### What Finch does well (and what we steal / leave)

**Steal:**
- One coherent character (no species fork at onboarding).
- Silhouette-reveal collection mechanic (Micropedia).
- Companion-centric profile page (not a hero profile).
- Painterly cream/pastel palette — already close to our parchment direction.
- Focus/category framing of self-care activities (tile picker with illustrated variants).

**Leave:**
- Streaks — "1 day streak — Longest self-care streak ever!" puts pressure on the user. Contradicts our mediator premise.
- Solo-adult framing — Ronki is relational (Louis ↔ dragon ↔ parents).
- Points/stats-heavy profiles.

---

## 2. North Star

> **Ronki is the friend who carries the routine with you, so the people who love you don't have to push.**

A **narrative routine-mediator**. The dragon is the neutral third party who "asks" for teeth-brushing, so Marc doesn't have to. The shared story (I care for Ronki → Ronki cares for me → we adventure together) is the mechanism by which the **parent-child relationship gets lubricated**.

### Design principles that fall out of the north star

1. **Ronki offers, never nags.** No red badges, no "you broke it," no streak guilt.
2. **Continuity is expressed spatially, not temporally.** Sanctuary fills up over weeks; that is the continuity signal. Streaks replaced by accretion.
3. **The path is the way.** Discovery, narrative, and curiosity drive daily return — not completionist pressure.
4. **Decor / collection = memory.** Every reward references *what Louis did* to earn it. No abstract badges.
5. **The dragon is Louis's mirror.** The companion's profile/growth/traits express Louis's progress back to him. No separate "hero identity" screen is needed.
6. **Real-world presence matters.** The best arcs produce physical artifacts (coloring pages, paper planes, maps on the wall).

---

## 3. Scope

### In scope (this spec)

- Strategic refocus of the core loop (routines + arc engine + Sanctuary).
- Cut-list: Hero Profile tab, species selection at onboarding, streak mechanics anywhere they exist, "pick your mission" UX.
- New systems: **Arc Engine**, **Ronki Profile** (replaces Hero Profile), **Micropedia**, **Hatching Chamber**, **decor-as-memory**.
- Phase shape across three releases.

### Out of scope (deferred or explicitly won't-do)

- Full map/zone exploration mechanic beyond what already exists in Track B (deferred to Phase 3).
- Product analytics / PostHog-style funnels (explicit *will not* for now).
- Craft-template print pipeline at scale (Phase 3; manual PDF for Phase 1/2 test arcs).
- Friend codes / social features (mentioned in Finch; out of scope for Ronki — relational design focuses on family, not strangers).
- Multi-kid support / accounts beyond what Supabase auth already gives us.

---

## 4. Cut-list & Refinements

### Cuts (removed entirely)

| Item | Rationale |
|---|---|
| Streak mechanics (anywhere they exist) | Contradicts mediator USP. Replaced by Sanctuary accretion as continuity signal. |
| "Pick your mission" UX (mission tile / notification bubble) | Louis doesn't discover it. Replaced by Ronki-delivered arc beats. |
| Abstract achievement badges (if any) | Replaced by micro-pets as personalized memory tokens. |
| Species selection at onboarding (3 different companions) | One dragon only; variants are cosmetic (see §8). |

### Rebirths (renamed / re-scoped)

| Before | After | Rationale |
|---|---|---|
| **Hero Profile tab** | **Ronki Profile tab** | Louis doesn't parse hero identity; he parses his dragon. Companion-centric profile is the mirror. |

### Shop / Belohnungsbank

Stays, with a scope shift: shop continues to handle **screen-time redemption** (already rebalanced via ISSUE-005). It does **not** become the primary source of Sanctuary decor — decor is earned narratively via arc completion, not bought. The shop is for consumables (screen minutes, occasional small treats), not for expressive identity items.

### Refinements (polished, not rebuilt)

- **Sanctuary** → gains Hatching Chamber sub-zone, decor surfaces, richer zone scenes.
- **TaskList** → re-framed visually as "Today with Ronki" but data model unchanged; routine quests keep working exactly as today.
- **ParentalDashboard** → gains weekly recap card (Phase 3).
- **Onboarding** → keeps egg-selection ceremony (emotional anchor) but constrained to one species with cosmetic variants.

### What stays as-is (don't touch)

- TaskList core loop (quest → tick → XP/coins).
- Journal + mood selector (just polished April 2026).
- Mini-games (Memory, Potion, CloudJump, StarCatcher).
- Celebration + CompanionToast systems.
- Zone scaffolding from Track B (Heiligtum / Wiese / Nebel-Höhle).
- Supabase auth + existing data model.
- Voice engine + bilingual lines.
- Dragon companion art, evolution stages, care interactions.
- i18n infrastructure (de/en).
- Safe-area handling, painterly visual direction.

---

## 5. Core Loop — Daily Texture

What a Tuesday with Ronki feels like under the new design.

### Morning — routine layer

Louis opens the app. **Lager (Campfire)** shows Ronki with a context-aware speech bubble:

| State | Ronki says |
|---|---|
| No arc active, not in cooldown | *"I had a strange dream last night — want me to tell you about it?"* → arc-start hook |
| Arc active | *"Morning! Today we continue our map adventure."* → arc continuity |
| Cooldown (Ronki "resting") | *"I'm still resting from yesterday — but your routines keep me cozy."* → no arc pressure |

Louis ticks routines (brush teeth, breakfast, get dressed). Each gives XP + coins exactly as today. If a routine is silently tagged as a current **arc beat**, completing it also advances the story — Ronki acknowledges afterwards: *"That brushing counted. The map is taking shape."*

### Afternoon — arc layer

Ronki surfaces the next arc beat when appropriate. Often a **craft beat**: *"Today's step: draw a map of our backyard. Here's a template to color."* Marc prints → Louis colors → Louis photographs or shows it → taps **"I did it."** Reward: points + a lore beat + (if milestone) an egg.

### Evening — care + reflection layer

Sanctuary visit. Feed Ronki, pet the micro-pets, check the Hatching Chamber. Quick mood tap in Journal. Read a queued lore snippet if one's waiting. Play Memory because Memory.

### Weekend — exploration layer (Phase 3)

Louis wanders the map zones. Finds a rare egg in Wiese. Drops it in the Hatching Chamber. Three-day hatch.

### Cadence

- **Routines:** daily, low-stakes, fast.
- **Arc beats:** 1–2 per active arc, on Ronki's schedule (not every day).
- **Arc cooldown:** 1–3 days between arcs.
- **Potion of Vigor override:** rare, earned (not bought). Allows skipping cooldown.
- **Micro-pet hatching:** days, not minutes — anticipation, not dopamine.

### The rule that holds it together

**Ronki never nags. Ronki offers.** If Louis skips a day, routines resume tomorrow, the arc picks up where it left off, Sanctuary accumulates at whatever pace he visits. No red badges, no broken streaks. The mediator premise is preserved by construction.

---

## 6. Arc Engine

The heart of the refocus. An **arc** is a short (days-long) narrative episode delivered by Ronki, composed of beats.

### Beat types

1. **Routine beats** — existing quests that Ronki narratively absorbs. "Chapter 1 begins when you brush your teeth tonight." No new task; Louis does what he'd do anyway and the narrative advances silently. **Implementation:** tag existing quest IDs with optional `arcBeatId` metadata; quest completion dispatches both XP/coin reward AND arc progress.

2. **Craft beats** — attention-span-sized DIY drawn from Louis's natural interests (drawing, coloring, paper planes, small building). Template + four micro-steps (*color → hang → tell someone → show*). Completion is self-reported via a "I did it" button, optionally with a photo.

3. **Lore beats** — 2–4 sentences of easy-language reading. Thread the story, unlock the next beat, occasionally reward a small item.

### Arc lifecycle

```
[idle] → [offered] → [active] → [complete] → [cooldown] → [idle]
                          ↓
                    (routine/craft/lore beats tick through)
```

- **Offered:** Ronki presents the arc opener in a morning speech bubble. Louis accepts with a tap.
- **Active:** One arc active at a time. Beats surface contextually (morning for the day's routine beat; afternoon for craft; evening for lore).
- **Complete:** Final beat triggers a small celebration + milestone reward (usually an egg + decor).
- **Cooldown:** 1–3 days. Ronki "rests." No new arc offered. Routines keep running normally.
- **Potion of Vigor:** Louis can consume to skip cooldown. Earned ~1 per 3–5 arcs completed.

### Pacing targets

- ~1–2 arcs per week (roughly 2 days active, 2 days cooldown).
- ~3–5 beats per arc.
- First-launch Phase 1 arc: **"The First Adventure"** — a 3-beat introduction arc that also teaches the mechanic.

### Data model sketch

```ts
type Arc = {
  id: string;
  title: string;              // "The Map of the Backyard"
  chapterName: string;        // for Micropedia / Discovery log
  beats: Beat[];
  rewardOnComplete: {
    xp: number;
    eggId?: string;           // milestone arcs only
    decorId?: string;
    traitIds?: string[];      // tags Ronki earns (e.g. "Mapmaker")
  };
  cooldownHours: number;      // default 48
};

type Beat =
  | { kind: "routine"; questId: string; narrativeBefore?: string; narrativeAfter?: string }
  | { kind: "craft"; title: string; templateUrl?: string; steps: string[] }
  | { kind: "lore"; text: string; imageUrl?: string };
```

### Delivery mechanism

- **ArcEngine** (new module) subscribes to quest completions and Sanctuary visits.
- On morning load, ArcEngine decides what Ronki says (offer / continue / cooldown).
- When a routine beat's tagged quest completes, ArcEngine advances the beat and triggers the narrative-after line via CompanionToast.
- Craft/lore beats surface as modal cards with explicit Louis-initiated confirmation.

---

## 7. Sanctuary v2 + Ronki Profile + Micropedia

These three are tightly coupled.

### 7.1 Sanctuary v2

The existing Sanctuary becomes a small **place** instead of a screen.

- **The Den** (default view) — Ronki's main living area. Stat meters (hunger/happiness/energy), pet & feed interactions — as today, visually polished (already done April 2026: painterly pass on stat tiles).
- **The Hatching Chamber** (sub-zone) — eggs in progress. Slot-based (3 slots?). Each egg shows a visible timer ("ready in 2 days") and a silhouette of what it might become. Tapping an egg shows where it was found / which arc produced it.
- **Zones** (already scaffolded) — Heiligtum / Wiese / Nebel-Höhle. Phase 3 wires egg-discovery into zone visits (e.g. 20% chance per Wiese visit, gated cooldown).
- **Decor surfaces** — walls/floor/shelves where arc rewards appear. Map Louis drew → hanging scroll. Paper plane folded → ceiling model. Each decor piece carries a `sourceArcId` so tapping it shows the memory: *"You made this during The Map Adventure."*

### 7.2 Ronki Profile (replaces Hero Profile tab)

Same nav slot as the current Hero Profile tab. Dragon-centric.

**Layout (patterned on Finch's Piper page, mediator-coded):**

- **Header:** dragon portrait + name (default *Ronki*; renameable) + evolution stage + pronouns (optional, picked at onboarding).
- **Tab strip:** *About* / *Details* / *Traits*.
  - **About:** softly generated bio referencing arcs survived. *"Ronki has been with you for 47 days. Together you've mapped the backyard and helped with your brother's birthday."*
  - **Details:** evo progress, XP, days-together, Sanctuary population.
  - **Traits:** tags Ronki has earned from arcs — *Brave, Gentle, Mapmaker, Generous*. Tappable; each trait shows which arc awarded it.
- **Memory card** (replaces Finch's streak card): most recent arc + date, or Sanctuary census ("3 micro-pets, 4 decor items, 1 arc survived").
- **Micropedia link** — opens the bestiary grid.
- **Discovery log link** — chronological timeline of arcs survived. A story of the relationship.

### 7.3 Micropedia

Inspired by Finch's silhouette catalog, re-skinned painterly.

- **Grid of tiles**, cream/parchment palette (already aligned with our April 2026 painterly pass).
- **Silhouette** until discovered. On discovery: full painted portrait + name + memory line (*"Found in Wiese on the third day of the Map Adventure"*).
- **Chapters** — ~5 groupings: **Forest / Sky / Water / Dream / Hearth**. Each chapter ~12 creatures = ~60 total (Finch parity). Chapters give completion sub-goals so the grand total doesn't feel daunting.
- **Counter:** `N/60 found` overall, plus per-chapter counts.
- **Ship strategy:** Phase 2 ships with 15–20 creatures and at least one complete chapter to make collection feel achievable. Catalog grows over time via content updates.

---

## 8. Companion / Egg / Micro-pet System

### 8.1 The main dragon (unchanged)

Louis's dragon is the single companion. He's bonded; art & evolution stay as today.

### 8.2 Onboarding egg ceremony (preserved, constrained)

Louis picks **one egg from a small clutch (3–5)** at onboarding. The egg hatches into his dragon. Variants are **cosmetic** on a single species rig:
- Color palette (3–5 options)
- Wing shape (2–3 options)
- Horn style (2–3 options)

Total variant combinations: modest (~30), but each feels "mine." Art burden: low (palette swap + swap-in wing/horn assets on shared base).

### 8.3 Micro-pets (new collection layer)

- **What they are:** small creatures collected over time, living ambient in Sanctuary alongside the main dragon.
- **Visual variety:** intentionally diverse — moth-spirits, orb-creatures, tiny foxes, mushroom-folk, cloud-puffs, dragonlings. **Not** all dragon-kin. Variety is part of the fun (confirmed from Finch Micropedia reference).
- **Sources:**
  - **Arc completion** (milestone arcs — every 3rd–5th arc): egg reward.
  - **Zone discovery** (Phase 3): small chance per zone visit.
- **Hatching:** eggs go to Hatching Chamber, take days to hatch (not minutes).
- **Function:** personalized memory tokens. No stats, no care required, no economy interaction. Purely expressive + collectible.
- **Total target:** ~60 (Finch parity). Ship Phase 2 with 15–20.

### 8.4 Potion of Vigor

- Rare item that wakes Ronki from cooldown early so a new arc can begin.
- **Earned**, not bought (preserves scarcity + narrative meaning).
- Rate: ~1 per 3–5 arcs completed, or occasionally as a special zone find.

---

## 9. Phase Shape

### Phase 1 — Refine (weeks)

Goal: cut the noise, reframe what's there, ship the arc engine with one test arc.

- Delete Hero Profile tab; stub Ronki Profile in the same nav slot.
- Remove streak mechanics wherever present.
- Kill "pick your mission" UX / notification bubble for missions.
- Constrain onboarding egg ceremony to cosmetic-variant picks on one species.
- Build **ArcEngine** module + data model.
- Tag existing routine quests with optional `arcBeatId` slots (infrastructure only, no live tags yet).
- Ship **"The First Adventure"** — 3-beat intro arc — as the test arc.
- Rebuild TopBar/Hub copy to match "Ronki offers" voice.

### Phase 2 — Grow (weeks)

Goal: micro-pets, Hatching Chamber, Sanctuary-as-museum.

- Hatching Chamber sub-zone in Sanctuary.
- Egg + micro-pet data model.
- Micropedia screen inside Ronki Profile.
- 15–20 launch micro-pets across at least one complete chapter.
- Decor-as-memory: arc-completion rewards produce decor with `sourceArcId` backrefs.
- Ronki Profile full buildout (About / Details / Traits tabs, Memory card, Discovery log).
- Two or three more arcs shipped (with craft + lore beats).

### Phase 3 — Explore (weeks)

Goal: map exploration, parent recap, physical artifacts at scale.

- Zone egg-discovery mechanic (Wiese / Nebel-Höhle).
- Potion of Vigor as zone reward.
- ParentalDashboard weekly recap card.
- Printable craft template pipeline (PDF generation or curated downloads).
- Additional arc catalog expansion.

---

## 10. Open Questions / Deferred Decisions

1. **Egg clutch count at onboarding** — 3 eggs or 5? Needs playtest with Louis.
2. **Arc cooldown default** — 48h proposed; validate against Louis's natural rhythm.
3. **Craft beat photo requirement** — optional or required? Leaning optional (friction reduces completion).
4. **Micropedia chapter names** — *Forest / Sky / Water / Dream / Hearth* are placeholders; final naming aligned to world lore TBD.
5. **Micropedia reveal mechanic animation** — silhouette → painted portrait transition needs a small celebratory moment without being over-the-top.
6. **Ronki renaming UX** — allowed, but when? At onboarding only, or anytime from Ronki Profile? Leaning onboarding-only to preserve identity continuity.
7. **Traits system** — finite trait pool or open-ended? Phase 2 decision; finite is simpler for v1.
8. **Decor placement** — auto-placed or Louis arranges? Phase 2 scope. Auto-placed for v1; drag-to-arrange deferred.

---

## 11. Appendix — References Studied

**Finch screenshots** (in `C:/Users/öööö/.basic-memory/Ronki/image/Finch_benchmark/`, 33 files IMG_2981..IMG_3044):
- IMG_2981 / IMG_3038 — splash / minimalist launch ("Your new self-care best friend")
- IMG_2985 — "Wow! When you take care of yourself…" reflection moment (stat gain via self-care)
- IMG_3024 — focus/category picker (Calm, Nutrition, Productivity, Movement, Self-kindness, Sleep, Gratitude, Hygiene)
- IMG_3030 — Piper's Bag / Finchie Forest home screen (Mail / Outfits / Furniture / Colors / Micropets)
- Micropedia grid (shared in review) — silhouette catalog, `0/60 found`, painterly cream parchment palette
- Baby Piper profile (shared in review) — About/Details/Traits tabs, streak card ("Longest self-care streak ever!"), Piper's collection with Micropets row, Discovery section, bottom nav (Home/Quests/Shop/Friends/Bag/Piper)

**Project memory references:**
- `feedback_painterly_over_isometric.md` — painterly direction confirmed
- `feedback_readability.md` — fonts/tap targets sized for 7yo
- `feedback_local_preview_workflow.md` — iterate via local preview
- `project_ronki_rebuild_decisions.md` — module-by-module rebuild history
- `project_hub_as_campfire.md` — Hub-as-Lagerfeuer reframe
- `backlog_evolution_orbs.md` — related growth mechanic (separate from arcs)

---

## 12. Success Criteria

This refocus succeeds if, after Phase 1 ships:
- Louis visibly understands that Ronki is *delivering* the next thing (not that he must pick it from a shelf).
- The Hero Profile confusion disappears (no "what is this?" from Louis).
- At least one arc — "The First Adventure" — is completed end-to-end by Louis without parental coaching on the mechanic.
- Marc reports parent-child routine friction is equal to or lower than baseline (qualitative, weekly check-in).

After Phase 2:
- Louis opens Sanctuary voluntarily multiple times per week to check micro-pets / decor, not just for stat maintenance.
- Micropedia `N/60 found` counter visibly motivates return visits without Marc prompting.
- At least 3 arcs complete; at least one craft artifact physically on the wall or refrigerator.

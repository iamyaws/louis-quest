/**
 * Arc Engine types. See spec §6 (Arc Engine) for semantics.
 *
 * An Arc is a short narrative episode delivered by Ronki.
 * A Beat is a single step inside an Arc — either a routine beat
 * (tied to an existing quest), a craft beat (DIY with 4 micro-steps),
 * or a lore beat (2–4 sentences of easy-language reading).
 */

export type BeatKind = 'routine' | 'craft' | 'lore';

export interface BaseBeat {
  id: string;               // unique within the arc, e.g. "fa-beat-1"
  kind: BeatKind;
  narrativeBefore?: string; // i18n key OR plain string Ronki says when beat activates
  narrativeAfter?: string;  // i18n key OR plain string Ronki says on beat completion
}

export interface RoutineBeat extends BaseBeat {
  kind: 'routine';
  questId: string;          // matches Quest.id; beat completes when this quest completes
}

export interface CraftBeat extends BaseBeat {
  kind: 'craft';
  title: string;            // i18n key — "Draw the map"
  templatePath?: string;    // optional path to a downloadable/printable template
  steps: string[];          // 4 i18n keys — color it / hang it / tell someone / show it
}

export interface LoreBeat extends BaseBeat {
  kind: 'lore';
  text: string;             // i18n key for the lore paragraph
  imagePath?: string;       // optional illustration
}

export type Beat = RoutineBeat | CraftBeat | LoreBeat;

export interface ArcReward {
  xp: number;
  coins?: number;
  eggId?: string;           // Phase 2 — milestone arcs only
  decorId?: string;         // Phase 2 — decor-as-memory
  traitIds?: string[];      // Phase 2 — traits Ronki earns
}

export interface Arc {
  id: string;               // stable unique id, e.g. "first-adventure"
  titleKey: string;         // i18n key for arc title
  chapterKey?: string;      // i18n key for chapter name (Discovery log, Phase 2)
  beats: Beat[];
  rewardOnComplete: ArcReward;
  cooldownHours: number;    // default 48
}

export type ArcLifecyclePhase =
  | 'idle'       // no active arc, not in cooldown — next arc may be offered
  | 'offered'    // Ronki has offered, awaiting accept/decline
  | 'active'     // arc in progress
  | 'cooldown';  // arc just completed, Ronki is resting

export interface ArcEngineState {
  phase: ArcLifecyclePhase;
  activeArcId: string | null;
  activeBeatIndex: number;       // which beat of the active arc is current (0-based)
  completedArcIds: string[];     // for Discovery log (Phase 2) and to avoid re-offering
  cooldownEndsAt: number | null; // epoch ms; null when not in cooldown
  offeredArcId: string | null;   // if phase === 'offered', which arc
  lastUpdatedAt: number;         // epoch ms
}

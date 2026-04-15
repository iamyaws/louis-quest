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

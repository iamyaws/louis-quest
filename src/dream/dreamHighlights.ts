import type { DreamHighlight, DreamHighlightsData, PrevDaySnapshot } from './types';

export function buildHighlights(snap: PrevDaySnapshot): DreamHighlightsData {
  const ordered: DreamHighlight[] = [];

  if (snap.bossKilledToday)      ordered.push({ kind: 'boss' });
  if (snap.arcBeatAdvancedToday) ordered.push({ kind: 'arc' });
  if (snap.allQuestsDone)        ordered.push({ kind: 'quests' });
  if (snap.allCareDone)          ordered.push({ kind: 'care' });

  const highlights = ordered.length > 0
    ? ordered.slice(0, 3)
    : [{ kind: 'ambient' as const }];

  return {
    highlights,
    capturedAt: Date.now(),
    seen: false,
  };
}

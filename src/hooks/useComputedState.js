import { useMemo } from 'react';
import { getLevel, getLvlProg, getMood, getDayName } from '../utils/helpers';

/**
 * Derives computed values from game state.
 * Memoized to avoid recalculation on unrelated renders.
 */
export default function useComputedState(state) {
  return useMemo(() => {
    if (!state) return null;

    const level = getLevel(state.xp);
    const xpP = getLvlProg(state.xp);
    const done = state.quests.filter(q => q.done).length;
    const total = state.quests.length;
    const allDone = done === total && total > 0;
    const pct = total > 0 ? done / total : 0;
    const mood = getMood(allDone, pct);
    const dayN = getDayName();

    const byA = {};
    state.quests.forEach(q => {
      if (!byA[q.anchor]) byA[q.anchor] = [];
      byA[q.anchor].push(q);
    });

    return { level, xpP, done, total, allDone, pct, mood, dayN, byA };
  }, [state]);
}

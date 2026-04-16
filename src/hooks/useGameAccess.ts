import { useMemo } from 'react';
import { useTask } from '../context/TaskContext';

/**
 * useGameAccess — determines whether minigames are currently unlocked.
 *
 * Logic (soft time-windows based on routine completion):
 *   1. Morning routine fully done → games unlocked (morning play window)
 *   2. After some time, games re-lock until more progress is made
 *   3. Evening routine done → games unlocked for ~20min (pre-bed window)
 *   4. All quests done → always unlocked for the rest of the day
 *
 * Implementation: no hard clock-based locks. Instead, track which routine
 * sections are complete and whether the unlock has been "spent."
 *
 * Phase 1 (simple): games unlock when ANY routine section is fully complete.
 * Phase 2: add play-count tracking per window.
 */

export interface GameAccessState {
  unlocked: boolean;
  reason: string; // i18n-ready explanation
  morningDone: boolean;
  eveningDone: boolean;
  allDone: boolean;
  /** How many routine sections are fully complete */
  sectionsComplete: number;
}

export function useGameAccess(): GameAccessState {
  const { state, computed } = useTask();

  return useMemo(() => {
    if (!state?.quests) {
      return { unlocked: false, reason: 'loading', morningDone: false, eveningDone: false, allDone: false, sectionsComplete: 0 };
    }

    const quests = state.quests.filter(q => !q.sideQuest);
    const morning = quests.filter(q => q.anchor === 'morning');
    const evening = quests.filter(q => q.anchor === 'evening');
    const bedtime = quests.filter(q => q.anchor === 'bedtime');
    const hobby = quests.filter(q => q.anchor === 'hobby');

    const morningDone = morning.length > 0 && morning.every(q => q.done);
    const eveningDone = evening.length > 0 && evening.every(q => q.done);
    const bedtimeDone = bedtime.length > 0 && bedtime.every(q => q.done);
    const hobbyDone = hobby.length > 0 && hobby.every(q => q.done);
    const allDone = computed.allDone;

    let sectionsComplete = 0;
    if (morningDone) sectionsComplete++;
    if (eveningDone) sectionsComplete++;
    if (bedtimeDone) sectionsComplete++;
    if (hobbyDone) sectionsComplete++;

    // Games unlock when at least one full routine section is done
    const unlocked = sectionsComplete >= 1;

    let reason = '';
    if (unlocked) {
      reason = allDone ? 'allDone' : morningDone ? 'morningDone' : eveningDone ? 'eveningDone' : 'sectionDone';
    } else {
      reason = 'noSection';
    }

    return { unlocked, reason, morningDone, eveningDone, allDone, sectionsComplete };
  }, [state?.quests, computed.allDone]);
}

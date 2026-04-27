import { useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { canAccessMinigames } from '../lib/minigameAccess';

/**
 * useGameAccess — determines whether minigames are currently unlocked.
 *
 * Reworked 22 Apr 2026. Now delegates to `canAccessMinigames()` which
 * reads `state.minigameAccessMode` (parent-configurable). Three modes:
 *   - 'frei'        — always unlocked (default, recommended per playtest)
 *   - 'routine'     — unlocked after at least one routine section is done
 *   - 'zeitfenster' — unlocked within state.minigameTimeWindow (configurable)
 *
 * The old hardcoded 13:00-19:30 window + "at least one section done"
 * combo is gone. It backfired on weekends — Louis hit an invisible wall
 * when the routine-skip logic and the time window disagreed.
 *
 * Dev mode still bypasses everything.
 *
 * Reason codes (for i18n-ready copy):
 *   - 'loading'         — state not ready yet
 *   - 'unlocked'        — generic "you can play"
 *   - 'routineNotDone'  — routine mode, haven't done today yet
 *   - 'timeBefore'      — time mode, before window starts
 *   - 'timeAfter'       — time mode, after window ends
 *   - 'morningDone' / 'eveningDone' / 'allDone' / 'sectionDone' —
 *     retained for downstream copy variations (they're finer-grained
 *     flavors of "unlocked" that some components key messaging on)
 */

export interface GameAccessState {
  unlocked: boolean;
  reason: string;
  morningDone: boolean;
  eveningDone: boolean;
  allDone: boolean;
  sectionsComplete: number;
  /** Whether we're currently inside the play-time window. True for
   *  'frei' and 'routine' modes (they don't gate on time). */
  withinTimeWindow: boolean;
  /** Time-window bounds, present for copy like "öffnet um 16 Uhr"
   *  even if the active mode isn't 'zeitfenster'. Shows current config. */
  windowStartHour: number;
  windowStartMinute: number;
  windowEndHour: number;
  windowEndMinute: number;
  /** The active gating mode (for components that want to branch on it). */
  mode: 'frei' | 'routine' | 'zeitfenster';
}

function readDevMode(): boolean {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('ronki_app_mode') : null;
    if (stored === 'dev') return true;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'dev') return true;
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}

export function useGameAccess(): GameAccessState {
  const { state, computed } = useTask();

  // Re-evaluate on the minute so a time-gated unlock flips exactly at
  // the boundary without requiring another state change to trigger a
  // re-render.
  const [minutesOfDay, setMinutesOfDay] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setMinutesOfDay(n.getHours() * 60 + n.getMinutes());
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const mode = state?.minigameAccessMode || 'frei';
    const timeWindow = state?.minigameTimeWindow || { startHour: 16, endHour: 18 };
    const base = {
      mode,
      windowStartHour: timeWindow.startHour,
      windowStartMinute: 0,
      windowEndHour: timeWindow.endHour,
      windowEndMinute: 0,
    } as const;

    if (!state?.quests) {
      return {
        ...base,
        unlocked: false,
        reason: 'loading',
        morningDone: false,
        eveningDone: false,
        allDone: false,
        sectionsComplete: 0,
        withinTimeWindow: false,
      };
    }

    // Routine-section computation kept intact — consumers still ask
    // "morning done?" / "evening done?" for copy flavor even when the
    // gating mode doesn't care.
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

    // Apr 27 2026 — games are now ALWAYS UNLOCKED. Marc's call after
    // playtest: locks felt "off" without explaining why, and the
    // information about why was missing. The kid taps a tile to play;
    // the routine quests are their own positive loop. Killing the
    // routine/zeitfenster gating modes here at the consumer layer.
    // canAccessMinigames + the minigameAccessMode reducer state stay
    // in the codebase so re-enabling per-family is a single-line
    // revert; right now they no-op.
    //
    // Reason still reports a flavor code consumers may use for copy
    // ("you finished morning!" celebratory beats), but `unlocked` is
    // always true.
    const reason = allDone
      ? 'allDone'
      : morningDone && !eveningDone
        ? 'morningDone'
        : eveningDone && !morningDone
          ? 'eveningDone'
          : sectionsComplete > 0
            ? 'sectionDone'
            : 'unlocked';

    return {
      ...base,
      unlocked: true,
      reason,
      morningDone,
      eveningDone,
      allDone,
      sectionsComplete,
      withinTimeWindow: true,
    };
  }, [state, computed.allDone, minutesOfDay]);
}

import { useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';

/**
 * useGameAccess — determines whether minigames are currently unlocked.
 *
 * Two layers of gating (both must pass):
 *
 * 1. **Time window** (hard rule, productizes Funkelzeit-discipline):
 *    Games are open only between PLAY_WINDOW_START_HOUR and
 *    PLAY_WINDOW_END_HOUR. Outside that window Ronki is "zu früh" or
 *    "müde" and games are locked regardless of routine progress. This is
 *    the D5-Tag&Nacht design cue: the app has nothing exciting to offer
 *    outside play hours, so kids naturally wind down without a fight.
 *
 * 2. **Routine progress** (soft rule, rewards doing the day):
 *    Even inside the window, at least one routine section must be fully
 *    complete before play unlocks.
 *
 * Dev mode bypasses the time window entirely — Marc needs to be able to
 * walk through games at any time for iteration/screenshots.
 *
 * Reason codes (for kid-friendly copy):
 *   - 'loading'         — state not ready yet
 *   - 'timeBefore'      — too early (before PLAY_WINDOW_START_HOUR)
 *   - 'timeAfter'       — too late (after PLAY_WINDOW_END_HOUR)
 *   - 'noSection'       — inside window but no routine section done yet
 *   - 'sectionDone'     — unlocked via a section (one of them)
 *   - 'morningDone'     — unlocked via morning specifically
 *   - 'eveningDone'     — unlocked via evening specifically
 *   - 'allDone'         — everything done for the day
 */

// Default play window. Tuned to overlap after-school + pre-evening-routine
// on a school day. One clear rule a first-grader can internalize:
// "Spiele 13–18 Uhr."
const PLAY_WINDOW_START_HOUR = 13;
const PLAY_WINDOW_END_HOUR = 18;

export interface GameAccessState {
  unlocked: boolean;
  reason: string; // i18n-ready explanation
  morningDone: boolean;
  eveningDone: boolean;
  allDone: boolean;
  /** How many routine sections are fully complete */
  sectionsComplete: number;
  /** Whether we're currently inside the play-time window */
  withinTimeWindow: boolean;
  /** Configured window start hour (24h) — useful for copy like "öffnet um 13 Uhr" */
  windowStartHour: number;
  /** Configured window end hour (24h) — useful for copy */
  windowEndHour: number;
}

function readDevMode(): boolean {
  try {
    // Mirrors src/utils/mode.ts logic without introducing a circular import.
    // Dev mode bypasses the time window so Marc can test at any hour.
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

  // Re-evaluate on the minute so a locked state flips open at 13:00 sharp
  // without requiring another state change to trigger a re-render.
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const tick = () => setCurrentHour(new Date().getHours());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const base = {
      morningDone: false,
      eveningDone: false,
      allDone: false,
      sectionsComplete: 0,
      withinTimeWindow: false,
      windowStartHour: PLAY_WINDOW_START_HOUR,
      windowEndHour: PLAY_WINDOW_END_HOUR,
    };

    if (!state?.quests) {
      return { ...base, unlocked: false, reason: 'loading' };
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

    // Time window — dev mode bypasses so iteration isn't blocked by clock
    const devBypass = readDevMode();
    const withinTimeWindow = devBypass
      || (currentHour >= PLAY_WINDOW_START_HOUR && currentHour < PLAY_WINDOW_END_HOUR);

    const sectionOk = sectionsComplete >= 1;
    const unlocked = withinTimeWindow && sectionOk;

    // Pick the most specific reason code. Time gate takes priority over
    // routine gate because "do your morning routine" is unhelpful copy at
    // 21:00 when the real blocker is it being bedtime.
    let reason: string;
    if (!withinTimeWindow) {
      reason = currentHour < PLAY_WINDOW_START_HOUR ? 'timeBefore' : 'timeAfter';
    } else if (!sectionOk) {
      reason = 'noSection';
    } else if (allDone) {
      reason = 'allDone';
    } else if (morningDone && !eveningDone) {
      reason = 'morningDone';
    } else if (eveningDone && !morningDone) {
      reason = 'eveningDone';
    } else {
      reason = 'sectionDone';
    }

    return {
      unlocked,
      reason,
      morningDone,
      eveningDone,
      allDone,
      sectionsComplete,
      withinTimeWindow,
      windowStartHour: PLAY_WINDOW_START_HOUR,
      windowEndHour: PLAY_WINDOW_END_HOUR,
    };
  }, [state?.quests, computed.allDone, currentHour]);
}

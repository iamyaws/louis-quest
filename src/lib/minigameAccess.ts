import type { TaskState } from '../context/TaskContext';

/**
 * Minigame access decision — single consultation point.
 *
 * Callers: MiniGames.jsx, Hub Spielzimmer card, anywhere we need to know
 * "can Louis play minigames right now?". All three gating modes resolve
 * through this helper so behaviour stays consistent across surfaces.
 *
 * Modes (set via ParentalDashboard → state.minigameAccessMode):
 *   'frei'        — always allowed. Stamina is disabled (see useRonkiStamina).
 *   'routine'     — allowed only after today's routine block is complete.
 *                   Stamina still applies.
 *   'zeitfenster' — allowed only inside state.minigameTimeWindow. Stamina applies.
 *
 * This helper does NOT read stamina. Stamina exhaustion is a separate gate
 * — the kid may be "allowed" per mode but still out of energy. Consumers
 * check both.
 */

export interface MinigameAccessDecision {
  allowed: boolean;
  /** Why the gate is closed, for display copy. Empty string when allowed. */
  reason:
    | ''
    | 'routine_not_done'
    | 'outside_time_window'
    | 'mode_unknown';
  /** Human-readable next-open window for 'zeitfenster' mode when closed. */
  nextWindow?: { startHour: number; endHour: number };
}

export interface AccessStateShape {
  minigameAccessMode?: TaskState['minigameAccessMode'];
  minigameTimeWindow?: TaskState['minigameTimeWindow'];
  // Routine completion is derived from the caller's signal — we don't re-derive
  // it here because the TaskList already computes what counts as "today's
  // routine block done" and the shape of that truth lives there. Callers pass
  // it in.
}

export function canAccessMinigames(
  state: AccessStateShape | null | undefined,
  opts: { routineDoneToday: boolean; now?: Date } = { routineDoneToday: false },
): MinigameAccessDecision {
  const mode = state?.minigameAccessMode ?? 'frei';
  const now = opts.now ?? new Date();

  if (mode === 'frei') {
    return { allowed: true, reason: '' };
  }

  if (mode === 'routine') {
    if (opts.routineDoneToday) {
      return { allowed: true, reason: '' };
    }
    return { allowed: false, reason: 'routine_not_done' };
  }

  if (mode === 'zeitfenster') {
    const window = state?.minigameTimeWindow ?? { startHour: 16, endHour: 18 };
    const hour = now.getHours();
    // Inclusive start, exclusive end — 16..18 means "from 16:00 up to 18:00".
    const inWindow = hour >= window.startHour && hour < window.endHour;
    if (inWindow) {
      return { allowed: true, reason: '' };
    }
    return { allowed: false, reason: 'outside_time_window', nextWindow: window };
  }

  return { allowed: false, reason: 'mode_unknown' };
}

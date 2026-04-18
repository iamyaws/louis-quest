import type { Arc, ArcEngineState, Beat } from './types';
import { findArc, pickNextArc } from './arcs';

export function initialArcState(): ArcEngineState {
  return {
    phase: 'idle',
    activeArcId: null,
    activeBeatIndex: 0,
    completedArcIds: [],
    cooldownEndsAt: null,
    offeredArcId: null,
    lastUpdatedAt: Date.now(),
  };
}

function touch(s: ArcEngineState): ArcEngineState {
  return { ...s, lastUpdatedAt: Date.now() };
}

/**
 * Transitions idle -> offered if an uncompleted arc exists and we are not
 * in cooldown. Otherwise returns state unchanged.
 */
export function offerNextArc(state: ArcEngineState): ArcEngineState {
  if (isInCooldown(state)) return state;
  if (state.phase !== 'idle') return state;
  const next = pickNextArc(state.completedArcIds);
  if (!next) return state;
  return touch({ ...state, phase: 'offered', offeredArcId: next.id });
}

/**
 * Transitions idle -> offered with an explicit arc id. Used by Freund reunion
 * arcs which are gated by chapter-discovery unlocks rather than the default
 * pickNextArc order. No-op if not idle, in cooldown, or arc already completed.
 */
export function offerArcById(state: ArcEngineState, arcId: string): ArcEngineState {
  if (isInCooldown(state)) return state;
  if (state.phase !== 'idle') return state;
  if (state.completedArcIds.includes(arcId)) return state;
  return touch({ ...state, phase: 'offered', offeredArcId: arcId });
}

/**
 * Transitions offered -> active. Throws if not in offered phase — callers
 * should guard.
 */
export function acceptOffer(state: ArcEngineState): ArcEngineState {
  if (state.phase !== 'offered' || !state.offeredArcId) {
    throw new Error('acceptOffer called outside offered phase');
  }
  return touch({
    ...state,
    phase: 'active',
    activeArcId: state.offeredArcId,
    activeBeatIndex: 0,
    offeredArcId: null,
  });
}

/**
 * Transitions offered -> idle, clearing the offer. Arc is NOT marked
 * completed.
 */
export function declineOffer(state: ArcEngineState): ArcEngineState {
  if (state.phase !== 'offered') return state;
  return touch({ ...state, phase: 'idle', offeredArcId: null });
}

/**
 * Advances the active beat if `beatId` matches the current beat.
 * If advancing past the last beat, transitions to cooldown.
 */
export function advanceBeat(state: ArcEngineState, beatId: string): ArcEngineState {
  if (state.phase !== 'active' || !state.activeArcId) return state;
  const arc = findArc(state.activeArcId);
  if (!arc) return state;
  const current = arc.beats[state.activeBeatIndex];
  if (!current || current.id !== beatId) return state;

  const nextIndex = state.activeBeatIndex + 1;
  if (nextIndex >= arc.beats.length) {
    // arc complete — enter cooldown
    return completeArc(state, arc);
  }
  return touch({ ...state, activeBeatIndex: nextIndex });
}

/**
 * Internal: handles transition active -> cooldown when the last beat
 * is advanced. Exported for tests that want to force-complete.
 */
export function completeArc(state: ArcEngineState, arc: Arc): ArcEngineState {
  const cooldownMs = arc.cooldownHours * 60 * 60 * 1000;
  return touch({
    ...state,
    phase: 'cooldown',
    activeArcId: null,
    activeBeatIndex: 0,
    completedArcIds: [...state.completedArcIds, arc.id],
    cooldownEndsAt: Date.now() + cooldownMs,
  });
}

/**
 * True when in cooldown phase AND cooldownEndsAt is in the future.
 * If the end has passed, returns false — callers should then reset
 * phase to idle (see `expireCooldownIfReady`).
 */
export function isInCooldown(state: ArcEngineState): boolean {
  if (state.phase !== 'cooldown') return false;
  if (state.cooldownEndsAt === null) return false;
  return state.cooldownEndsAt > Date.now();
}

/**
 * If cooldown has expired, return a fresh idle state. Otherwise pass
 * through. Hook callers should run this before deciding whether to offer.
 */
export function expireCooldownIfReady(state: ArcEngineState): ArcEngineState {
  if (state.phase === 'cooldown' && state.cooldownEndsAt !== null && state.cooldownEndsAt <= Date.now()) {
    return touch({ ...state, phase: 'idle', cooldownEndsAt: null });
  }
  return state;
}

/**
 * Returns the currently active beat, or null if no arc is active.
 */
export function getActiveBeat(state: ArcEngineState): Beat | null {
  if (state.phase !== 'active' || !state.activeArcId) return null;
  const arc = findArc(state.activeArcId);
  if (!arc) return null;
  return arc.beats[state.activeBeatIndex] ?? null;
}

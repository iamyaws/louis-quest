import type { Arc } from './types';
import { FIRST_ADVENTURE } from './first-adventure';
import { LISTENING_GAME } from './listening-game';
import { RONKIS_GARDEN } from './ronkis-garden';
import { WEATHER_WALKER } from './weather-walker';

export const ARCS: Arc[] = [
  FIRST_ADVENTURE,
  LISTENING_GAME,
  RONKIS_GARDEN,
  WEATHER_WALKER,
];

export function findArc(id: string): Arc | undefined {
  return ARCS.find(arc => arc.id === id);
}

/**
 * Returns the next arc that should be offered, given the set of already-completed
 * arc ids. For Phase 1, returns the first uncompleted arc in ARCS order.
 */
export function pickNextArc(completedArcIds: string[]): Arc | undefined {
  return ARCS.find(arc => !completedArcIds.includes(arc.id));
}

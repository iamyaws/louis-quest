import type { GameState } from '../types';
import type { ArcEngineState } from './types';
import { initialArcState } from './ArcEngine';

export function loadArcEngineState(game: { arcEngine?: ArcEngineState }): ArcEngineState {
  if (game.arcEngine) return game.arcEngine;
  return initialArcState();
}

export function saveArcEngineState(game: GameState, state: ArcEngineState): GameState {
  return { ...game, arcEngine: state };
}

import { describe, it, expect } from 'vitest';
import { loadArcEngineState, saveArcEngineState } from './persistence';
import { initialArcState } from './ArcEngine';
import type { GameState } from '../types';

describe('arc persistence', () => {
  it('loadArcEngineState returns initial state when none stored', () => {
    const game = {} as GameState;
    const s = loadArcEngineState(game);
    expect(s.phase).toBe('idle');
  });

  it('loadArcEngineState returns stored state when present', () => {
    const stored = initialArcState();
    stored.completedArcIds = ['some-id'];
    const game = { arcEngine: stored } as GameState;
    const s = loadArcEngineState(game);
    expect(s.completedArcIds).toEqual(['some-id']);
  });

  it('saveArcEngineState writes to game state', () => {
    const game = {} as GameState;
    const s = initialArcState();
    const updated = saveArcEngineState(game, s);
    expect(updated.arcEngine).toEqual(s);
  });
});

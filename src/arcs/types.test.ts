import { describe, it, expect } from 'vitest';
import type { Arc, Beat, ArcEngineState } from './types';

describe('Arc types', () => {
  it('builds a minimal valid arc with one routine beat', () => {
    const arc: Arc = {
      id: 'test-arc',
      titleKey: 'arc.test.title',
      beats: [
        {
          id: 'b1',
          kind: 'routine',
          questId: 'brush_teeth',
        },
      ],
      rewardOnComplete: { xp: 10 },
      cooldownHours: 48,
    };
    expect(arc.beats).toHaveLength(1);
    expect(arc.beats[0].kind).toBe('routine');
  });

  it('builds a valid initial ArcEngineState', () => {
    const state: ArcEngineState = {
      phase: 'idle',
      activeArcId: null,
      activeBeatIndex: 0,
      completedArcIds: [],
      cooldownEndsAt: null,
      offeredArcId: null,
      lastUpdatedAt: Date.now(),
    };
    expect(state.phase).toBe('idle');
  });
});

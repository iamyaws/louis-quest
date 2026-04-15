import { describe, it, expect } from 'vitest';
import { createInitialState } from './TaskContext';

describe('TaskContext initial state', () => {
  it('does not include a streak (sd) field', () => {
    const state = createInitialState();
    expect('sd' in state).toBe(false);
  });
});

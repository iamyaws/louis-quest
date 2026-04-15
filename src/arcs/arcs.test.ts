import { describe, it, expect } from 'vitest';
import { ARCS, findArc, pickNextArc } from './arcs';

describe('arcs catalog', () => {
  it('contains at least one arc', () => {
    expect(ARCS.length).toBeGreaterThanOrEqual(1);
  });

  it('findArc returns the matching arc', () => {
    const arc = findArc('first-adventure');
    expect(arc).toBeDefined();
    expect(arc?.id).toBe('first-adventure');
  });

  it('findArc returns undefined for unknown id', () => {
    expect(findArc('nonexistent')).toBeUndefined();
  });

  it('pickNextArc returns first uncompleted arc', () => {
    expect(pickNextArc([])?.id).toBe('first-adventure');
  });

  it('pickNextArc returns undefined when all arcs completed', () => {
    const allIds = ARCS.map(a => a.id);
    expect(pickNextArc(allIds)).toBeUndefined();
  });
});

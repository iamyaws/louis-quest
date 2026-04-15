import { describe, it, expect } from 'vitest';
import { buildHighlights } from './dreamHighlights';
import type { PrevDaySnapshot } from './types';

const empty: PrevDaySnapshot = {
  bossKilledToday: false,
  allCareDone: false,
  allQuestsDone: false,
  arcBeatAdvancedToday: false,
};

describe('buildHighlights', () => {
  it('returns 1 ambient panel when nothing notable happened', () => {
    const result = buildHighlights(empty);
    expect(result.highlights).toHaveLength(1);
    expect(result.highlights[0].kind).toBe('ambient');
  });

  it('marks seen as false on creation', () => {
    const result = buildHighlights(empty);
    expect(result.seen).toBe(false);
  });

  it('sets capturedAt to approximately now', () => {
    const before = Date.now();
    const result = buildHighlights(empty);
    const after = Date.now();
    expect(result.capturedAt).toBeGreaterThanOrEqual(before);
    expect(result.capturedAt).toBeLessThanOrEqual(after);
  });

  it('includes boss panel when boss was killed', () => {
    const result = buildHighlights({ ...empty, bossKilledToday: true });
    expect(result.highlights.map(h => h.kind)).toContain('boss');
  });

  it('includes arc panel when arc beat was advanced', () => {
    const result = buildHighlights({ ...empty, arcBeatAdvancedToday: true });
    expect(result.highlights.map(h => h.kind)).toContain('arc');
  });

  it('includes quests panel when all quests done', () => {
    const result = buildHighlights({ ...empty, allQuestsDone: true });
    expect(result.highlights.map(h => h.kind)).toContain('quests');
  });

  it('includes care panel when all care done', () => {
    const result = buildHighlights({ ...empty, allCareDone: true });
    expect(result.highlights.map(h => h.kind)).toContain('care');
  });

  it('does NOT include ambient when at least one highlight exists', () => {
    const result = buildHighlights({ ...empty, allCareDone: true });
    expect(result.highlights.map(h => h.kind)).not.toContain('ambient');
  });

  it('orders by emotional weight: boss first, then arc, quests, care', () => {
    const result = buildHighlights({
      bossKilledToday: true,
      arcBeatAdvancedToday: true,
      allQuestsDone: true,
      allCareDone: true,
    });
    expect(result.highlights[0].kind).toBe('boss');
    expect(result.highlights[1].kind).toBe('arc');
    expect(result.highlights[2].kind).toBe('quests');
    expect(result.highlights).toHaveLength(3);
  });

  it('caps at 3 panels even when all 4 highlights are present', () => {
    const result = buildHighlights({
      bossKilledToday: true,
      arcBeatAdvancedToday: true,
      allQuestsDone: true,
      allCareDone: true,
    });
    expect(result.highlights).toHaveLength(3);
  });

  it('returns exactly 2 panels when two highlights present', () => {
    const result = buildHighlights({ ...empty, bossKilledToday: true, allCareDone: true });
    expect(result.highlights).toHaveLength(2);
    expect(result.highlights[0].kind).toBe('boss');
    expect(result.highlights[1].kind).toBe('care');
  });
});

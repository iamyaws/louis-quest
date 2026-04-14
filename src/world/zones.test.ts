import { describe, it, expect } from 'vitest';
import { ZONES, zoneById, isZoneUnlocked, zoneUnlockProgress } from './zones';

describe('ZONES catalog', () => {
  it('has the three v0 zones in the expected order', () => {
    expect(ZONES.map(z => z.id)).toEqual(['sanctuary', 'meadow', 'cave']);
  });

  it('sanctuary is always unlocked (threshold 0)', () => {
    const s = zoneById('sanctuary')!;
    expect(isZoneUnlocked(s, {})).toBe(true);
    expect(isZoneUnlocked(s, { catEvo: 0 })).toBe(true);
  });

  it('meadow unlocks at catEvo >= 3 (Baby)', () => {
    const m = zoneById('meadow')!;
    expect(isZoneUnlocked(m, { catEvo: 0 })).toBe(false);
    expect(isZoneUnlocked(m, { catEvo: 2 })).toBe(false);
    expect(isZoneUnlocked(m, { catEvo: 3 })).toBe(true);
    expect(isZoneUnlocked(m, { catEvo: 99 })).toBe(true);
  });

  it('cave unlocks at catEvo >= 9 (Juvenile)', () => {
    const c = zoneById('cave')!;
    expect(isZoneUnlocked(c, { catEvo: 8 })).toBe(false);
    expect(isZoneUnlocked(c, { catEvo: 9 })).toBe(true);
  });
});

describe('zoneUnlockProgress', () => {
  it('returns 1 for always-unlocked zones', () => {
    expect(zoneUnlockProgress(zoneById('sanctuary')!, { catEvo: 0 })).toBe(1);
  });

  it('returns partial progress for locked zones', () => {
    const m = zoneById('meadow')!;
    expect(zoneUnlockProgress(m, { catEvo: 0 })).toBe(0);
    expect(zoneUnlockProgress(m, { catEvo: 1 })).toBeCloseTo(1 / 3);
    expect(zoneUnlockProgress(m, { catEvo: 2 })).toBeCloseTo(2 / 3);
    expect(zoneUnlockProgress(m, { catEvo: 3 })).toBe(1);
    expect(zoneUnlockProgress(m, { catEvo: 10 })).toBe(1); // clamps
  });

  it('treats missing state as 0', () => {
    const m = zoneById('meadow')!;
    expect(zoneUnlockProgress(m, {})).toBe(0);
  });
});

describe('zoneById', () => {
  it('returns undefined for unknown ids', () => {
    // @ts-expect-error - testing runtime behaviour with invalid id
    expect(zoneById('atlantis')).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import {
  COMPANION_VARIANTS,
  DEFAULT_VARIANT_ID,
  getVariant,
  type CompanionVariantId,
} from './companionVariants';

describe('companionVariants', () => {
  it('exports exactly 6 variants', () => {
    expect(COMPANION_VARIANTS).toHaveLength(6);
  });

  it('has the six expected ids', () => {
    const ids = COMPANION_VARIANTS.map(v => v.id).sort();
    expect(ids).toEqual(['amber', 'forest', 'rose', 'sunset', 'teal', 'violet']);
  });

  it('every variant has all required fields populated', () => {
    for (const v of COMPANION_VARIANTS) {
      expect(v.id).toBeTruthy();
      expect(v.name.de).toBeTruthy();
      expect(v.name.en).toBeTruthy();
      expect(v.eggGradient).toMatch(/gradient\(/);
      expect(v.glowColor).toMatch(/rgba?\(/);
      expect(v.borderColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(v.spritePath).toBeTruthy();
    }
  });

  it('DEFAULT_VARIANT_ID is "amber"', () => {
    expect(DEFAULT_VARIANT_ID).toBe('amber');
  });

  it('DEFAULT_VARIANT_ID resolves to an actual variant', () => {
    const found = COMPANION_VARIANTS.find(v => v.id === DEFAULT_VARIANT_ID);
    expect(found).toBeDefined();
  });

  it('getVariant returns the matching variant by id', () => {
    const teal = getVariant('teal');
    expect(teal.id).toBe('teal');
    expect(teal.name.de).toBeTruthy();
  });

  it('getVariant falls back to the default when id is unknown', () => {
    const v = getVariant('nonexistent' as CompanionVariantId);
    expect(v.id).toBe(DEFAULT_VARIANT_ID);
  });

  it('getVariant falls back to the default when id is undefined', () => {
    const v = getVariant(undefined);
    expect(v.id).toBe(DEFAULT_VARIANT_ID);
  });

  it('all variants share the same placeholder sprite path for now', () => {
    // Marc is making real variant art later — every variant currently points
    // to dragon-young.webp. When per-variant sprites land, update this test.
    const unique = new Set(COMPANION_VARIANTS.map(v => v.spritePath));
    expect(unique.size).toBe(1);
    expect([...unique][0]).toBe('art/companion/dragon-young.webp');
  });
});

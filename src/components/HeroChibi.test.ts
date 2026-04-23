import { describe, it, expect } from 'vitest';
import {
  resolveFace,
  SKIN_TONES,
  HAIR_STYLES,
  EXPRESSIONS,
  DEFAULT_FACE,
} from './HeroChibi';

/**
 * Tests for HeroChibi.resolveFace().
 *
 * This helper is the single compatibility layer for heroFace. If a persisted
 * face carries an unknown id (user played with a palette we later removed,
 * or the field is missing entirely), the render must still produce a valid
 * chibi. That's what these tests guard.
 *
 * Fallback policy:
 *   - Unknown / missing skin    → SKIN_TONES[2] ('warm', matches DEFAULT_FACE)
 *   - Unknown / missing hair    → HAIR_STYLES[0] ('short-brown')
 *   - Unknown / missing express → EXPRESSIONS[0] ('happy')
 */
describe('resolveFace', () => {
  it('returns valid defaults for null', () => {
    const resolved = resolveFace(null);
    expect(resolved.skin.id).toBe('warm');
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('returns valid defaults for undefined', () => {
    const resolved = resolveFace(undefined);
    expect(resolved.skin.id).toBe('warm');
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('returns valid defaults for empty object', () => {
    const resolved = resolveFace({});
    expect(resolved.skin.id).toBe('warm');
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('resolves a fully-specified face', () => {
    const resolved = resolveFace({ skin: 'pale', hair: 'curly-red', expression: 'cool' });
    expect(resolved.skin.id).toBe('pale');
    expect(resolved.skin.color).toBe('#fde7d0');
    expect(resolved.hair.id).toBe('curly-red');
    expect(resolved.hair.style).toBe('curly');
    expect(resolved.expression.id).toBe('cool');
  });

  it('falls back to default skin when skin id is unknown', () => {
    const resolved = resolveFace({ skin: 'ghost-white', hair: 'short-brown', expression: 'happy' });
    expect(resolved.skin.id).toBe('warm');
    // Hair + expression passed-through valid still resolve correctly.
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('falls back to default hair when hair id is unknown', () => {
    const resolved = resolveFace({ skin: 'pale', hair: 'mohawk-purple', expression: 'happy' });
    expect(resolved.skin.id).toBe('pale');
    expect(resolved.hair.id).toBe('short-brown');
  });

  it('falls back to default expression when expression id is unknown', () => {
    const resolved = resolveFace({ skin: 'pale', hair: 'short-brown', expression: 'angry' });
    expect(resolved.expression.id).toBe('happy');
  });

  it('falls back on all three when all three ids are unknown', () => {
    const resolved = resolveFace({ skin: 'x', hair: 'y', expression: 'z' });
    expect(resolved.skin.id).toBe('warm');
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('handles partial input (only skin provided)', () => {
    const resolved = resolveFace({ skin: 'deep' });
    expect(resolved.skin.id).toBe('deep');
    // Missing hair + expression fall through to defaults.
    expect(resolved.hair.id).toBe('short-brown');
    expect(resolved.expression.id).toBe('happy');
  });

  it('DEFAULT_FACE is internally consistent', () => {
    // If someone later edits the defaults, resolveFace() should still
    // return the same object for DEFAULT_FACE-in as the fallback.
    const resolved = resolveFace(DEFAULT_FACE);
    expect(resolved.skin.id).toBe(DEFAULT_FACE.skin);
    expect(resolved.hair.id).toBe(DEFAULT_FACE.hair);
    expect(resolved.expression.id).toBe(DEFAULT_FACE.expression);
  });
});

describe('HeroChibi palettes', () => {
  it('exports exactly 5 skin tones', () => {
    expect(SKIN_TONES).toHaveLength(5);
  });

  it('exports exactly 6 hair styles', () => {
    expect(HAIR_STYLES).toHaveLength(6);
  });

  it('exports exactly 4 expressions', () => {
    expect(EXPRESSIONS).toHaveLength(4);
  });

  it('every skin has id, color, blush (no undefined)', () => {
    for (const s of SKIN_TONES) {
      expect(s.id).toBeTruthy();
      expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(s.blush).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('every hair has id, color, style, and bilingual label', () => {
    for (const h of HAIR_STYLES) {
      expect(h.id).toBeTruthy();
      expect(h.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(h.style).toMatch(/^(short|long|curly|bun)$/);
      expect(h.label.de).toBeTruthy();
      expect(h.label.en).toBeTruthy();
    }
  });

  it('every expression has id and bilingual label', () => {
    for (const e of EXPRESSIONS) {
      expect(e.id).toBeTruthy();
      expect(e.label.de).toBeTruthy();
      expect(e.label.en).toBeTruthy();
    }
  });

  it('skin ids are unique', () => {
    const ids = SKIN_TONES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hair ids are unique', () => {
    const ids = HAIR_STYLES.map(h => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('expression ids are unique', () => {
    const ids = EXPRESSIONS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

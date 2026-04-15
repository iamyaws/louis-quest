import { describe, it, expect } from 'vitest';
import { pickLine, matchesContext, recordUse, pruneHistory } from './VoiceEngine';
import type { VoiceContext, VoiceLine, VoiceHistory } from './types';

const baseCtx: VoiceContext = {
  trigger: 'hub_open',
  timeOfDay: 'morning',
  weather: null,
  mood: null,
  stage: 'baby',
  questsCompletedToday: 0,
  lang: 'de',
};

const L = (overrides: Partial<VoiceLine>): VoiceLine => ({
  id: overrides.id || 'test_01',
  text: overrides.text || 'Hi',
  triggers: overrides.triggers || ['hub_open'],
  ...overrides,
});

describe('matchesContext', () => {
  it('matches when trigger aligns', () => {
    expect(matchesContext(L({ triggers: ['hub_open'] }), baseCtx)).toBe(true);
  });

  it('rejects on trigger mismatch', () => {
    expect(matchesContext(L({ triggers: ['sanctuary_open'] }), baseCtx)).toBe(false);
  });

  it('honors timeOfDay when set', () => {
    expect(matchesContext(L({ timeOfDay: ['morning'] }), baseCtx)).toBe(true);
    expect(matchesContext(L({ timeOfDay: ['night'] }), baseCtx)).toBe(false);
  });

  it('requires weather to be present when line specifies weather', () => {
    const line = L({ weather: ['rain'] });
    expect(matchesContext(line, baseCtx)).toBe(false);
    expect(matchesContext(line, { ...baseCtx, weather: 'rain' })).toBe(true);
    expect(matchesContext(line, { ...baseCtx, weather: 'snow' })).toBe(false);
  });

  it('enforces minQuestsToday', () => {
    const line = L({ minQuestsToday: 3, triggers: ['quest_complete'] });
    const ctx = { ...baseCtx, trigger: 'quest_complete' as const };
    expect(matchesContext(line, { ...ctx, questsCompletedToday: 2 })).toBe(false);
    expect(matchesContext(line, { ...ctx, questsCompletedToday: 3 })).toBe(true);
    expect(matchesContext(line, { ...ctx, questsCompletedToday: 10 })).toBe(true);
  });

  it('requires careAction when line specifies it', () => {
    const line = L({ careAction: ['fed'], triggers: ['care_action'] });
    const ctx = { ...baseCtx, trigger: 'care_action' as const };
    expect(matchesContext(line, ctx)).toBe(false);
    expect(matchesContext(line, { ...ctx, careAction: 'fed' })).toBe(true);
    expect(matchesContext(line, { ...ctx, careAction: 'played' })).toBe(false);
  });
});

describe('pickLine', () => {
  const lines = [
    L({ id: 'a', triggers: ['hub_open'] }),
    L({ id: 'b', triggers: ['hub_open'] }),
    L({ id: 'c', triggers: ['sanctuary_open'] }),
  ];

  it('picks only from matching candidates', () => {
    // Deterministic: rand always returns 0 -> first candidate
    const picked = pickLine(baseCtx, lines, {}, { rand: () => 0 });
    expect(picked).not.toBeNull();
    expect(['a', 'b']).toContain(picked!.id);
  });

  it('returns null when nothing matches', () => {
    const picked = pickLine({ ...baseCtx, trigger: 'idle' }, lines, {}, { rand: () => 0 });
    expect(picked).toBeNull();
  });

  it('avoids lines still on cooldown', () => {
    const now = 1_000_000_000_000;
    const history: VoiceHistory = { a: now - 1000 }; // just used
    const picked = pickLine(baseCtx, lines, history, { now, rand: () => 0 });
    expect(picked!.id).toBe('b');
  });

  it('ignores cooldown if all matches are on cooldown (repeat beats silence)', () => {
    const now = 1_000_000_000_000;
    const history: VoiceHistory = { a: now - 1000, b: now - 1000 };
    const picked = pickLine(baseCtx, lines, history, { now, rand: () => 0 });
    expect(picked).not.toBeNull();
    expect(['a', 'b']).toContain(picked!.id);
  });

  it('respects custom cooldownHours', () => {
    const now = 1_000_000_000_000;
    const shortLines = [L({ id: 'short', triggers: ['hub_open'], cooldownHours: 1 })];
    const history: VoiceHistory = { short: now - 30 * 60 * 1000 }; // used 30 min ago
    // Still on cooldown (1h), but it's the only match -> picks anyway
    const picked = pickLine(baseCtx, shortLines, history, { now, rand: () => 0 });
    expect(picked!.id).toBe('short');
    // 2h later: cooldown passed
    const later = pickLine(baseCtx, shortLines, history, { now: now + 2 * 60 * 60 * 1000, rand: () => 0 });
    expect(later!.id).toBe('short');
  });
});

describe('recordUse + pruneHistory', () => {
  it('recordUse updates without mutating', () => {
    const h: VoiceHistory = { a: 100 };
    const next = recordUse('b', h, 200);
    expect(h).toEqual({ a: 100 });
    expect(next).toEqual({ a: 100, b: 200 });
  });

  it('pruneHistory drops entries older than 48h', () => {
    const now = 1_000_000_000_000;
    const h: VoiceHistory = {
      old: now - 49 * 60 * 60 * 1000,
      recent: now - 1000,
    };
    const pruned = pruneHistory(h, now);
    expect(pruned).toEqual({ recent: h.recent });
  });
});

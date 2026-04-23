import { describe, it, expect } from 'vitest';
import { canAccessMinigames } from './minigameAccess';

/**
 * Tests for the 3-mode minigame access gate.
 *
 * Covers:
 *   - 'frei' (default): always allowed, regardless of routine / time
 *   - 'routine': gated by routineDoneToday flag
 *   - 'zeitfenster': gated by current hour, custom + default window
 *   - Edge cases: null state, undefined mode, unknown mode
 */
describe('canAccessMinigames', () => {
  // ── 'frei' mode ───────────────────────────────────────────────────
  describe("mode: 'frei'", () => {
    it('allows access when routine not done', () => {
      const result = canAccessMinigames(
        { minigameAccessMode: 'frei' },
        { routineDoneToday: false },
      );
      expect(result).toEqual({ allowed: true, reason: '' });
    });

    it('allows access when routine done', () => {
      const result = canAccessMinigames(
        { minigameAccessMode: 'frei' },
        { routineDoneToday: true },
      );
      expect(result.allowed).toBe(true);
    });

    it('ignores time window even when outside', () => {
      // 03:00 — way outside a default 16-18 window
      const result = canAccessMinigames(
        { minigameAccessMode: 'frei', minigameTimeWindow: { startHour: 16, endHour: 18 } },
        { routineDoneToday: false, now: new Date(2026, 3, 22, 3, 0) },
      );
      expect(result.allowed).toBe(true);
    });
  });

  // ── Migration safety: missing mode defaults to 'frei' ────────────
  describe('default when mode is undefined', () => {
    it('treats missing minigameAccessMode as frei (allowed)', () => {
      // Critical: existing users persisted before the gating shipped
      // must NOT be locked out of minigames.
      const result = canAccessMinigames({}, { routineDoneToday: false });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('');
    });

    it('treats null state as frei (allowed)', () => {
      const result = canAccessMinigames(null, { routineDoneToday: false });
      expect(result.allowed).toBe(true);
    });

    it('treats undefined state as frei (allowed)', () => {
      const result = canAccessMinigames(undefined, { routineDoneToday: false });
      expect(result.allowed).toBe(true);
    });

    it('uses default opts (routineDoneToday=false) when opts omitted', () => {
      // Calling with bare state — function sig gives default opts.
      const result = canAccessMinigames({ minigameAccessMode: 'frei' });
      expect(result.allowed).toBe(true);
    });
  });

  // ── 'routine' mode ───────────────────────────────────────────────
  describe("mode: 'routine'", () => {
    it('blocks access before routine complete', () => {
      const result = canAccessMinigames(
        { minigameAccessMode: 'routine' },
        { routineDoneToday: false },
      );
      expect(result).toEqual({
        allowed: false,
        reason: 'routine_not_done',
      });
    });

    it('allows access after routine complete', () => {
      const result = canAccessMinigames(
        { minigameAccessMode: 'routine' },
        { routineDoneToday: true },
      );
      expect(result).toEqual({ allowed: true, reason: '' });
    });
  });

  // ── 'zeitfenster' mode ────────────────────────────────────────────
  describe("mode: 'zeitfenster'", () => {
    const state = {
      minigameAccessMode: 'zeitfenster' as const,
      minigameTimeWindow: { startHour: 16, endHour: 18 },
    };

    it('blocks before window starts', () => {
      const result = canAccessMinigames(state, {
        routineDoneToday: true,
        now: new Date(2026, 3, 22, 15, 59),
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('outside_time_window');
      expect(result.nextWindow).toEqual({ startHour: 16, endHour: 18 });
    });

    it('allows at window start (inclusive)', () => {
      const result = canAccessMinigames(state, {
        routineDoneToday: false,
        now: new Date(2026, 3, 22, 16, 0),
      });
      expect(result.allowed).toBe(true);
    });

    it('allows mid-window', () => {
      const result = canAccessMinigames(state, {
        routineDoneToday: false,
        now: new Date(2026, 3, 22, 17, 30),
      });
      expect(result.allowed).toBe(true);
    });

    it('blocks at window end (exclusive)', () => {
      const result = canAccessMinigames(state, {
        routineDoneToday: true,
        now: new Date(2026, 3, 22, 18, 0),
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('outside_time_window');
    });

    it('blocks after window end', () => {
      const result = canAccessMinigames(state, {
        routineDoneToday: true,
        now: new Date(2026, 3, 22, 20, 0),
      });
      expect(result.allowed).toBe(false);
    });

    it('uses default window (16-18) when minigameTimeWindow missing', () => {
      const result = canAccessMinigames(
        { minigameAccessMode: 'zeitfenster' },
        { routineDoneToday: false, now: new Date(2026, 3, 22, 17, 0) },
      );
      expect(result.allowed).toBe(true);
    });

    it('respects a custom window (19-20)', () => {
      const customState = {
        minigameAccessMode: 'zeitfenster' as const,
        minigameTimeWindow: { startHour: 19, endHour: 20 },
      };
      expect(canAccessMinigames(customState, {
        routineDoneToday: false,
        now: new Date(2026, 3, 22, 18, 59),
      }).allowed).toBe(false);
      expect(canAccessMinigames(customState, {
        routineDoneToday: false,
        now: new Date(2026, 3, 22, 19, 30),
      }).allowed).toBe(true);
    });
  });

  // ── Unknown mode (defensive) ─────────────────────────────────────
  describe('unknown mode', () => {
    it('returns mode_unknown for string we did not implement', () => {
      const result = canAccessMinigames(
        // @ts-expect-error — testing runtime fallback
        { minigameAccessMode: 'gibberish' },
        { routineDoneToday: true },
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('mode_unknown');
    });
  });
});

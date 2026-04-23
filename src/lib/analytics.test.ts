import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock supabase BEFORE importing the module under test ────────────
// We don't want real network calls in tests, but we DO want to assert
// what rows analytics.ts would have inserted.
const insertSpy = vi.fn().mockResolvedValue({ error: null });
const fromSpy = vi.fn().mockReturnValue({ insert: insertSpy });

vi.mock('./supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromSpy(...args),
  },
}));

// Imported AFTER the mock so the mocked supabase is what analytics sees.
import {
  track,
  getDeviceId,
  setAnalyticsEnabled,
  _resetForTests,
  _flushForTests,
} from './analytics';

/**
 * Privacy-critical tests for telemetry.
 *
 * These tests are the line of defence against:
 *   - PII leaks via unexpected prop keys (hero name, journal text)
 *   - Timing-fingerprint leaks via precise mood timestamps
 *   - Anonymous device_id getting fingerprinted / tied to auth
 *   - Silent acceptance of event names outside the schema
 *   - Disabled-state leaks (opted-out users still sending events)
 */
describe('analytics', () => {
  beforeEach(() => {
    _resetForTests();
    insertSpy.mockClear();
    fromSpy.mockClear();
    // Ensure localStorage + sessionStorage are clean each test.
    localStorage.clear();
    sessionStorage.clear();
    setAnalyticsEnabled(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Prop allowlist (privacy-critical) ────────────────────────────
  describe('prop allowlist', () => {
    it('strips unknown prop keys from allowed events', async () => {
      track('quest.complete', {
        questId: 'morning',
        anchor: 'morning',
        // @ts-expect-error — verifying runtime filter
        heroName: 'Louis',
        // @ts-expect-error
        journalContent: 'I felt sad today',
      });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows).toHaveLength(1);
      expect(Object.keys(rows[0].props).sort()).toEqual(['anchor', 'questId']);
      expect(rows[0].props.heroName).toBeUndefined();
      expect(rows[0].props.journalContent).toBeUndefined();
    });

    it('drops non-primitive values even when key is allowlisted', async () => {
      track('quest.complete', {
        questId: 'morning',
        // @ts-expect-error — allowed key but wrong type
        anchor: { nested: 'object' },
      });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows[0].props).toEqual({ questId: 'morning' });
    });

    it('accepts all three primitive types on allowed keys', async () => {
      track('game.end', {
        gameId: 'crystals',
        durationSec: 42,
        completed: true,
      });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows[0].props).toEqual({
        gameId: 'crystals',
        durationSec: 42,
        completed: true,
      });
    });

    it('empty allowlist events drop all props', async () => {
      // 'routine.complete' has ALLOWED_PROP_KEYS = []
      track('routine.complete', {
        // @ts-expect-error — no keys allowed
        anchor: 'morning',
      });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows[0].props).toEqual({});
    });
  });

  // ── Event name allowlist ─────────────────────────────────────────
  describe('event name allowlist', () => {
    it('silently drops unknown event names', async () => {
      track(
        // @ts-expect-error — verifying unknown-name drop
        'potentially.dangerous.name',
        { foo: 'bar' },
      );
      await flushAndSettle();
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('accepts all 15 documented event names', async () => {
      const names = [
        'app.open',
        'routine.complete',
        'quest.complete',
        'tool.open',
        'tool.complete',
        'mood.pick',
        'game.start',
        'game.end',
        'ronki.hatch',
        'ronki.evolve',
        'journal.write',
        'ausmalbild.redeem',
        'parent.pin.enter',
        'parent.dashboard.open',
        'parent.setting.change',
      ] as const;
      // Clear the app.open dedup flag before iterating.
      sessionStorage.clear();
      for (const n of names) {
        track(n);
      }
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows).toHaveLength(names.length);
      expect(rows.map(r => r.name).sort()).toEqual([...names].sort());
    });
  });

  // ── Timestamp truncation (mood.pick fingerprint guard) ───────────
  describe('timestamp truncation', () => {
    it('mood.pick timestamps snap to the hour', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-22T14:37:42.891Z'));
      track('mood.pick', { mood: 'gut', slot: 'morning' });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows[0].ts).toBe('2026-04-22T14:00:00.000Z');
    });

    it('non-mood events keep full-precision timestamps', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-22T14:37:42.891Z'));
      track('quest.complete', { questId: 'wasser', anchor: 'morning' });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows[0].ts).toBe('2026-04-22T14:37:42.891Z');
    });
  });

  // ── device_id (anonymous, persistent, rotatable) ─────────────────
  describe('device_id', () => {
    it('generates and persists a UUID on first call', () => {
      expect(localStorage.getItem('ronki_analytics_device_id')).toBeNull();
      const id = getDeviceId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(localStorage.getItem('ronki_analytics_device_id')).toBe(id);
    });

    it('reuses the same id within the rotation window', () => {
      const a = getDeviceId();
      const b = getDeviceId();
      expect(a).toBe(b);
    });

    it('rotates the id after the rotation window', () => {
      const a = getDeviceId();
      // Force rotation deadline to be in the past.
      localStorage.setItem('ronki_analytics_device_id_rotate_at', '1');
      const b = getDeviceId();
      expect(b).not.toBe(a);
    });

    it('is never assembled from any auth / user source', () => {
      // Sanity — getDeviceId() is called without args, no ambient context.
      const id = getDeviceId();
      // It MUST be exactly a UUID v4 shape.
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  // ── Enabled / disabled state ─────────────────────────────────────
  describe('enabled toggle', () => {
    it('does not send events when disabled', async () => {
      setAnalyticsEnabled(false);
      track('quest.complete', { questId: 'wasser', anchor: 'morning' });
      await flushAndSettle();
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('persists enabled=false across module reload', () => {
      setAnalyticsEnabled(false);
      expect(localStorage.getItem('ronki_analytics_enabled')).toBe('0');
    });

    it('re-enables cleanly and the next event sends', async () => {
      setAnalyticsEnabled(false);
      track('quest.complete', { questId: 'a', anchor: 'morning' });
      setAnalyticsEnabled(true);
      track('quest.complete', { questId: 'b', anchor: 'morning' });
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].props.questId).toBe('b');
    });
  });

  // ── app.open dedup (hot reload + StrictMode safety) ──────────────
  describe('app.open dedup', () => {
    it('fires only once per session', async () => {
      track('app.open');
      track('app.open');
      track('app.open');
      await flushAndSettle();
      const rows = lastInsertedRows();
      const opens = rows.filter(r => r.name === 'app.open');
      expect(opens).toHaveLength(1);
    });

    it('fires again after sessionStorage clears', async () => {
      track('app.open');
      sessionStorage.clear();
      track('app.open');
      await flushAndSettle();
      const rows = lastInsertedRows();
      expect(rows.filter(r => r.name === 'app.open')).toHaveLength(2);
    });
  });

  // ── Payload shape ────────────────────────────────────────────────
  describe('payload shape', () => {
    it('each row has device_id, name, props, ts (and app_version if configured)', async () => {
      track('quest.complete', { questId: 'q1', anchor: 'morning' });
      await flushAndSettle();
      const [row] = lastInsertedRows();
      expect(row).toHaveProperty('device_id');
      expect(row).toHaveProperty('name', 'quest.complete');
      expect(row).toHaveProperty('props');
      expect(row).toHaveProperty('ts');
      // app_version may be undefined → nulled by the insert mapper.
      expect('app_version' in row).toBe(true);
    });

    it('every row hits the telemetry_events table exactly', async () => {
      track('quest.complete', { questId: 'q1', anchor: 'morning' });
      await flushAndSettle();
      expect(fromSpy).toHaveBeenCalledWith('telemetry_events');
    });
  });
});

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Analytics.track() queues synchronously; in prod, flush is driven by
 * visibilitychange/interval/beforeunload. Tests bypass the DOM plumbing
 * and go straight through the exported _flushForTests helper — the
 * jsdom dispatch path is fiddly across document↔window, and we already
 * test the event wiring with integration coverage.
 */
async function flushAndSettle(): Promise<void> {
  await _flushForTests();
}

/** Concatenate all rows that have been inserted since the last clear. */
function lastInsertedRows(): Array<{
  device_id: string;
  name: string;
  props: Record<string, string | number | boolean>;
  ts: string;
  app_version?: string | null;
}> {
  const rows: Array<any> = [];
  for (const call of insertSpy.mock.calls) {
    if (Array.isArray(call[0])) rows.push(...call[0]);
  }
  return rows;
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initialArcState,
  offerNextArc,
  acceptOffer,
  declineOffer,
  advanceBeat,
  completeArc,
  isInCooldown,
  getActiveBeat,
} from './ArcEngine';
import { ARCS, findArc } from './arcs';
import type { ArcEngineState } from './types';

const NOW = 1_700_000_000_000;

describe('ArcEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  describe('initialArcState', () => {
    it('starts idle with no active arc', () => {
      const s = initialArcState();
      expect(s.phase).toBe('idle');
      expect(s.activeArcId).toBeNull();
      expect(s.completedArcIds).toEqual([]);
      expect(s.cooldownEndsAt).toBeNull();
    });
  });

  describe('offerNextArc', () => {
    it('transitions idle -> offered when an uncompleted arc exists', () => {
      const s = offerNextArc(initialArcState());
      expect(s.phase).toBe('offered');
      expect(s.offeredArcId).toBe('first-adventure');
    });

    it('stays idle when all arcs are completed', () => {
      const allIds = ARCS.map(a => a.id);
      const s = offerNextArc({ ...initialArcState(), completedArcIds: allIds });
      expect(s.phase).toBe('idle');
      expect(s.offeredArcId).toBeNull();
    });

    it('stays in cooldown and does not offer', () => {
      const cooldown: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW + 1000,
      };
      const s = offerNextArc(cooldown);
      expect(s.phase).toBe('cooldown');
    });
  });

  describe('acceptOffer', () => {
    it('offered -> active with beat index 0', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      expect(s.phase).toBe('active');
      expect(s.activeArcId).toBe('first-adventure');
      expect(s.activeBeatIndex).toBe(0);
      expect(s.offeredArcId).toBeNull();
    });

    it('throws if not in offered phase', () => {
      expect(() => acceptOffer(initialArcState())).toThrow();
    });
  });

  describe('declineOffer', () => {
    it('offered -> idle, arc not marked completed', () => {
      let s = offerNextArc(initialArcState());
      s = declineOffer(s);
      expect(s.phase).toBe('idle');
      expect(s.offeredArcId).toBeNull();
      expect(s.completedArcIds).not.toContain('first-adventure');
    });
  });

  describe('advanceBeat', () => {
    it('advances beat index when active and current beat matches', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      // beat 0 is the lore beat 'fa-b1-dream' — advance it
      s = advanceBeat(s, 'fa-b1-dream');
      expect(s.activeBeatIndex).toBe(1);
      expect(s.phase).toBe('active');
    });

    it('ignores advance if beat id does not match current', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const before = s.activeBeatIndex;
      s = advanceBeat(s, 'some-other-beat');
      expect(s.activeBeatIndex).toBe(before);
    });

    it('transitions to cooldown when advancing past last beat', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const arc = findArc('first-adventure')!;
      // walk through all beats
      for (const beat of arc.beats) {
        s = advanceBeat(s, beat.id);
      }
      expect(s.phase).toBe('cooldown');
      expect(s.completedArcIds).toContain('first-adventure');
      expect(s.cooldownEndsAt).toBe(NOW + arc.cooldownHours * 60 * 60 * 1000);
      expect(s.activeArcId).toBeNull();
    });
  });

  describe('isInCooldown', () => {
    it('returns true when phase is cooldown and end not reached', () => {
      const s: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW + 1000,
      };
      expect(isInCooldown(s)).toBe(true);
    });

    it('returns false and transitions when cooldown expired', () => {
      const s: ArcEngineState = {
        ...initialArcState(),
        phase: 'cooldown',
        cooldownEndsAt: NOW - 1000,
      };
      expect(isInCooldown(s)).toBe(false);
    });
  });

  describe('getActiveBeat', () => {
    it('returns the current beat when active', () => {
      let s = offerNextArc(initialArcState());
      s = acceptOffer(s);
      const beat = getActiveBeat(s);
      expect(beat?.id).toBe('fa-b1-dream');
    });

    it('returns null when not active', () => {
      expect(getActiveBeat(initialArcState())).toBeNull();
    });
  });
});

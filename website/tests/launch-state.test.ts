import { describe, it, expect } from 'vitest';
import { getLaunchCopy, LAUNCH_STATE } from '../src/config/launch-state';

describe('launch state', () => {
  it('exports a valid LAUNCH_STATE value', () => {
    expect(['waitlist', 'live']).toContain(LAUNCH_STATE);
  });

  it('returns waitlist copy when state is waitlist', () => {
    const copy = getLaunchCopy('waitlist');
    expect(copy.ctaLabel).toBe('Auf die Warteliste');
    expect(copy.ctaAction).toBe('waitlist');
    expect(copy.footerMicro).toMatch(/warteliste/i);
  });

  it('returns live copy when state is live', () => {
    const copy = getLaunchCopy('live');
    expect(copy.ctaLabel).toBe('Kostenlos testen');
    expect(copy.ctaAction).toBe('install');
    expect(copy.footerMicro).toMatch(/browser/i);
  });
});

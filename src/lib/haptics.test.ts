import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  triggerHaptic,
  setHapticsEnabled,
  setHapticsMode,
  __resetHapticsForTests,
} from './haptics';

// Stub navigator.vibrate with a spy so we can assert the exact pattern
// handed off to the browser. We restore after each test to keep cases
// independent.
describe('haptics lib', () => {
  let vibrateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    __resetHapticsForTests();
    vibrateSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      writable: true,
      value: vibrateSpy,
    });
  });

  afterEach(() => {
    // Leave navigator.vibrate as our spy between tests; beforeEach resets it.
    vi.restoreAllMocks();
  });

  it("gentle mode halves 'tap' duration (10ms → 5ms)", () => {
    setHapticsMode('gentle');
    triggerHaptic('tap');
    // 10ms / 2 = 5ms, floor at 5ms holds
    expect(vibrateSpy).toHaveBeenCalledWith(5);
  });

  it("normal mode sends the unscaled 'tap' pattern", () => {
    setHapticsMode('normal');
    triggerHaptic('tap');
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it("gentle mode widens 'success' sequence pauses by 1.3×", () => {
    setHapticsMode('gentle');
    triggerHaptic('success');
    // Normal: [30, 40, 80]
    // Gentle: active ms/2 floor 5, pauses * 1.3 rounded
    //   -> [15, 52, 40]
    expect(vibrateSpy).toHaveBeenCalledWith([15, 52, 40]);
  });

  it("normal mode sends the unscaled 'celebration' sequence", () => {
    setHapticsMode('normal');
    triggerHaptic('celebration');
    expect(vibrateSpy).toHaveBeenCalledWith([40, 60, 40]);
  });

  it('is a no-op when disabled', () => {
    setHapticsEnabled(false);
    triggerHaptic('tap');
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it('force:true bypasses the enabled flag (parental preview)', () => {
    setHapticsEnabled(false);
    triggerHaptic('tap', { force: true });
    expect(vibrateSpy).toHaveBeenCalledWith(5); // gentle default
  });

  it('silently ignores unknown pattern names', () => {
    // @ts-expect-error — testing the guard
    triggerHaptic('unknown');
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it('__resetHapticsForTests restores defaults (enabled=true, mode=gentle)', () => {
    setHapticsEnabled(false);
    setHapticsMode('normal');
    __resetHapticsForTests();
    triggerHaptic('tap');
    expect(vibrateSpy).toHaveBeenCalledWith(5); // gentle → 5ms, enabled again
  });
});

import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { triggerHaptic, setHapticsEnabled, setHapticsMode } from '../lib/haptics';

/**
 * Sync TaskState → pure haptics lib, return the trigger function.
 *
 * Callers do:
 *   const haptic = useHaptic();
 *   haptic('tap'); // or 'select' | 'confirm' | 'success' | 'celebration'
 *
 * Research notes (haptic_research_2026_04.md):
 *   - Age 6 is edge of startle-reflex maturation → default mode is 'gentle'
 *   - Haptic is confirmer, not carrier → always pair with visual in callsites
 *   - Respect OS reduce-motion as a sensory-sensitivity proxy (15-20% of
 *     any classroom). When reduce-motion is on, suppress haptics even if
 *     the user left the toggle enabled.
 *   - Emotional-regulation tools MUST NOT call this hook. During Box-Atmung,
 *     Drei-Danke, Kraftwort, Löwen-Pose, Stein-und-Gummi the user is
 *     regulating, not transacting.
 */
export function useHaptic() {
  const { state } = useTask();

  // Mirror TaskState → lib on every relevant change. The lib is a singleton;
  // multiple components can call useHaptic() and the last writer wins, but
  // they all read from the same TaskState so values stay consistent.
  useEffect(() => {
    setHapticsMode(state?.hapticsMode ?? 'gentle');
  }, [state?.hapticsMode]);

  // OS reduce-motion is treated as a hard override: if the user has asked
  // for less motion at the system level, haptics stay silent regardless of
  // the app toggle. Covers sensory-sensitivity cases without a second UI.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setHapticsEnabled(state?.hapticsEnabled !== false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const userOn = state?.hapticsEnabled !== false;
      setHapticsEnabled(userOn && !mq.matches);
    };
    apply();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
    // Legacy Safari fallback (addListener/removeListener).
    if (typeof (mq as any).addListener === 'function') {
      (mq as any).addListener(apply);
      return () => (mq as any).removeListener(apply);
    }
    return undefined;
  }, [state?.hapticsEnabled]);

  return triggerHaptic;
}

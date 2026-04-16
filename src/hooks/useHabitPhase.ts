import { useMemo } from 'react';
import { useTask } from '../context/TaskContext';

/**
 * useHabitPhase — determines which reward phase Louis is in.
 *
 * Based on habit formation research (Lally 2010, Atomic Habits):
 *   Phase 1 (days 1-7):   ESTABLISHMENT — full celebrations, Ronki very present
 *   Phase 2 (days 8-21):  CONSOLIDATION — reduced intensity, identity language
 *   Phase 3 (days 22-45): INTERNALIZATION — intermittent rewards, Ronki quieter
 *   Phase 4 (days 46+):   INDEPENDENCE — minimal interaction, meadow blooms
 *
 * daysSinceOnboarding is derived from state.onboardingDate (ISO string).
 * If not set, falls back to totalTaskDays as a proxy.
 */

export type HabitPhase = 'establishment' | 'consolidation' | 'internalization' | 'independence';

export interface HabitPhaseInfo {
  phase: HabitPhase;
  phaseNumber: 1 | 2 | 3 | 4;
  daysSince: number;
  /** Celebration probability (1.0 = always, 0.2 = 20% of the time) */
  celebrationProbability: number;
  /** Animation duration multiplier (1.0 = full, 0.3 = very short) */
  animationScale: number;
  /** Should Ronki speak this routine? */
  shouldSpeak: boolean;
  /** Should we use identity language? ("Du bist jemand, der...") */
  useIdentityLanguage: boolean;
  /** Is the meadow in full bloom? */
  meadowBloom: boolean;
}

export function useHabitPhase(): HabitPhaseInfo {
  const { state } = useTask();

  return useMemo(() => {
    // Calculate days since onboarding
    let daysSince = 0;
    if (state?.onboardingDate) {
      const start = new Date(state.onboardingDate);
      const now = new Date();
      daysSince = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Fallback: use totalTaskDays as proxy
      daysSince = state?.totalTaskDays || 0;
    }

    if (daysSince <= 7) {
      return {
        phase: 'establishment',
        phaseNumber: 1,
        daysSince,
        celebrationProbability: 1.0,
        animationScale: 1.0,
        shouldSpeak: true,
        useIdentityLanguage: false,
        meadowBloom: false,
      };
    }

    if (daysSince <= 21) {
      // Linearly reduce from 1.0 to 0.65 over days 8-21
      const progress = (daysSince - 7) / 14;
      return {
        phase: 'consolidation',
        phaseNumber: 2,
        daysSince,
        celebrationProbability: 1.0 - progress * 0.35,
        animationScale: 1.0 - progress * 0.3,
        shouldSpeak: Math.random() < (1.0 - progress * 0.4),
        useIdentityLanguage: daysSince >= 14,
        meadowBloom: false,
      };
    }

    if (daysSince <= 45) {
      // Reduce from 0.65 to 0.2 over days 22-45
      const progress = (daysSince - 21) / 24;
      return {
        phase: 'internalization',
        phaseNumber: 3,
        daysSince,
        celebrationProbability: 0.65 - progress * 0.45,
        animationScale: 0.7 - progress * 0.3,
        shouldSpeak: Math.random() < 0.4,
        useIdentityLanguage: true,
        meadowBloom: false,
      };
    }

    // Phase 4: independence
    return {
      phase: 'independence',
      phaseNumber: 4,
      daysSince,
      celebrationProbability: 0.15,
      animationScale: 0.3,
      shouldSpeak: Math.random() < 0.15,
      useIdentityLanguage: true,
      meadowBloom: true,
    };
  }, [state?.onboardingDate, state?.totalTaskDays]);
}

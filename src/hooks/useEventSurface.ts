/**
 * useEventSurface — centralized quiet-window gate for event cards.
 *
 * Three surfaces currently call `isEventSuppressed(state?.onboardingDate, 'xyz')`
 * with their own null-guards and boilerplate: Hub's voiceGreeting, Hub's
 * visitor card, and FreundCallbackCard. This hook collapses the boilerplate:
 *
 *   const { suppressed } = useEventSurface('visitor');
 *   if (suppressed) return null;
 *
 * Read the surface name (must match a key in the eventOrchestration QUIET_DAYS
 * table) and return `{ suppressed: boolean }`. Future event surfaces (Wave-3
 * callback, expedition return, Buch witness page) slot in as one-liners.
 *
 * See src/utils/eventOrchestration.ts for the underlying suppression math +
 * the list of known surface names.
 */

import { useTask } from '../context/TaskContext';
import { isEventSuppressed } from '../utils/eventOrchestration';

export interface UseEventSurfaceOptions {
  /** For legacy users with no onboardingDate, fall back to a
   *  totalTaskDays-based quiet window. Set to the minimum number of
   *  task days below which the surface stays silent. Default: 0 (no
   *  fallback — legacy users are never quieted). Matches Hub's prior
   *  voiceGreeting behavior which used `fallbackDays < 2`. */
  legacyFallbackDays?: number;
}

export function useEventSurface(
  name: string,
  opts: UseEventSurfaceOptions = {}
): { suppressed: boolean } {
  const { state } = useTask();
  const onboardingDate = state?.onboardingDate;
  if (onboardingDate) {
    return { suppressed: isEventSuppressed(onboardingDate, name) };
  }
  const fallback = opts.legacyFallbackDays ?? 0;
  if (fallback > 0) {
    const taskDays = state?.totalTaskDays ?? 0;
    return { suppressed: taskDays < fallback };
  }
  return { suppressed: false };
}

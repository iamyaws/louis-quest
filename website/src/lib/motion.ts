import type { HTMLMotionProps, Transition } from 'motion/react';

/**
 * Shared motion easing curves and helpers. Typed properly so motion/react
 * accepts them without TypeScript complaining about `number[]` vs `Easing`.
 */

/** Primary ease-out curve used across the site. Smooth deceleration. */
export const EASE_OUT: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/** Snappier ease-out for short UI transitions (~200-400ms). */
export const EASE_OUT_QUICK: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

/** Quintic ease-out — more dramatic deceleration, good for editorial reveals. */
export const EASE_OUT_QUINT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Standard fade-up entrance. Respects prefers-reduced-motion by returning
 * a no-op animation when `reduced` is true.
 *
 * Explicitly typed return to avoid union-type inference issues when spreading
 * into motion components.
 */
export function fadeUp(delay: number, reduced?: boolean | null): Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'transition'
> {
  if (reduced) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 } as Transition,
    };
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE_OUT } as Transition,
  };
}

import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCount — tweens its displayed integer from the last value to
 * the new value over ~700ms with a tick SFX on decreases. Used on the
 * Sterne / Funkelzeit counters so redeeming a reward feels tangible
 * instead of snapping. See backlog_claim_deduction_animation.md.
 *
 * Props:
 *   - value (number, required) — the target integer to display
 *   - duration (ms) — tween length, default 700
 *   - onDecrease (fn({ from, to, rect })) — fires once per decrease
 *     transition, *after* the tween kicks in. Useful for spawning
 *     sparkle particles timed with the count ticking down.
 */
export default function AnimatedCount({ value, duration = 700, onDecrease, ...rest }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const rafRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;

    // Fire decrease hook — lets callers drop sparkles at this element's
    // position without having to thread a ref themselves.
    if (to < from && onDecrease && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      onDecrease({ from, to, rect });
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic — slower landing makes the deduction feel deliberate
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prev.current = to;
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span ref={rootRef} {...rest}>
      {display}
    </span>
  );
}

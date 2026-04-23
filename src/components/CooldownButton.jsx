import React, { useState, useEffect, useRef } from 'react';

/**
 * CooldownButton — forces Louis to pause before proceeding.
 * Shows a circular countdown ring that drains over `delay` seconds.
 * Button is disabled + visually muted until countdown completes.
 *
 * Props:
 *  - delay: seconds to wait (default 4)
 *  - children: button label
 *  - onClick: fires when tapped after cooldown
 *  - className, style: passed through to button
 *  - icon: optional material icon name shown next to label
 */
export default function CooldownButton({ delay = 4, children, onClick, className = '', style = {}, icon }) {
  const [remaining, setRemaining] = useState(delay);
  const [ready, setReady] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, delay - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(intervalRef.current);
        setReady(true);
      }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [delay]);

  const pct = delay > 0 ? remaining / delay : 0;
  // Ring SVG values
  const R = 11;
  const C = 2 * Math.PI * R;

  return (
    <button
      onClick={ready ? onClick : undefined}
      disabled={!ready}
      className={`relative transition-all duration-300 ${ready ? 'active:scale-95' : 'opacity-70 cursor-not-allowed'} ${className}`}
      style={{
        ...style,
        filter: ready ? 'none' : 'saturate(0.6)',
      }}
    >
      {/* Countdown ring — pinned to the left edge of the button. Sits at
           left:10px with a 26px-wide ring, so its right edge lands at 36px.
           The label's paddingLeft below must clear that. */}
      {!ready && (
        <span className="absolute left-[10px] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <svg width="26" height="26" className="-rotate-90">
            <circle cx="13" cy="13" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
            <circle cx="13" cy="13" r={R} fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                    className="transition-none" />
          </svg>
          <span className="absolute font-label font-bold text-white" style={{ fontSize: 10 }}>
            {Math.ceil(remaining)}
          </span>
        </span>
      )}
      {/* Label — shifted right when countdown is showing. Previous value
           (20) allowed the ring to lap into the first letter of the label
           (tester Apr 25 2026 saw a "1" circle on top of "Stark!"). Bumped
           to 38 so the "S" starts after the ring ends. */}
      <span className="flex items-center justify-center gap-2" style={{ paddingLeft: ready ? 0 : 38, paddingRight: ready ? 0 : 12 }}>
        {icon && ready && (
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        )}
        {children}
      </span>
    </button>
  );
}

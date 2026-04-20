import React from "react";

/**
 * RONKI CURRENCY ICONS
 *
 * Star (was Pearl)   -> Sterne (Heldenpunkte rename — Apr 2026)
 * Bolt (was Hourglass) -> Funkelzeit (Screentime Minutes)
 *
 * NOTE: back-compat aliases `Pearl` and `Hourglass` are exported so call
 * sites still compile while the rest of the codebase is migrated in-place.
 */

// --- Star (Sterne) ---

export function Star({ size = 24, dark = false, className = "" }) {
  const id = React.useId().replace(/:/g, "");
  const showGlow = size >= 24;
  const showHighlight = size >= 20;

  const glowOpacity = dark ? 0.35 : 0.45;
  const highlightOpacity = dark ? 0.65 : 0.75;
  const gradStops = dark
    ? { inner: "#fef3c7", mid: "#efb752", outer: "#92400e" }
    : { inner: "#fef3c7", mid: "#f5c06a", outer: "#b45309" };

  // Classic 5-point star, centered at (12,12), outer radius ~8.5, inner ~3.6.
  // Points start at top and rotate 72° around.
  const starPath =
    "M12 3.2 L13.95 9.35 L20.4 9.35 L15.22 13.15 L17.18 19.3 L12 15.5 L6.82 19.3 L8.78 13.15 L3.6 9.35 L10.05 9.35 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Sterne"
      role="img"
      style={{
        filter: showGlow
          ? `drop-shadow(0 0 6px rgba(252,211,77,${glowOpacity}))`
          : undefined,
      }}
    >
      <defs>
        <radialGradient id={`sg-${id}`} cx="0.38" cy="0.32" r="0.7">
          <stop offset="0%" stopColor={gradStops.inner} />
          <stop offset="55%" stopColor={gradStops.mid} />
          <stop offset="100%" stopColor={gradStops.outer} />
        </radialGradient>
      </defs>
      <path d={starPath} fill={`url(#sg-${id})`} stroke={gradStops.outer} strokeWidth="0.6" strokeLinejoin="round" />
      {showHighlight && (
        <path
          d="M10.3 6.8 Q9.2 8.8 8.2 10.2"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          opacity={highlightOpacity}
        />
      )}
    </svg>
  );
}

// Back-compat alias
export const Pearl = Star;

// --- Bolt (Funkelzeit) ---

export function Bolt({ size = 24, dark = false, className = "" }) {
  const id = React.useId().replace(/:/g, "");
  const showGlow = size >= 20;
  const glowOpacity = dark ? 0.4 : 0.55;

  const gradStops = dark
    ? { inner: "#ccfbf1", mid: "#5eead4", outer: "#0f766e" }
    : { inner: "#ccfbf1", mid: "#5eead4", outer: "#0d9488" };

  // Lightning bolt: top-right tapered tip → zig at center → bottom-left tip.
  const boltPath =
    "M14.5 2.5 L7 12.2 L11 12.2 L9.5 21.5 L17 11.4 L13 11.4 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Funkelzeit"
      role="img"
      style={{
        filter: showGlow
          ? `drop-shadow(0 0 6px rgba(94,234,212,${glowOpacity}))`
          : undefined,
      }}
    >
      <defs>
        <radialGradient id={`bg-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={gradStops.inner} />
          <stop offset="55%" stopColor={gradStops.mid} />
          <stop offset="100%" stopColor={gradStops.outer} />
        </radialGradient>
      </defs>
      <path
        d={boltPath}
        fill={`url(#bg-${id})`}
        stroke={gradStops.outer}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* White highlight on the leading (upper-right) stroke */}
      <path
        d="M13.3 4.3 L9.5 9.4"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Back-compat alias
export const Hourglass = Bolt;

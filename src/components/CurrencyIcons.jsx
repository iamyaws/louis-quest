import React from "react";

/**
 * RONKI CURRENCY ICONS
 *
 * Pearl (Chau)     -> Heldenpunkte / XP
 * Hourglass        -> Screentime Minutes
 */

// --- Pearl (Heldenpunkte) ---

export function Pearl({ size = 24, dark = false, className = "" }) {
  const id = React.useId().replace(/:/g, "");
  const showGlow = size >= 24;
  const showSecondary = size >= 28;

  const glowOpacity = dark ? 0.15 : 0.2;
  const highlightOpacity = dark ? 0.8 : 0.7;
  const gradStops = dark
    ? { inner: "#FDE68A", mid: "#EFB752", outer: "#D97706" }
    : { inner: "#FDE68A", mid: "#F5C06A", outer: "#D97706" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Heldenpunkte"
      role="img"
    >
      <defs>
        <radialGradient id={`pg-${id}`} cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor={gradStops.inner} />
          <stop offset="50%" stopColor={gradStops.mid} />
          <stop offset="100%" stopColor={gradStops.outer} />
        </radialGradient>
      </defs>
      {showGlow && (
        <circle cx="12" cy="12" r="8" fill="#FCD34D" opacity={glowOpacity} />
      )}
      <circle cx="12" cy="12" r="5.5" fill="#F5C06A" />
      <circle cx="12" cy="12" r="5" fill={`url(#pg-${id})`} />
      <ellipse
        cx="10.2"
        cy="10"
        rx="1.8"
        ry="1.2"
        fill="#FFF8E8"
        opacity={highlightOpacity}
        transform="rotate(-20 10.2 10)"
      />
      {showSecondary && (
        <circle cx="13.8" cy="14" r="0.6" fill="#FFF8E8" opacity={0.4} />
      )}
    </svg>
  );
}

// --- Hourglass (Screentime Minutes) ---

export function Hourglass({ size = 24, dark = false, className = "" }) {
  const frameColor = dark ? "#AFA9EC" : "#6D28D9";
  const frameOpacity = dark ? 0.9 : 0.8;
  const sandOpacity = dark ? 0.7 : 0.6;
  const sandTopOpacity = 0.3;
  const dotColor = dark ? "#FCD34D" : "#D97706";
  const strokeWidth = size <= 20 ? 1.2 : 1.3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Screentime Minuten"
      role="img"
    >
      <rect x="6.5" y="2" width="11" height="2.5" rx="1" fill={frameColor} opacity={frameOpacity} />
      <rect x="6.5" y="19.5" width="11" height="2.5" rx="1" fill={frameColor} opacity={frameOpacity} />
      <path
        d="M8 4.5 L8 8.5 Q8 10.5 10.5 11.5 L11.2 12 L10.5 12.5 Q8 13.5 8 15.5 L8 19.5"
        fill="none" stroke={frameColor} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      <path
        d="M16 4.5 L16 8.5 Q16 10.5 13.5 11.5 L12.8 12 L13.5 12.5 Q16 13.5 16 15.5 L16 19.5"
        fill="none" stroke={frameColor} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      <path d="M9.2 17.5 Q9.5 16 10.8 15 L12 14.2 L13.2 15 Q14.5 16 14.8 17.5 Z" fill="#FCD34D" opacity={sandOpacity} />
      <path d="M9.2 6.5 Q9.5 8 10.8 9 L12 9.8 L13.2 9 Q14.5 8 14.8 6.5 Z" fill="#FCD34D" opacity={sandTopOpacity} />
      <circle cx="12" cy="12" r="0.6" fill={dotColor} />
    </svg>
  );
}

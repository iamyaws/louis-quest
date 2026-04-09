import React, { useMemo } from 'react';

const EGG_THEMES = {
  dragon: {
    base: "#EF4444",
    highlight: "#FCD34D",
    dark: "#B91C1C",
    glow: "#FF6B35",
    speckle: "#F97316",
  },
  wolf: {
    base: "#64748B",
    highlight: "#E2E8F0",
    dark: "#334155",
    glow: "#93C5FD",
    speckle: "#94A3B8",
  },
  phoenix: {
    base: "#F59E0B",
    highlight: "#FEF3C7",
    dark: "#B45309",
    glow: "#FCD34D",
    speckle: "#D97706",
  },
};

function getPatternElements(type) {
  if (type === "dragon") {
    // Flame-like speckles
    return (
      <>
        <circle cx="35" cy="40" r="3" opacity="0.4" />
        <circle cx="60" cy="55" r="2.5" opacity="0.35" />
        <circle cx="45" cy="70" r="3.5" opacity="0.3" />
        <circle cx="55" cy="35" r="2" opacity="0.45" />
        <path d="M38 60 Q40 55 42 60" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M55 45 Q57 40 59 45" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M30 75 Q33 70 36 75" strokeWidth="1.5" fill="none" opacity="0.25" />
      </>
    );
  }
  if (type === "wolf") {
    // Paw print marks
    return (
      <>
        <circle cx="38" cy="50" r="2.5" opacity="0.25" />
        <circle cx="35" cy="44" r="1.5" opacity="0.2" />
        <circle cx="41" cy="44" r="1.5" opacity="0.2" />
        <circle cx="33" cy="47" r="1.2" opacity="0.2" />
        <circle cx="43" cy="47" r="1.2" opacity="0.2" />

        <circle cx="60" cy="70" r="2.5" opacity="0.2" />
        <circle cx="57" cy="64" r="1.5" opacity="0.15" />
        <circle cx="63" cy="64" r="1.5" opacity="0.15" />
        <circle cx="55" cy="67" r="1.2" opacity="0.15" />
        <circle cx="65" cy="67" r="1.2" opacity="0.15" />
      </>
    );
  }
  // Phoenix: feather-like swirls
  return (
    <>
      <path d="M35 45 Q40 38 45 45 Q40 42 35 45Z" opacity="0.3" />
      <path d="M55 60 Q60 53 65 60 Q60 57 55 60Z" opacity="0.25" />
      <path d="M40 75 Q45 68 50 75 Q45 72 40 75Z" opacity="0.2" />
      <path d="M30 62 Q33 57 36 62" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M58 40 Q61 35 64 40" strokeWidth="1.5" fill="none" opacity="0.3" />
    </>
  );
}

function getCrackLines(progress) {
  if (progress < 25) return null;

  const cracks = [];

  if (progress >= 25) {
    // One small crack at top
    cracks.push(
      <path
        key="c1"
        d="M50 18 L48 28 L52 32"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (progress >= 50) {
    // Multiple cracks spreading
    cracks.push(
      <path
        key="c2"
        d="M48 28 L42 40 L38 48"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />,
      <path
        key="c3"
        d="M52 32 L58 42 L62 50"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />,
      // Light peeking through
      <line
        key="glow1"
        x1="42" y1="40"
        x2="44" y2="38"
        stroke="rgba(255,255,200,0.6)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  }

  if (progress >= 75) {
    // Heavy cracks
    cracks.push(
      <path
        key="c4"
        d="M38 48 L30 58 L28 68"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />,
      <path
        key="c5"
        d="M62 50 L68 60 L70 72"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />,
      <path
        key="c6"
        d="M42 40 L35 35 L30 38"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />,
      // Bright light shining through
      <line
        key="glow2"
        x1="58" y1="42"
        x2="60" y2="39"
        stroke="rgba(255,255,200,0.8)"
        strokeWidth="4"
        strokeLinecap="round"
      />,
      <line
        key="glow3"
        x1="30" y1="58"
        x2="33" y2="56"
        stroke="rgba(255,255,200,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  }

  return cracks;
}

function getParticles(progress, theme) {
  const count = Math.floor((progress / 100) * 8) + 1;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const radius = 52 + (i % 3) * 6;
    const cx = 50 + Math.cos((angle * Math.PI) / 180) * radius;
    const cy = 55 + Math.sin((angle * Math.PI) / 180) * radius * 0.7;
    const size = 1 + (progress / 100) * 2;
    const delay = i * 0.3;
    particles.push(
      <circle
        key={`p${i}`}
        cx={cx}
        cy={cy}
        r={size}
        fill={theme.glow}
        opacity={0.3 + (progress / 100) * 0.5}
      >
        <animate
          attributeName="cy"
          values={`${cy};${cy - 6};${cy}`}
          dur={`${1.5 + delay}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values={`${0.2 + (progress / 100) * 0.3};${0.5 + (progress / 100) * 0.4};${0.2 + (progress / 100) * 0.3}`}
          dur={`${1.5 + delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    );
  }
  return particles;
}

export default function Egg({ type = "dragon", progress = 0, size = 80 }) {
  const theme = EGG_THEMES[type] || EGG_THEMES.dragon;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const glowIntensity = clampedProgress / 100;
  const isReady = clampedProgress >= 100;

  const bobStyle = {
    animation: "eggBob 2.5s ease-in-out infinite",
    width: size,
    height: size * (130 / 100),
  };

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <style>{`
        @keyframes eggBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes eggFullGlow {
          0%, 100% { filter: drop-shadow(0 0 8px ${theme.glow}); }
          50% { filter: drop-shadow(0 0 18px ${theme.glow}); }
        }
      `}</style>
      <svg
        viewBox="0 0 100 130"
        style={{
          ...bobStyle,
          ...(isReady ? { animation: "eggBob 2.5s ease-in-out infinite, eggFullGlow 1.2s ease-in-out infinite" } : {}),
        }}
      >
        <defs>
          <radialGradient id={`eggGrad-${type}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={theme.highlight} stopOpacity="0.6" />
            <stop offset="50%" stopColor={theme.base} />
            <stop offset="100%" stopColor={theme.dark} />
          </radialGradient>
          {/* Gentle glow filter for low progress */}
          <filter id={`eggGlow-${type}`}>
            <feGaussianBlur stdDeviation={2 + glowIntensity * 4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base glow behind egg */}
        <ellipse
          cx="50" cy="65"
          rx={32 + glowIntensity * 8}
          ry={42 + glowIntensity * 8}
          fill={theme.glow}
          opacity={0.08 + glowIntensity * 0.2}
        />

        {/* Shadow */}
        <ellipse cx="50" cy="118" rx={22 - glowIntensity * 4} ry="5" fill="rgba(0,0,0,0.1)" />

        {/* Egg body */}
        <ellipse
          cx="50" cy="65"
          rx="32" ry="42"
          fill={`url(#eggGrad-${type})`}
          stroke={theme.dark}
          strokeWidth="1"
          filter={clampedProgress > 0 ? `url(#eggGlow-${type})` : undefined}
        />

        {/* Shine highlight */}
        <ellipse
          cx="40" cy="45"
          rx="10" ry="14"
          fill="white"
          opacity="0.15"
          transform="rotate(-15 40 45)"
        />

        {/* Pattern elements */}
        <g fill={theme.speckle} stroke={theme.speckle}>
          {getPatternElements(type)}
        </g>

        {/* Crack lines */}
        {getCrackLines(clampedProgress)}

        {/* Floating particles */}
        {getParticles(clampedProgress, theme)}
      </svg>
    </div>
  );
}

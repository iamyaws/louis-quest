import React from 'react';

export default function HeroSprite({ shape, color, eyes, hair, size: s, level, skinTone, hairColor }) {
  const sz = s || 140;
  const lvl = level || 1;
  const hasCape = lvl >= 5;
  const hasCrown = lvl >= 10;
  const hasGlow = lvl >= 15;

  const skin = skinTone || '#F5D0B0';
  const hColor = hairColor || '#5B3A1A';
  const outfit = color || '#4F8DFF';

  // Darken outfit color for pants
  const pantsColor = darkenHex(outfit, 0.3);

  return (
    <svg
      viewBox="0 0 100 140"
      width={sz}
      height={sz}
      style={{
        filter: hasGlow
          ? `drop-shadow(0 0 14px ${outfit}88)`
          : 'drop-shadow(0 3px 8px rgba(0,0,0,0.12))',
      }}
    >
      {/* === Cape (level 5+) === */}
      {hasCape && (
        <path
          d="M30 60 Q28 95 22 110 L50 100 L78 110 Q72 95 70 60"
          fill={outfit}
          opacity="0.3"
        />
      )}

      {/* === Legs === */}
      <rect x="35" y="100" width="11" height="20" rx="4" fill={pantsColor} />
      <rect x="54" y="100" width="11" height="20" rx="4" fill={pantsColor} />

      {/* === Feet === */}
      <ellipse cx="40" cy="121" rx="8" ry="4" fill="#4A4A5A" />
      <ellipse cx="60" cy="121" rx="8" ry="4" fill="#4A4A5A" />

      {/* === Body (torso / shirt) === */}
      <rect x="30" y="62" width="40" height="42" rx="10" fill={outfit} />
      {/* Shirt highlight */}
      <ellipse cx="44" cy="72" rx="10" ry="6" fill="white" opacity="0.12" transform="rotate(-15 44 72)" />

      {/* === Arms === */}
      <rect x="17" y="66" width="14" height="28" rx="7" fill={skin} />
      <rect x="69" y="66" width="14" height="28" rx="7" fill={skin} />

      {/* === Head === */}
      <circle cx="50" cy="36" r="26" fill={skin} />
      {/* Head highlight */}
      <ellipse cx="42" cy="28" rx="10" ry="6" fill="white" opacity="0.12" transform="rotate(-15 42 28)" />

      {/* === Hair === */}
      {hair === 'short' && (
        <path
          d="M25 32 Q26 14 50 12 Q74 14 75 32 L72 28 Q70 20 50 18 Q30 20 28 28 Z"
          fill={hColor}
        />
      )}
      {hair === 'spiky' && (
        <>
          <path d="M25 32 Q28 16 50 14 Q72 16 75 32" fill={hColor} />
          <polygon points="32,22 36,4 42,20" fill={hColor} />
          <polygon points="44,18 50,0 56,18" fill={hColor} />
          <polygon points="58,20 64,4 68,22" fill={hColor} />
        </>
      )}
      {hair === 'curly' && (
        <>
          <circle cx="30" cy="26" r="8" fill={hColor} />
          <circle cx="42" cy="18" r="9" fill={hColor} />
          <circle cx="58" cy="18" r="9" fill={hColor} />
          <circle cx="70" cy="26" r="8" fill={hColor} />
          <circle cx="50" cy="14" r="7" fill={hColor} />
        </>
      )}
      {hair === 'long' && (
        <>
          <path d="M24 32 Q24 14 50 12 Q76 14 76 32" fill={hColor} />
          <path d="M24 32 L20 62" stroke={hColor} strokeWidth="8" strokeLinecap="round" />
          <path d="M76 32 L80 62" stroke={hColor} strokeWidth="8" strokeLinecap="round" />
        </>
      )}
      {hair === 'cap' && (
        <>
          <ellipse cx="50" cy="24" rx="28" ry="14" fill="#1E293B" />
          <rect x="22" y="22" width="56" height="7" rx="3.5" fill="#1E293B" />
          <rect x="22" y="26" width="18" height="5" rx="2.5" fill="#1E293B" />
          <circle cx="50" cy="14" r="3.5" fill="white" />
        </>
      )}

      {/* === Face === */}
      {/* Eyes */}
      {eyes === 'round' && (
        <>
          <circle cx="40" cy="36" r="5.5" fill="white" />
          <circle cx="60" cy="36" r="5.5" fill="white" />
          <circle cx="41.5" cy="35.5" r="3" fill="#1E1B4B" />
          <circle cx="61.5" cy="35.5" r="3" fill="#1E1B4B" />
          <circle cx="43" cy="34" r="1.2" fill="white" />
          <circle cx="63" cy="34" r="1.2" fill="white" />
        </>
      )}
      {eyes === 'happy' && (
        <>
          <path d="M35 36 Q40 30 45 36" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 36 Q60 30 65 36" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {eyes === 'cool' && (
        <>
          {/* Sunglasses */}
          <rect x="33" y="33" width="14" height="7" rx="3" fill="#1E1B4B" />
          <rect x="53" y="33" width="14" height="7" rx="3" fill="#1E1B4B" />
          <line x1="47" y1="36" x2="53" y2="36" stroke="#1E1B4B" strokeWidth="1.5" />
          {/* Lens shine */}
          <rect x="35" y="34.5" width="4" height="2" rx="1" fill="white" opacity="0.3" />
          <rect x="55" y="34.5" width="4" height="2" rx="1" fill="white" opacity="0.3" />
        </>
      )}
      {eyes === 'big' && (
        <>
          <circle cx="40" cy="36" r="7" fill="white" />
          <circle cx="60" cy="36" r="7" fill="white" />
          <circle cx="42" cy="35.5" r="4" fill="#1E1B4B" />
          <circle cx="62" cy="35.5" r="4" fill="#1E1B4B" />
          <circle cx="44" cy="33" r="1.8" fill="white" />
          <circle cx="64" cy="33" r="1.8" fill="white" />
        </>
      )}
      {/* Default eyes if none specified */}
      {!eyes && (
        <>
          <circle cx="40" cy="36" r="5.5" fill="white" />
          <circle cx="60" cy="36" r="5.5" fill="white" />
          <circle cx="41.5" cy="35.5" r="3" fill="#1E1B4B" />
          <circle cx="61.5" cy="35.5" r="3" fill="#1E1B4B" />
          <circle cx="43" cy="34" r="1.2" fill="white" />
          <circle cx="63" cy="34" r="1.2" fill="white" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="50" cy="42" rx="1.8" ry="1.5" fill={darkenHex(skin, 0.15)} />

      {/* Mouth */}
      {eyes === 'happy' ? (
        <path d="M44 47 Q50 53 56 47" stroke="#1E1B4B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M45 47 Q50 51 55 47" stroke="#1E1B4B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}

      {/* Blush cheeks */}
      <circle cx="32" cy="42" r="4" fill="#FF9999" opacity="0.25" />
      <circle cx="68" cy="42" r="4" fill="#FF9999" opacity="0.25" />

      {/* === Crown (level 10+) === */}
      {hasCrown && (
        <g transform="translate(50, 8)">
          <polygon
            points="-12,8 -8,-3 -4,4 0,-10 4,4 8,-3 12,8"
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />
        </g>
      )}
    </svg>
  );
}

/**
 * Darken a hex color by a given factor (0-1).
 */
function darkenHex(hex, factor) {
  try {
    const h = hex.replace('#', '');
    const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - factor)));
    const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - factor)));
    const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - factor)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return hex;
  }
}

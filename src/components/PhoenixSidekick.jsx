import React from 'react';
import { PHOENIX_VARIANTS } from '../constants';

const FALLBACK = { col: "#F59E0B", chest: "#FEF3C7", wing: "#DC2626", tail: "#EF4444", glow: "#FCD34D" };

/* ------------------------------------------------------------------ */
/*  Mood overlays shared across all stages                            */
/* ------------------------------------------------------------------ */

function Eyes({ mood, sc, cx1, cy1, cx2, cy2, r = 4.5, ry }) {
  const eyeRy = ry || r;
  if (mood === "sleepy") {
    return <>
      <line x1={cx1 - r} y1={cy1} x2={cx1 + r} y2={cy1} stroke={sc} strokeWidth="2" strokeLinecap="round" />
      <line x1={cx2 - r} y1={cy2} x2={cx2 + r} y2={cy2} stroke={sc} strokeWidth="2" strokeLinecap="round" />
    </>;
  }
  if (mood === "happy" || mood === "excited") {
    return <>
      <path d={`M${cx1 - r} ${cy1 + 2} Q${cx1} ${cy1 - 3} ${cx1 + r} ${cy1 + 2}`} stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={`M${cx2 - r} ${cy2 + 2} Q${cx2} ${cy2 - 3} ${cx2 + r} ${cy2 + 2}`} stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>;
  }
  /* neutral */
  return <>
    <ellipse cx={cx1} cy={cy1} rx={r} ry={eyeRy} fill="white" />
    <ellipse cx={cx2} cy={cy2} rx={r} ry={eyeRy} fill="white" />
    <ellipse cx={cx1} cy={cy1} rx={r * 0.55} ry={eyeRy * 0.7} fill={sc} />
    <ellipse cx={cx2} cy={cy2} rx={r * 0.55} ry={eyeRy * 0.7} fill={sc} />
    <circle cx={cx1 + 1.5} cy={cy1 - 1.5} r={1.2} fill="white" />
    <circle cx={cx2 + 1.5} cy={cy2 - 1.5} r={1.2} fill="white" />
  </>;
}

function Blush({ mood, cx1, cy1, cx2, cy2 }) {
  if (mood !== "happy" && mood !== "excited") return null;
  const op = mood === "excited" ? 0.55 : 0.35;
  return <>
    <ellipse cx={cx1} cy={cy1} rx={5} ry={3} fill="#FDA4AF" opacity={op} />
    <ellipse cx={cx2} cy={cy2} rx={5} ry={3} fill="#FDA4AF" opacity={op} />
  </>;
}

function SleepyZ() {
  return <>
    <text x="88" y="44" fontSize="12" opacity="0.5" fill="#F97316">z</text>
    <text x="96" y="34" fontSize="10" opacity="0.35" fill="#F97316">z</text>
    <text x="102" y="26" fontSize="8" opacity="0.2" fill="#F97316">z</text>
  </>;
}

function Sparkles() {
  return <>
    <text x="22" y="38" fontSize="9">{"\u2728"}</text>
    <text x="88" y="34" fontSize="9">{"\u2B50"}</text>
  </>;
}

/* ------------------------------------------------------------------ */
/*  Floating ember particles                                          */
/* ------------------------------------------------------------------ */

function Embers({ stage, c }) {
  if (stage < 2) return null;
  return <>
    <circle cx="24" cy="50" r="2" fill="#F97316" opacity="0.7">
      <animate attributeName="cy" values="50;42;50" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="96" cy="46" r="1.5" fill="#EF4444" opacity="0.6">
      <animate attributeName="cy" values="46;38;46" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3s" repeatCount="indefinite" />
    </circle>
    {stage >= 3 && <>
      <circle cx="34" cy="36" r="1.8" fill="#FCD34D" opacity="0.5">
        <animate attributeName="cy" values="36;28;36" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="86" cy="30" r="1.4" fill={c.tail} opacity="0.4">
        <animate attributeName="cy" values="30;22;30" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite" />
      </circle>
    </>}
    {stage >= 4 && <>
      <circle cx="18" cy="22" r="2.2" fill="#FDE68A" opacity="0.5">
        <animate attributeName="cy" values="22;12;22" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="102" cy="18" r="1.6" fill="#FBBF24" opacity="0.45">
        <animate attributeName="cy" values="18;8;18" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0.12;0.45" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="14" r="1.8" fill="#F97316" opacity="0.4">
        <animate attributeName="cy" values="14;4;14" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="44" cy="26" r="1.2" fill="#FCD34D" opacity="0.35">
        <animate attributeName="cy" values="26;16;26" dur="3.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="76" cy="20" r="1.4" fill="#EF4444" opacity="0.4">
        <animate attributeName="cy" values="20;10;20" dur="3.3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.9s" repeatCount="indefinite" />
      </circle>
    </>}
  </>;
}

/* ================================================================== */
/*  STAGE 0 -- Chick (Baby)                                           */
/*  Tiny fluffy ball. Oversized head. No visible wings. Ember glow.   */
/* ================================================================== */

function ChickPhoenix({ c, mood, sc }) {
  return <g>
    {/* Warm ember glow around body */}
    <ellipse cx="60" cy="92" rx="32" ry="28" fill={c.glow} opacity="0.12" />

    {/* Two tiny feet poking out below */}
    <g stroke={c.wing} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M52 118 L50 126 M52 118 L54 126" />
      <path d="M68 118 L66 126 M68 118 L70 126" />
    </g>

    {/* Tiny fluffy ball body -- round, no distinct shape */}
    <ellipse cx="60" cy="100" rx="20" ry="18" fill={c.col} />
    {/* Fluffy texture -- overlapping circles for puffiness */}
    <circle cx="50" cy="96" r="8" fill={c.col} />
    <circle cx="70" cy="96" r="8" fill={c.col} />
    <circle cx="55" cy="106" r="7" fill={c.col} />
    <circle cx="65" cy="106" r="7" fill={c.col} />
    {/* Chest fluff patch */}
    <ellipse cx="60" cy="102" rx="10" ry="9" fill={c.chest} opacity="0.5" />

    {/* Oversized round head */}
    <circle cx="60" cy="68" r="22" fill={c.col} />
    {/* Fluffy head texture */}
    <circle cx="48" cy="62" r="6" fill={c.col} />
    <circle cx="72" cy="62" r="6" fill={c.col} />
    <circle cx="60" cy="54" r="5" fill={c.col} />

    {/* Tiny beak -- small triangle */}
    <polygon points="57,76 60,82 63,76" fill="#F97316" />

    {/* Small dot eyes -- big and innocent */}
    <Eyes mood={mood} sc={sc} cx1={51} cy1={65} cx2={69} cy2={65} r={5} ry={5.5} />
    <Blush mood={mood} cx1={43} cy1={72} cx2={77} cy2={72} />

    {/* Mouth hint */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M56 78 Q60 81 64 78" stroke={sc} strokeWidth="1" fill="none" strokeLinecap="round" />
      : null
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 1 -- Fledgling                                              */
/*  Teardrop body. Small folded wings. Short tail plumes. Defined beak*/
/* ================================================================== */

function FledglingPhoenix({ c, mood, sc, vid }) {
  return <g>
    {/* Soft glow */}
    <ellipse cx="60" cy="88" rx="36" ry="32" fill={c.glow} opacity="0.15" />

    {/* Tail feathers -- 2-3 short plumes */}
    <g transform="translate(60, 108)">
      <path d="M0 0 Q-3 10 1 20 Q3 16 0 0" fill={c.tail} opacity="0.8" />
      <path d="M-5 0 Q-10 8 -7 18 Q-5 14 -5 0" fill={c.tail} opacity="0.6" />
      <path d="M5 0 Q10 8 7 18 Q5 14 5 0" fill={c.tail} opacity="0.6" />
    </g>

    {/* Feet -- slightly bigger, with toes */}
    <g stroke={c.wing} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M50 118 L46 128 M50 118 L50 128 M50 118 L54 128" />
      <path d="M70 118 L66 128 M70 118 L70 128 M70 118 L74 128" />
    </g>

    {/* Teardrop body -- narrower at top, wider at bottom */}
    <path d="M40 82 Q38 100 44 116 Q52 122 60 122 Q68 122 76 116 Q82 100 80 82 Q72 74 60 74 Q48 74 40 82 Z" fill={c.col} />
    {/* Chest patch */}
    <ellipse cx="60" cy="100" rx="12" ry="13" fill={c.chest} opacity="0.5" />

    {/* Small folded wings on sides */}
    <path d="M38 88 Q28 82 26 76 Q30 80 36 84" fill={c.wing} opacity="0.8" />
    <path d="M36 86 Q30 82 28 78" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M82 88 Q92 82 94 76 Q90 80 84 84" fill={c.wing} opacity="0.8" />
    <path d="M84 86 Q90 82 92 78" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />

    {/* Head -- round, bird shape emerging */}
    <circle cx="60" cy="60" r="20" fill={c.col} />

    {/* More defined beak */}
    <polygon points="55,70 60,78 65,70" fill="#F97316" />
    <line x1="57" y1="73" x2="63" y2="73" stroke="#EA580C" strokeWidth="0.6" opacity="0.4" />

    {/* Eyes -- larger with pupils */}
    <Eyes mood={mood} sc={sc} cx1={51} cy1={57} cx2={69} cy2={57} r={5} ry={5.5} />
    <Blush mood={mood} cx1={43} cy1={64} cx2={77} cy2={64} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M56 72 Q60 75 64 72" stroke={sc} strokeWidth="1" fill="none" strokeLinecap="round" />
      : null
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 2 -- Young Phoenix                                          */
/*  Full wings slightly raised. Flame tail plumes. Head crest emerges.*/
/*  Athletic body. Ember particles float around.                      */
/* ================================================================== */

function YoungPhoenix({ c, mood, sc, vid }) {
  return <g>
    {/* Intensified glow */}
    <ellipse cx="60" cy="84" rx="40" ry="36" fill={c.glow} opacity="0.15" />

    {/* Tail feathers -- 3-4 flame-shaped plumes, longer */}
    <g transform="translate(60, 106)">
      <path d="M0 0 Q-4 14 2 30 Q4 22 0 0" fill={c.tail} opacity="0.85">
        <animate attributeName="d" values="M0 0 Q-4 14 2 30 Q4 22 0 0;M0 0 Q-3 14 1 28 Q3 22 0 0;M0 0 Q-4 14 2 30 Q4 22 0 0" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M-6 0 Q-14 12 -10 28 Q-7 20 -6 0" fill={c.tail} opacity="0.65" />
      <path d="M6 0 Q14 12 10 28 Q7 20 6 0" fill={c.tail} opacity="0.65" />
      <path d="M-3 2 Q-8 16 -4 24 Q-2 18 -3 2" fill={c.wing} opacity="0.4" />
    </g>

    {/* Feet -- defined claws */}
    <g stroke={c.col} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M48 118 L44 128 M48 118 L48 128 M48 118 L52 128" />
      <path d="M72 118 L68 128 M72 118 L72 128 M72 118 L76 128" />
    </g>

    {/* Athletic sleek body */}
    <path d="M38 78 Q34 96 40 116 Q50 124 60 124 Q70 124 80 116 Q86 96 82 78 Q74 68 60 68 Q46 68 38 78 Z" fill={c.col} />
    {/* Feather texture lines */}
    {[82, 88, 94, 100, 106, 112].map((y, i) =>
      <path key={i}
        d={`M${44 + (i % 2)} ${y} Q60 ${y - 3} ${76 - (i % 2)} ${y}`}
        stroke={c.chest} strokeWidth="0.6" fill="none" opacity="0.3" />
    )}
    {/* Chest patch */}
    <ellipse cx="60" cy="96" rx="14" ry="16" fill={c.chest} opacity="0.5" />

    {/* Wings -- fully formed, slightly raised */}
    <path d="M36 84 Q20 72 16 60 Q14 52 18 48 Q22 56 28 66 Q24 58 22 50 Q28 60 34 74"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    <path d="M30 70 Q22 62 20 54" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M84 84 Q100 72 104 60 Q106 52 102 48 Q98 56 92 66 Q96 58 98 50 Q92 60 86 74"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    <path d="M90 70 Q98 62 100 54" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />

    {/* Head */}
    <circle cx="60" cy="54" r="20" fill={c.col} />

    {/* Small crown of fire -- crest feathers emerge */}
    <path d="M54 36 Q52 28 56 26 Q57 32 56 36" fill={c.tail} opacity="0.7" />
    <path d="M60 34 Q60 24 62 22 Q63 28 62 34" fill={c.tail} opacity="0.8" />
    <path d="M66 36 Q68 28 64 26 Q63 32 64 36" fill={c.tail} opacity="0.7" />

    {/* Beak -- defined, athletic bird */}
    <polygon points="55,64 60,72 65,64" fill="#F97316" />
    <line x1="56" y1="67" x2="64" y2="67" stroke="#EA580C" strokeWidth="0.7" opacity="0.5" />

    {/* Confident eyes */}
    <Eyes mood={mood} sc={sc} cx1={51} cy1={51} cx2={69} cy2={51} r={5} ry={5} />
    <Blush mood={mood} cx1={42} cy1={58} cx2={78} cy2={58} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M55 66 Q60 69 65 66" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      : <line x1="56" y1="66" x2="64" y2="66" stroke={sc} strokeWidth="0.8" opacity="0.3" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 3 -- Phoenix (Full)                                         */
/*  Full wingspan spread. Long flame tail. Elaborate head crest.      */
/*  Majestic proportions. Fiery aura. Iridescent quality.             */
/* ================================================================== */

function FullPhoenix({ c, mood, sc, vid }) {
  return <g>
    {/* Fiery aura */}
    <ellipse cx="60" cy="80" rx="48" ry="44" fill={c.glow} opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.1;0.15" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* Long flowing tail feathers -- 5+ flame plumes with gradient */}
    <defs>
      <linearGradient id={`tail-grad-${vid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c.tail} stopOpacity="1" />
        <stop offset="60%" stopColor={c.wing} stopOpacity="0.8" />
        <stop offset="100%" stopColor={c.glow} stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <g transform="translate(60, 108)">
      {/* Center plume */}
      <path d={`M0 0 Q-5 18 2 40 Q5 30 0 0`} fill={`url(#tail-grad-${vid})`} opacity="0.9">
        <animate attributeName="d" values="M0 0 Q-5 18 2 40 Q5 30 0 0;M0 0 Q-3 18 0 38 Q3 30 0 0;M0 0 Q-5 18 2 40 Q5 30 0 0" dur="3s" repeatCount="indefinite" />
      </path>
      {/* Left plumes */}
      <path d="M-5 0 Q-16 14 -12 36 Q-8 26 -5 0" fill={c.tail} opacity="0.7" />
      <path d="M-8 2 Q-22 12 -18 32 Q-14 22 -8 2" fill={c.tail} opacity="0.5" />
      {/* Right plumes */}
      <path d="M5 0 Q16 14 12 36 Q8 26 5 0" fill={c.tail} opacity="0.7" />
      <path d="M8 2 Q22 12 18 32 Q14 22 8 2" fill={c.tail} opacity="0.5" />
      {/* Inner glow strands */}
      <path d="M-2 4 Q-6 18 -2 30" stroke={c.glow} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M2 4 Q6 18 2 30" stroke={c.glow} strokeWidth="0.8" fill="none" opacity="0.4" />
    </g>

    {/* Feet -- elegant talons */}
    <g stroke={c.col} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M48 118 L44 128 M48 118 L48 128 M48 118 L52 128" />
      <path d="M72 118 L68 128 M72 118 L72 128 M72 118 L76 128" />
    </g>

    {/* Majestic body -- larger proportions */}
    <path d="M34 74 Q28 94 36 116 Q48 126 60 126 Q72 126 84 116 Q92 94 86 74 Q76 62 60 62 Q44 62 34 74 Z" fill={c.col} />
    {/* Iridescent shimmer overlay */}
    <path d="M34 74 Q28 94 36 116 Q48 126 60 126 Q72 126 84 116 Q92 94 86 74 Q76 62 60 62 Q44 62 34 74 Z"
      fill="white" opacity="0.06">
      <animate attributeName="opacity" values="0.04;0.08;0.04" dur="4s" repeatCount="indefinite" />
    </path>
    {/* Feather pattern */}
    {[76, 84, 92, 100, 108].map((y, i) =>
      <path key={i}
        d={`M${40 + (i % 2) * 2} ${y} Q60 ${y - 4} ${80 - (i % 2) * 2} ${y}`}
        stroke={c.chest} strokeWidth="0.7" fill="none" opacity="0.3" />
    )}
    {/* Chest */}
    <ellipse cx="60" cy="94" rx="16" ry="18" fill={c.chest} opacity="0.5" />

    {/* Wings -- full wingspan visible, spread wide */}
    {/* Left wing */}
    <path d="M34 78 Q14 62 6 46 Q2 36 6 30 Q12 42 20 56 Q14 42 10 30 Q18 44 26 58 Q20 46 18 36 Q26 50 32 66"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    {/* Wing feather details */}
    <path d="M24 56 Q16 46 12 36" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M28 62 Q20 52 16 42" fill="none" stroke={c.chest} strokeWidth="0.6" opacity="0.25" />
    {/* Right wing */}
    <path d="M86 78 Q106 62 114 46 Q118 36 114 30 Q108 42 100 56 Q106 42 110 30 Q102 44 94 58 Q100 46 102 36 Q94 50 88 66"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    <path d="M96 56 Q104 46 108 36" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M92 62 Q100 52 104 42" fill="none" stroke={c.chest} strokeWidth="0.6" opacity="0.25" />

    {/* Head -- majestic */}
    <circle cx="60" cy="48" r="21" fill={c.col} />

    {/* Elaborate head crest -- 3 flame feathers */}
    <path d="M50 30 Q46 16 52 10 Q54 20 54 30" fill={c.tail} opacity="0.8" />
    <path d="M58 28 Q56 10 62 4 Q64 16 62 28" fill={c.tail} opacity="0.9" />
    <path d="M66 30 Q70 16 64 10 Q62 20 62 30" fill={c.tail} opacity="0.8" />
    {/* Feather glow tips */}
    <circle cx="52" cy="12" r="2" fill={c.glow} opacity="0.5" />
    <circle cx="62" cy="6" r="2.5" fill={c.glow} opacity="0.6" />
    <circle cx="64" cy="12" r="2" fill={c.glow} opacity="0.5" />

    {/* Beak -- refined */}
    <polygon points="55,58 60,66 65,58" fill="#F97316" />
    <line x1="56" y1="61" x2="64" y2="61" stroke="#EA580C" strokeWidth="0.8" opacity="0.5" />

    {/* Proud majestic eyes */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={44} cx2={70} cy2={44} r={5.5} ry={6} />
    <Blush mood={mood} cx1={41} cy1={52} cx2={79} cy2={52} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M55 60 Q60 64 65 60" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      : <path d="M56 60 Q60 62 64 60" stroke={sc} strokeWidth="0.8" fill="none" opacity="0.35" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 4 -- Legendary Phoenix                                      */
/*  Maximum grandeur, fills SVG. Wings fully spread with flame tips.  */
/*  Cascade fire tail. Radiant fire crown. Solar disc. Inner glow.    */
/*  Golden + red gradient aura. Embers drift upward constantly.       */
/* ================================================================== */

function LegendaryPhoenix({ c, mood, sc, vid }) {
  return <g>
    <defs>
      {/* Iridescent body shimmer */}
      <linearGradient id={`legend-shimmer-${vid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c.col} stopOpacity="1" />
        <stop offset="40%" stopColor="white" stopOpacity="0.15">
          <animate attributeName="offset" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={c.col} stopOpacity="1" />
      </linearGradient>
      {/* Golden + red gradient aura */}
      <radialGradient id={`legend-aura-${vid}`} cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.3" />
        <stop offset="50%" stopColor={c.tail} stopOpacity="0.12" />
        <stop offset="100%" stopColor={c.tail} stopOpacity="0" />
      </radialGradient>
      {/* Tail fire gradient */}
      <linearGradient id={`legend-tail-${vid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c.tail} stopOpacity="1" />
        <stop offset="40%" stopColor={c.wing} stopOpacity="0.9" />
        <stop offset="70%" stopColor="#FCD34D" stopOpacity="0.6" />
        <stop offset="100%" stopColor={c.glow} stopOpacity="0.2" />
      </linearGradient>
    </defs>

    {/* Golden + red gradient aura -- pulsing */}
    <ellipse cx="60" cy="70" rx="58" ry="60" fill={`url(#legend-aura-${vid})`}>
      <animate attributeName="rx" values="56;60;56" dur="3s" repeatCount="indefinite" />
      <animate attributeName="ry" values="58;62;58" dur="3s" repeatCount="indefinite" />
    </ellipse>
    {/* Secondary aura ring */}
    <ellipse cx="60" cy="70" rx="52" ry="50" fill="none" stroke={c.glow} strokeWidth="1.5" opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.08;0.15" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="rx" values="52;56;52" dur="2.5s" repeatCount="indefinite" />
    </ellipse>

    {/* Solar disc / sun above head */}
    <circle cx="60" cy="10" r="10" fill={c.glow} opacity="0.3">
      <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2s" repeatCount="indefinite" />
      <animate attributeName="r" values="9;11;9" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Sun rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = angle * Math.PI / 180;
      const x1 = 60 + Math.cos(rad) * 12;
      const y1 = 10 + Math.sin(rad) * 12;
      const x2 = 60 + Math.cos(rad) * 17;
      const y2 = 10 + Math.sin(rad) * 17;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={c.glow} strokeWidth="1.2" strokeLinecap="round" opacity="0.25">
        <animate attributeName="opacity" values="0.2;0.35;0.2" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
      </line>;
    })}

    {/* Cascade fire tail -- long flowing flame shapes */}
    <g transform="translate(60, 106)">
      {/* Central fire cascade */}
      <path d="M0 0 Q-6 22 3 50 Q6 36 0 0" fill={`url(#legend-tail-${vid})`} opacity="0.9">
        <animate attributeName="d" values="M0 0 Q-6 22 3 50 Q6 36 0 0;M0 0 Q-4 22 1 48 Q4 36 0 0;M0 0 Q-6 22 3 50 Q6 36 0 0" dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Outer left plumes */}
      <path d="M-6 0 Q-20 16 -16 44 Q-10 30 -6 0" fill={c.tail} opacity="0.7">
        <animate attributeName="d" values="M-6 0 Q-20 16 -16 44 Q-10 30 -6 0;M-6 0 Q-18 16 -14 42 Q-10 30 -6 0;M-6 0 Q-20 16 -16 44 Q-10 30 -6 0" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M-10 2 Q-26 14 -22 38 Q-16 24 -10 2" fill={c.tail} opacity="0.5" />
      {/* Outer right plumes */}
      <path d="M6 0 Q20 16 16 44 Q10 30 6 0" fill={c.tail} opacity="0.7">
        <animate attributeName="d" values="M6 0 Q20 16 16 44 Q10 30 6 0;M6 0 Q18 16 14 42 Q10 30 6 0;M6 0 Q20 16 16 44 Q10 30 6 0" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M10 2 Q26 14 22 38 Q16 24 10 2" fill={c.tail} opacity="0.5" />
      {/* Inner glow strands */}
      <path d="M-3 6 Q-8 22 -4 38" stroke={c.glow} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M3 6 Q8 22 4 38" stroke={c.glow} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M0 8 Q-2 24 1 40" stroke={c.glow} strokeWidth="0.6" fill="none" opacity="0.35" />
    </g>

    {/* Feet -- regal talons */}
    <g stroke={c.col} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <path d="M46 118 L42 128 M46 118 L46 128 M46 118 L50 128" />
      <path d="M74 118 L70 128 M74 118 L74 128 M74 118 L78 128" />
    </g>

    {/* Maximum body -- fills the space */}
    <path d="M30 72 Q22 92 32 116 Q46 128 60 128 Q74 128 88 116 Q98 92 90 72 Q78 58 60 58 Q42 58 30 72 Z"
      fill={`url(#legend-shimmer-${vid})`} stroke={c.col} strokeWidth="0.5" />
    {/* Inner glow on body */}
    <ellipse cx="60" cy="92" rx="20" ry="22" fill={c.glow} opacity="0.1">
      <animate attributeName="opacity" values="0.08;0.14;0.08" dur="2s" repeatCount="indefinite" />
    </ellipse>
    {/* Feather scale pattern */}
    {[74, 82, 90, 98, 106, 114].map((y, i) =>
      <path key={i}
        d={`M${36 + (i % 2) * 2} ${y} Q60 ${y - 5} ${84 - (i % 2) * 2} ${y}`}
        stroke={c.chest} strokeWidth="0.8" fill="none" opacity="0.3" />
    )}
    {/* Chest */}
    <ellipse cx="60" cy="92" rx="18" ry="20" fill={c.chest} opacity="0.5" />

    {/* Wings fully spread with flame tips */}
    {/* Left wing -- large, spread wide */}
    <path d="M30 74 Q8 56 0 38 Q-4 26 2 20 Q8 32 16 48 Q8 32 4 18 Q14 34 22 50 Q16 36 12 24 Q22 40 28 56 Q22 44 20 34 Q28 48 32 64"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    {/* Flame tips on left wing */}
    <path d="M2 20 Q-2 12 4 8 Q6 14 2 20" fill={c.tail} opacity="0.6" />
    <path d="M4 18 Q0 10 6 6 Q8 12 4 18" fill={c.glow} opacity="0.3" />
    {/* Left wing feather lines */}
    <path d="M20 50 Q12 40 6 28" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M24 56 Q16 46 10 34" fill="none" stroke={c.chest} strokeWidth="0.6" opacity="0.25" />

    {/* Right wing -- large, spread wide */}
    <path d="M90 74 Q112 56 120 38 Q124 26 118 20 Q112 32 104 48 Q112 32 116 18 Q106 34 98 50 Q104 36 108 24 Q98 40 92 56 Q98 44 100 34 Q92 48 88 64"
      fill={c.wing} stroke={c.wing} strokeWidth="0.5" opacity="0.85" />
    {/* Flame tips on right wing */}
    <path d="M118 20 Q122 12 116 8 Q114 14 118 20" fill={c.tail} opacity="0.6" />
    <path d="M116 18 Q120 10 114 6 Q112 12 116 18" fill={c.glow} opacity="0.3" />
    {/* Right wing feather lines */}
    <path d="M100 50 Q108 40 114 28" fill="none" stroke={c.chest} strokeWidth="0.8" opacity="0.3" />
    <path d="M96 56 Q104 46 110 34" fill="none" stroke={c.chest} strokeWidth="0.6" opacity="0.25" />

    {/* Head -- large, powerful, glowing */}
    <circle cx="60" cy="42" r="22" fill={c.col} />
    {/* Inner glow on head */}
    <circle cx="60" cy="42" r="22" fill={`url(#legend-shimmer-${vid})`} opacity="0.3" />

    {/* Radiant crown of fire feathers -- 5 flame feathers */}
    <path d="M46 24 Q42 8 48 2 Q50 14 50 24" fill={c.tail} opacity="0.85" />
    <path d="M52 22 Q48 4 54 -2 Q56 10 55 22" fill={c.tail} opacity="0.9" />
    <path d="M58 20 Q56 0 62 -6 Q64 8 62 20" fill={c.tail} opacity="0.95" />
    <path d="M64 22 Q68 4 62 -2 Q60 10 61 22" fill={c.tail} opacity="0.9" />
    <path d="M70 24 Q74 8 68 2 Q66 14 66 24" fill={c.tail} opacity="0.85" />
    {/* Crown glow tips */}
    <circle cx="48" cy="4" r="2.5" fill={c.glow} opacity="0.6">
      <animate attributeName="opacity" values="0.5;0.7;0.5" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="54" cy="0" r="2" fill={c.glow} opacity="0.55" />
    <circle cx="62" cy="-4" r="3" fill={c.glow} opacity="0.7">
      <animate attributeName="opacity" values="0.6;0.8;0.6" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="62" cy="-2" r="2" fill={c.glow} opacity="0.55" />
    <circle cx="68" cy="4" r="2.5" fill={c.glow} opacity="0.6">
      <animate attributeName="opacity" values="0.5;0.7;0.5" dur="2.2s" repeatCount="indefinite" />
    </circle>

    {/* Beak -- regal, sharp */}
    <polygon points="54,52 60,62 66,52" fill="#F97316" />
    <line x1="55" y1="56" x2="65" y2="56" stroke="#EA580C" strokeWidth="0.8" opacity="0.5" />

    {/* Large wise eyes */}
    <Eyes mood={mood} sc={sc} cx1={49} cy1={38} cx2={71} cy2={38} r={6} ry={6.5} />
    <Blush mood={mood} cx1={39} cy1={46} cx2={81} cy2={46} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M54 54 Q60 58 66 54" stroke={sc} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      : <path d="M55 54 Q60 56 65 54" stroke={sc} strokeWidth="1" fill="none" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  Main component                                                    */
/* ================================================================== */

export default function PhoenixSidekick({ variant, mood, size: s, stage, gear }) {
  const c = (typeof PHOENIX_VARIANTS !== 'undefined' && PHOENIX_VARIANTS[variant]) || FALLBACK;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 4;
  const sc = "#1E1B4B";
  const vid = variant || "default";

  /* Build filter string */
  let filter = `drop-shadow(0 4px 8px ${c.glow}33)`;
  if (stg >= 4) filter += ` drop-shadow(0 0 14px ${c.glow}90)`;
  else if (stg >= 3) filter += ` drop-shadow(0 0 8px ${c.glow}60)`;
  else if (stg >= 2) filter += ` drop-shadow(0 0 5px ${c.glow}40)`;

  return (
    <svg
      viewBox="0 0 120 140"
      width={sz}
      height={sz * 1.17}
      style={{ filter }}
    >
      {/* Stage-specific phoenix body */}
      {stg >= 4 ? <LegendaryPhoenix c={c} mood={mood} sc={sc} vid={vid} />
        : stg >= 3 ? <FullPhoenix c={c} mood={mood} sc={sc} vid={vid} />
        : stg >= 2 ? <YoungPhoenix c={c} mood={mood} sc={sc} vid={vid} />
        : stg >= 1 ? <FledglingPhoenix c={c} mood={mood} sc={sc} vid={vid} />
        : <ChickPhoenix c={c} mood={mood} sc={sc} />
      }

      {/* ── Equipped Gear Overlays ── */}
      {gear?.head === "c_crown" && (
        <g>
          <polygon points="46,22 50,12 54,20 58,8 62,20 66,12 70,22" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="58" cy="14" r="2.5" fill="#EF4444" />
          <circle cx="50" cy="18" r="1.5" fill="#3B82F6" />
          <circle cx="66" cy="18" r="1.5" fill="#34D399" />
        </g>
      )}
      {gear?.head === "h_headband" && (
        <g>
          <path d="M36 50 Q60 42 84 50" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="48" r="3" fill="#EF4444" />
        </g>
      )}
      {gear?.head === "h_sunglasses" && (
        <g>
          <rect x="40" y="48" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <rect x="64" y="48" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <line x1="54" y1="52" x2="64" y2="52" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="52" x2="34" y2="48" stroke="#1E293B" strokeWidth="1.5" />
          <line x1="78" y1="52" x2="84" y2="48" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      )}
      {gear?.body === "h_cape_red" && (
        <g>
          <path d="M34 70 Q22 90 18 118 Q28 114 38 118 L44 88 Z" fill="#DC2626" opacity="0.8" />
          <path d="M86 70 Q98 90 102 118 Q92 114 82 118 L76 88 Z" fill="#DC2626" opacity="0.8" />
        </g>
      )}
      {gear?.body === "c_scarf" && (
        <g>
          <path d="M38 70 Q60 76 82 70" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M42 72 L38 90" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M40 90 L44 82" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {gear?.body === "c_bowtie" && (
        <g>
          <polygon points="50,70 58,66 58,74" fill="#EC4899" />
          <polygon points="66,70 58,66 58,74" fill="#EC4899" />
          <circle cx="58" cy="70" r="3" fill="#DB2777" />
        </g>
      )}
      {gear?.accessory === "h_wings" && (
        <g>
          <path d="M26 80 Q6 60 0 40 Q10 56 20 68 Q8 50 4 34 Q16 54 26 70" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
          <path d="M94 80 Q114 60 120 40 Q110 56 100 68 Q112 50 116 34 Q104 54 94 70" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
        </g>
      )}
      {gear?.accessory === "c_collar" && (
        <g>
          <ellipse cx="60" cy="72" rx="20" ry="4" fill="none" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="60" cy="76" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        </g>
      )}

      {/* Shared overlays */}
      <Embers stage={stg} c={c} />
      {mood === "sleepy" && <SleepyZ />}
      {mood === "excited" && <Sparkles />}
    </svg>
  );
}

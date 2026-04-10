import React from 'react';
import { DRAGON_VARIANTS } from '../constants';

const FALLBACK = { col: "#EF4444", belly: "#FEE2E2", wing: "#DC2626", horn: "#92400E" };

/* ------------------------------------------------------------------ */
/*  Mood overlays shared across all stages                            */
/* ------------------------------------------------------------------ */

function Eyes({ mood, sc, cx1, cy1, cx2, cy2, r = 5, ry }) {
  const eyeRy = ry || r * 1.2;
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
    <ellipse cx={cx1} cy={cy1} rx={r * 0.5} ry={eyeRy * 0.75} fill={sc} />
    <ellipse cx={cx2} cy={cy2} rx={r * 0.5} ry={eyeRy * 0.75} fill={sc} />
    <circle cx={cx1 + 1.5} cy={cy1 - 2} r={1.2} fill="white" />
    <circle cx={cx2 + 1.5} cy={cy2 - 2} r={1.2} fill="white" />
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
    <text x="96" y="44" fontSize="12" opacity="0.5" fill="#6366F1">z</text>
    <text x="104" y="34" fontSize="10" opacity="0.35" fill="#6366F1">z</text>
    <text x="110" y="26" fontSize="8" opacity="0.2" fill="#6366F1">z</text>
  </>;
}

function Sparkles() {
  return <>
    <text x="26" y="38" fontSize="9">{"\u2728"}</text>
    <text x="84" y="34" fontSize="9">{"\u2B50"}</text>
  </>;
}

/* ------------------------------------------------------------------ */
/*  Floating particle effects                                         */
/* ------------------------------------------------------------------ */

function Particles({ stage, c }) {
  if (stage < 2) return null;
  return <>
    <circle cx="16" cy="48" r="2" fill="#FCD34D" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2s" repeatCount="indefinite" />
      <animate attributeName="cy" values="48;42;48" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="104" cy="40" r="1.5" fill="#FCD34D" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="40;34;40" dur="3.5s" repeatCount="indefinite" />
    </circle>
    {stage >= 3 && <>
      <circle cx="10" cy="88" r="1.8" fill="#FBBF24" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="72" r="1.4" fill={c.col} opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2.8s" repeatCount="indefinite" />
      </circle>
    </>}
    {stage >= 4 && <>
      <circle cx="20" cy="24" r="2.2" fill="#FDE68A" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="24;18;24" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="20" r="1.6" fill="#FBBF24" opacity="0.45">
        <animate attributeName="opacity" values="0.45;0.12;0.45" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </>}
  </>;
}

/* ================================================================== */
/*  STAGE 0 -- Baby / Hatchling                                       */
/*  Tiny, round, chubby. Oversized head, stubby tail, no horns.       */
/* ================================================================== */

function BabyDragon({ c, mood, sc }) {
  return <g>
    {/* Stubby tail */}
    <path d="M82 106 Q96 104 100 98 Q102 95 99 93" stroke={c.col} strokeWidth="5" fill="none" strokeLinecap="round" />

    {/* Round chubby body */}
    <ellipse cx="60" cy="100" rx="24" ry="20" fill={c.col} />
    <ellipse cx="60" cy="104" rx="14" ry="11" fill={c.belly} opacity="0.55" />

    {/* Stubby feet -- no visible claws */}
    <ellipse cx="48" cy="118" rx="8" ry="5" fill={c.col} />
    <ellipse cx="72" cy="118" rx="8" ry="5" fill={c.col} />

    {/* Oversized head */}
    <circle cx="60" cy="64" r="24" fill={c.col} />

    {/* Snout -- very small, round */}
    <ellipse cx="60" cy="76" rx="7" ry="4" fill={c.col} />
    <ellipse cx="60" cy="77" rx="5" ry="3" fill={`${c.belly}80`} />
    {/* Tiny nostrils */}
    <circle cx="57" cy="76" r="1" fill={sc} opacity="0.4" />
    <circle cx="63" cy="76" r="1" fill={sc} opacity="0.4" />

    {/* Big innocent eyes */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={60} cx2={70} cy2={60} r={6} ry={7} />
    <Blush mood={mood} cx1={42} cy1={68} cx2={78} cy2={68} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M55 72 Q60 76 65 72" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      : <line x1="56" y1="72" x2="64" y2="72" stroke={sc} strokeWidth="1" opacity="0.35" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 1 -- Ly (The Innocent)                                      */
/*  Slender, snake-like S-curves. Bodhi-leaf crest. Pearl in mouth.   */
/* ================================================================== */

function LyDragon({ c, mood, sc }) {
  return <g>
    {/* Long thin tail tapering to nothing */}
    <path d="M82 108 Q100 106 108 96 Q114 88 116 78 Q117 72 114 68"
      stroke={c.col} strokeWidth="4" fill="none" strokeLinecap="round"
      strokeDasharray="none" />
    <path d="M114 68 Q112 64 114 62" stroke={c.col} strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Slender S-curve body */}
    <path d="M44 114 Q38 96 42 84 Q46 72 56 72 Q66 72 74 80 Q82 90 78 108 Z"
      fill={c.col} />
    {/* Faint segment lines (12 along body) */}
    {[76, 80, 84, 88, 92, 96, 100, 104, 108].map((y, i) =>
      <line key={i} x1={46 + (i % 2)} y1={y} x2={72 - (i % 2)} y2={y}
        stroke={c.belly} strokeWidth="0.5" opacity="0.3" />
    )}
    {/* Belly */}
    <ellipse cx="60" cy="96" rx="12" ry="14" fill={c.belly} opacity="0.45" />

    {/* Feet -- 3 small toes each */}
    <ellipse cx="48" cy="118" rx="8" ry="4.5" fill={c.col} />
    <ellipse cx="72" cy="118" rx="8" ry="4.5" fill={c.col} />
    {[42, 48, 54].map(x => <circle key={x} cx={x} cy="121" r="1.8" fill={c.col} />)}
    {[66, 72, 78].map(x => <circle key={x} cx={x} cy="121" r="1.8" fill={c.col} />)}

    {/* Head -- slightly oval, large for innocent look */}
    <ellipse cx="60" cy="56" rx="20" ry="18" fill={c.col} />

    {/* Bodhi-leaf crest on nose tip (NO horns) */}
    <path d="M60 38 Q56 32 60 26 Q64 32 60 38 Z" fill={c.wing} opacity="0.7" />

    {/* Snout */}
    <ellipse cx="60" cy="66" rx="8" ry="5" fill={c.col} />
    <ellipse cx="60" cy="67" rx="6" ry="3.5" fill={`${c.belly}80`} />
    <ellipse cx="57" cy="66" rx="1.2" ry="0.8" fill={sc} opacity="0.45" />
    <ellipse cx="63" cy="66" rx="1.2" ry="0.8" fill={sc} opacity="0.45" />

    {/* Pearl held in mouth */}
    <circle cx="60" cy="71" r="3" fill="white" opacity="0.85" />
    <circle cx="61" cy="70" r="1" fill="white" opacity="0.5" />

    {/* Large round innocent eyes */}
    <Eyes mood={mood} sc={sc} cx1={52} cy1={52} cx2={68} cy2={52} r={5} ry={6} />
    <Blush mood={mood} cx1={43} cy1={58} cx2={77} cy2={58} />

    {/* Mouth (around pearl) */}
    {(mood === "happy" || mood === "excited")
      ? <path d="M55 68 Q60 72 65 68" stroke={sc} strokeWidth="1" fill="none" strokeLinecap="round" />
      : <path d="M56 69 Q60 70 64 69" stroke={sc} strokeWidth="0.8" fill="none" opacity="0.35" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 2 -- Tran (The Brave)                                       */
/*  Stockier, muscular. Short forked horns. Arc-scales. 4 claws.      */
/* ================================================================== */

function TranDragon({ c, mood, sc }) {
  return <g>
    {/* Thicker tail with slight spiral */}
    <path d="M84 106 Q102 100 108 90 Q112 82 108 76 Q104 72 106 66 Q108 62 104 60"
      stroke={c.col} strokeWidth="5.5" fill="none" strokeLinecap="round" />

    {/* Stocky muscular body */}
    <path d="M38 116 Q30 94 36 78 Q42 64 60 64 Q78 64 84 78 Q90 94 82 116 Z"
      fill={c.col} />
    {/* Arc-shaped chevron scales */}
    {[74, 80, 86, 92, 98, 104].map((y, i) =>
      <path key={i}
        d={`M${48 + (i % 2) * 2} ${y} Q60 ${y - 4} ${72 - (i % 2) * 2} ${y}`}
        stroke={c.belly} strokeWidth="0.8" fill="none" opacity="0.35" />
    )}
    {/* Belly */}
    <ellipse cx="60" cy="96" rx="15" ry="16" fill={c.belly} opacity="0.5" />

    {/* Broader chest accent */}
    <path d="M48 76 Q60 70 72 76" stroke={c.belly} strokeWidth="1" fill="none" opacity="0.3" />

    {/* Stronger legs -- 4 claws each */}
    <rect x="40" y="114" width="14" height="8" rx="4" fill={c.col} />
    <rect x="66" y="114" width="14" height="8" rx="4" fill={c.col} />
    {[40, 44, 48, 52].map(x => <ellipse key={x} cx={x + 1} cy="123" rx="2" ry="1.5" fill={c.horn} />)}
    {[66, 70, 74, 78].map(x => <ellipse key={x} cx={x + 1} cy="123" rx="2" ry="1.5" fill={c.horn} />)}

    {/* Head -- slightly broader, confident */}
    <ellipse cx="60" cy="50" rx="21" ry="18" fill={c.col} />

    {/* SHORT FORKED HORNS */}
    <path d="M43 38 L39 24 L42 30 L44 22 L45 34" fill={c.horn} />
    <path d="M77 38 L81 24 L78 30 L76 22 L75 34" fill={c.horn} />

    {/* Snout -- broader */}
    <ellipse cx="60" cy="60" rx="10" ry="6" fill={c.col} />
    <ellipse cx="60" cy="61" rx="7.5" ry="4" fill={`${c.belly}80`} />
    <ellipse cx="56" cy="60" rx="1.5" ry="1" fill={sc} opacity="0.5" />
    <ellipse cx="64" cy="60" rx="1.5" ry="1" fill={sc} opacity="0.5" />

    {/* Confident eyes -- slightly narrowed */}
    <Eyes mood={mood} sc={sc} cx1={51} cy1={46} cx2={69} cy2={46} r={5} ry={5} />
    <Blush mood={mood} cx1={42} cy1={52} cx2={78} cy2={52} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M54 56 Q57 59 60 56" stroke={sc} strokeWidth="1.2" fill="none" />
          <path d="M60 56 Q63 59 66 56" stroke={sc} strokeWidth="1.2" fill="none" />
        </>
      : <line x1="55" y1="56" x2="65" y2="56" stroke={sc} strokeWidth="1" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 3 -- Le (The Proud)                                         */
/*  Full commanding form. 5 claws. Flowing mane. Cloud fins on spine. */
/* ================================================================== */

function LeDragon({ c, mood, sc }) {
  return <g>
    {/* Tail with flowing wisps */}
    <path d="M86 104 Q106 96 112 84 Q116 74 112 66 Q108 60 110 52"
      stroke={c.col} strokeWidth="6" fill="none" strokeLinecap="round" />
    {/* Hair wisps on tail */}
    <path d="M110 52 Q114 46 108 44" stroke={c.wing} strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M112 56 Q118 50 112 48" stroke={c.wing} strokeWidth="1" fill="none" opacity="0.4" />
    <path d="M110 52 Q106 46 110 42" stroke={c.wing} strokeWidth="1" fill="none" opacity="0.5" />

    {/* Cloud-like FINS along spine (scalloped shapes) */}
    <path d="M50 62 Q46 56 50 52 Q54 48 58 52 Q62 48 66 52 Q70 48 74 52 Q78 56 74 62"
      fill={c.wing} opacity="0.5" />
    <path d="M42 78 Q38 72 42 68 Q46 64 50 68 Q54 64 58 68"
      fill={c.wing} opacity="0.35" />

    {/* Full commanding body -- larger */}
    <path d="M34 118 Q24 92 32 74 Q40 58 60 58 Q80 58 88 74 Q96 92 86 118 Z"
      fill={c.col} />
    {/* Scale pattern */}
    {[70, 78, 86, 94, 102, 110].map((y, i) =>
      <path key={i}
        d={`M${42 + (i % 2) * 2} ${y} Q60 ${y - 5} ${78 - (i % 2) * 2} ${y}`}
        stroke={c.belly} strokeWidth="0.7" fill="none" opacity="0.3" />
    )}
    {/* Belly */}
    <ellipse cx="60" cy="94" rx="17" ry="18" fill={c.belly} opacity="0.5" />

    {/* Powerful legs -- 5 CLAWS (emperor's mark!) */}
    <rect x="36" y="114" width="16" height="9" rx="4" fill={c.col} />
    <rect x="68" y="114" width="16" height="9" rx="4" fill={c.col} />
    {[36, 40, 44, 48, 52].map(x => <path key={x} d={`M${x} 124 L${x - 0.5} 127 L${x + 1} 127 Z`} fill={c.horn} />)}
    {[68, 72, 76, 80, 84].map(x => <path key={x} d={`M${x} 124 L${x - 0.5} 127 L${x + 1} 127 Z`} fill={c.horn} />)}

    {/* Head -- proud, commanding */}
    <ellipse cx="60" cy="44" rx="22" ry="19" fill={c.col} />

    {/* Flowing MANE behind head (wavy lines) */}
    <path d="M38 38 Q32 42 28 36 Q24 30 30 26 Q34 22 38 28"
      stroke={c.wing} strokeWidth="2.5" fill={c.wing} opacity="0.6" />
    <path d="M82 38 Q88 42 92 36 Q96 30 90 26 Q86 22 82 28"
      stroke={c.wing} strokeWidth="2.5" fill={c.wing} opacity="0.6" />
    <path d="M36 44 Q28 48 24 42" stroke={c.wing} strokeWidth="2" fill="none" opacity="0.4" />
    <path d="M84 44 Q92 48 96 42" stroke={c.wing} strokeWidth="2" fill="none" opacity="0.4" />

    {/* Horns -- longer, elegant curves */}
    <path d="M42 30 Q36 16 42 8 Q44 18 46 26" fill={c.horn} />
    <path d="M78 30 Q84 16 78 8 Q76 18 74 26" fill={c.horn} />

    {/* Snout -- refined */}
    <ellipse cx="60" cy="56" rx="10" ry="6" fill={c.col} />
    <ellipse cx="60" cy="57" rx="7.5" ry="4" fill={`${c.belly}80`} />
    <ellipse cx="56" cy="56" rx="1.5" ry="1.2" fill={sc} opacity="0.5" />
    <ellipse cx="64" cy="56" rx="1.5" ry="1.2" fill={sc} opacity="0.5" />

    {/* Proud eyes */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={40} cx2={70} cy2={40} r={5.5} ry={6} />
    <Blush mood={mood} cx1={41} cy1={48} cx2={79} cy2={48} />

    {/* Mouth -- slight confident smile */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M53 52 Q57 56 60 52" stroke={sc} strokeWidth="1.2" fill="none" />
          <path d="M60 52 Q63 56 67 52" stroke={sc} strokeWidth="1.2" fill="none" />
        </>
      : <path d="M54 52 Q60 54 66 52" stroke={sc} strokeWidth="1" fill="none" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 4 -- Nguyen (The Legendary)                                 */
/*  Maximum majesty. Spiral tail. Stag horns. Lion nose. Sword fin.   */
/* ================================================================== */

function NguyenDragon({ c, mood, sc }) {
  return <g>
    {/* Iridescent shimmer defs */}
    <defs>
      <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c.col} stopOpacity="1" />
        <stop offset="40%" stopColor="white" stopOpacity="0.12">
          <animate attributeName="offset" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={c.col} stopOpacity="1" />
      </linearGradient>
      <radialGradient id="aura">
        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Golden glow aura */}
    <ellipse cx="60" cy="80" rx="56" ry="60" fill="url(#aura)">
      <animate attributeName="rx" values="54;58;54" dur="3s" repeatCount="indefinite" />
      <animate attributeName="ry" values="58;62;58" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* SPIRAL TAIL with flowing hair strands */}
    <path d="M88 100 Q108 92 114 80 Q118 68 112 58 Q106 50 110 40 Q114 32 108 28 Q102 34 106 42"
      stroke={c.col} strokeWidth="6" fill="none" strokeLinecap="round" />
    {/* Tail hair */}
    <path d="M108 28 Q114 22 106 18 Q104 24 108 28" fill={c.wing} opacity="0.6" />
    <path d="M108 28 Q102 20 108 16" stroke={c.wing} strokeWidth="1.5" fill="none" opacity="0.5" />
    <path d="M106 32 Q114 26 110 22" stroke={c.wing} strokeWidth="1.2" fill="none" opacity="0.4" />
    <path d="M112 36 Q118 30 114 24" stroke={c.wing} strokeWidth="1" fill="none" opacity="0.35" />

    {/* Long fiery SWORD-FIN along entire back */}
    <path d="M40 54 L36 46 L42 50 L38 40 L46 48 L42 36 L50 46 L48 34 L56 44 L54 32 L60 42 L62 30 L64 42 L66 32 L68 44 L72 34 L72 46 L78 36 L78 48 L82 40 L80 52"
      fill={c.wing} opacity="0.55" stroke={c.wing} strokeWidth="0.5" />

    {/* Maximum body -- fills the space */}
    <path d="M30 120 Q18 90 28 68 Q38 50 60 50 Q82 50 92 68 Q102 90 90 120 Z"
      fill="url(#shimmer)" stroke={c.col} strokeWidth="0.5" />
    {/* Thick scale lines */}
    {[64, 72, 80, 88, 96, 104, 112].map((y, i) =>
      <path key={i}
        d={`M${38 + (i % 2) * 2} ${y} Q60 ${y - 5} ${82 - (i % 2) * 2} ${y}`}
        stroke={c.belly} strokeWidth="0.8" fill="none" opacity="0.3" />
    )}
    {/* Belly */}
    <ellipse cx="60" cy="92" rx="19" ry="20" fill={c.belly} opacity="0.5" />

    {/* Powerful legs -- 5 claws, larger */}
    <rect x="32" y="116" width="18" height="10" rx="5" fill={c.col} />
    <rect x="70" y="116" width="18" height="10" rx="5" fill={c.col} />
    {[32, 36, 40, 44, 48].map(x =>
      <path key={x} d={`M${x + 1} 126 L${x} 130 L${x + 2} 130 Z`} fill={c.horn} />
    )}
    {[70, 74, 78, 82, 86].map(x =>
      <path key={x} d={`M${x + 1} 126 L${x} 130 L${x + 2} 130 Z`} fill={c.horn} />
    )}

    {/* Head -- large, powerful */}
    <ellipse cx="60" cy="38" rx="24" ry="20" fill={c.col} />

    {/* Iridescent overlay on head */}
    <ellipse cx="60" cy="38" rx="24" ry="20" fill="url(#shimmer)" opacity="0.3" />

    {/* Flowing mane -- more dramatic */}
    <path d="M36 34 Q26 40 20 32 Q16 24 24 18 Q30 14 34 22 Q32 28 36 34"
      fill={c.wing} opacity="0.6" />
    <path d="M84 34 Q94 40 100 32 Q104 24 96 18 Q90 14 86 22 Q88 28 84 34"
      fill={c.wing} opacity="0.6" />
    <path d="M34 40 Q22 46 16 38" stroke={c.wing} strokeWidth="2.5" fill="none" opacity="0.4" />
    <path d="M86 40 Q98 46 104 38" stroke={c.wing} strokeWidth="2.5" fill="none" opacity="0.4" />
    <path d="M32 36 Q20 38 16 30" stroke={c.wing} strokeWidth="1.5" fill="none" opacity="0.3" />
    <path d="M88 36 Q100 38 104 30" stroke={c.wing} strokeWidth="1.5" fill="none" opacity="0.3" />

    {/* STAG HORNS -- wide branching */}
    <path d="M40 24 L32 8 L36 16 L28 4 L38 14 L34 2 L40 18"
      fill={c.horn} stroke={c.horn} strokeWidth="0.5" />
    <path d="M80 24 L88 8 L84 16 L92 4 L82 14 L86 2 L80 18"
      fill={c.horn} stroke={c.horn} strokeWidth="0.5" />

    {/* Lion's nose -- broader snout */}
    <ellipse cx="60" cy="50" rx="12" ry="7" fill={c.col} />
    <ellipse cx="60" cy="51" rx="9" ry="5" fill={`${c.belly}90`} />
    {/* Broader nostrils */}
    <ellipse cx="55" cy="50" rx="2" ry="1.2" fill={sc} opacity="0.5" />
    <ellipse cx="65" cy="50" rx="2" ry="1.2" fill={sc} opacity="0.5" />

    {/* Exposed canine teeth (small, not scary) */}
    <path d="M52 54 L51 57 L53 56" fill="white" opacity="0.8" />
    <path d="M68 54 L69 57 L67 56" fill="white" opacity="0.8" />

    {/* Large wise eyes */}
    <Eyes mood={mood} sc={sc} cx1={49} cy1={34} cx2={71} cy2={34} r={6} ry={7} />
    <Blush mood={mood} cx1={39} cy1={42} cx2={81} cy2={42} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M52 48 Q56 52 60 48" stroke={sc} strokeWidth="1.3" fill="none" />
          <path d="M60 48 Q64 52 68 48" stroke={sc} strokeWidth="1.3" fill="none" />
        </>
      : <path d="M53 48 Q60 50 67 48" stroke={sc} strokeWidth="1" fill="none" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  Main component                                                    */
/* ================================================================== */

export default function DragonSidekick({ variant, mood, size: s, stage, gear }) {
  const c = (typeof DRAGON_VARIANTS !== 'undefined' && DRAGON_VARIANTS[variant]) || FALLBACK;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 4;
  const sc = "#1E1B4B";

  /* Build filter string */
  let filter = `drop-shadow(0 4px 8px ${c.col}33)`;
  if (stg >= 4) filter += ` drop-shadow(0 0 14px #FCD34D90)`;
  else if (stg >= 3) filter += ` drop-shadow(0 0 8px ${c.col}60)`;
  else if (stg >= 2) filter += ` drop-shadow(0 0 5px ${c.col}40)`;

  return (
    <svg
      viewBox="0 0 120 140"
      width={sz}
      height={sz * 1.17}
      style={{ filter }}
    >
      {/* Stage-specific dragon body */}
      {stg >= 4 ? <NguyenDragon c={c} mood={mood} sc={sc} />
        : stg >= 3 ? <LeDragon c={c} mood={mood} sc={sc} />
        : stg >= 2 ? <TranDragon c={c} mood={mood} sc={sc} />
        : stg >= 1 ? <LyDragon c={c} mood={mood} sc={sc} />
        : <BabyDragon c={c} mood={mood} sc={sc} />
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
          <path d="M36 46 Q60 38 84 46" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="44" r="3" fill="#EF4444" />
        </g>
      )}
      {gear?.head === "h_sunglasses" && (
        <g>
          <rect x="42" y="50" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <rect x="62" y="50" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <line x1="56" y1="54" x2="62" y2="54" stroke="#1E293B" strokeWidth="2" />
          <line x1="42" y1="54" x2="36" y2="50" stroke="#1E293B" strokeWidth="1.5" />
          <line x1="76" y1="54" x2="82" y2="50" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      )}
      {gear?.body === "h_cape_red" && (
        <g>
          <path d="M36 68 Q24 88 20 115 Q30 112 40 115 L46 85 Z" fill="#DC2626" opacity="0.8" />
          <path d="M84 68 Q96 88 100 115 Q90 112 80 115 L74 85 Z" fill="#DC2626" opacity="0.8" />
        </g>
      )}
      {gear?.body === "c_scarf" && (
        <g>
          <path d="M40 68 Q60 74 80 68" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M44 70 L40 88" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M42 88 L46 80" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {gear?.body === "c_bowtie" && (
        <g>
          <polygon points="50,68 58,64 58,72" fill="#EC4899" />
          <polygon points="66,68 58,64 58,72" fill="#EC4899" />
          <circle cx="58" cy="68" r="3" fill="#DB2777" />
        </g>
      )}
      {gear?.accessory === "h_wings" && (
        <g>
          <path d="M28 78 Q8 58 2 38 Q12 54 22 66 Q10 48 6 32 Q18 52 28 68" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
          <path d="M92 78 Q112 58 118 38 Q108 54 98 66 Q110 48 114 32 Q102 52 92 68" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
        </g>
      )}
      {gear?.accessory === "c_collar" && (
        <g>
          <ellipse cx="60" cy="70" rx="20" ry="4" fill="none" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="60" cy="74" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        </g>
      )}

      {/* Shared overlays */}
      <Particles stage={stg} c={c} />
      {mood === "sleepy" && <SleepyZ />}
      {mood === "excited" && <Sparkles />}
    </svg>
  );
}

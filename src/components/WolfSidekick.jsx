import React from 'react';
import { WOLF_VARIANTS } from '../constants';

const FALLBACK = { col: "#64748B", belly: "#E2E8F0", ear: "#94A3B8", tail: "#475569" };

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
    <circle cx="16" cy="48" r="2" fill="#C4B5FD" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2s" repeatCount="indefinite" />
      <animate attributeName="cy" values="48;42;48" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="104" cy="40" r="1.5" fill="#A5B4FC" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="40;34;40" dur="3.5s" repeatCount="indefinite" />
    </circle>
    {stage >= 3 && <>
      <circle cx="10" cy="88" r="1.8" fill="#93C5FD" opacity="0.4">
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
      <circle cx="100" cy="20" r="1.6" fill="#C4B5FD" opacity="0.45">
        <animate attributeName="opacity" values="0.45;0.12;0.45" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </>}
  </>;
}

/* ================================================================== */
/*  STAGE 0 -- Puppy (Baby)                                           */
/*  Tiny, round, oversized head. Floppy ears. Stubby tail + legs.     */
/*  Plushie proportions -- like a stuffed animal.                      */
/* ================================================================== */

function PuppyWolf({ c, mood, sc }) {
  return <g>
    {/* Tiny stubby tail -- short round nub */}
    <ellipse cx="84" cy="106" rx="6" ry="4" fill={c.tail} />
    <ellipse cx="88" cy="104" rx="4" ry="3" fill={c.tail} />

    {/* Round chubby body -- very compact */}
    <ellipse cx="60" cy="102" rx="22" ry="18" fill={c.col} />
    {/* Lighter belly */}
    <ellipse cx="60" cy="106" rx="13" ry="10" fill={c.belly} opacity="0.5" />

    {/* Stubby little legs -- very short */}
    <ellipse cx="48" cy="118" rx="7" ry="5" fill={c.col} />
    <ellipse cx="72" cy="118" rx="7" ry="5" fill={c.col} />
    {/* Tiny paw pads */}
    <ellipse cx="48" cy="120" rx="4" ry="2.5" fill={c.belly} opacity="0.35" />
    <ellipse cx="72" cy="120" rx="4" ry="2.5" fill={c.belly} opacity="0.35" />

    {/* Oversized head -- much bigger than body */}
    <circle cx="60" cy="62" r="26" fill={c.col} />

    {/* FLOPPY ears -- drooping down, rounded tips */}
    <path d="M38 52 Q30 38 26 50 Q24 58 32 62" fill={c.col} stroke={c.col} strokeWidth="1" />
    <path d="M34 54 Q28 44 27 52 Q26 56 32 58" fill={c.ear} />
    <path d="M82 52 Q90 38 94 50 Q96 58 88 62" fill={c.col} stroke={c.col} strokeWidth="1" />
    <path d="M86 54 Q92 44 93 52 Q94 56 88 58" fill={c.ear} />

    {/* Big round innocent eyes */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={58} cx2={70} cy2={58} r={6} ry={7} />
    <Blush mood={mood} cx1={40} cy1={66} cx2={80} cy2={66} />

    {/* Round puppy snout -- very small */}
    <ellipse cx="60" cy="70" rx="8" ry="5" fill={c.belly} opacity="0.4" />

    {/* Small round nose */}
    <ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill="#1E1B4B" />
    {/* Nose shine */}
    <ellipse cx="61.5" cy="67" rx="1.2" ry="0.8" fill="white" opacity="0.4" />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M55 72 Q60 77 65 72" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Tongue */}
          <ellipse cx="60" cy="76" rx="3" ry="3" fill="#FDA4AF" />
          <ellipse cx="60" cy="75" rx="3" ry="1.5" fill={c.belly} opacity="0.3" />
        </>
      : <line x1="57" y1="72" x2="63" y2="72" stroke={sc} strokeWidth="1" opacity="0.35" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 1 -- Young Pup                                              */
/*  Ears halfway pointed. Slightly longer body. Fluffier tail.        */
/*  Visible paw pads. Curious wide eyes.                              */
/* ================================================================== */

function YoungPupWolf({ c, mood, sc }) {
  return <g>
    {/* Fluffier tail -- starting to curve upward */}
    <path d="M82 102 Q94 96 100 88 Q104 82 100 80"
      stroke={c.tail} strokeWidth="6" fill="none" strokeLinecap="round" />
    {/* Tail fluff tip */}
    <ellipse cx="100" cy="79" rx="5" ry="4" fill={c.tail} />

    {/* Slightly longer body -- still round but not as compact */}
    <ellipse cx="60" cy="100" rx="24" ry="20" fill={c.col} />
    {/* Belly */}
    <ellipse cx="60" cy="104" rx="14" ry="12" fill={c.belly} opacity="0.5" />

    {/* Legs -- a bit longer with visible paw pads */}
    <ellipse cx="46" cy="118" rx="8" ry="6" fill={c.col} />
    <ellipse cx="74" cy="118" rx="8" ry="6" fill={c.col} />
    {/* Paw pad details -- 3 small beans + 1 big pad */}
    <ellipse cx="46" cy="121" rx="5" ry="3" fill={c.belly} opacity="0.4" />
    <ellipse cx="74" cy="121" rx="5" ry="3" fill={c.belly} opacity="0.4" />
    {[42, 46, 50].map(x => <circle key={x} cx={x} cy="123" r="1.5" fill={c.belly} opacity="0.3" />)}
    {[70, 74, 78].map(x => <circle key={x} cx={x} cy="123" r="1.5" fill={c.belly} opacity="0.3" />)}

    {/* Back paws peeking */}
    <ellipse cx="38" cy="120" rx="6" ry="4.5" fill={c.col} />
    <ellipse cx="82" cy="120" rx="6" ry="4.5" fill={c.col} />

    {/* Head -- still large, slightly oval */}
    <ellipse cx="60" cy="58" rx="24" ry="22" fill={c.col} />

    {/* HALF-POINTED ears -- transitioning from floppy to upright */}
    {/* Left ear: base points up, tip folds over */}
    <path d="M38 50 L30 26 Q28 22 32 28 L36 38" fill={c.col} />
    <path d="M30 26 Q26 30 28 36" stroke={c.col} strokeWidth="3" fill={c.col} />
    <path d="M37 46 L33 30 Q31 28 33 32" fill={c.ear} />
    {/* Right ear */}
    <path d="M82 50 L90 26 Q92 22 88 28 L84 38" fill={c.col} />
    <path d="M90 26 Q94 30 92 36" stroke={c.col} strokeWidth="3" fill={c.col} />
    <path d="M83 46 L87 30 Q89 28 87 32" fill={c.ear} />

    {/* Curious wide eyes -- slightly bigger than normal */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={54} cx2={70} cy2={54} r={5.5} ry={6.5} />
    <Blush mood={mood} cx1={41} cy1={62} cx2={79} cy2={62} />

    {/* Snout -- starting to form a muzzle shape */}
    <ellipse cx="60" cy="66" rx="9" ry="6" fill={c.belly} opacity="0.4" />

    {/* Nose */}
    <path d="M57 64 Q60 61 63 64 Q60 67 57 64 Z" fill="#1E1B4B" />
    <ellipse cx="61" cy="63" rx="1" ry="0.6" fill="white" opacity="0.35" />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M55 68 Q60 73 65 68" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="72" rx="3" ry="3" fill="#FDA4AF" />
          <ellipse cx="60" cy="71" rx="3" ry="1.5" fill={c.belly} opacity="0.3" />
        </>
      : <line x1="57" y1="68" x2="63" y2="68" stroke={sc} strokeWidth="1" opacity="0.35" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 2 -- Adolescent Wolf                                        */
/*  Ears fully pointed + tall. Athletic body, longer legs.            */
/*  Thick fluffy tail curving up. Defined muzzle. Chest puff.         */
/* ================================================================== */

function AdolescentWolf({ c, mood, sc }) {
  return <g>
    {/* Thick fluffy tail curving upward */}
    <path d="M84 98 Q100 90 108 78 Q112 70 108 64 Q106 60 108 56"
      stroke={c.tail} strokeWidth="7" fill="none" strokeLinecap="round" />
    {/* Tail fluff edges */}
    <path d="M108 56 Q112 50 106 50 Q104 54 108 56" fill={c.tail} />
    <path d="M110 64 Q116 60 112 56" stroke={c.tail} strokeWidth="2" fill="none" opacity="0.6" />

    {/* Athletic body -- longer, leaner than pup */}
    <path d="M38 118 Q28 96 34 78 Q40 64 60 64 Q80 64 86 78 Q92 96 82 118 Z"
      fill={c.col} />
    {/* Chest puff -- fluffy fur on upper chest */}
    <path d="M44 72 Q48 66 54 68 Q60 64 66 68 Q72 66 76 72 Q72 78 60 80 Q48 78 44 72"
      fill={c.belly} opacity="0.5" />
    {/* Belly */}
    <ellipse cx="60" cy="96" rx="15" ry="16" fill={c.belly} opacity="0.4" />

    {/* Longer legs -- athletic proportions */}
    <rect x="40" y="114" width="14" height="9" rx="4" fill={c.col} />
    <rect x="66" y="114" width="14" height="9" rx="4" fill={c.col} />
    {/* Paw pads */}
    <ellipse cx="47" cy="122" rx="5" ry="2.5" fill={c.belly} opacity="0.3" />
    <ellipse cx="73" cy="122" rx="5" ry="2.5" fill={c.belly} opacity="0.3" />
    {/* Back legs visible */}
    <ellipse cx="36" cy="118" rx="6" ry="5" fill={c.col} />
    <ellipse cx="84" cy="118" rx="6" ry="5" fill={c.col} />

    {/* Head -- slightly elongated, less round */}
    <ellipse cx="60" cy="50" rx="22" ry="19" fill={c.col} />

    {/* FULLY POINTED tall ears */}
    <polygon points="38,42 26,10 50,36" fill={c.col} />
    <polygon points="40,40 30,16 48,36" fill={c.ear} />
    <polygon points="82,42 94,10 70,36" fill={c.col} />
    <polygon points="80,40 90,16 72,36" fill={c.ear} />

    {/* Defined muzzle / snout -- longer, more angular */}
    <path d="M50 56 Q52 64 60 66 Q68 64 70 56" fill={c.col} />
    <ellipse cx="60" cy="60" rx="10" ry="6" fill={c.belly} opacity="0.35" />

    {/* Nose -- slightly larger */}
    <path d="M56 57 Q60 53 64 57 Q60 61 56 57 Z" fill="#1E1B4B" />
    <ellipse cx="61.5" cy="56" rx="1" ry="0.7" fill="white" opacity="0.35" />

    {/* Confident narrower eyes */}
    <Eyes mood={mood} sc={sc} cx1={50} cy1={46} cx2={70} cy2={46} r={5} ry={5} />
    <Blush mood={mood} cx1={41} cy1={52} cx2={79} cy2={52} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M55 62 Q60 67 65 62" stroke={sc} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="66" rx="3" ry="3" fill="#FDA4AF" />
        </>
      : <line x1="56" y1="62" x2="64" y2="62" stroke={sc} strokeWidth="1" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 3 -- Adult Wolf                                             */
/*  Full wolf proportions. Thick ruff/mane. Powerful legs.            */
/*  Majestic bushy tail. Wise calm eyes. Fur markings.                */
/* ================================================================== */

function AdultWolf({ c, mood, sc }) {
  return <g>
    {/* Majestic bushy tail -- thick, flowing */}
    <path d="M86 96 Q106 86 112 72 Q116 60 110 50 Q106 44 108 38"
      stroke={c.tail} strokeWidth="8" fill="none" strokeLinecap="round" />
    {/* Tail fur wisps */}
    <path d="M108 38 Q114 30 106 30 Q104 34 108 38" fill={c.tail} />
    <path d="M112 44 Q118 38 114 34" stroke={c.tail} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M110 50 Q116 44 112 40" stroke={c.tail} strokeWidth="1.5" fill="none" opacity="0.4" />

    {/* Full wolf body -- larger, powerful */}
    <path d="M34 120 Q22 94 30 74 Q38 56 60 56 Q82 56 90 74 Q98 94 86 120 Z"
      fill={c.col} />

    {/* Thick ruff/mane around neck -- scalloped fur */}
    <path d="M38 62 Q34 56 38 50 Q42 44 48 48 Q52 42 58 46 Q62 42 68 46 Q72 42 78 48 Q82 44 86 50 Q90 56 86 62"
      fill={c.col} />
    <path d="M40 60 Q36 54 40 50 Q44 46 48 50 Q52 44 58 48 Q62 44 68 48 Q72 44 78 50 Q82 46 84 50 Q88 54 84 60"
      fill={c.belly} opacity="0.45" />

    {/* Belly */}
    <ellipse cx="60" cy="96" rx="17" ry="18" fill={c.belly} opacity="0.45" />

    {/* Fur markings on shoulders */}
    <path d="M38 72 Q42 68 46 72" stroke={c.tail} strokeWidth="1.2" fill="none" opacity="0.3" />
    <path d="M36 78 Q40 74 44 78" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M74 72 Q78 68 82 72" stroke={c.tail} strokeWidth="1.2" fill="none" opacity="0.3" />
    <path d="M76 78 Q80 74 84 78" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.25" />

    {/* Powerful legs with defined paws */}
    <rect x="36" y="116" width="16" height="9" rx="4" fill={c.col} />
    <rect x="68" y="116" width="16" height="9" rx="4" fill={c.col} />
    {/* Paw details */}
    {[38, 42, 46, 50].map(x => <ellipse key={x} cx={x} cy="124" rx="2" ry="1.5" fill={c.belly} opacity="0.35" />)}
    {[70, 74, 78, 82].map(x => <ellipse key={x} cx={x} cy="124" rx="2" ry="1.5" fill={c.belly} opacity="0.35" />)}
    {/* Back legs */}
    <rect x="30" y="118" width="10" height="7" rx="3" fill={c.col} />
    <rect x="80" y="118" width="10" height="7" rx="3" fill={c.col} />

    {/* Head -- longer muzzle, proud */}
    <ellipse cx="60" cy="40" rx="23" ry="20" fill={c.col} />

    {/* Tall pointed ears -- slightly wider base, adult proportions */}
    <polygon points="38,32 22,2 52,26" fill={c.col} />
    <polygon points="40,30 26,8 50,26" fill={c.ear} />
    <polygon points="82,32 98,2 68,26" fill={c.col} />
    <polygon points="80,30 94,8 70,26" fill={c.ear} />

    {/* Fur markings on face -- cheek stripes */}
    <path d="M36 38 Q38 36 40 38" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M34 42 Q37 40 40 42" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M80 38 Q82 36 84 38" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M80 42 Q83 40 86 42" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.25" />

    {/* Defined muzzle -- long snout */}
    <path d="M48 48 Q50 58 60 60 Q70 58 72 48" fill={c.col} />
    <ellipse cx="60" cy="54" rx="11" ry="7" fill={c.belly} opacity="0.35" />

    {/* Nose */}
    <path d="M55 50 Q60 46 65 50 Q60 54 55 50 Z" fill="#1E1B4B" />
    <ellipse cx="61.5" cy="49" rx="1.2" ry="0.8" fill="white" opacity="0.35" />

    {/* Wise, calm eyes */}
    <Eyes mood={mood} sc={sc} cx1={49} cy1={36} cx2={71} cy2={36} r={5.5} ry={5.5} />
    <Blush mood={mood} cx1={40} cy1={44} cx2={80} cy2={44} />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M54 56 Q57 59 60 56" stroke={sc} strokeWidth="1.2" fill="none" />
          <path d="M60 56 Q63 59 66 56" stroke={sc} strokeWidth="1.2" fill="none" />
        </>
      : <path d="M55 56 Q60 58 65 56" stroke={sc} strokeWidth="1" fill="none" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  STAGE 4 -- Legendary Alpha                                        */
/*  Maximum size. Elaborate flowing mane. Glowing eyes. Spectral      */
/*  aura wisps. Moon crescent above head. Fenrir-inspired.            */
/* ================================================================== */

function AlphaWolf({ c, mood, sc }) {
  return <g>
    {/* Shimmer + aura gradients */}
    <defs>
      <linearGradient id="wolfShimmer" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c.col} stopOpacity="1" />
        <stop offset="40%" stopColor="white" stopOpacity="0.12">
          <animate attributeName="offset" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={c.col} stopOpacity="1" />
      </linearGradient>
      <radialGradient id="wolfAura">
        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="eyeGlow">
        <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Golden glow aura */}
    <ellipse cx="60" cy="78" rx="56" ry="60" fill="url(#wolfAura)">
      <animate attributeName="rx" values="54;58;54" dur="3s" repeatCount="indefinite" />
      <animate attributeName="ry" values="58;62;58" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* Spectral wisps around body */}
    <path d="M14 90 Q8 70 16 55" stroke="#C4B5FD" strokeWidth="1.5" fill="none" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M106 90 Q112 70 104 55" stroke="#C4B5FD" strokeWidth="1.5" fill="none" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3.5s" repeatCount="indefinite" />
    </path>
    <path d="M20 110 Q10 92 18 78" stroke="#A5B4FC" strokeWidth="1" fill="none" opacity="0.25">
      <animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.8s" repeatCount="indefinite" />
    </path>
    <path d="M100 110 Q110 92 102 78" stroke="#A5B4FC" strokeWidth="1" fill="none" opacity="0.25">
      <animate attributeName="opacity" values="0.25;0.08;0.25" dur="3.2s" repeatCount="indefinite" />
    </path>

    {/* Massive bushy tail -- flowing, elaborate */}
    <path d="M88 92 Q110 80 116 64 Q120 50 114 40 Q108 32 112 22 Q114 16 108 14"
      stroke={c.tail} strokeWidth="8" fill="none" strokeLinecap="round" />
    {/* Tail fur strands */}
    <path d="M108 14 Q116 8 106 8 Q104 12 108 14" fill={c.tail} opacity="0.7" />
    <path d="M108 14 Q102 6 108 4" stroke={c.tail} strokeWidth="1.5" fill="none" opacity="0.5" />
    <path d="M112 20 Q118 14 114 10" stroke={c.tail} strokeWidth="1.2" fill="none" opacity="0.4" />
    <path d="M114 28 Q120 22 116 16" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.35" />

    {/* Maximum body -- fills the space */}
    <path d="M30 122 Q16 92 26 68 Q36 48 60 48 Q84 48 94 68 Q104 92 90 122 Z"
      fill="url(#wolfShimmer)" stroke={c.col} strokeWidth="0.5" />

    {/* Elaborate flowing mane -- extends from head down along neck + shoulders */}
    <path d="M34 52 Q26 46 20 36 Q16 28 24 22 Q30 18 34 26 Q32 34 36 42"
      fill={c.col} opacity="0.7" />
    <path d="M86 52 Q94 46 100 36 Q104 28 96 22 Q90 18 86 26 Q88 34 84 42"
      fill={c.col} opacity="0.7" />
    <path d="M32 56 Q22 52 16 42" stroke={c.col} strokeWidth="2.5" fill="none" opacity="0.5" />
    <path d="M88 56 Q98 52 104 42" stroke={c.col} strokeWidth="2.5" fill="none" opacity="0.5" />
    <path d="M30 62 Q18 60 12 48" stroke={c.col} strokeWidth="1.8" fill="none" opacity="0.35" />
    <path d="M90 62 Q102 60 108 48" stroke={c.col} strokeWidth="1.8" fill="none" opacity="0.35" />
    {/* Front mane ruff -- elaborate scalloped */}
    <path d="M36 56 Q32 48 38 42 Q44 36 50 40 Q56 34 62 38 Q68 34 74 40 Q80 36 86 42 Q92 48 88 56"
      fill={c.col} />
    <path d="M38 54 Q34 48 40 44 Q46 38 52 42 Q56 36 62 40 Q68 36 74 42 Q80 38 84 44 Q90 48 86 54"
      fill={c.belly} opacity="0.45" />

    {/* Belly */}
    <ellipse cx="60" cy="94" rx="19" ry="20" fill={c.belly} opacity="0.45" />

    {/* Fur pattern -- chevron markings across body */}
    {[72, 80, 88, 96, 104, 112].map((y, i) =>
      <path key={i}
        d={`M${40 + (i % 2) * 2} ${y} Q60 ${y - 4} ${80 - (i % 2) * 2} ${y}`}
        stroke={c.tail} strokeWidth="0.7" fill="none" opacity="0.2" />
    )}

    {/* Powerful legs -- larger, defined */}
    <rect x="32" y="118" width="18" height="10" rx="5" fill={c.col} />
    <rect x="70" y="118" width="18" height="10" rx="5" fill={c.col} />
    {/* Claws */}
    {[34, 38, 42, 46].map(x =>
      <path key={x} d={`M${x + 1} 128 L${x} 132 L${x + 2} 132 Z`} fill={c.tail} opacity="0.6" />
    )}
    {[72, 76, 80, 84].map(x =>
      <path key={x} d={`M${x + 1} 128 L${x} 132 L${x + 2} 132 Z`} fill={c.tail} opacity="0.6" />
    )}
    {/* Back legs */}
    <rect x="26" y="120" width="12" height="8" rx="4" fill={c.col} />
    <rect x="82" y="120" width="12" height="8" rx="4" fill={c.col} />

    {/* Head -- large, powerful alpha */}
    <ellipse cx="60" cy="34" rx="25" ry="21" fill={c.col} />

    {/* Iridescent shimmer on head */}
    <ellipse cx="60" cy="34" rx="25" ry="21" fill="url(#wolfShimmer)" opacity="0.3" />

    {/* Tall majestic ears */}
    <polygon points="36,26 18,-6 54,18" fill={c.col} />
    <polygon points="38,24 22,0 52,18" fill={c.ear} />
    <polygon points="84,26 102,-6 66,18" fill={c.col} />
    <polygon points="82,24 98,0 68,18" fill={c.ear} />

    {/* CRESCENT MOON above head */}
    <g>
      <path d="M52,-14 Q60,-22 68,-14 Q62,-10 52,-14 Z" fill="#FCD34D" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite" />
      </path>
      {/* Moon glow */}
      <ellipse cx="60" cy="-14" rx="12" ry="8" fill="#FCD34D" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.08;0.15" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </g>

    {/* Face markings -- ancient rune-like stripes */}
    <path d="M36 30 L32 26 L36 28" stroke={c.tail} strokeWidth="1.2" fill="none" opacity="0.4" />
    <path d="M34 34 L30 32 L34 33" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M84 30 L88 26 L84 28" stroke={c.tail} strokeWidth="1.2" fill="none" opacity="0.4" />
    <path d="M86 34 L90 32 L86 33" stroke={c.tail} strokeWidth="1" fill="none" opacity="0.3" />

    {/* Defined muzzle -- long, powerful snout */}
    <path d="M46 42 Q48 54 60 56 Q72 54 74 42" fill={c.col} />
    <ellipse cx="60" cy="48" rx="12" ry="7" fill={c.belly} opacity="0.35" />

    {/* Nose -- broader */}
    <path d="M54 44 Q60 40 66 44 Q60 48 54 44 Z" fill="#1E1B4B" />
    <ellipse cx="62" cy="43" rx="1.5" ry="1" fill="white" opacity="0.35" />

    {/* GLOWING EYES -- inner light */}
    {mood === "sleepy" ? (
      <>
        <line x1={43} y1={30} x2={55} y2={30} stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
        <line x1={65} y1={30} x2={77} y2={30} stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : mood === "happy" || mood === "excited" ? (
      <>
        <path d="M43 32 Q49 27 55 32" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M65 32 Q71 27 77 32" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Glow behind happy eyes */}
        <ellipse cx="49" cy="30" rx="8" ry="5" fill="url(#eyeGlow)" opacity="0.3" />
        <ellipse cx="71" cy="30" rx="8" ry="5" fill="url(#eyeGlow)" opacity="0.3" />
      </>
    ) : (
      <>
        {/* Glowing neutral eyes */}
        <ellipse cx="49" cy="30" rx="6" ry="7" fill="white" />
        <ellipse cx="71" cy="30" rx="6" ry="7" fill="white" />
        <ellipse cx="49" cy="30" rx="3" ry="5.5" fill="#FBBF24" />
        <ellipse cx="71" cy="30" rx="3" ry="5.5" fill="#FBBF24" />
        {/* Inner light glow */}
        <ellipse cx="49" cy="30" rx="1.5" ry="3" fill="#FDE68A" />
        <ellipse cx="71" cy="30" rx="1.5" ry="3" fill="#FDE68A" />
        <circle cx="50.5" cy="28" r={1.2} fill="white" />
        <circle cx="72.5" cy="28" r={1.2} fill="white" />
        {/* Eye glow aura */}
        <ellipse cx="49" cy="30" rx="9" ry="8" fill="url(#eyeGlow)" opacity="0.25" />
        <ellipse cx="71" cy="30" rx="9" ry="8" fill="url(#eyeGlow)" opacity="0.25" />
      </>
    )}
    <Blush mood={mood} cx1={38} cy1={38} cx2={82} cy2={38} />

    {/* Exposed canine teeth (small, mythic) */}
    <path d="M52 50 L51 53 L53 52" fill="white" opacity="0.7" />
    <path d="M68 50 L69 53 L67 52" fill="white" opacity="0.7" />

    {/* Mouth */}
    {(mood === "happy" || mood === "excited")
      ? <>
          <path d="M53 50 Q57 54 60 50" stroke="#FCD34D" strokeWidth="1.3" fill="none" opacity="0.8" />
          <path d="M60 50 Q63 54 67 50" stroke="#FCD34D" strokeWidth="1.3" fill="none" opacity="0.8" />
        </>
      : <path d="M54 50 Q60 52 66 50" stroke={sc} strokeWidth="1" fill="none" opacity="0.4" />
    }
  </g>;
}

/* ================================================================== */
/*  Main component                                                    */
/* ================================================================== */

export default function WolfSidekick({ variant, mood, size: s, stage, gear }) {
  const c = (typeof WOLF_VARIANTS !== 'undefined' && WOLF_VARIANTS[variant]) || FALLBACK;
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
      {/* Stage-specific wolf body */}
      {stg >= 4 ? <AlphaWolf c={c} mood={mood} sc={sc} />
        : stg >= 3 ? <AdultWolf c={c} mood={mood} sc={sc} />
        : stg >= 2 ? <AdolescentWolf c={c} mood={mood} sc={sc} />
        : stg >= 1 ? <YoungPupWolf c={c} mood={mood} sc={sc} />
        : <PuppyWolf c={c} mood={mood} sc={sc} />
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

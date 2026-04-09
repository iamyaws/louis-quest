import React from 'react';
import { DRAGON_VARIANTS } from '../constants';

const FALLBACK = { col: "#EF4444", belly: "#FEE2E2", wing: "#DC2626", horn: "#92400E" };

export default function DragonSidekick({ variant, mood, size: s, stage }) {
  const c = (typeof DRAGON_VARIANTS !== 'undefined' && DRAGON_VARIANTS[variant]) || FALLBACK;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 3;
  const sc = "#1E1B4B";

  return (
    <svg viewBox="0 0 120 140" width={sz} height={sz * 1.17} style={{ filter: `drop-shadow(0 4px 8px ${c.col}33)${stg >= 4 ? ` drop-shadow(0 0 12px #FCD34D80)` : stg >= 3 ? ` drop-shadow(0 0 8px ${c.col}60)` : ""}` }}>

      {/* --- Wings (behind body) --- */}
      {stg >= 4 ? <>
        {/* Stage 4: larger wings */}
        <path d="M28 78 Q8 50 15 30 Q20 48 28 58 Q18 38 22 22 Q28 45 32 62 Q24 42 28 28 Q32 50 34 68" fill={`${c.wing}B0`} stroke={c.wing} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M92 78 Q112 50 105 30 Q100 48 92 58 Q102 38 98 22 Q92 45 88 62 Q96 42 92 28 Q88 50 86 68" fill={`${c.wing}B0`} stroke={c.wing} strokeWidth="1.2" strokeLinejoin="round" />
      </> : <>
        {/* Normal small bat wings */}
        <path d="M30 82 Q14 60 18 45 Q22 56 28 64 Q20 48 24 38 Q28 52 32 68" fill={`${c.wing}A0`} stroke={c.wing} strokeWidth="1" strokeLinejoin="round" />
        <path d="M90 82 Q106 60 102 45 Q98 56 92 64 Q100 48 96 38 Q92 52 88 68" fill={`${c.wing}A0`} stroke={c.wing} strokeWidth="1" strokeLinejoin="round" />
      </>}

      {/* --- Tail (behind body) --- */}
      <path d="M88 108 Q108 105 112 95 Q115 88 110 85" stroke={c.col} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Flame/spade tip */}
      <path d="M110 85 Q114 78 110 74 Q108 80 106 78 Q108 82 106 85 Z" fill="#F97316" opacity="0.9" />
      <path d="M109 82 Q111 79 109 76" stroke="#FBBF24" strokeWidth="1" fill="none" opacity="0.7" />

      {/* --- Body (chubby egg shape) --- */}
      <ellipse cx="60" cy="95" rx={30 + stg} ry={28 + stg} fill={c.col} />

      {/* --- Belly patch --- */}
      <ellipse cx="60" cy="100" rx="18" ry="16" fill={c.belly} opacity="0.6" />

      {/* --- Stubby feet --- */}
      <ellipse cx="46" cy="122" rx="10" ry="6" fill={c.col} />
      <ellipse cx="74" cy="122" rx="10" ry="6" fill={c.col} />
      {/* Tiny toes */}
      <circle cx="40" cy="126" r="2.5" fill={c.col} />
      <circle cx="46" cy="127" r="2.5" fill={c.col} />
      <circle cx="52" cy="126" r="2.5" fill={c.col} />
      <circle cx="68" cy="126" r="2.5" fill={c.col} />
      <circle cx="74" cy="127" r="2.5" fill={c.col} />
      <circle cx="80" cy="126" r="2.5" fill={c.col} />

      {/* --- Head (round) --- */}
      <circle cx="60" cy="58" r={22 + stg * 0.5} fill={c.col} />

      {/* --- Horns --- */}
      <path d="M44 42 Q42 30 46 24 Q46 34 48 40" fill={c.horn} />
      <path d="M76 42 Q78 30 74 24 Q74 34 72 40" fill={c.horn} />

      {/* --- Snout --- */}
      <ellipse cx="60" cy="68" rx="10" ry="6" fill={c.col} />
      <ellipse cx="60" cy="69" rx="8" ry="4.5" fill={`${c.belly}80`} />
      {/* Nostrils */}
      <ellipse cx="56" cy="68" rx="1.5" ry="1" fill={sc} opacity="0.5" />
      <ellipse cx="64" cy="68" rx="1.5" ry="1" fill={sc} opacity="0.5" />

      {/* --- Eyes --- */}
      {mood === "sleepy" ? <>
        {/* Closed eye lines */}
        <line x1="48" y1="56" x2="56" y2="56" stroke={sc} strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="56" x2="72" y2="56" stroke={sc} strokeWidth="2" strokeLinecap="round" />
      </> : (mood === "happy" || mood === "excited") ? <>
        {/* Happy curved eyes */}
        <path d="M48 58 Q52 54 56 58" stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M64 58 Q68 54 72 58" stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
      </> : <>
        {/* Normal open eyes */}
        <ellipse cx="52" cy="56" rx="5" ry="6" fill="white" />
        <ellipse cx="68" cy="56" rx="5" ry="6" fill="white" />
        <ellipse cx="52" cy="56" rx="2.5" ry="4.5" fill={sc} />
        <ellipse cx="68" cy="56" rx="2.5" ry="4.5" fill={sc} />
        {/* Eye shine */}
        <circle cx="53.5" cy="54" r="1.2" fill="white" />
        <circle cx="69.5" cy="54" r="1.2" fill="white" />
      </>}

      {/* --- Blush (happy/excited) --- */}
      {(mood === "happy" || mood === "excited") && <>
        <ellipse cx="44" cy="62" rx="5" ry="3" fill="#FDA4AF" opacity={mood === "excited" ? "0.55" : "0.35"} />
        <ellipse cx="76" cy="62" rx="5" ry="3" fill="#FDA4AF" opacity={mood === "excited" ? "0.55" : "0.35"} />
      </>}

      {/* --- Mouth --- */}
      {(mood === "happy" || mood === "excited") ? <>
        <path d="M55 64 Q60 68 60 64" stroke={sc} strokeWidth="1.2" fill="none" />
        <path d="M60 64 Q60 68 65 64" stroke={sc} strokeWidth="1.2" fill="none" />
      </> : <line x1="56" y1="64" x2="64" y2="64" stroke={sc} strokeWidth="1" opacity="0.4" />}

      {/* --- Crown / Tiara (stage 3+) --- */}
      {stg >= 3 && <>
        <polygon points="46,26 50,14 54,24 58,8 62,24 66,14 70,26" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="58" cy="15" r="2" fill="#EF4444" />
        <circle cx="50" cy="20" r="1.5" fill="#0EA5E9" />
        <circle cx="66" cy="20" r="1.5" fill="#34D399" />
      </>}

      {/* --- Floating star particles (stage 2+) --- */}
      {stg >= 2 && <>
        <circle cx="22" cy="48" r="2" fill="#FCD34D" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="98" cy="42" r="1.5" fill="#FCD34D" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="90" r="1.8" fill="#FBBF24" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </>}

      {/* --- Sleepy z's --- */}
      {mood === "sleepy" && <>
        <text x="96" y="44" fontSize="12" opacity="0.5">z</text>
        <text x="104" y="34" fontSize="10" opacity="0.35">z</text>
        <text x="110" y="26" fontSize="8" opacity="0.2">z</text>
      </>}

      {/* --- Excited sparkles --- */}
      {mood === "excited" && <>
        <text x="26" y="38" fontSize="9">{"\u2728"}</text>
        <text x="84" y="34" fontSize="9">{"\u2B50"}</text>
      </>}
    </svg>
  );
}

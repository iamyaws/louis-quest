import React from 'react';
import { PHOENIX_VARIANTS } from '../constants';

const FALLBACK = { col: "#F59E0B", chest: "#FEF3C7", wing: "#DC2626", tail: "#EF4444", glow: "#FCD34D" };

export default function PhoenixSidekick({ variant, mood, size: s, stage }) {
  const c = (PHOENIX_VARIANTS && PHOENIX_VARIANTS[variant]) || FALLBACK;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 3;

  return (
    <svg viewBox="0 0 120 140" width={sz} height={sz * 1.17} style={{ filter: `drop-shadow(0 4px 8px ${c.glow}33)${stg >= 4 ? ` drop-shadow(0 0 14px ${c.glow}90)` : stg >= 3 ? ` drop-shadow(0 0 8px ${c.glow}60)` : ""}` }}>
      <defs>
        <radialGradient id={`phoenix-glow-${variant}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`tail-fade-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.tail} stopOpacity="1" />
          <stop offset="100%" stopColor={c.tail} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="60" cy="85" rx={40 + stg * 2} ry={35 + stg * 2} fill={`url(#phoenix-glow-${variant})`} />

      {/* Stage 4: intense glow aura */}
      {stg >= 4 && (
        <ellipse cx="60" cy="80" rx="50" ry="45" fill="none" stroke={c.glow} strokeWidth="2" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.15;0.3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="rx" values="50;53;50" dur="2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="45;48;45" dur="2s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Tail feathers — 3 curved flame-like plumes */}
      <g transform="translate(60, 105)">
        {/* Center plume */}
        <path
          d={stg >= 4 ? "M0 0 Q-4 20 2 45 Q4 35 0 0" : "M0 0 Q-3 14 1 28 Q3 22 0 0"}
          fill={`url(#tail-fade-${variant})`}
          stroke={c.tail}
          strokeWidth="1"
          opacity="0.9"
        />
        {/* Left plume */}
        <path
          d={stg >= 4 ? "M-4 0 Q-16 18 -12 42 Q-8 30 -4 0" : "M-3 0 Q-12 12 -8 24 Q-6 18 -3 0"}
          fill={c.tail}
          opacity="0.7"
        />
        {/* Right plume */}
        <path
          d={stg >= 4 ? "M4 0 Q16 18 12 42 Q8 30 4 0" : "M3 0 Q12 12 8 24 Q6 18 3 0"}
          fill={c.tail}
          opacity="0.7"
        />
      </g>

      {/* Feet / claws */}
      <g stroke={c.col} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M48 118 L44 128 M48 118 L48 128 M48 118 L52 128" />
        <path d="M72 118 L68 128 M72 118 L72 128 M72 118 L76 128" />
      </g>

      {/* Fluffy round body */}
      <ellipse cx="60" cy="95" rx={28 + stg} ry={24 + stg} fill={c.col} />

      {/* Chest patch */}
      <ellipse cx="60" cy="100" rx="16" ry="14" fill={c.chest} opacity="0.6" />

      {/* Wings — left */}
      <path
        d="M32 88 Q18 75 22 65 Q26 72 34 80"
        fill={c.wing}
        stroke={c.wing}
        strokeWidth="1"
        opacity="0.85"
      />
      <path d="M34 85 Q24 78 26 70" fill="none" stroke={c.chest} strokeWidth="1" opacity="0.3" />

      {/* Wings — right */}
      <path
        d="M88 88 Q102 75 98 65 Q94 72 86 80"
        fill={c.wing}
        stroke={c.wing}
        strokeWidth="1"
        opacity="0.85"
      />
      <path d="M86 85 Q96 78 94 70" fill="none" stroke={c.chest} strokeWidth="1" opacity="0.3" />

      {/* Head — round, sits on top of body */}
      <circle cx="60" cy="62" r={20 + stg * 0.5} fill={c.col} />

      {/* Stage 3+: crest / crown feathers on head */}
      {stg >= 3 && (
        <g>
          <path d="M52 44 Q50 30 54 26 Q56 34 56 44" fill={c.tail} opacity="0.8" />
          <path d="M58 42 Q58 24 62 20 Q64 30 62 42" fill={c.tail} opacity="0.9" />
          <path d="M64 44 Q68 30 66 26 Q62 34 64 44" fill={c.tail} opacity="0.8" />
        </g>
      )}

      {/* Beak — small pointed triangle */}
      <polygon points="57,68 60,73 63,68" fill="#F97316" />

      {/* Eyes */}
      {mood === "sleepy" ? (
        <>
          <line x1="50" y1="60" x2="56" y2="60" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1="60" x2="70" y2="60" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (mood === "happy" || mood === "excited") ? (
        <>
          {/* Happy curved eyes */}
          <path d="M49 60 Q53 55 57 60" stroke="#1E1B4B" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M63 60 Q67 55 71 60" stroke="#1E1B4B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Neutral big round eyes */}
          <circle cx="53" cy="59" r="4.5" fill="white" />
          <circle cx="67" cy="59" r="4.5" fill="white" />
          <circle cx="53" cy="59" r="2.5" fill="#1E1B4B" />
          <circle cx="67" cy="59" r="2.5" fill="#1E1B4B" />
          <circle cx="54.5" cy="57.5" r="1" fill="white" />
          <circle cx="68.5" cy="57.5" r="1" fill="white" />
        </>
      )}

      {/* Blush cheeks */}
      <ellipse cx="46" cy="64" rx="4" ry="3" fill="#FDA4AF" opacity={(mood === "happy" || mood === "excited") ? "0.5" : "0.2"} />
      <ellipse cx="74" cy="64" rx="4" ry="3" fill="#FDA4AF" opacity={(mood === "happy" || mood === "excited") ? "0.5" : "0.2"} />

      {/* Sleepy z's */}
      {mood === "sleepy" && (
        <>
          <text x="82" y="48" fontSize="12" fill="#1E1B4B" opacity="0.5">z</text>
          <text x="90" y="38" fontSize="10" fill="#1E1B4B" opacity="0.35">z</text>
          <text x="96" y="30" fontSize="8" fill="#1E1B4B" opacity="0.2">z</text>
        </>
      )}

      {/* Excited sparkle + extra glow */}
      {mood === "excited" && (
        <>
          <text x="26" y="42" fontSize="10">{"\u2728"}</text>
          <text x="84" y="38" fontSize="10">{"\u2728"}</text>
          <ellipse cx="60" cy="80" rx="35" ry="30" fill={c.glow} opacity="0.1">
            <animate attributeName="opacity" values="0.1;0.2;0.1" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* Stage 2+: floating ember particles (campfire sparks) */}
      {stg >= 2 && (
        <>
          <circle cx="28" cy="52" r="2" fill="#F97316" opacity="0.7">
            <animate attributeName="cy" values="52;46;52" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="92" cy="48" r="1.5" fill="#EF4444" opacity="0.6">
            <animate attributeName="cy" values="48;40;48" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="38" cy="38" r="1.2" fill="#FCD34D" opacity="0.5">
            <animate attributeName="cy" values="38;32;38" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="82" cy="34" r="1" fill="#F97316" opacity="0.4">
            <animate attributeName="cy" values="34;28;34" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

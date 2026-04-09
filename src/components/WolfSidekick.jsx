import React from 'react';
import { WOLF_VARIANTS } from '../constants';

const FALLBACK = { col: "#64748B", belly: "#E2E8F0", ear: "#94A3B8", tail: "#475569" };

export default function WolfSidekick({ variant, mood, size: s, stage }) {
  const c = (WOLF_VARIANTS && WOLF_VARIANTS[variant]) || FALLBACK;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 3;
  const dk = c.col === "#475569" || c.col === "#64748B";
  const sc = dk ? "#94A3B8" : "#1E1B4B";

  // Stage 4 gets a bigger, fluffier tail
  const tailFluff = stg >= 4 ? 1.3 : 1;

  return (
    <svg
      viewBox="0 0 120 140"
      width={sz}
      height={sz * 1.17}
      style={{
        filter: `drop-shadow(0 4px 8px ${c.col}33)${
          stg >= 4
            ? ` drop-shadow(0 0 14px #FCD34D90)`
            : stg >= 3
            ? ` drop-shadow(0 0 8px ${c.col}60)`
            : ""
        }`,
      }}
    >
      {/* Stage 4: golden glow aura */}
      {stg >= 4 && (
        <ellipse cx="60" cy="90" rx="50" ry="45" fill="#FCD34D" opacity="0.1">
          <animate attributeName="opacity" values="0.1;0.18;0.1" dur="3s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Big fluffy tail curving up from behind */}
      <path
        d={`M85 100 Q${100 * tailFluff} ${75 / tailFluff} ${108 * tailFluff} ${50 / tailFluff} Q${105 * tailFluff} ${42 / tailFluff} ${95 * tailFluff} ${48 / tailFluff} Q${100} ${65} 88 85`}
        fill={c.tail}
        stroke={c.tail}
        strokeWidth="1"
      />
      {/* Extra fluff on stage 4 tail */}
      {stg >= 4 && (
        <path
          d="M105 42 Q115 32 118 38 Q116 45 108 48"
          fill={c.tail}
          stroke={c.col}
          strokeWidth="0.5"
          opacity="0.8"
        />
      )}

      {/* Body — slightly elongated round shape */}
      <ellipse cx="60" cy="95" rx={32 + stg} ry={24 + stg} fill={c.col} />

      {/* Lighter chest/belly */}
      <ellipse cx="60" cy="100" rx="19" ry="15" fill={c.belly} opacity="0.5" />

      {/* Front paws (stubby) */}
      <ellipse cx="44" cy="118" rx="9" ry="7" fill={c.col} />
      <ellipse cx="76" cy="118" rx="9" ry="7" fill={c.col} />
      {/* Paw pads */}
      <ellipse cx="44" cy="120" rx="5" ry="3.5" fill={c.belly} opacity="0.4" />
      <ellipse cx="76" cy="120" rx="5" ry="3.5" fill={c.belly} opacity="0.4" />

      {/* Back paws peeking out */}
      <ellipse cx="36" cy="122" rx="7" ry="5" fill={c.col} />
      <ellipse cx="84" cy="122" rx="7" ry="5" fill={c.col} />

      {/* Head — round */}
      <circle cx="60" cy="60" r={23 + stg * 0.5} fill={c.col} />

      {/* Muzzle / snout area — lighter */}
      <ellipse cx="60" cy="68" rx="12" ry="8" fill={c.belly} opacity="0.35" />

      {/* Tall pointed ears — taller + more triangular than cat */}
      <polygon points="36,55 24,18 52,45" fill={c.col} />
      <polygon points="39,50 29,25 50,44" fill={c.ear} />
      <polygon points="84,55 96,18 68,45" fill={c.col} />
      <polygon points="81,50 91,25 70,44" fill={c.ear} />

      {/* Eyes — mood-based */}
      {mood === "sleepy" ? (
        <>
          {/* Closed sleepy eyes */}
          <line x1="49" y1="58" x2="56" y2="58" stroke={sc} strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1="58" x2="71" y2="58" stroke={sc} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : mood === "happy" || mood === "excited" ? (
        <>
          {/* Happy curved eyes */}
          <path d="M49 58 Q52.5 54 56 58" stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M64 58 Q67.5 54 71 58" stroke={sc} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Neutral open eyes with pupils */}
          <ellipse cx="52" cy="57" rx="4.5" ry="5.5" fill="white" />
          <ellipse cx="68" cy="57" rx="4.5" ry="5.5" fill="white" />
          <ellipse cx="52" cy="57" rx="2" ry="4.5" fill={dk ? "#1E293B" : "#1E1B4B"} />
          <ellipse cx="68" cy="57" rx="2" ry="4.5" fill={dk ? "#1E293B" : "#1E1B4B"} />
          {/* Eye shine */}
          <circle cx="53.5" cy="55" r="1.2" fill="white" />
          <circle cx="69.5" cy="55" r="1.2" fill="white" />
        </>
      )}

      {/* Nose — small rounded triangle, black */}
      <path d="M57 65 Q60 62 63 65 Q60 68 57 65 Z" fill="#1E1B4B" />

      {/* Blush marks */}
      <ellipse
        cx="44"
        cy="64"
        rx="4"
        ry="3"
        fill="#FDA4AF"
        opacity={mood === "happy" || mood === "excited" ? "0.5" : "0.2"}
      />
      <ellipse
        cx="76"
        cy="64"
        rx="4"
        ry="3"
        fill="#FDA4AF"
        opacity={mood === "happy" || mood === "excited" ? "0.5" : "0.2"}
      />

      {/* Mouth */}
      {mood === "happy" || mood === "excited" ? (
        <>
          {/* Happy smile */}
          <path d="M55 70 Q60 75 65 70" stroke={sc} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Tongue sticking out */}
          <ellipse cx="60" cy="74" rx="3" ry="3.5" fill="#FDA4AF" />
          <ellipse cx="60" cy="73" rx="3" ry="2" fill={c.belly} opacity="0.3" />
        </>
      ) : (
        <line x1="57" y1="70" x2="63" y2="70" stroke={sc} strokeWidth="1.2" opacity="0.4" />
      )}

      {/* Sleepy Z's */}
      {mood === "sleepy" && (
        <>
          <text x="96" y="46" fontSize="12" opacity="0.5">z</text>
          <text x="104" y="36" fontSize="10" opacity="0.35">z</text>
          <text x="110" y="28" fontSize="8" opacity="0.2">z</text>
        </>
      )}

      {/* Excited sparkles */}
      {mood === "excited" && (
        <>
          <text x="26" y="40" fontSize="9">{"\u2728"}</text>
          <text x="84" y="36" fontSize="9">{"\u2B50"}</text>
        </>
      )}

      {/* Stage 2+: floating particles */}
      {stg >= 2 && (
        <>
          <circle cx="22" cy="48" r="2" fill="#FCD34D" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="98" cy="42" r="1.5" fill="#FCD34D" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="15" cy="75" r="1.5" fill="#A78BFA" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="105" cy="70" r="2" fill="#34D399" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Stage 3+: crown */}
      {stg >= 3 && (
        <>
          <polygon
            points="44,24 48,12 53,22 57,8 61,22 66,10 70,22 74,14 76,24"
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="1"
          />
          <circle cx="57" cy="17" r="2" fill="#EF4444" />
          <circle cx="66" cy="15" r="1.5" fill="#0EA5E9" />
          <circle cx="49" cy="19" r="1.5" fill="#34D399" />
        </>
      )}
    </svg>
  );
}

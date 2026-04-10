import React from 'react';
import { CAT_VARIANTS } from '../constants';

export default function CatSidekick({ variant, mood, size: s, stage, gear }) {
  const c = CAT_VARIANTS[variant] || CAT_VARIANTS.galaxy;
  const stg = stage || 0;
  const baseSize = s || 60;
  const sz = baseSize + stg * 3;
  const dk = variant === "shadow";
  const sc = dk ? "#94A3B8" : "#1E1B4B";
  return (
    <svg viewBox="0 0 120 140" width={sz} height={sz * 1.17} style={{ filter: `drop-shadow(0 4px 8px ${c.col}33)${stg >= 4 ? ` drop-shadow(0 0 12px #FCD34D80)` : stg >= 3 ? ` drop-shadow(0 0 8px ${c.col}60)` : ""}` }}>
      {stg >= 4 && <>
        <path d="M30 85 Q10 60 5 40 Q8 55 20 70 Q15 50 12 35 Q18 55 28 75" fill={`${c.col}60`} stroke={c.col} strokeWidth="1" opacity="0.7" />
        <path d="M90 85 Q110 60 115 40 Q112 55 100 70 Q105 50 108 35 Q102 55 92 75" fill={`${c.col}60`} stroke={c.col} strokeWidth="1" opacity="0.7" />
      </>}
      <path d="M90 100 Q108 85 105 65 Q104 55 98 52" stroke={c.col} strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="95" rx={30 + stg} ry={25 + stg} fill={c.col} /><ellipse cx="60" cy="99" rx="18" ry="14" fill="white" opacity="0.15" />
      {c.stripes && <><line x1="42" y1="85" x2="38" y2="92" stroke="#C2410C" strokeWidth="2" opacity="0.3" strokeLinecap="round" /><line x1="78" y1="85" x2="82" y2="92" stroke="#C2410C" strokeWidth="2" opacity="0.3" strokeLinecap="round" /></>}
      <polygon points="38,58 30,30 50,48" fill={c.col} /><polygon points="40,54 34,36 48,48" fill={c.ear} />
      <polygon points="82,58 90,30 70,48" fill={c.col} /><polygon points="80,54 86,36 72,48" fill={c.ear} />
      <circle cx="60" cy="62" r={22 + stg * 0.5} fill={c.col} />
      {mood === "sleepy" ? <>
        <line x1="50" y1="60" x2="56" y2="60" stroke={sc} strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="60" x2="70" y2="60" stroke={sc} strokeWidth="2" strokeLinecap="round" />
      </> : <>
        <ellipse cx="53" cy="60" rx="4" ry="5" fill="white" /><ellipse cx="67" cy="60" rx="4" ry="5" fill="white" />
        <ellipse cx="53" cy="60" rx="1.8" ry="4" fill={dk ? "#1E293B" : "#1E1B4B"} /><ellipse cx="67" cy="60" rx="1.8" ry="4" fill={dk ? "#1E293B" : "#1E1B4B"} />
        <circle cx="54.5" cy="58" r="1" fill="white" /><circle cx="68.5" cy="58" r="1" fill="white" />
      </>}
      <polygon points="60,66 57,69 63,69" fill="#FDA4AF" />
      <line x1="35" y1="66" x2="48" y2="67" stroke={sc} strokeWidth="1" opacity="0.3" /><line x1="35" y1="70" x2="48" y2="70" stroke={sc} strokeWidth="1" opacity="0.3" />
      <line x1="72" y1="67" x2="85" y2="66" stroke={sc} strokeWidth="1" opacity="0.3" /><line x1="72" y1="70" x2="85" y2="70" stroke={sc} strokeWidth="1" opacity="0.3" />
      {(mood === "happy" || mood === "excited") ? <>
        <path d="M56 72 Q60 76 60 72" stroke={sc} strokeWidth="1.5" fill="none" />
        <path d="M60 72 Q60 76 64 72" stroke={sc} strokeWidth="1.5" fill="none" />
      </> : <line x1="57" y1="72" x2="63" y2="72" stroke={sc} strokeWidth="1.2" opacity="0.4" />}
      <ellipse cx="46" cy="68" rx="4" ry="3" fill="#FDA4AF" opacity={mood === "excited" ? "0.5" : "0.3"} /><ellipse cx="74" cy="68" rx="4" ry="3" fill="#FDA4AF" opacity={mood === "excited" ? "0.5" : "0.3"} />
      <ellipse cx="48" cy="120" rx="10" ry="6" fill={c.col} /><ellipse cx="72" cy="120" rx="10" ry="6" fill={c.col} />
      {stg >= 3 && <>
        <polygon points="48,28 52,18 56,26 60,14 64,26 68,18 72,28" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="60" cy="20" r="2" fill="#EF4444" />
        <circle cx="52" cy="23" r="1.5" fill="#0EA5E9" />
        <circle cx="68" cy="23" r="1.5" fill="#34D399" />
      </>}
      {mood === "sleepy" && <>
        <text x="98" y="48" fontSize="12" opacity="0.5">z</text>
        <text x="106" y="38" fontSize="10" opacity="0.35">z</text>
        <text x="112" y="30" fontSize="8" opacity="0.2">z</text>
      </>}
      {mood === "excited" && <>
        <text x="28" y="42" fontSize="9">{"\u2728"}</text>
        <text x="82" y="38" fontSize="9">{"\u2B50"}</text>
      </>}

      {/* ── Equipped Gear Overlays ── */}
      {gear?.head === "c_crown" && (
        <g>
          <polygon points="48,28 52,18 56,26 60,14 64,26 68,18 72,28" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="60" cy="20" r="2.5" fill="#EF4444" />
          <circle cx="52" cy="24" r="1.5" fill="#3B82F6" />
          <circle cx="68" cy="24" r="1.5" fill="#34D399" />
        </g>
      )}
      {gear?.head === "h_headband" && (
        <g>
          <path d="M38 52 Q60 44 82 52" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="50" r="3" fill="#EF4444" />
        </g>
      )}
      {gear?.head === "h_sunglasses" && (
        <g>
          <rect x="44" y="56" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <rect x="62" y="56" width="14" height="10" rx="3" fill="#1E293B" opacity="0.85" />
          <line x1="58" y1="60" x2="62" y2="60" stroke="#1E293B" strokeWidth="2" />
          <line x1="44" y1="60" x2="38" y2="56" stroke="#1E293B" strokeWidth="1.5" />
          <line x1="76" y1="60" x2="82" y2="56" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      )}
      {gear?.body === "h_cape_red" && (
        <g>
          <path d="M40 75 Q30 90 25 115 Q35 112 45 115 L50 90 Z" fill="#DC2626" opacity="0.8" />
          <path d="M80 75 Q90 90 95 115 Q85 112 75 115 L70 90 Z" fill="#DC2626" opacity="0.8" />
        </g>
      )}
      {gear?.body === "c_scarf" && (
        <g>
          <path d="M42 76 Q60 82 78 76" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M46 78 L42 95" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M44 95 L48 88" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {gear?.body === "c_bowtie" && (
        <g>
          <polygon points="52,76 60,72 60,80" fill="#EC4899" />
          <polygon points="68,76 60,72 60,80" fill="#EC4899" />
          <circle cx="60" cy="76" r="3" fill="#DB2777" />
        </g>
      )}
      {gear?.accessory === "h_wings" && (
        <g>
          <path d="M30 85 Q10 65 5 45 Q15 60 25 72 Q12 55 10 40 Q20 58 30 75" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
          <path d="M90 85 Q110 65 115 45 Q105 60 95 72 Q108 55 110 40 Q100 58 90 75" fill="#A78BFA" opacity="0.7" stroke="#7C3AED" strokeWidth="1" />
        </g>
      )}
      {gear?.accessory === "c_collar" && (
        <g>
          <ellipse cx="60" cy="78" rx="18" ry="4" fill="none" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="60" cy="82" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        </g>
      )}

      {stg >= 2 && <>
        <circle cx="25" cy="50" r="2" fill="#FCD34D" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="95" cy="45" r="1.5" fill="#FCD34D" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" /></circle>
      </>}
    </svg>
  );
}

import React from 'react';
import { CAT_VARIANTS } from '../constants';

export default function CatSidekick({ variant, mood, size: s }) {
  const c = CAT_VARIANTS[variant] || CAT_VARIANTS.galaxy;
  const sz = s || 60;
  const dk = variant === "shadow";
  const sc = dk ? "#94A3B8" : "#1E1B4B";
  return (
    <svg viewBox="0 0 120 140" width={sz} height={sz * 1.17} style={{ filter: `drop-shadow(0 4px 8px ${c.col}33)` }}>
      <path d="M90 100 Q108 85 105 65 Q104 55 98 52" stroke={c.col} strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="95" rx="30" ry="25" fill={c.col} /><ellipse cx="60" cy="99" rx="18" ry="14" fill="white" opacity="0.15" />
      {c.stripes && <><line x1="42" y1="85" x2="38" y2="92" stroke="#C2410C" strokeWidth="2" opacity="0.3" strokeLinecap="round" /><line x1="78" y1="85" x2="82" y2="92" stroke="#C2410C" strokeWidth="2" opacity="0.3" strokeLinecap="round" /></>}
      <polygon points="38,58 30,30 50,48" fill={c.col} /><polygon points="40,54 34,36 48,48" fill={c.ear} />
      <polygon points="82,58 90,30 70,48" fill={c.col} /><polygon points="80,54 86,36 72,48" fill={c.ear} />
      <circle cx="60" cy="62" r="22" fill={c.col} />
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
      <ellipse cx="46" cy="68" rx="4" ry="3" fill="#FDA4AF" opacity="0.3" /><ellipse cx="74" cy="68" rx="4" ry="3" fill="#FDA4AF" opacity="0.3" />
      <ellipse cx="48" cy="120" rx="10" ry="6" fill={c.col} /><ellipse cx="72" cy="120" rx="10" ry="6" fill={c.col} />
    </svg>
  );
}

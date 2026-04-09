import React from 'react';

export default function HeroSprite({ shape, color, eyes, hair, size: s, level }) {
  const sz = s || 140;
  const lvl = level || 1;
  const hasCape = lvl >= 5;
  const hasCrown = lvl >= 10;
  const hasGlow = lvl >= 15;
  return (
    <svg viewBox="0 0 200 240" width={sz} height={sz * 1.2} style={{ filter: hasGlow ? `drop-shadow(0 0 20px ${color}88)` : `drop-shadow(0 6px 16px rgba(0,0,0,0.12))` }}>
      {hasCape && <path d="M70 120 L60 200 L100 185 L140 200 L130 120" fill={color} opacity="0.3" />}
      {shape === "cube" && <rect x="55" y="100" width="90" height="90" rx="18" fill={color} />}
      {shape === "circle" && <ellipse cx="100" cy="145" rx="48" ry="48" fill={color} />}
      {shape === "hex" && <polygon points="100,98 148,120 148,170 100,192 52,170 52,120" fill={color} />}
      {shape === "pill" && <rect x="62" y="90" width="76" height="105" rx="38" fill={color} />}
      <ellipse cx="85" cy="125" rx="20" ry="12" fill="white" opacity="0.2" transform="rotate(-20 85 125)" />
      <circle cx="100" cy="78" r="36" fill={color} />
      <ellipse cx="88" cy="70" rx="14" ry="8" fill="white" opacity="0.15" transform="rotate(-15 88 70)" />
      {eyes === "round" && <><circle cx="87" cy="78" r="8" fill="white" /><circle cx="113" cy="78" r="8" fill="white" /><circle cx="89" cy="77" r="4.5" fill="#1E1B4B" /><circle cx="115" cy="77" r="4.5" fill="#1E1B4B" /><circle cx="91" cy="75" r="1.5" fill="white" /><circle cx="117" cy="75" r="1.5" fill="white" /></>}
      {eyes === "happy" && <><path d="M79 78 Q87 70 95 78" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M105 78 Q113 70 121 78" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" /></>}
      {eyes === "cool" && <><rect x="78" y="73" width="18" height="8" rx="4" fill="white" /><rect x="104" y="73" width="18" height="8" rx="4" fill="white" /><rect x="82" y="74" width="8" height="6" rx="3" fill="#1E1B4B" /><rect x="108" y="74" width="8" height="6" rx="3" fill="#1E1B4B" /></>}
      {eyes === "big" && <><circle cx="86" cy="78" r="10" fill="white" /><circle cx="114" cy="78" r="10" fill="white" /><circle cx="88" cy="77" r="6" fill="#1E1B4B" /><circle cx="116" cy="77" r="6" fill="#1E1B4B" /><circle cx="90" cy="74" r="2.5" fill="white" /><circle cx="118" cy="74" r="2.5" fill="white" /></>}
      <path d="M93 92 Q100 98 107 92" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {hair === "short" && <path d="M66 68 Q70 42 100 40 Q130 42 134 68" fill={color} stroke={color} strokeWidth="4" />}
      {hair === "spiky" && <><polygon points="80,52 85,28 95,50" fill={color} /><polygon points="95,48 100,22 108,46" fill={color} /><polygon points="108,50 115,30 120,52" fill={color} /></>}
      {hair === "curly" && <><circle cx="75" cy="55" r="10" fill={color} /><circle cx="90" cy="48" r="11" fill={color} /><circle cx="108" cy="47" r="11" fill={color} /><circle cx="124" cy="54" r="10" fill={color} /></>}
      {hair === "long" && <><path d="M64 68 Q62 45 80 38 Q100 32 120 38 Q138 45 136 68" fill={color} /><path d="M64 68 L58 120" stroke={color} strokeWidth="10" strokeLinecap="round" /><path d="M136 68 L142 120" stroke={color} strokeWidth="10" strokeLinecap="round" /></>}
      {hair === "cap" && <><ellipse cx="100" cy="58" rx="40" ry="18" fill="#1E293B" /><rect x="60" y="55" width="80" height="10" rx="5" fill="#1E293B" /><circle cx="100" cy="42" r="5" fill="white" /></>}
      {hasCrown && <g transform="translate(100,33)"><polygon points="-16,10 -11,-5 -5,5 0,-12 5,5 11,-5 16,10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" /></g>}
      <ellipse cx="82" cy="198" rx="14" ry="8" fill={color} /><ellipse cx="118" cy="198" rx="14" ry="8" fill={color} />
    </svg>
  );
}

import React, { useState, useEffect } from 'react';

/**
 * ToothBrushGuide — 3-minute guided tooth-brushing screen.
 * 6 zones × 30s each = 3 minutes total.
 * Each zone shows:
 *   - A mouth SVG with the current zone highlighted
 *   - A motion hint
 *   - A countdown for the zone
 *   - Progress dots below
 */

const ZONES = [
  { id: 'top-right-out', label: 'Oben rechts außen',        motion: 'Kleine Kreise',       seconds: 30 },
  { id: 'top-left-out',  label: 'Oben links außen',         motion: 'Kleine Kreise',       seconds: 30 },
  { id: 'top-back',      label: 'Oben hinten (Kauflächen)', motion: 'Rauf und runter',     seconds: 30 },
  { id: 'bot-right-out', label: 'Unten rechts außen',       motion: 'Kleine Kreise',       seconds: 30 },
  { id: 'bot-left-out',  label: 'Unten links außen',        motion: 'Kleine Kreise',       seconds: 30 },
  { id: 'tongue',        label: 'Zunge',                    motion: 'Sanft abbürsten',     seconds: 30 },
];

export default function ToothBrushGuide({ onFinish, onCancel }) {
  const [zoneIdx, setZoneIdx] = useState(0);
  const [zoneSecondsLeft, setZoneSecondsLeft] = useState(ZONES[0].seconds);

  useEffect(() => {
    if (zoneSecondsLeft <= 0) {
      if (zoneIdx + 1 >= ZONES.length) {
        onFinish?.();
        return;
      }
      const nextIdx = zoneIdx + 1;
      setZoneIdx(nextIdx);
      setZoneSecondsLeft(ZONES[nextIdx].seconds);
      return;
    }
    const t = setTimeout(() => setZoneSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [zoneSecondsLeft, zoneIdx, onFinish]);

  const zone = ZONES[zoneIdx];

  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center px-6"
         style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)' }}>
      <MouthSVG activeZone={zone.id} />

      <h2 className="font-headline font-bold text-2xl text-[#0c4a6e] mt-6 mb-1"
          style={{ fontFamily: 'Fredoka, sans-serif' }}>
        {zone.label}
      </h2>
      <p className="font-body text-base text-[#0369a1] mb-4 italic">{zone.motion}</p>

      <div className="text-5xl font-bold text-[#0c4a6e] mb-4 tabular-nums">
        {zoneSecondsLeft}s
      </div>

      <div className="flex gap-2 mb-2">
        {ZONES.map((_, i) => (
          <div key={i} className="rounded-full"
               style={{
                 width: i === zoneIdx ? 14 : 10,
                 height: i === zoneIdx ? 14 : 10,
                 background: i < zoneIdx ? '#10b981' : i === zoneIdx ? '#0ea5e9' : 'rgba(12,74,110,0.15)',
                 transition: 'width 300ms ease, height 300ms ease, background 300ms ease',
               }} />
        ))}
      </div>
      <p className="font-label text-xs text-[#0c4a6e]/50 uppercase tracking-widest mb-8">
        {zoneIdx + 1} von {ZONES.length}
      </p>

      <button onClick={onCancel}
        className="font-label text-sm text-[#0c4a6e]/40 active:opacity-70 py-3 px-6 min-h-[44px]">
        Abbrechen
      </button>
    </div>
  );
}

function MouthSVG({ activeZone }) {
  const stroke = (id, base) => activeZone === id ? '#0ea5e9' : base;
  const baseFaint = 'rgba(14,165,233,0.18)';
  return (
    <svg viewBox="0 0 200 160" className="w-72 h-56">
      {/* Upper arch — right outside */}
      <path d="M 20 45 Q 55 28 100 32"
            fill="none" stroke={stroke('top-right-out', baseFaint)} strokeWidth="18" strokeLinecap="round" />
      {/* Upper arch — left outside */}
      <path d="M 100 32 Q 145 28 180 45"
            fill="none" stroke={stroke('top-left-out', baseFaint)} strokeWidth="18" strokeLinecap="round" />
      {/* Upper back / Kauflächen — inner curve */}
      <path d="M 65 55 Q 100 68 135 55"
            fill="none" stroke={stroke('top-back', baseFaint)} strokeWidth="14" strokeLinecap="round" />
      {/* Lower arch — right outside */}
      <path d="M 20 115 Q 55 132 100 128"
            fill="none" stroke={stroke('bot-right-out', baseFaint)} strokeWidth="18" strokeLinecap="round" />
      {/* Lower arch — left outside */}
      <path d="M 100 128 Q 145 132 180 115"
            fill="none" stroke={stroke('bot-left-out', baseFaint)} strokeWidth="18" strokeLinecap="round" />
      {/* Tongue (pink) */}
      <ellipse cx="100" cy="92" rx="32" ry="11"
               fill={activeZone === 'tongue' ? '#ec4899' : 'rgba(236,72,153,0.25)'} />
      {/* Tongue midline */}
      <line x1="100" y1="84" x2="100" y2="100"
            stroke={activeZone === 'tongue' ? '#be185d' : 'rgba(190,24,93,0.15)'}
            strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

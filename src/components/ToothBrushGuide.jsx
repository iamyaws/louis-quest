import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';

/**
 * ToothBrushGuide — 3-minute guided tooth-brushing screen with two modes.
 *
 * TASCHE-MODUS (default, "Ab in die Tasche"): dark calm screen, Ronki silhouette
 * breathing, ONE big message asking Louis to put the phone down. Audio cues at
 * each 30s zone transition (via VoiceAudio direct-play). Designed so Louis
 * doesn't stare at the phone for the full 3 minutes.
 *
 * SCHAU-MODUS: the original illustrated 6-zone guide with mouth SVG, motion
 * hints and visible countdown. For days when a visual guide is wanted.
 *
 * Mode is controlled by familyConfig.toothBrushDefaultMode (parent toggle).
 *
 * 6 zones x 30s = 3 min total.
 */

const ZONES = [
  { id: 'top-right-out', label: 'Oben rechts außen',        motion: 'Kleine Kreise',       seconds: 30, voiceId: 'de_brush_zone_1' },
  { id: 'top-left-out',  label: 'Oben links außen',         motion: 'Kleine Kreise',       seconds: 30, voiceId: 'de_brush_zone_2' },
  { id: 'top-back',      label: 'Oben hinten (Kauflächen)', motion: 'Rauf und runter',     seconds: 30, voiceId: 'de_brush_zone_3' },
  { id: 'bot-right-out', label: 'Unten rechts außen',       motion: 'Kleine Kreise',       seconds: 30, voiceId: 'de_brush_zone_4' },
  { id: 'bot-left-out',  label: 'Unten links außen',        motion: 'Kleine Kreise',       seconds: 30, voiceId: 'de_brush_zone_5' },
  { id: 'tongue',        label: 'Zunge',                    motion: 'Sanft abbürsten',     seconds: 30, voiceId: 'de_brush_zone_6' },
];

export default function ToothBrushGuide({ onFinish, onCancel }) {
  const { state } = useTask();
  const mode = state?.familyConfig?.toothBrushDefaultMode || 'tasche';

  const [zoneIdx, setZoneIdx] = useState(0);
  const [zoneSecondsLeft, setZoneSecondsLeft] = useState(ZONES[0].seconds);
  // Flag flipped by visibilitychange — only matters in Tasche mode
  const [wasHidden, setWasHidden] = useState(false);

  // ── Zone countdown + transition audio cue ──
  useEffect(() => {
    if (zoneSecondsLeft <= 0) {
      if (zoneIdx + 1 >= ZONES.length) {
        // Final zone done — play completion line, then finish
        VoiceAudio.play('de_brush_done_01');
        SFX.play('chime');
        onFinish?.();
        return;
      }
      const nextIdx = zoneIdx + 1;
      // Audio cue for the new zone — voice line (if audio exists) + SFX beep fallback
      VoiceAudio.play(ZONES[nextIdx].voiceId);
      SFX.play('pop');
      setZoneIdx(nextIdx);
      setZoneSecondsLeft(ZONES[nextIdx].seconds);
      return;
    }
    const t = setTimeout(() => setZoneSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [zoneSecondsLeft, zoneIdx, onFinish]);

  // ── Announce the first zone once on mount (Tasche mode primarily) ──
  useEffect(() => {
    VoiceAudio.play(ZONES[0].voiceId);
    SFX.play('pop');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Detect mid-routine re-entry (Tasche mode — prompt again) ──
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setWasHidden(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (mode === 'schau') {
    return <SchauMode zoneIdx={zoneIdx} zoneSecondsLeft={zoneSecondsLeft} onCancel={onCancel} />;
  }
  return (
    <TascheMode
      zoneIdx={zoneIdx}
      zoneSecondsLeft={zoneSecondsLeft}
      wasHidden={wasHidden}
      onCancel={onCancel}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASCHE MODE — phone down, dark calm, audio carries the guide
// ═══════════════════════════════════════════════════════════════════════
function TascheMode({ zoneIdx, zoneSecondsLeft, wasHidden, onCancel }) {
  const base = import.meta.env.BASE_URL;
  const zone = ZONES[zoneIdx];
  // Total seconds remaining across all zones (for the mid-session nudge only)
  const totalRemaining =
    zoneSecondsLeft +
    ZONES.slice(zoneIdx + 1).reduce((acc, z) => acc + z.seconds, 0);

  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center px-8 text-center"
         style={{
           background: 'radial-gradient(ellipse at center, #0c3236 0%, #061618 70%, #020809 100%)',
         }}>
      {/* Soft Ronki silhouette — dimmed, breathing */}
      <div className="relative mb-8">
        <img
          src={base + 'art/companion/dragon-baby.webp'}
          alt=""
          aria-hidden="true"
          className="w-40 h-auto select-none"
          style={{
            opacity: 0.22,
            filter: 'brightness(0.75) drop-shadow(0 0 32px rgba(94,234,212,0.18))',
            animation: 'ronki-breathe 3.6s ease-in-out infinite',
          }}
          draggable={false}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ONE big message — the whole point of Tasche-Modus */}
      <h2 className="font-headline font-bold text-white text-2xl leading-snug mb-4 max-w-xs"
          style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
        Leg das Handy weg.
      </h2>
      <p className="font-body text-base leading-relaxed mb-10 max-w-xs"
         style={{ color: 'rgba(161,207,211,0.85)' }}>
        Ich ruf dich wenn's fertig ist.
      </p>

      {/* Tiny, unobtrusive zone-name fade — only text confirmation of progress.
          No big countdown. No illustrations. No tap targets. */}
      <p key={zone.id}
         className="font-label text-xs uppercase tracking-[0.3em] transition-opacity duration-500"
         style={{ color: 'rgba(252,211,77,0.4)', animation: 'zone-fade 2.4s ease-in-out' }}>
        {zone.label}
      </p>

      {/* Gentle nudge if Louis came back mid-session */}
      {wasHidden && totalRemaining > 5 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full"
             style={{
               background: 'rgba(252,211,77,0.10)',
               border: '1px solid rgba(252,211,77,0.25)',
               backdropFilter: 'blur(6px)',
             }}>
          <p className="font-label text-xs" style={{ color: 'rgba(252,211,77,0.85)' }}>
            Noch {totalRemaining} Sekunden. Leg mich weg.
          </p>
        </div>
      )}

      {/* Tiny cancel affordance — present but visually minimal */}
      <button onClick={onCancel}
        className="absolute bottom-6 font-label text-xs active:opacity-70 py-3 px-6 min-h-[44px]"
        style={{ color: 'rgba(161,207,211,0.35)' }}>
        Abbrechen
      </button>

      <style>{`
        @keyframes ronki-breathe {
          0%, 100% { transform: scale(1); opacity: 0.22; }
          50%      { transform: scale(1.04); opacity: 0.30; }
        }
        @keyframes zone-fade {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCHAU MODE — original visible 6-zone guide (illustrated backup)
// ═══════════════════════════════════════════════════════════════════════
function SchauMode({ zoneIdx, zoneSecondsLeft, onCancel }) {
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

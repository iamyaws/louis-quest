import React, { useState } from 'react';
import MoodChibi from './MoodChibi';
import { COMPANION_VARIANTS } from '../data/companionVariants';

/**
 * ChibiGallery — dev review page showing every Ronki colorway at
 * every evolution stage, optionally at every mood. Accessible via
 * /?gallery=1 in the URL. Not linked from any in-app navigation —
 * Marc's personal review surface, not for Louis.
 *
 * Layout: 6 columns (variants) × 4 rows (stages), each cell renders
 * a MoodChibi at size 140. A mood toggle at the top switches all
 * chibis between normal / sad / tired so Marc can scan a single
 * emotional state across the whole matrix.
 */

const STAGES = [
  { id: 0, label: 'Ei',             sub: 'Egg' },
  { id: 1, label: 'Baby',           sub: 'Baby (wings from hatch)' },
  { id: 2, label: 'Jungtier',       sub: 'Toddler' },
  { id: 3, label: 'Stolz',          sub: 'Proud — tail appears' },
  { id: 4, label: 'Heranwachsend',  sub: 'Teen — bigger wings' },
  { id: 5, label: 'Legendär',       sub: 'Legend — aura halo' },
];

const MOODS = [
  { id: 'normal',  label: 'Normal',   ink: '#A83E2C' },
  { id: 'sad',     label: 'Traurig',  ink: '#2f3d5a' },
  { id: 'tired',   label: 'Müde',     ink: '#26333c' },
  { id: 'besorgt', label: 'Besorgt',  ink: '#6d28d9' },
  { id: 'gut',     label: 'Gut',      ink: '#a16207' },
  { id: 'magisch', label: 'Magisch',  ink: '#be185d' },
];

export default function ChibiGallery({ onClose }) {
  const [mood, setMood] = useState('normal');

  return (
    <div className="min-h-dvh"
         style={{
           background: '#2a2420',
           color: '#f6ead8',
           padding: '48px 32px 80px',
         }}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <p className="font-label font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.22em', color: '#fcd34d', marginBottom: 6 }}>
            Ronki · Chibi Review
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 34, color: '#fef3c7', letterSpacing: '-0.01em' }}>
            All colorways × all stages
          </h1>
          <p style={{ margin: '6px 0 0', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(255,242,217,0.6)' }}>
            6 variants · 6 stages · 6 moods · live MoodChibi renders from
            the app. Mood toggle below applies to every cell.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              background: 'rgba(252,211,77,0.18)',
              border: '1px solid rgba(252,211,77,0.35)',
              color: '#fcd34d',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
            ← Zurück
          </button>
        )}
      </header>

      {/* Mood toggle */}
      <div className="max-w-6xl mx-auto mb-10 flex gap-2">
        {MOODS.map(m => (
          <button key={m.id}
            onClick={() => setMood(m.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              background: mood === m.id ? '#fcd34d' : 'rgba(255,255,255,0.06)',
              color: mood === m.id ? '#2a2420' : 'rgba(255,242,217,0.75)',
              border: mood === m.id ? '1px solid #fcd34d' : '1px solid rgba(255,255,255,0.12)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Grid — header row with variant names, then one row per stage */}
      <div className="max-w-6xl mx-auto">
        <div style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${COMPANION_VARIANTS.length}, 1fr)`,
          gap: 16,
          alignItems: 'stretch',
        }}>
          {/* Header row */}
          <div />
          {COMPANION_VARIANTS.map(v => (
            <div key={`head-${v.id}`} className="text-center">
              <p style={{
                margin: 0,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: v.borderColor,
                marginBottom: 4,
              }}>
                {v.id}
              </p>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'rgba(255,242,217,0.8)' }}>
                {v.name.de}
              </p>
            </div>
          ))}

          {/* Stage rows */}
          {STAGES.map(st => (
            <React.Fragment key={`row-${st.id}`}>
              <div className="flex flex-col justify-center"
                   style={{
                     background: 'rgba(255,255,255,0.04)',
                     borderRadius: 14,
                     padding: 16,
                     border: '1px solid rgba(255,255,255,0.08)',
                   }}>
                <p style={{
                  margin: 0,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 800,
                  fontSize: 9,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(252,211,77,0.65)',
                }}>
                  Stage {st.id}
                </p>
                <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 19, color: '#fef3c7', fontWeight: 600 }}>
                  {st.label}
                </p>
                <p style={{ margin: '2px 0 0', fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'rgba(255,242,217,0.5)' }}>
                  {st.sub}
                </p>
              </div>
              {COMPANION_VARIANTS.map(v => (
                <div key={`${v.id}-${st.id}`}
                     className="flex items-center justify-center"
                     style={{
                       aspectRatio: '1 / 1.1',
                       background: '#fff8f2',
                       borderRadius: 20,
                       boxShadow: '0 10px 24px -10px rgba(0,0,0,0.35)',
                       border: '1px solid rgba(0,0,0,0.08)',
                       padding: 12,
                       position: 'relative',
                     }}>
                  <MoodChibi size={140} mood={mood} variant={v.id} stage={st.id} bare />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <footer style={{ marginTop: 48, textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'rgba(255,242,217,0.4)' }}>
        Dev review · rendered from live MoodChibi component. Reload to see latest.
      </footer>
    </div>
  );
}

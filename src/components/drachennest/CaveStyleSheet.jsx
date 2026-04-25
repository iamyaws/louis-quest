import React from 'react';
import { useTask } from '../../context/TaskContext';
import { WALLPAPERS, FLOORS } from '../../data/caveStyles';

/**
 * CaveStyleSheet — kid-facing room personalisation picker.
 *
 * Marc 25 Apr 2026 ("approach A, free"): kid taps a wallpaper or
 * floor swatch and the cave updates instantly behind the sheet so
 * they can experiment without committing. No HP economy, no
 * "spend"; this is a vibe-control surface.
 *
 * Layout:
 *  · Two sections — Wand (Wallpaper) + Boden (Floor)
 *  · 3-column swatch grid per section
 *  · Active swatch highlighted with a gold ring
 *  · Sticky "Fertig" button at the bottom dismisses the sheet
 *
 * The sheet is a bottom-anchored ¾-height modal so the cave stays
 * visible above it — the kid sees the swatch take effect on the
 * actual room behind the sheet, not in a tiny preview.
 */

export default function CaveStyleSheet({ onClose }) {
  const { state, actions } = useTask();
  const caveStyle = state?.caveStyle || { wallpaper: 'warm-amber', floor: 'amber' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronkis Zimmer einrichten"
      style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        zIndex: 90,
        height: '78vh',
        background: 'linear-gradient(180deg, #fff8f2 0%, #fef3c7 100%)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -10px 40px -10px rgba(40,20,8,0.45)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'css-slide-up 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
      }}
    >
      {/* Drag handle + header */}
      <div style={{
        padding: '10px 20px 14px',
        borderBottom: '1px solid rgba(180,83,9,0.12)',
        background: 'rgba(255,248,242,0.85)',
        backdropFilter: 'blur(6px)',
      }}>
        <div aria-hidden="true" style={{
          width: 44, height: 5, borderRadius: 999,
          background: 'rgba(120,53,15,0.30)',
          margin: '0 auto 10px',
        }} />
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#A83E2C', textAlign: 'center', marginBottom: 4,
        }}>
          Ronkis Zimmer
        </div>
        <h2 style={{
          margin: 0,
          font: '500 22px/1.2 "Fredoka", sans-serif',
          color: '#124346',
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}>
          Wie soll's heut aussehen?
        </h2>
      </div>

      {/* Scrollable swatches */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '20px 18px 110px',
      }}>
        {/* Wand */}
        <Section
          kicker="Wand"
          subtitle="Wähl die Farbe der Höhle."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 26,
        }}>
          {WALLPAPERS.map(w => (
            <Swatch
              key={w.id}
              label={w.label}
              gradient={w.bg}
              active={caveStyle.wallpaper === w.id}
              onTap={() => actions?.setCaveStyle?.({ wallpaper: w.id })}
            />
          ))}
        </div>

        {/* Boden */}
        <Section
          kicker="Boden"
          subtitle="Was liegt unter Ronki?"
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
        }}>
          {FLOORS.map(f => (
            <Swatch
              key={f.id}
              label={f.label}
              gradient={f.outer}
              active={caveStyle.floor === f.id}
              onTap={() => actions?.setCaveStyle?.({ floor: f.id })}
              wide
            />
          ))}
        </div>
      </div>

      {/* Sticky done button */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        padding: '14px 18px calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(180deg, rgba(255,248,242,0) 0%, rgba(255,248,242,0.92) 35%, rgba(255,248,242,0.96) 100%)',
        backdropFilter: 'blur(6px)',
      }}>
        <button
          type="button"
          onClick={onClose}
          className="active:scale-[0.98] transition-transform"
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 16,
            background: '#124346',
            color: '#fef3c7',
            font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 18px -8px rgba(18,67,70,0.40)',
          }}
        >
          Fertig
        </button>
      </div>

      <style>{`
        @keyframes css-slide-up {
          0%   { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Section({ kicker, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(120,53,15,0.6)', marginBottom: 4,
      }}>
        {kicker}
      </div>
      <div style={{
        font: '500 13px/1.4 "Nunito", sans-serif',
        color: 'rgba(18,67,70,0.7)',
      }}>
        {subtitle}
      </div>
    </div>
  );
}

function Swatch({ label, gradient, active, onTap, wide = false }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="active:scale-[0.96] transition-transform"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: wide ? '2 / 1' : '1 / 1',
        borderRadius: 14,
        background: gradient,
        border: active ? '3px solid #f59e0b' : '2px solid rgba(180,83,9,0.18)',
        boxShadow: active
          ? '0 6px 16px -6px rgba(245,158,11,0.55), inset 0 2px 0 rgba(255,255,255,0.30)'
          : '0 4px 10px -6px rgba(40,20,8,0.30), inset 0 2px 0 rgba(255,255,255,0.30)',
        transition: 'all 0.18s ease-out',
      }} />
      <div style={{
        marginTop: 6,
        font: '600 11px/1.1 "Fredoka", sans-serif',
        color: active ? '#A83E2C' : 'rgba(18,67,70,0.7)',
      }}>
        {label}
      </div>
    </button>
  );
}

import React, { useState } from 'react';
import { EMOJI_VOCABULARY, formatEmojiCode } from '../../data/emojiCodeVocabulary';

/**
 * EmojiCodePicker — pick 3 emojis from the curated 30-emoji
 * vocabulary as the kid's unique sharing code (or as a friend's
 * code being typed in by the parent).
 *
 * Marc 25 Apr 2026 (friends + sign-up Q1 = 3-emoji chain): the
 * pool is 30³ = 27,000 codes. Each pick is one tap on a 30-tile
 * grid; three taps total to set a code. No keyboard, no os
 * emoji-picker, no skin-tone ambiguity — only this controlled
 * vocabulary.
 *
 * Two modes via the `mode` prop:
 *   · 'self'    — kid picks their own code at onboarding. Confirms
 *                 "Das ist dein Zeichen" once 3 are chosen.
 *   · 'friend'  — parent types a friend's code to add them. Shows
 *                 "Code von einem Freund" + a confirm step.
 */

export default function EmojiCodePicker({ mode = 'self', initial = [], onConfirm, onCancel }) {
  const [picks, setPicks] = useState(Array.isArray(initial) ? initial.filter(Boolean).slice(0, 3) : []);
  const isSelf = mode === 'self';

  const tap = (glyph) => {
    if (picks.length >= 3) return;
    setPicks(prev => [...prev, glyph]);
  };
  const undo = () => setPicks(prev => prev.slice(0, -1));
  const reset = () => setPicks([]);

  const ready = picks.length === 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emoji-Code wählen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        background: 'linear-gradient(180deg, #fff8f2 0%, #fef3c7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Inner column — phone-shaped on any viewport. Without the
          max-width clamp the 5-col grid expanded edge-to-edge on
          tablet/desktop windows and the rightmost tiles got clipped
          off-screen (Marc QA 25 Apr 2026: "either not responsive or
          not fit the screen estate"). 460px is a comfortable phone-
          frame width that still accommodates 5 tiles + gaps. */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        margin: '0 auto',
        padding: '24px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#A83E2C', marginBottom: 6,
        }}>
          {isSelf ? 'Dein Zeichen' : 'Freund einladen'}
        </div>
        <h2 style={{
          margin: 0,
          font: '500 22px/1.2 "Fredoka", sans-serif',
          color: '#124346',
          letterSpacing: '-0.01em',
        }}>
          {isSelf ? 'Wähle drei Emojis aus.' : 'Tipp die drei Emojis ein, die dein Freund dir gezeigt hat.'}
        </h2>
        <p style={{
          margin: '8px 0 0',
          font: '500 13px/1.45 "Nunito", sans-serif',
          color: 'rgba(18,67,70,0.7)',
        }}>
          {isSelf
            ? 'Die werden dein Zeichen, mit dem du Freunde einladen kannst.'
            : 'Wenn die Reihenfolge stimmt, taucht euer Freund hier auf.'}
        </p>
      </div>

      {/* Picks display */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        margin: '8px 0 20px',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: picks[i] ? 'rgba(252,211,77,0.20)' : 'rgba(18,67,70,0.05)',
              border: picks[i] ? '2px solid #fbbf24' : '2px dashed rgba(18,67,70,0.20)',
              display: 'grid', placeItems: 'center',
              fontSize: 32,
              transition: 'all 0.2s ease',
              transform: picks[i] ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            {picks[i] || ''}
          </div>
        ))}
      </div>

      {/* Action row — undo / reset */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 14,
        marginBottom: 18,
        minHeight: 32,
      }}>
        {picks.length > 0 && !ready && (
          <button
            type="button"
            onClick={undo}
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.7)',
              border: '1.5px solid rgba(18,67,70,0.18)',
              font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#124346',
              cursor: 'pointer',
            }}
          >
            ← Zurück
          </button>
        )}
        {ready && (
          <button
            type="button"
            onClick={reset}
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.7)',
              border: '1.5px solid rgba(18,67,70,0.18)',
              font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#124346',
              cursor: 'pointer',
            }}
          >
            Nochmal
          </button>
        )}
      </div>

      {/* 30-emoji grid (5 cols × 6 rows) */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        marginBottom: 20,
      }}>
        {EMOJI_VOCABULARY.map(opt => {
          const used = picks.includes(opt.glyph);
          return (
            <button
              key={opt.glyph}
              type="button"
              onClick={() => tap(opt.glyph)}
              disabled={ready}
              aria-label={opt.label}
              className="active:scale-95 transition-transform"
              style={{
                aspectRatio: '1 / 1',
                borderRadius: 14,
                background: used ? 'rgba(252,211,77,0.20)' : '#ffffff',
                border: used ? '1.5px solid #fbbf24' : '1.5px solid rgba(18,67,70,0.10)',
                fontSize: 28,
                cursor: ready ? 'default' : 'pointer',
                opacity: ready ? 0.5 : 1,
                padding: 0,
                boxShadow: '0 2px 6px rgba(18,67,70,0.06)',
              }}
            >
              {opt.glyph}
            </button>
          );
        })}
      </div>

      {/* Confirm + cancel row, sticky-ish at the bottom */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 'auto',
      }}>
        <button
          type="button"
          onClick={() => ready && onConfirm?.(picks)}
          disabled={!ready}
          className="active:scale-[0.99] transition-transform"
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 16,
            background: ready ? '#124346' : 'rgba(18,67,70,0.18)',
            color: ready ? '#fef3c7' : 'rgba(255,255,255,0.6)',
            font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: ready ? 'pointer' : 'default',
            boxShadow: ready ? '0 8px 18px -8px rgba(18,67,70,0.40)' : 'none',
          }}
        >
          {isSelf
            ? (ready ? `Das bin ich · ${formatEmojiCode(picks)}` : 'Wähle 3 Emojis')
            : (ready ? `Freund hinzufügen · ${formatEmojiCode(picks)}` : 'Tipp 3 Emojis ein')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="active:scale-[0.99] transition-transform"
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 14,
              background: 'transparent',
              color: 'rgba(18,67,70,0.7)',
              font: '600 13px/1 "Nunito", sans-serif',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

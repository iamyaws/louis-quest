import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';
import { FREUND_BY_ID, getFreundSpritePath } from '../data/freunde';
import { CHAPTERS } from '../data/creatures';
import SFX from '../utils/sfx';

const BASE = import.meta.env.BASE_URL;

/**
 * Floating Freund-sprite reunion overlay.
 *
 * Used in place of the flat ArcOfferCard when the offered arc has a
 * `freundId` set. Instead of a modal, a transparent Freund sprite
 * floats on the Hub itself with a chapter-color aura that breathes,
 * a gentle bobbing motion, and a small tap-to-meet hint. Decline
 * lives in a quiet corner so it never steals focus from the sprite.
 *
 * On tap: `accept()` starts the arc, the sprite animates out, and
 * the usual BeatCompletionModal flow takes over.
 */
export default function FreundSpriteReunion() {
  const { lang } = useTranslation();
  const { offeredArc, accept, decline } = useArc();
  const [spriteFailed, setSpriteFailed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const sfxPlayedRef = useRef(false);

  const freund = offeredArc?.freundId ? FREUND_BY_ID.get(offeredArc.freundId) : null;
  const chapter = freund ? CHAPTERS.find(c => c.id === freund.chapter) : null;
  const accent = chapter?.color || '#059669';

  // Reset local flags when the offered Freund changes.
  useEffect(() => {
    setSpriteFailed(false);
    setExiting(false);
    sfxPlayedRef.current = false;
  }, [offeredArc?.id]);

  // Play a gentle entry chime on mount (once per offer).
  useEffect(() => {
    if (!freund || sfxPlayedRef.current) return;
    SFX.play('chime');
    sfxPlayedRef.current = true;
  }, [freund?.id]);

  if (!freund) return null;

  const handleTap = () => {
    if (exiting) return;
    setExiting(true);
    SFX.play('pop');
    // Let the exit animation play before the accept flow takes over.
    window.setTimeout(() => {
      accept();
    }, 400);
  };

  const handleDecline = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => {
      decline();
    }, 300);
  };

  const nameLabel = lang === 'en' ? freund.name.en : freund.name.de;
  const tapHint = lang === 'en'
    ? `Tap to meet ${nameLabel}`
    : `Tippe, um ${nameLabel} zu treffen`;
  const notNow = lang === 'en' ? 'Not now' : 'Nicht jetzt';

  const spritePath = getFreundSpritePath(freund);

  // Key forces a full remount (and animation restart) when the offered
  // Freund identity changes.
  return (
    <div
      key={`freund-sprite-${freund.id}`}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden={exiting ? 'true' : undefined}
    >
      <style>{`
        @keyframes freund-sprite-enter {
          0%   { transform: scale(0.3) translateY(20px); opacity: 0; }
          70%  { transform: scale(1.08) translateY(-2px); opacity: 1; }
          100% { transform: scale(1.0) translateY(0); opacity: 1; }
        }
        @keyframes freund-sprite-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes freund-aura-breathe {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(1.06); }
        }
        @keyframes freund-sprite-exit {
          0%   { transform: scale(1.0) translateY(0); opacity: 1; }
          100% { transform: scale(1.1) translateY(-10px); opacity: 0; }
        }
        @keyframes freund-name-fade-in {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes freund-particle-orbit-a {
          0%   { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        @keyframes freund-particle-orbit-b {
          0%   { transform: rotate(120deg) translateX(80px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(80px) rotate(-480deg); }
        }
        @keyframes freund-particle-orbit-c {
          0%   { transform: rotate(240deg) translateX(60px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(60px) rotate(-600deg); }
        }
      `}</style>

      {/* Sprite stack — centered horizontally, biased to lower-mid area */}
      <div
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          marginTop: '25vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: exiting
            ? 'freund-sprite-exit 400ms ease-in forwards'
            : 'freund-sprite-enter 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both',
        }}
      >
        {/* Sprite + aura + particles */}
        <button
          type="button"
          onClick={handleTap}
          aria-label={tapHint}
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Breathing chapter-color aura */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-18%',
              borderRadius: '50%',
              background: `radial-gradient(circle at center, ${accent}66 0%, ${accent}22 55%, transparent 75%)`,
              filter: 'blur(12px)',
              animation: 'freund-aura-breathe 3s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Orbiting particles — subtle, 3 dots at different radii/phases */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: accent,
                opacity: 0.7,
                marginTop: -3,
                marginLeft: -3,
                boxShadow: `0 0 6px ${accent}`,
                animation: 'freund-particle-orbit-a 7s linear infinite',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: accent,
                opacity: 0.55,
                marginTop: -2,
                marginLeft: -2,
                boxShadow: `0 0 5px ${accent}`,
                animation: 'freund-particle-orbit-b 9s linear infinite',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: accent,
                opacity: 0.6,
                marginTop: -2.5,
                marginLeft: -2.5,
                boxShadow: `0 0 5px ${accent}`,
                animation: 'freund-particle-orbit-c 11s linear infinite',
              }}
            />
          </div>

          {/* Sprite (with bobbing motion) — or fallback chapter icon */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: exiting
                ? 'none'
                : 'freund-sprite-bob 3.5s ease-in-out infinite',
            }}
          >
            {!spriteFailed ? (
              <img
                src={BASE + spritePath}
                alt=""
                aria-hidden="true"
                onError={() => setSpriteFailed(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 6px 10px ${accent}55)`,
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                }}
                draggable={false}
              />
            ) : (
              <div
                style={{
                  width: '82%',
                  height: '82%',
                  borderRadius: '50%',
                  background: `${accent}22`,
                  border: `2px solid ${accent}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 18px ${accent}44`,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 56,
                    color: accent,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {chapter?.icon || 'forest'}
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Name label — fades in after sprite settles */}
        <div
          style={{
            marginTop: 14,
            opacity: 0,
            animation: exiting
              ? 'none'
              : 'freund-name-fade-in 600ms ease-out 1100ms forwards',
            textAlign: 'center',
          }}
        >
          <div
            className="font-headline"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: accent,
              textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.18)',
              letterSpacing: 0.2,
            }}
          >
            {nameLabel}
          </div>
        </div>

        {/* Tap-to-meet hint — fades in shortly after the name */}
        <div
          style={{
            marginTop: 4,
            opacity: 0,
            animation: exiting
              ? 'none'
              : 'freund-name-fade-in 300ms ease-out 1700ms forwards',
            textAlign: 'center',
          }}
        >
          <div
            className="font-body"
            style={{
              fontSize: 13,
              color: accent,
              opacity: 0.75,
              textShadow: '0 1px 2px rgba(255,255,255,0.7)',
            }}
          >
            {tapHint}
          </div>
        </div>
      </div>

      {/* Quiet decline button — bottom-right, tucked away */}
      <button
        type="button"
        onClick={handleDecline}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 112,
          pointerEvents: 'auto',
          background: 'rgba(255,255,255,0.55)',
          color: '#374151',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          opacity: exiting ? 0 : 0.55,
          transition: 'opacity 200ms ease-out',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
        className="font-label"
      >
        {notNow}
      </button>
    </div>
  );
}

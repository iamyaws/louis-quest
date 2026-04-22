import React, { useEffect, useState } from 'react';
import MoodChibi from './MoodChibi';
import VitalsRing from './VitalsRing';
import VoiceBubble from './VoiceBubble';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * BegleiterStage — the meadow stage hosting Ronki on the Care tab.
 *
 * Replaces the flat "companion hero card + three horizontal stat bars"
 * block with a painted meadow scene behind Ronki. Built from pure CSS
 * (gradient sky + two rolling hills + grass ground + sparkles), no
 * images. Construction distilled from Ronki Begleiter Polish.html
 * lines 1964–2260.
 *
 * Why its own component instead of a CampfireScene variant:
 *   · CampfireScene is shaped around logs + fire + tree silhouettes +
 *     side-posed Ronki. The meadow is front-posed, centered, arcs
 *     around the chibi, no fire — the structural shape is different
 *     enough that forking CampfireScene would require gutting half of
 *     it behind a variant flag.
 *   · Keeping them separate leaves the Hub's CampfireScene usage
 *     untouched (another agent is working on Hub simplification).
 *
 * Speech bubble policy:
 *   · On mount, voice.line from useVoice fires (handles audio playback).
 *     While it's active, VoiceBubble renders at top-center.
 *   · After voice.line dismisses (or if it never fires), a rotating
 *     "mood line" takes over — one line every ~4.2s, pulled from the
 *     care.mood.line.{0..5} i18n keys. Pure visual; no audio.
 *
 * Props:
 *   fed, petted, played  — booleans, current day's care state
 *   variant              — companion variant id (default 'amber')
 *   stage                — 0..3 evolution stage for MoodChibi
 *   mood                 — 'idle' | 'happy' | 'eating' | 'playing'
 *                          (component maps these to MoodChibi moods)
 *   satisfaction         — 0..100 for nameplate "% zufrieden"
 *   evoStageLabel        — e.g. "Stufe 4" — rendered in nameplate
 *   voiceLine            — voice.line from useVoice, optional
 *   onDismissVoice       — callback to dismiss voice.line
 *   onTapRonki           — optional tap handler (plays haptic + SFX upstream)
 */

const MOOD_LINE_KEYS = [
  'care.mood.line.0',
  'care.mood.line.1',
  'care.mood.line.2',
  'care.mood.line.3',
  'care.mood.line.4',
  'care.mood.line.5',
];

// Map Begleiter action states to MoodChibi mood strings. MoodChibi
// doesn't model a dedicated "eating" pose, so we fall back to 'gut'
// (bouncy happy) for fed/petted and 'magisch' (shimmery) for play.
function mapMoodForChibi(stageMood) {
  if (stageMood === 'happy')   return 'gut';
  if (stageMood === 'eating')  return 'gut';
  if (stageMood === 'playing') return 'magisch';
  return 'normal';
}

export default function BegleiterStage({
  fed,
  petted,
  played,
  variant = 'amber',
  stage = 2,
  mood = 'idle',
  satisfaction = 0,
  evoStageLabel = '',
  voiceLine,
  onDismissVoice,
  onTapRonki,
}) {
  const { t } = useTranslation();
  const [lineIdx, setLineIdx] = useState(0);

  // Rotate a mood line every 4.2s — purely visual. Suppressed while
  // voice.line is active so the two bubbles don't overlap.
  useEffect(() => {
    if (voiceLine) return;
    const id = setInterval(() => setLineIdx(i => (i + 1) % MOOD_LINE_KEYS.length), 4200);
    return () => clearInterval(id);
  }, [voiceLine]);

  const rotatingLine = t(MOOD_LINE_KEYS[lineIdx]);
  const chibiMood = mapMoodForChibi(mood);
  const isTapping = mood !== 'idle';

  return (
    <section
      style={{
        position: 'relative',
        height: 380,
        margin: '8px 0 20px',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 18px 40px -16px rgba(18,67,70,0.3)',
        isolation: 'isolate',
      }}
      aria-label={t('care.stage.label')}
    >
      {/* ── Painted meadow backdrop (pure CSS) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }} aria-hidden="true">
        {/* Sky */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #bfe4ec 0%, #e9f1d5 60%, #f4e2c8 100%)',
        }} />
        {/* Back hill — lower saturation, behind */}
        <div style={{
          position: 'absolute',
          left: '-10%', right: '30%',
          bottom: '22%',
          height: 90,
          background: '#8fb878',
          opacity: 0.7,
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }} />
        {/* Front hill */}
        <div style={{
          position: 'absolute',
          left: '10%', right: '-10%',
          bottom: '18%',
          height: 110,
          background: '#6a9a58',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }} />
        {/* Grass ground */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '22%',
          background: 'linear-gradient(180deg, #5a8f4a 0%, #3f6b34 100%)',
          boxShadow: 'inset 0 8px 20px rgba(0,0,0,0.18)',
        }} />
        {/* Sparkles */}
        <span style={{
          position: 'absolute', top: '18%', left: '14%',
          color: 'rgba(255,255,255,0.7)', fontSize: 16,
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
          animation: 'bgs-twinkle 3s ease-in-out infinite',
          animationDelay: '0s',
        }}>✦</span>
        <span style={{
          position: 'absolute', top: '26%', right: '18%',
          color: 'rgba(255,255,255,0.7)', fontSize: 12,
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
          animation: 'bgs-twinkle 3s ease-in-out infinite',
          animationDelay: '1s',
        }}>✦</span>
        <span style={{
          position: 'absolute', top: '40%', left: '78%',
          color: 'rgba(255,255,255,0.7)', fontSize: 16,
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
          animation: 'bgs-twinkle 3s ease-in-out infinite',
          animationDelay: '2s',
        }}>✧</span>
      </div>

      {/* ── Speech bubble: voice.line when present, otherwise rotating mood line ── */}
      {voiceLine ? (
        <div style={{
          position: 'absolute',
          top: 14, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          maxWidth: '82%',
        }}>
          <VoiceBubble line={voiceLine} onDismiss={onDismissVoice} variant="chip" />
        </div>
      ) : (
        <div
          key={lineIdx}
          style={{
            position: 'absolute',
            top: 14, left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '82%',
            zIndex: 3,
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(18,67,70,0.1)',
            boxShadow: '0 6px 14px -4px rgba(18,67,70,0.18)',
            color: '#124346',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.35,
            textAlign: 'center',
            textWrap: 'balance',
            animation: 'bgs-speech-in 0.35s cubic-bezier(.34,1.56,.64,1)',
          }}
          role="status"
          aria-live="polite"
        >
          {rotatingLine}
          {/* Tail pointing down */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: -6, left: '50%',
              width: 12, height: 12,
              background: 'rgba(255,255,255,0.95)',
              borderRight: '1px solid rgba(18,67,70,0.1)',
              borderBottom: '1px solid rgba(18,67,70,0.1)',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* ── Ronki hero + vitals ring ── */}
      <div style={{
        position: 'absolute',
        zIndex: 4,
        left: '50%', bottom: 14,
        transform: 'translateX(-50%)',
        width: 280, height: 280,
        display: 'grid',
        placeItems: 'center',
      }}>
        <VitalsRing fed={fed} petted={petted} played={played} size={280} />
        <button
          type="button"
          onClick={onTapRonki}
          aria-label={t('care.tapRonki.label')}
          style={{
            position: 'relative',
            zIndex: 2,
            width: 180, height: 180,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: onTapRonki ? 'pointer' : 'default',
            transition: 'transform .2s ease',
            animation: isTapping
              ? (mood === 'eating'  ? 'bgs-munch .5s ease 2'
                : mood === 'playing' ? 'bgs-wiggle .5s ease 2'
                :                      'bgs-bounce .6s ease')
              : undefined,
          }}
        >
          <MoodChibi size={170} mood={chibiMood} bare variant={variant} stage={Math.min(3, stage)} />
        </button>
      </div>

      {/* ── Name plate (bottom-left) ── */}
      <div style={{
        position: 'absolute',
        zIndex: 4,
        bottom: 14, left: 14,
        padding: '10px 14px',
        borderRadius: 14,
        background: 'rgba(255,248,242,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(18,67,70,0.1)',
        boxShadow: '0 6px 14px -4px rgba(18,67,70,0.18)',
      }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: 12,
                color: '#fcd34d',
                fontVariationSettings: "'FILL' 1, 'wght' 600",
              }}
            >
              star
            </span>
          ))}
        </div>
        <h2 style={{
          margin: '0 0 2px',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: '#124346',
        }}>
          Ronki
        </h2>
        <p style={{
          margin: 0,
          fontFamily: 'Nunito, sans-serif',
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(18,67,70,0.55)',
        }}>
          {evoStageLabel ? evoStageLabel + ' · ' : ''}{satisfaction}% {t('care.satisfied')}
        </p>
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes bgs-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes bgs-speech-in {
          from { opacity: 0; transform: translate(-50%, -6px) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes bgs-bounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
        @keyframes bgs-munch {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04, 0.96); }
        }
        @keyframes bgs-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(4deg); }
        }
      `}</style>
    </section>
  );
}

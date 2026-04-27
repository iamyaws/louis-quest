import React, { useEffect, useState } from 'react';
import ChibiFriend, { hasChibiFriend } from './ChibiFriend';
import { SEED_BY_ID, CREATURE_CONTENT, CHAPTERS } from '../../data/creatures';
import VoiceAudio from '../../utils/voiceAudio';

/**
 * FriendIntroCeremony — full-screen first-encounter takeover when a
 * kid discovers a creature for the first time.
 *
 * Marc 25 Apr 2026: "when we first encounter them we should have a
 * full animation plus card introducing them properly also with a
 * fade or some animation that gets triggered to make it feel
 * special plus adding some context on how they are friends and what
 * ronki maybe even learned from them."
 *
 * Surface:
 *  · Backdrop fade-in (chapter-tinted gradient).
 *  · Name + chapter kicker fade in first.
 *  · Chibi enters with their signature move (already wired into
 *    ChibiFriend via cfg.move).
 *  · "Ronki erzählt" — pulls the existing `howMet` narrative from
 *    CREATURE_CONTENT so we don't duplicate copy.
 *  · "Was Ronki gelernt hat" — pulls funFacts[0] or secret as the
 *    take-away line.
 *  · Tap-to-close button at the bottom that says "Schön dich
 *    kennenzulernen."
 *
 * Replaces the smaller CreatureDiscoveryToast for first-ever
 * discoveries. The toast still works fine for any future
 * re-discovery beats but the persistent state.micropediaDiscovered
 * gate means useMicropediaDiscovery only fires once per creature,
 * so in practice the ceremony is the discovery surface for the
 * prototype.
 */

const STAGES = [
  { id: 'enter',  delay: 0,    duration: 600 },   // backdrop fades in
  { id: 'name',   delay: 600,  duration: 400 },   // name + chapter
  { id: 'chibi',  delay: 1100, duration: 700 },   // chibi springs in
  { id: 'story',  delay: 1900, duration: 500 },   // howMet text reveals
  { id: 'lesson', delay: 2700, duration: 500 },   // what-Ronki-learned beat
  { id: 'cta',    delay: 3400, duration: 400 },   // close button reveals
];

export default function FriendIntroCeremony({ creatureId, onClose }) {
  const seed = SEED_BY_ID.get(creatureId);
  const content = CREATURE_CONTENT[creatureId];
  const chapter = CHAPTERS?.find?.(c => c.id === seed?.chapter);
  const accent = chapter?.color || '#7a9a5d';

  // Drive the staged reveal. Each entry flips its flag at its delay,
  // so the JSX can opacity-gate sub-blocks without doing per-element
  // animation timings.
  const [phase, setPhase] = useState({});
  useEffect(() => {
    const timers = STAGES.map(s =>
      setTimeout(() => setPhase(p => ({ ...p, [s.id]: true })), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Voice — Ronki tells the howMet story when the story-stage reveals.
  // 20 stories, one per creature ID. Apr 2026 voice pass; files at
  // public/audio/ronki/de_creature_lore_<id>.mp3.
  useEffect(() => {
    if (!phase.story || !creatureId) return;
    VoiceAudio.playLocalized(`creature_lore_${creatureId}`, 100);
  }, [phase.story, creatureId]);

  if (!seed) {
    // Shouldn't happen — the discovery hook only fires for known
    // SEED_CREATURES — but bail safely if a stale id ever sneaks in.
    return null;
  }

  const lessonLine =
    content?.funFacts?.[0] ||
    content?.secret ||
    'Wir freuen uns einfach, dass wir uns kennengelernt haben.';
  const howMet =
    content?.howMet ||
    'Wir sind uns auf einem unserer Streifzüge begegnet, und seitdem mögen wir uns.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Neuer Freund: ${seed.name?.de || creatureId}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        // Layered backdrop: opaque dark base FIRST so Hub content
        // never bleeds through, with the chapter-tinted glow painted
        // on top as an atmospheric layer (multi-bg, leftmost is on
        // top so the glow sits over the dark base). The previous
        // single radial used `${accent}40` (25% alpha) at 0% which
        // left the center of the screen 75% transparent and let the
        // Hub leak through.
        background: `
          radial-gradient(ellipse at 50% 30%, ${accent}55 0%, transparent 55%),
          linear-gradient(180deg, #1e1b3a 0%, #0e0c20 100%)
        `,
        backgroundColor: '#0e0c20',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        // The previous outer-div fade-in (`fic-enter` opacity 0→1)
        // also faded the backdrop, leaving the Hub visible for the
        // first 600ms. Drop the whole-div animation — the staged
        // inner reveals (name/chibi/story/lesson/cta) already
        // provide the entrance choreography, and the backdrop
        // appears instantly so nothing leaks through.
        overflow: 'hidden',
        // Belt-and-braces: own all input + scrolling while open.
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
    >
      {/* Sparkles drifting up across the backdrop — discovery moment
          visual cue. */}
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${5 + (i * 9.7) % 90}%`,
            bottom: '8%',
            color: '#fde68a',
            fontSize: 10 + (i % 3) * 4,
            animation: `fic-spark ${5 + (i * 0.4) % 3}s ease-out infinite ${i * 0.5}s`,
            pointerEvents: 'none',
            opacity: 0,
          }}
        >
          ✦
        </span>
      ))}

      {/* Top kicker — "Neuer Freund" pulses in once name stage hits. */}
      <div
        style={{
          opacity: phase.name ? 1 : 0,
          transform: phase.name ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'all 0.4s ease-out',
          font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: accent,
          textShadow: `0 0 12px ${accent}60`,
          marginBottom: 14,
        }}
      >
        Neuer Freund
      </div>

      {/* Big name */}
      <h2
        style={{
          opacity: phase.name ? 1 : 0,
          transform: phase.name ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s ease-out 0.1s',
          margin: 0,
          font: '500 32px/1.1 "Fredoka", sans-serif',
          color: '#fef3c7',
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}
      >
        {seed.name?.de || creatureId}
      </h2>

      {/* Chapter pill */}
      <div
        style={{
          opacity: phase.name ? 0.85 : 0,
          transition: 'opacity 0.5s ease-out 0.2s',
          marginTop: 6,
          padding: '4px 12px',
          borderRadius: 999,
          background: `${accent}26`,
          border: `1px solid ${accent}55`,
          font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#fef3c7',
        }}
      >
        {chapter?.name?.de || seed.chapter}
      </div>

      {/* Chibi — springs in with its built-in signature move */}
      <div
        style={{
          marginTop: 28,
          marginBottom: 22,
          width: 200,
          height: 200,
          opacity: phase.chibi ? 1 : 0,
          transform: phase.chibi ? 'scale(1)' : 'scale(0.6)',
          transition: 'all 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)',
          filter: `drop-shadow(0 8px 24px ${accent}80)`,
        }}
      >
        {hasChibiFriend(creatureId) ? (
          <ChibiFriend id={creatureId} size={200} withBg={false} />
        ) : (
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            background: `${accent}55`,
            display: 'grid', placeItems: 'center',
            fontSize: 80,
          }}>
            ✨
          </div>
        )}
      </div>

      {/* "Ronki erzählt" — howMet block */}
      <div
        style={{
          opacity: phase.story ? 1 : 0,
          transform: phase.story ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease-out',
          maxWidth: 380,
          padding: '14px 18px',
          borderRadius: 16,
          background: 'rgba(255,250,240,0.92)',
          border: `2px solid ${accent}55`,
          font: '500 14px/1.5 "Fredoka", sans-serif',
          color: '#1e1b17',
          textAlign: 'center',
        }}
      >
        <div style={{
          font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: accent, marginBottom: 6,
        }}>
          Ronki erzählt
        </div>
        „{howMet}"
      </div>

      {/* "Was Ronki gelernt hat" — small tag-line below */}
      <div
        style={{
          opacity: phase.lesson ? 1 : 0,
          transform: phase.lesson ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s ease-out',
          marginTop: 14,
          maxWidth: 360,
          padding: '0 8px',
          font: '500 12px/1.5 "Nunito", sans-serif',
          color: 'rgba(254,243,199,0.82)',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        Ronki sagt: {lessonLine}
      </div>

      {/* CTA — "Schön dich kennenzulernen" */}
      <button
        type="button"
        onClick={onClose}
        style={{
          opacity: phase.cta ? 1 : 0,
          transform: phase.cta ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.4s ease-out',
          marginTop: 28,
          padding: '14px 28px',
          borderRadius: 999,
          background: '#fcd34d',
          color: '#3a1c05',
          font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: 'pointer',
          boxShadow: `0 8px 24px -6px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.5)`,
          pointerEvents: phase.cta ? 'auto' : 'none',
        }}
      >
        Schön dich kennenzulernen
      </button>

      <style>{`
        @keyframes fic-enter {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fic-spark {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          15%  { opacity: 0.9; }
          80%  { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(-280px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

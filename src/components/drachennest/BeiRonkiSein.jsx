import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import { track } from '../../lib/analytics';
import MoodChibi from '../MoodChibi';

/**
 * BeiRonkiSein — the presence beat (Marc 25 Apr 2026).
 *
 * Marc: "could be a chance for ronki to tell the kid a story or just
 * sit with each other to be present. could allow us for a cutscene
 * of sorts sitting at the fire and having a friendship/bonding
 * moment."
 *
 * The fourth interaction next to Füttern / Streicheln / Spielen, but
 * deliberately separate from them — costs no Funken, doesn't change
 * a vital, doesn't drive any meter. The whole point is the absence
 * of mechanics: a slow cozy sit at the campfire with Ronki saying
 * one short kid-readable line. Tap anywhere to dismiss.
 *
 * Rotation rules:
 *  · Pick a line that wasn't shown in the last three taps (per
 *    session, kept in a ref). Avoids rapid-repeat boredom without
 *    needing global state.
 *  · Voice-rule compliant — longer slightly-stumbly sentences with
 *    soft hedges, no em-dashes, no tidy three-beat fragments.
 *  · No cooldown for v1 — the kid can return to this moment as
 *    often as they want. If it ends up over-fired we'll add a
 *    once-per-N-minutes throttle later.
 */

const STORIES = [
  'Heute hab ich an die Wolken gedacht. Manche davon sahen aus wie kleine Drachen die Verstecken spielen.',
  'Im Morgenwald rascheln die Blätter ganz leise wenn niemand hinsieht. Ich glaub die erzählen sich kleine Witze.',
  'Ich mag wie\'s hier riecht wenn das Feuer knistert. Irgendwie nach Marshmallows und nach Holz und nach gemütlich.',
  'Manchmal frag ich mich was die Sterne eigentlich machen wenn keiner sie anschaut. Vielleicht tanzen sie ein bisschen.',
  'Weißt du was lustig ist, mein Schwanz schläft manchmal vor mir ein. Dann muss ich ihn ganz vorsichtig wecken.',
  'Wenn ich so mit dir am Feuer sitze, fühlt sich der ganze Tag an wie in eine warme Decke eingewickelt.',
  'Heute morgen hat ein kleiner Käfer mein Frühstück angeguckt. Ich hab ihn gefragt ob er was abhaben will, er war aber viel zu schüchtern.',
  'Ich hab vergessen was ich eigentlich erzählen wollte. Aber das ist okay, ich bin einfach gern mit dir hier.',
  'Manchmal lieg ich abends da und mag das Geräusch wenn der Wind in den Birken oben umherwandert. Klingt fast wie wer leise summt.',
  'Mama-Drache hat mir mal gezeigt wie man Funken pustet ohne dass was kaputtgeht. Sie sagt das geht nur wenn man ruhig atmet.',
];

export default function BeiRonkiSein({ onClose }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'forest';
  // Match RoomHub's canonical mapping (getCatStage uses CAT_STAGES
  // thresholds [0, 3, 9, 18, 30, 45]). The previous Math.floor(catEvo/9)
  // produced stage 0 (egg) for any catEvo in 1-8, so a freshly-hatched
  // kid sat down at the campfire and saw the egg again. The `|| 1`
  // fallback mirrors RoomHub: by the time the kid is at the campfire
  // they've already hatched, so we never render the egg here even if
  // catEvo somehow lands at 0.
  const stageIdx = getCatStage(state?.catEvo ?? 0) || 1;

  // Track recently-shown line indexes per session so the rotation
  // doesn't repeat itself in quick succession. Lives in a ref so
  // it survives the moment closing + re-opening within the session.
  const recentRef = useRef(typeof window !== 'undefined' ? (window.__beiRonkiRecent || []) : []);
  const story = useMemo(() => {
    const recent = recentRef.current;
    const fresh = STORIES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : STORIES.map((_, i) => i);
    const pickIdx = pool[Math.floor(Math.random() * pool.length)];
    const next = [...recent, pickIdx].slice(-3);
    recentRef.current = next;
    if (typeof window !== 'undefined') window.__beiRonkiRecent = next;
    return STORIES[pickIdx];
  }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Telemetry — fire once per mount so we count "kid sat with Ronki"
  // moments. This is a high-signal event for the companion thesis.
  useEffect(() => { track('companion.sit'); }, []);

  // Reveal the story line ~700ms after the scene fades in so the kid
  // has a beat to register the change of place before Ronki speaks.
  const [showStory, setShowStory] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowStory(true), 700);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bei Ronki sitzen"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: '#0f1525',  // deep nightfall outside the firelight
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        animation: 'brs-fade-in 0.6s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Soft amber halo around the campfire — radial vignette. */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 50% 38% at 50% 62%, rgba(252,165,73,0.45) 0%, transparent 65%),
          radial-gradient(ellipse 80% 60% at 50% 70%, rgba(180,83,9,0.30) 0%, transparent 70%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Drifting embers */}
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${15 + (i * 9.3) % 70}%`,
            bottom: '38%',
            width: 4, height: 4, borderRadius: '50%',
            background: 'radial-gradient(circle, #fde68a, #f59e0b)',
            boxShadow: '0 0 8px rgba(252,211,77,0.7)',
            animation: `brs-ember ${4 + i * 0.5}s ease-out infinite ${i * 0.3}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Campfire scene — Ronki + the fire, simplified. */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        aspectRatio: '4 / 5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px 80px',
      }}>
        {/* Ronki sitting */}
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: 200, height: 200,
            display: 'grid', placeItems: 'center',
            animation: 'brs-breathe 5s ease-in-out infinite',
            zIndex: 4,
          }}
        >
          <MoodChibi size={200} variant={variant} stage={stageIdx} mood="normal" bare />
        </div>

        {/* Campfire */}
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: 92, height: 70,
            marginTop: -12,
            zIndex: 3,
          }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', left: -40, bottom: -20,
            width: 170, height: 80,
            background: 'radial-gradient(ellipse, rgba(252,165,73,0.6), transparent 70%)',
            filter: 'blur(2px)',
          }} />
          {/* Logs */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 14,
            background: 'linear-gradient(180deg, #9b7447 0%, #5c3e1f 70%)',
            borderRadius: 6,
            boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.1)',
          }} />
          {/* Flame */}
          <div style={{
            position: 'absolute', left: '50%', bottom: 12,
            transform: 'translateX(-50%)',
            width: 44, height: 56,
            background: 'radial-gradient(ellipse at 50% 80%, #fef3c7 0%, #fcd34d 18%, #f97316 55%, #dc2626 100%)',
            borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
            animation: 'brs-fire 1.1s ease-in-out infinite alternate',
            filter: 'drop-shadow(0 0 14px rgba(249,115,22,0.7))',
          }} />
        </div>

        {/* Ground line */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 60, left: '15%', right: '15%',
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(180,83,9,0.35), transparent)',
        }} />

        {/* Story bubble — fades in after the scene settles. */}
        {showStory && (
          <div style={{
            position: 'absolute',
            top: '14%',
            left: '8%',
            right: '8%',
            maxWidth: 380,
            margin: '0 auto',
            padding: '14px 18px 16px',
            borderRadius: 18,
            background: 'rgba(255,250,240,0.96)',
            border: '2px solid #5c2a08',
            boxShadow: '0 10px 28px -8px rgba(0,0,0,0.5)',
            font: '500 15px/1.45 "Fredoka", "Nunito", sans-serif',
            color: '#1e1b17',
            textAlign: 'center',
            zIndex: 6,
            animation: 'brs-bubble-in 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both',
          }}>
            {story}
          </div>
        )}

        {/* Quiet hint at the bottom — kid-friendly tap-to-close. */}
        <div style={{
          position: 'absolute', bottom: 24, left: 0, right: 0,
          textAlign: 'center',
          font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(254,243,199,0.55)',
          zIndex: 5,
        }}>
          Tipp irgendwo, um zurück zu gehen
        </div>
      </div>

      <style>{`
        @keyframes brs-fade-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes brs-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
        @keyframes brs-fire {
          0%   { transform: translateX(-50%) scale(0.95, 1) rotate(-2deg); }
          100% { transform: translateX(-50%) scale(1.05, 0.95) rotate(2deg); }
        }
        @keyframes brs-ember {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          15%  { opacity: 0.9; }
          70%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-180px) scale(1.1); }
        }
        @keyframes brs-bubble-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

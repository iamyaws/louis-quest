import React, { useEffect, useRef, useState } from 'react';

/**
 * RonkiSpeechBubble — rotating mood-line that hovers above Ronki.
 *
 * Direct port of the Begleiter Polish "Sprechblase mit rotierender
 * Laune". Six lines, cycles every ~4.2 seconds. Makes the screen
 * feel alive even when the kid isn't interacting.
 *
 * Voice rule (feedback_no_ai_writing.md): no em-dashes, no tidy
 * three-beat fragments. The lines below were drafted under that
 * rule.
 *
 * Tap behaviour (Marc 25 Apr 2026): the bubble used to overlap the
 * top vitals arc icon. Two fixes:
 *   1) RoomHub now mounts this OUTSIDE the rh-ronki-stage so the
 *      bubble sits in the scene's empty top band, above the ring.
 *   2) Tap to "mark as read" — the bubble slides up and fades,
 *      then a quiet window of ~6s passes before the next line
 *      shows. Lets the kid clear the surface intentionally without
 *      losing the alive-feeling rotation.
 *
 * Future: pull lines from i18n + tie to vital state (low Hunger →
 * "Mein Bauch knurrt schon ein bisschen", low Liebe → "Magst du
 * mich mal kurz drücken?", etc.). For prototype: static rotation.
 */

const MOOD_LINES = [
  'Ich mag es wenn du bei mir bist.',
  'Spielst du heute mit mir?',
  'Mein Bauch grummelt so ein bisschen…',
  'Erzähl mir was du heute erlebt hast.',
  'Kannst du mich mal streicheln?',
  'Ich hab heut Nacht von fliegenden Keksen geträumt.',
];

const ROTATE_MS = 4200;
const QUIET_AFTER_DISMISS_MS = 6000;

export default function RonkiSpeechBubble({ idx: idxProp }) {
  const [idx, setIdx] = useState(0);
  // 'visible' = bubble shown, 'dismissing' = play exit animation,
  // 'quiet' = waiting after a tap-dismiss before the next line cycles.
  const [phase, setPhase] = useState('visible');
  const dismissTimerRef = useRef(null);

  // Auto-rotate while visible. Skip the timer when controlled (idxProp)
  // or when in dismissing/quiet phase so we don't fight the user.
  useEffect(() => {
    if (typeof idxProp === 'number') return;
    if (phase !== 'visible') return;
    const id = setInterval(() => setIdx(i => (i + 1) % MOOD_LINES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [idxProp, phase]);

  useEffect(() => () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const handleTap = () => {
    if (phase !== 'visible') return;
    setPhase('dismissing');
    // After the exit animation, drop into quiet, advance the line, then
    // come back. The advance happens during quiet so the next line
    // doesn't flash in the middle of the slide-up.
    setTimeout(() => {
      setIdx(i => (i + 1) % MOOD_LINES.length);
      setPhase('quiet');
      dismissTimerRef.current = setTimeout(() => setPhase('visible'), QUIET_AFTER_DISMISS_MS);
    }, 280);
  };

  const showIdx = typeof idxProp === 'number' ? idxProp % MOOD_LINES.length : idx;

  if (phase === 'quiet') return null;

  return (
    <button
      key={`${showIdx}-${phase}`}
      type="button"
      onClick={handleTap}
      aria-label="Nachricht von Ronki — antippen zum Schließen"
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        border: '2px solid #124346',
        borderRadius: '18px 18px 18px 4px',
        padding: '10px 16px 11px',
        font: '600 14px/1.3 "Nunito", sans-serif',
        color: '#1e1b17',
        maxWidth: 260,
        textAlign: 'center',
        boxShadow: '0 6px 14px -4px rgba(18,67,70,0.20)',
        zIndex: 6,
        cursor: 'pointer',
        animation: phase === 'dismissing'
          ? 'rsb-out 0.28s ease-in forwards'
          : 'rsb-in 0.4s ease-out',
      }}
    >
      {MOOD_LINES[showIdx]}
      {/* Small tail pointing down toward Ronki — drawn as two stacked
          triangles so the dark border shows through. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid #124346',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '8px solid #ffffff',
        }}
      />
      <style>{`
        @keyframes rsb-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes rsb-out {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); }
        }
      `}</style>
    </button>
  );
}

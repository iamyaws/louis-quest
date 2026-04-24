import React, { useEffect, useState } from 'react';

/**
 * RonkiSpeechBubble — rotating mood-line above Ronki.
 *
 * Direct port of the Begleiter Polish "Sprechblase mit rotierender
 * Laune". Six lines, cycles every 4.2 seconds. Makes the screen feel
 * alive even when the kid isn't interacting.
 *
 * Voice rule (feedback_no_ai_writing.md): no em-dashes, no tidy
 * three-beat fragments. The lines below were drafted under that rule.
 *
 * Future: pull lines from i18n + tie to vital state (low Hunger →
 * "Mein Bauch knurrt schon ein bisschen", low Liebe → "Magst du mich
 * mal kurz drücken?", etc.). For prototype: static rotation.
 */

const MOOD_LINES = [
  'Ich mag es wenn du bei mir bist.',
  'Spielst du heute mit mir?',
  'Mein Bauch grummelt so ein bisschen…',
  'Erzähl mir was du heute erlebt hast.',
  'Kannst du mich mal streicheln?',
  'Ich hab heut Nacht von fliegenden Keksen geträumt.',
];

export default function RonkiSpeechBubble({ idx: idxProp }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (typeof idxProp === 'number') return;  // controlled mode
    const id = setInterval(() => setIdx(i => (i + 1) % MOOD_LINES.length), 4200);
    return () => clearInterval(id);
  }, [idxProp]);
  const showIdx = typeof idxProp === 'number' ? idxProp % MOOD_LINES.length : idx;
  return (
    <div
      key={showIdx}
      style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        border: '2px solid #124346',
        borderRadius: '18px 18px 4px 18px',
        padding: '10px 16px',
        font: '600 14px/1.3 "Nunito", sans-serif',
        color: '#1e1b17',
        maxWidth: 260,
        textAlign: 'center',
        boxShadow: '0 6px 14px -4px rgba(18,67,70,0.20)',
        zIndex: 5,
        animation: 'speech-in 0.4s ease-out',
      }}
    >
      {MOOD_LINES[showIdx]}
      <style>{`
        @keyframes speech-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

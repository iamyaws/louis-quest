import React, { useEffect, useMemo, useState } from 'react';
import MoodChibi from './MoodChibi';
import { useTask } from '../context/TaskContext';

/**
 * StaminaExhausted — full-screen Ronki takeover when the kid runs
 * out of minigame stamina. Marc 25 Apr 2026: "let's bring ronki in
 * full screen including a voiceline (three different ones) stating
 * that he has played enough games for now and wants to do something
 * else plus we will be back again and having some fun playing
 * again — something along those lines."
 *
 * Three lines rotate so the kid doesn't hear the same thing every
 * tap. Voice playback is wired through the existing voiceAudio
 * helper — the audio file at `/audio/ronki/ronki_stamina_out_<n>.mp3`
 * fires once on mount if available; if the file isn't there yet
 * (still in the recording queue), playLocalized no-ops gracefully.
 *
 * Tap anywhere to dismiss back to the previous surface. The kid
 * isn't trapped — this is a friendly nudge, not a lock-out.
 */

const LINES = [
  {
    voiceId: 'ronki_stamina_out_01',
    text: 'Puh, jetzt brauch ich mal eine kleine Pause vom Spielen. Magst du was anderes mit mir machen? Wir spielen später wieder, versprochen.',
  },
  {
    voiceId: 'ronki_stamina_out_02',
    text: 'Mein Kopf ist ein bisschen müde von den ganzen Spielen. Wir kommen gleich wieder, und dann hab ich wieder mehr Lust.',
  },
  {
    voiceId: 'ronki_stamina_out_03',
    text: 'Komm wir machen jetzt was anderes zusammen. Spielen ist toll, aber zu viel auf einmal macht mich ganz wuselig im Bauch.',
  },
];

export default function StaminaExhausted({ nextRechargeMin, stage = 2, onClose }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'forest';
  // Pick a line on mount and keep it for the duration of this view.
  // Using window.__staminaOutRecent (session ref) so the same line
  // doesn't fire twice in a row when the kid hits stamina-out
  // multiple times in the same session.
  const line = useMemo(() => {
    const recent = (typeof window !== 'undefined' ? window.__staminaOutRecent : null) || [];
    const fresh = LINES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : LINES.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    if (typeof window !== 'undefined') {
      window.__staminaOutRecent = [...recent, idx].slice(-2);
    }
    return LINES[idx];
  }, []);

  // Optional voiceline playback — no-ops if VoiceAudio isn't wired
  // or the file doesn't exist on disk yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await import('../utils/voiceAudio');
        if (cancelled) return;
        m?.default?.playLocalized?.(line.voiceId, 350);
      } catch {
        /* voice audio module missing — silent fallback */
      }
    })();
    return () => { cancelled = true; };
  }, [line.voiceId]);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reveal the speech bubble after Ronki finishes appearing — gives
  // the kid a beat to register the shift before reading.
  const [showLine, setShowLine] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowLine(true), 700);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronki braucht eine Pause"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 60%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        cursor: 'pointer',
        animation: 'sxe-fade-in 0.6s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Soft moonlight halo behind Ronki */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '32%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 360, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(165,180,252,0.22), transparent 70%)',
        pointerEvents: 'none',
        animation: 'sxe-halo 4.6s ease-in-out infinite',
      }} />

      {/* Drifting "zzz" particles */}
      {[0, 1, 2].map(i => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: `${28 + i * 4}%`,
            left: `${52 + i * 4}%`,
            color: 'rgba(254,243,199,0.7)',
            font: '700 24px/1 "Fredoka", sans-serif',
            animation: `sxe-zzz ${4 + i * 0.6}s ease-out infinite ${i * 0.7}s`,
            pointerEvents: 'none',
          }}
        >
          z
        </span>
      ))}

      {/* Tired Ronki — uses the existing MoodChibi tired mood so the
          variant + the closed-eyes / sway loop come for free. */}
      <div
        aria-hidden="true"
        style={{
          width: 220,
          height: 220,
          marginBottom: 24,
          display: 'grid',
          placeItems: 'center',
          animation: 'sxe-breathe 4s ease-in-out infinite',
          zIndex: 5,
        }}
      >
        <MoodChibi size={210} mood="tired" variant={variant} stage={stage} bare />
      </div>

      {/* Speech-line bubble */}
      {showLine && (
        <div
          style={{
            position: 'relative',
            maxWidth: 380,
            padding: '16px 20px',
            borderRadius: 18,
            background: 'rgba(255,250,240,0.96)',
            border: '2px solid #5c2a08',
            boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
            font: '500 16px/1.45 "Fredoka", "Nunito", sans-serif',
            color: '#1e1b17',
            textAlign: 'center',
            animation: 'sxe-bubble-in 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both',
            zIndex: 6,
          }}
        >
          {line.text}
        </div>
      )}

      {/* Recharge note + dismiss hint */}
      <p
        style={{
          marginTop: 20,
          font: '500 13px/1.4 "Nunito", sans-serif',
          color: 'rgba(254,243,199,0.55)',
          textAlign: 'center',
          maxWidth: 320,
          zIndex: 5,
        }}
      >
        Erholt sich in {nextRechargeMin} {nextRechargeMin === 1 ? 'Minute' : 'Minuten'}.
      </p>

      <div style={{
        position: 'absolute',
        bottom: 28,
        left: 0,
        right: 0,
        textAlign: 'center',
        font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(254,243,199,0.5)',
        zIndex: 5,
      }}>
        Tipp irgendwo, um zurück zu gehen
      </div>

      <style>{`
        @keyframes sxe-fade-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes sxe-halo {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.22; }
          50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 0.35; }
        }
        @keyframes sxe-zzz {
          0%   { opacity: 0; transform: translate(0, 0) scale(0.6); }
          20%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-12px, -36px) scale(1.1); }
        }
        @keyframes sxe-breathe {
          0%, 100% { transform: scale(1) rotate(-1deg); }
          50%      { transform: scale(1.03) rotate(1deg); }
        }
        @keyframes sxe-bubble-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

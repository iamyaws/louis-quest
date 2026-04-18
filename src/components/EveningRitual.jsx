import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import VoiceAudio from '../utils/voiceAudio';
import SFX from '../utils/sfx';

/**
 * EveningRitual — 30-second end-of-day closing sequence.
 *
 * Flow:
 *  1. Drachenmutter: "Der Tag neigt sich..." (intro, ~5s)
 *  2. Drachenmutter: "Was war heute schön?" → Louis types 1-3 words (or skips)
 *  3. Drachenmutter: "Schlaf gut..." (goodnight, ~4s)
 *  4. Fade out → close
 *
 * State: when completed, writes state.eveningRitualCompletedAt = today's date.
 * Parent (Hub) should only mount this when:
 *   - It's evening time (after 18:00)
 *   - Bedtime quests are done
 *   - eveningRitualCompletedAt !== today
 */
import { getDragonArt } from '../utils/helpers';

const base = import.meta.env.BASE_URL;

export default function EveningRitual({ stage = 1, onClose }) {
  const { state, actions } = useTask();
  const { lang } = useTranslation();
  const [phase, setPhase] = useState('intro'); // intro | ask | write | goodnight | done
  const [highlight, setHighlight] = useState('');
  const startedRef = useRef(false);

  // Play intro audio on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    VoiceAudio.playNarrator('ritual_start', 600);
    const t = setTimeout(() => setPhase('ask'), 5200);
    return () => clearTimeout(t);
  }, []);

  // Play ask/goodnight audio on phase change
  useEffect(() => {
    if (phase === 'ask') {
      VoiceAudio.playNarrator('ritual_ask', 400);
      const t = setTimeout(() => setPhase('write'), 3800);
      return () => clearTimeout(t);
    }
    if (phase === 'goodnight') {
      VoiceAudio.playNarrator('ritual_goodnight', 300);
      const t = setTimeout(() => {
        finish();
      }, 4800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const saveAndAdvance = () => {
    const entry = highlight.trim();
    if (entry) {
      const existing = state?.journalGratitude || [];
      if (!existing.includes(entry)) {
        actions.patchState({ journalGratitude: [...existing, entry] });
      }
    }
    setPhase('goodnight');
  };

  const finish = () => {
    const today = new Date().toISOString().slice(0, 10);
    actions.patchState({ eveningRitualCompletedAt: today });
    SFX.play('chime');
    onClose?.();
  };

  const artFile = getDragonArt(stage);

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(160deg, #0a0a2e 0%, #1a0f3a 50%, #2d1b4e 100%)' }}>
      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
               style={{
                 width: 2, height: 2,
                 top: `${Math.random() * 60}%`,
                 left: `${Math.random() * 100}%`,
                 background: 'white',
                 opacity: 0.3 + Math.random() * 0.4,
                 boxShadow: '0 0 4px white',
                 animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
               }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-md">
        {/* Sleeping Ronki */}
        <div className="w-40 h-40 rounded-full overflow-hidden mb-6 relative"
             style={{ border: '2px solid rgba(252,211,77,0.35)', boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
          <img src={`${base}art/companion/${artFile}.webp`} alt=""
               className="w-full h-full object-cover"
               style={{ filter: 'brightness(0.7) saturate(0.8)' }} />
        </div>

        {phase === 'intro' && (
          <p className="font-body text-lg text-white/70 italic leading-relaxed">
            Der Tag neigt sich...
          </p>
        )}

        {phase === 'ask' && (
          <p className="font-body text-lg text-white/70 italic leading-relaxed">
            Was war heute schön?
          </p>
        )}

        {phase === 'write' && (
          <>
            <h2 className="font-headline font-bold text-2xl text-white mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Was war heute schön?
            </h2>
            <input type="text"
                   value={highlight}
                   onChange={e => setHighlight(e.target.value)}
                   maxLength={60}
                   placeholder="Zum Beispiel: Eis gegessen..."
                   className="w-full px-5 py-4 rounded-2xl font-body text-base text-on-surface outline-none mb-4"
                   style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(252,211,77,0.4)' }}
                   autoFocus />
            <div className="flex gap-3 w-full">
              <button onClick={() => setPhase('goodnight')}
                className="flex-1 py-3 rounded-full font-label font-bold text-sm text-white/60"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                Nichts heute
              </button>
              <button onClick={saveAndAdvance}
                className="flex-1 py-3 rounded-full font-label font-bold text-sm"
                style={{ background: '#fcd34d', color: '#725b00' }}>
                Speichern ✨
              </button>
            </div>
          </>
        )}

        {phase === 'goodnight' && (
          <>
            <p className="font-body text-lg text-white/80 italic leading-relaxed mb-4">
              Schlaf gut, kleiner Held.
            </p>
            <p className="font-label text-xs text-white/40 uppercase tracking-widest">
              Drück irgendwo, um zu schließen
            </p>
            <button onClick={finish} className="absolute inset-0" aria-label="close" />
          </>
        )}
      </div>

      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}

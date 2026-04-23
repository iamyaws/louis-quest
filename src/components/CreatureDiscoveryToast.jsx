import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { SEED_BY_ID } from '../data/creatures';
import VoiceAudio from '../utils/voiceAudio';
import SFX from '../utils/sfx';

const base = import.meta.env.BASE_URL;

// Label pool — kid sees a rotating greeting on each discovery so the
// "Schau mal, ein neuer Freund!" moment doesn't feel canned. Audio file
// is still a single take until we record new voicelines; the on-screen
// copy at least varies.
const LABELS = {
  de: [
    'Neu entdeckt!',
    'Schau mal!',
    'Ein neuer Freund!',
    'Den kennen wir noch nicht!',
    'Wer bist du denn?',
  ],
  en: [
    'Newly found!',
    'Look, who is this?',
    'A new friend!',
    'I have never seen this one!',
    'Hello, stranger!',
  ],
};

export default function CreatureDiscoveryToast({ creatureId, onDismiss, onOpenDetail }) {
  const { lang } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!creatureId) return;
    setVisible(true);
    SFX.play('coin');
    VoiceAudio.play('de_discover_creature', 500);
    // 4s was too short for first-graders to absorb the moment (tester
    // 25 Apr 2026). 8s gives enough time to read the name + tap through
    // if curious, and still dismisses on its own so kids aren't stuck.
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 8000);
    return () => clearTimeout(t);
  }, [creatureId]);

  const label = useMemo(() => {
    const pool = LABELS[lang] || LABELS.de;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [creatureId, lang]);

  if (!creatureId) return null;
  const meta = SEED_BY_ID.get(creatureId);
  if (!meta) return null;

  const name = meta.name[lang] || meta.name.de;
  // Short teaser pulled from the creature's metadata. `howMet` tends to
  // be a complete sentence in DE; first-line trim keeps the toast light.
  const teaser = meta.howMet
    ? meta.howMet.split(/(?<=[.!?])\s+/)[0]
    : (meta.funFacts && meta.funFacts[0]);

  const handleTap = (e) => {
    e.stopPropagation();
    if (onOpenDetail) {
      onOpenDetail(creatureId);
      setVisible(false);
      setTimeout(() => onDismiss?.(), 200);
    } else {
      // No detail view wired — tap still dismisses so the toast doesn't
      // stick around if the kid swipes it away.
      setVisible(false);
      setTimeout(() => onDismiss?.(), 200);
    }
  };

  return (
    <div
      className="fixed inset-x-0 top-16 z-[700] flex justify-center px-6 pointer-events-auto"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-20px)', opacity: visible ? 1 : 0, transition: 'all 0.3s ease' }}
    >
      <button
        type="button"
        onClick={handleTap}
        aria-label={onOpenDetail ? (lang === 'de' ? 'Mehr über diesen Freund erfahren' : 'Learn more about this friend') : (lang === 'de' ? 'Schließen' : 'Dismiss')}
        className="rounded-2xl p-4 flex items-start gap-3 max-w-sm w-full text-left active:scale-[0.98] transition-transform"
        style={{
          background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
          boxShadow: '0 12px 32px rgba(252,211,77,0.4), 0 4px 0 #d4a830',
          border: '2px solid rgba(161,98,7,0.2)',
          cursor: 'pointer',
        }}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
          <img src={base + meta.art} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#78350f' }}>
            {label}
          </p>
          <p className="font-headline font-bold text-lg truncate" style={{ color: '#451a03' }}>
            {name} 🎉
          </p>
          {teaser && (
            <p className="font-body text-xs leading-snug mt-1 line-clamp-2" style={{ color: '#78350f' }}>
              {teaser}
            </p>
          )}
          {onOpenDetail && (
            <p className="font-label font-bold text-[11px] uppercase tracking-widest mt-1.5 inline-flex items-center gap-1"
               style={{ color: '#7c2d12' }}>
              {lang === 'de' ? 'Mehr erfahren' : 'Learn more'}
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </p>
          )}
        </div>
      </button>
    </div>
  );
}

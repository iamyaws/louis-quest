import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { SEED_BY_ID } from '../data/creatures';
import VoiceAudio from '../utils/voiceAudio';
import SFX from '../utils/sfx';

const base = import.meta.env.BASE_URL;

export default function CreatureDiscoveryToast({ creatureId, onDismiss }) {
  const { lang } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!creatureId) return;
    setVisible(true);
    SFX.play('coin');
    VoiceAudio.play('de_discover_creature', 500);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [creatureId]);

  if (!creatureId) return null;
  const meta = SEED_BY_ID.get(creatureId);
  if (!meta) return null;

  const name = meta.name[lang] || meta.name.de;

  return (
    <div onClick={onDismiss}
         className="fixed inset-x-0 top-16 z-[700] flex justify-center px-6 pointer-events-auto"
         style={{ transform: visible ? 'translateY(0)' : 'translateY(-20px)', opacity: visible ? 1 : 0, transition: 'all 0.3s ease' }}>
      <div className="rounded-2xl p-4 flex items-center gap-3 max-w-sm w-full"
           style={{
             background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
             boxShadow: '0 12px 32px rgba(252,211,77,0.4), 0 4px 0 #d4a830',
             border: '2px solid rgba(161,98,7,0.2)',
           }}>
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
          <img src={base + meta.art} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#78350f' }}>
            {lang === 'de' ? 'Neu entdeckt!' : 'Newly found!'}
          </p>
          <p className="font-headline font-bold text-lg truncate" style={{ color: '#451a03' }}>
            {name} 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

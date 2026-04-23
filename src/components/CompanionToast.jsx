import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import RonkiPortrait from './RonkiPortrait';

const MESSAGES = [
  { key: 'toast.stronger', icon: 'bolt' },
  { key: 'toast.proud', icon: 'sentiment_very_satisfied' },
  { key: 'toast.energy', icon: 'local_fire_department' },
  { key: 'toast.joyful', icon: 'auto_awesome' },
  { key: 'toast.wellDone', icon: 'military_tech' },
  { key: 'toast.growing', icon: 'trending_up' },
];

export default function CompanionToast({ trigger }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState(MESSAGES[0]);
  const [lastTrigger, setLastTrigger] = useState(0);

  useEffect(() => {
    if (trigger > lastTrigger && trigger > 0) {
      setLastTrigger(trigger);
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [trigger, lastTrigger]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-slide-in-toast pointer-events-none">
      <div className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl"
           style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(18,67,70,0.12)' }}>
        {/* Variant-aware mini chibi — replaces the amber-only dragon-baby
             painted portrait so the toast reflects the kid's picked
             variant (Marc 23 Apr 2026). */}
        <div className="shrink-0" style={{ width: 36, height: 36 }}>
          <RonkiPortrait size={36} />
        </div>
        <span className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}>{msg.icon}</span>
        <span className="font-headline font-bold text-base text-on-surface whitespace-nowrap">{t(msg.key)}</span>
      </div>
    </div>
  );
}

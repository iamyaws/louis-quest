import React, { useEffect, useState } from 'react';

const MESSAGES = [
  { text: 'Ronki fühlt sich stärker!', icon: 'bolt' },
  { text: 'Ronki ist stolz auf dich!', icon: 'sentiment_very_satisfied' },
  { text: 'Ronki hat neue Energie!', icon: 'local_fire_department' },
  { text: 'Ronki strahlt vor Freude!', icon: 'auto_awesome' },
  { text: 'Super gemacht, Held!', icon: 'military_tech' },
  { text: 'Ronki wächst weiter!', icon: 'trending_up' },
];

export default function CompanionToast({ trigger }) {
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
           style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(15,118,110,0.12)' }}>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 shrink-0"
             style={{ background: '#ccfbf1' }}>
          <img src={import.meta.env.BASE_URL + 'art/dragon-baby.webp'} alt=""
               className="w-full h-full object-cover" />
        </div>
        <span className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}>{msg.icon}</span>
        <span className="font-headline font-bold text-base text-on-surface whitespace-nowrap">{msg.text}</span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

const STEPS = [
  {
    icon: 'home',
    title: 'Deine Zentrale',
    body: 'Hier siehst du alles auf einen Blick — deinen Fortschritt, deinen Begleiter und tägliche Highlights.',
    tab: 'START',
  },
  {
    icon: 'task_alt',
    title: 'Tägliche Quests',
    body: 'Erledige Morgen-, Abend- und Bonus-Aufgaben, um XP zu sammeln und deinen Drachen wachsen zu lassen.',
    tab: 'AUFGABEN',
  },
  {
    icon: 'pets',
    title: 'Dein Begleiter',
    body: 'Füttere, streichle und spiele mit deinem Drachen. Je mehr du dich kümmerst, desto stärker wird er!',
    tab: 'PFLEGE',
  },
];

export default function WelcomeTour({ onDone }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
         style={{ background: 'rgba(18,67,70,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
           style={{ boxShadow: '0 24px 64px rgba(18,67,70,0.2)' }}>
        {/* Card content */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon circle */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-primary text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              {current.icon}
            </span>
          </div>

          {/* Tab label chip */}
          <span className="font-label font-bold text-[10px] tracking-[0.2em] uppercase text-primary/50 bg-primary/5 px-3 py-1 rounded-full mb-3">
            {current.tab}
          </span>

          <h2 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
            {current.title}
          </h2>
          <p className="font-body text-on-surface-variant text-base leading-relaxed">
            {current.body}
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          {/* CTA */}
          <button
            onClick={() => isLast ? onDone() : setStep(s => s + 1)}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLast ? 'Los geht\'s!' : 'Weiter'}</span>
            <span className="material-symbols-outlined text-secondary-container text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              {isLast ? 'rocket_launch' : 'arrow_forward'}
            </span>
          </button>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onDone}
              className="w-full py-2 text-primary/40 font-label font-semibold text-xs"
            >
              Überspringen
            </button>
          )}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-1">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 28 : 8,
                  height: 8,
                  background: i === step ? '#124346' : 'rgba(18,67,70,0.1)',
                }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

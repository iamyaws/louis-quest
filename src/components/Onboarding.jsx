import React, { useState } from 'react';

const base = import.meta.env.BASE_URL;

// ── Streamlined 3-step onboarding: Welcome → Egg pick → Go! ──
const EGGS = [
  {
    id: 'fire',
    name: 'Feuer-Ei',
    desc: 'Voller Leidenschaft und Kraft!',
    icon: 'local_fire_department',
    glowColor: 'rgba(239,68,68,0.25)',
    iconBg: 'rgba(239,68,68,0.12)',
    iconColor: '#ef4444',
    borderColor: '#ef4444',
  },
  {
    id: 'golden',
    name: 'Goldenes Ei',
    desc: 'Strahlend und voller Licht!',
    icon: 'star',
    glowColor: 'rgba(252,211,77,0.3)',
    iconBg: 'rgba(252,211,77,0.2)',
    iconColor: '#b45309',
    borderColor: '#fcd34d',
  },
  {
    id: 'spirit',
    name: 'Geist-Ei',
    desc: 'Geheimnisvoll und weise!',
    icon: 'fluid_med',
    glowColor: 'rgba(109,40,217,0.2)',
    iconBg: 'rgba(109,40,217,0.1)',
    iconColor: '#6d28d9',
    borderColor: '#6d28d9',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedEgg, setSelectedEgg] = useState(1); // default golden

  // ── Step 0: Welcome splash ──
  if (step === 0) {
    return (
      <div className="fixed inset-0 flex flex-col text-white overflow-hidden font-body">
        <div className="absolute inset-0 z-0">
          <img src={base + 'art/hero-entrance.webp'} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Ronki portrait */}
          <div className="flex-none flex justify-center"
               style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))' }}>
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
              <img src={base + 'art/dragon-baby.webp'} alt="Ronki" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1" />

          {/* Bottom content */}
          <div className="px-6 pb-12 max-w-lg mx-auto w-full text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold font-headline leading-tight"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                Willkommen bei Ronki!
              </h1>
              <p className="text-lg text-white/90 max-w-sm mx-auto leading-relaxed"
                 style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                Im mystischen Wald wartet ein Drachen-Ei auf dich.
                Pflege es, erledige Quests und werde zum Helden!
              </p>
            </div>
            <button onClick={() => setStep(1)}
              className="w-full py-5 rounded-full font-label font-extrabold text-xl flex items-center justify-center gap-3 active:scale-95 transition-all bg-white text-primary"
              style={{ boxShadow: '0 8px 30px rgba(255,255,255,0.3)' }}>
              Abenteuer starten!
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pt-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === 0 ? 32 : 8, height: 8,
                    background: i === 0 ? '#fcd34d' : 'rgba(255,255,255,0.2)',
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Egg selection ──
  if (step === 1) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden font-body">
        <div className="absolute inset-0 z-0">
          <img src={base + 'art/egg-chamber.webp'} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,248,241,0.5), transparent 30%, rgba(255,248,241,1))' }} />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto pb-36 px-6"
             style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h2 className="font-headline text-4xl font-bold text-primary">Wähle dein Ei</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Welches Drachen-Ei spricht zu dir?
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {EGGS.map((egg, i) => {
                const selected = i === selectedEgg;
                return (
                  <button key={egg.id}
                    onClick={() => setSelectedEgg(i)}
                    className="relative flex items-center gap-4 bg-white rounded-2xl p-5 text-left active:scale-[0.98] transition-all duration-300"
                    style={{
                      boxShadow: selected ? `0 0 30px -5px ${egg.glowColor}` : '0 2px 8px rgba(0,0,0,0.06)',
                      border: selected ? `2.5px solid ${egg.borderColor}` : '2px solid transparent',
                    }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: egg.iconBg }}>
                      <span className="material-symbols-outlined text-3xl"
                            style={{ color: egg.iconColor, fontVariationSettings: "'FILL' 1" }}>
                        {egg.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline text-xl font-bold text-on-surface">{egg.name}</h3>
                      <p className="text-sm text-on-surface-variant">{egg.desc}</p>
                    </div>
                    {selected && (
                      <span className="material-symbols-outlined text-xl shrink-0"
                            style={{ color: egg.borderColor, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-6" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
          <div className="max-w-lg mx-auto flex flex-col gap-3">
            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-full font-label font-extrabold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4)' }}>
              {EGGS[selectedEgg].name} wählen
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === 1 ? 32 : 8, height: 8,
                    background: i === 1 ? '#fcd34d' : 'rgba(0,0,0,0.08)',
                  }} />
              ))}
            </div>
          </div>
        </nav>
      </div>
    );
  }

  // ── Step 2: Quick guide + launch ──
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden font-body bg-surface">
      <img src={base + 'art/bg-parchment.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-30" style={{ zIndex: 0 }} />

      <div className="relative z-10 flex-1 overflow-y-auto pb-36 px-6"
           style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
        <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
          {/* Egg confirmation */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                 style={{ background: EGGS[selectedEgg].iconBg, boxShadow: `0 0 30px ${EGGS[selectedEgg].glowColor}` }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: EGGS[selectedEgg].iconColor, fontVariationSettings: "'FILL' 1" }}>
                {EGGS[selectedEgg].icon}
              </span>
            </div>
            <h2 className="font-headline text-3xl font-bold text-on-surface">Dein {EGGS[selectedEgg].name}!</h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-xs mx-auto">
              Dein Abenteuer beginnt jetzt. Hier ist, wie es funktioniert:
            </p>
          </div>

          {/* Quick guide cards */}
          <div className="flex flex-col gap-4 w-full">
            {[
              { icon: 'task_alt', title: 'Quests erledigen', body: 'Morgens und abends warten Aufgaben auf dich. Jede gibt XP und macht deinen Drachen stärker!', color: '#059669' },
              { icon: 'pets', title: 'Drache pflegen', body: 'Füttere, streichle und spiele mit deinem Drachen — und schau ihm beim Wachsen zu!', color: '#f59e0b' },
              { icon: 'swords', title: 'Bosse besiegen', body: 'Für jede erledigte Quest schlägst du den Tages-Boss. Besiege ihn und sammle Trophäen!', color: '#ba1a1a' },
            ].map((card, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white"
                   style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: `${card.color}15` }}>
                  <span className="material-symbols-outlined text-2xl"
                        style={{ color: card.color, fontVariationSettings: "'FILL' 1" }}>
                    {card.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-base text-on-surface">{card.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-1">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-6" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <button onClick={() => {
              localStorage.setItem('ronki_tour_done', '1');
              onComplete({ eggType: EGGS[selectedEgg].id });
            }}
            className="w-full py-5 rounded-full font-label font-extrabold text-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
            Los geht's!
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </button>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === 2 ? 32 : 8, height: 8,
                  background: i === 2 ? '#fcd34d' : 'rgba(0,0,0,0.08)',
                }} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

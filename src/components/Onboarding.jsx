import React, { useState } from 'react';

const base = import.meta.env.BASE_URL;

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

const TOTAL_STEPS = 5;

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedEgg, setSelectedEgg] = useState(1);

  // ── Progress bar (top) ──
  const ProgressBar = () => (
    <div className="w-full flex justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-500"
          style={{
            width: i === step ? 48 : 32,
            background: i === step ? '#fcd34d' : i < step ? '#124346' : 'rgba(18,67,70,0.15)',
          }} />
      ))}
    </div>
  );

  // ── Gradient CTA button ──
  const PrimaryButton = ({ children, onClick }) => (
    <button onClick={onClick}
      className="w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all"
      style={{
        background: 'linear-gradient(135deg, #124346, #2d5a5e)',
        boxShadow: '0 12px 30px rgba(18,67,70,0.25)',
      }}>
      {children}
    </button>
  );

  // ══════════════════════════════════════════
  // Step 0: Welcome to Thang Long (lore intro)
  // ══════════════════════════════════════════
  if (step === 0) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden font-body bg-background">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <img src={base + 'art/hero-entrance.webp'} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
          <ProgressBar />

          {/* Lantern motif */}
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-secondary-container/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-8 rounded-xl"
                 style={{ background: 'rgba(232,225,218,0.4)', backdropFilter: 'blur(12px)' }}>
              <div className="w-28 h-28 flex items-center justify-center rounded-full mx-auto"
                   style={{ background: '#fcd34d', filter: 'drop-shadow(0 0 15px rgba(252,211,77,0.6))' }}>
                <span className="material-symbols-outlined text-primary text-6xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}>temp_preferences_custom</span>
              </div>
              <div className="absolute -top-4 -right-4 opacity-20 text-primary">
                <span className="material-symbols-outlined text-4xl">eco</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="max-w-md space-y-5">
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Willkommen in Thang Long
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed px-4">
              Der Nebel macht unseren Wald schläfrig. Nur du kannst das Licht zurückbringen.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 w-full max-w-xs">
            <PrimaryButton onClick={() => setStep(1)}>
              Weiter
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
          </div>

          {/* Decorative */}
          <div className="absolute bottom-16 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '120px' }}>eco</span>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 1: Helden-Aufgaben (quest intro)
  // ══════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden font-body bg-background">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <img src={base + 'art/bg-golden.webp'} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/90 z-10" />
        </div>

        <main className="relative z-20 flex-1 flex flex-col items-center justify-between px-8 py-12">
          <ProgressBar />

          {/* Title */}
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-primary leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Deine Helden-Aufgaben
            </h1>
            <p className="text-on-surface/80 max-w-sm mx-auto text-lg leading-relaxed">
              Jede erledigte Aufgabe schenkt deinem Ronki Energie und verjagt den Nebel.
            </p>
          </header>

          {/* Bento quest preview */}
          <div className="w-full max-w-md my-8 relative flex items-center justify-center" style={{ minHeight: 240 }}>
            {/* Glow */}
            <div className="absolute w-48 h-48 rounded-full blur-3xl opacity-30"
                 style={{ background: 'rgba(252,211,77,0.4)', animation: 'float 6s ease-in-out infinite' }} />
            <div className="grid grid-cols-2 gap-5 relative z-10 w-full">
              <div className="rounded-xl p-6 flex flex-col items-center justify-center -rotate-2 scale-105"
                   style={{ background: 'rgba(255,248,242,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                     style={{ background: 'rgba(18,67,70,0.1)' }}>
                  <span className="material-symbols-outlined text-3xl text-primary">brush</span>
                </div>
                <span className="text-sm font-bold text-primary" style={{ fontFamily: 'Fredoka, sans-serif' }}>Zähne putzen</span>
              </div>
              <div className="rounded-xl p-6 flex flex-col items-center justify-center rotate-2 translate-y-6"
                   style={{ background: 'rgba(255,248,242,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                     style={{ background: 'rgba(252,211,77,0.2)' }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#735c00' }}>menu_book</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: 'Fredoka, sans-serif', color: '#735c00' }}>Lesen</span>
              </div>
            </div>
            {/* Floating sparkle */}
            <div className="absolute -top-2 -right-1" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-2s' }}>
              <div className="p-3 rounded-full"
                   style={{ background: '#fcd34d', boxShadow: '0 0 40px rgba(252,211,77,0.3)' }}>
                <span className="material-symbols-outlined text-2xl"
                      style={{ color: '#574500', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <footer className="w-full max-w-xs space-y-5">
            <PrimaryButton onClick={() => setStep(2)}>
              Weiter
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
            <div className="flex items-center justify-center gap-2 text-primary/50 font-label text-sm">
              <span className="material-symbols-outlined text-base">verified_user</span>
              Sichere Umgebung für Helden
            </div>
          </footer>
        </main>

        <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 2: Egg selection
  // ══════════════════════════════════════════
  if (step === 2) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden font-body">
        <div className="absolute inset-0 z-0">
          <img src={base + 'art/egg-chamber.webp'} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,248,241,0.5), transparent 30%, rgba(255,248,241,1))' }} />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto pb-40 px-8"
             style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
            <ProgressBar />

            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-primary"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>Wähle dein Ei</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Welches Geheimnis verbirgt sich darin?
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
        <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-8" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
          <div className="max-w-xs mx-auto flex flex-col gap-3">
            <PrimaryButton onClick={() => setStep(3)}>
              {EGGS[selectedEgg].name} wählen
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
          </div>
        </nav>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 3: Wachse zusammen (companion growth)
  // ══════════════════════════════════════════
  if (step === 3) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden font-body bg-background">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <img src={base + 'art/bg-golden.webp'} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-background/40" style={{ backdropFilter: 'blur(2px)' }} />
        </div>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
          <ProgressBar />

          {/* Egg hero section */}
          <div className="relative mb-10">
            {/* Glow aura */}
            <div className="absolute inset-0 rounded-full blur-3xl scale-125 opacity-30"
                 style={{ background: 'rgba(252,211,77,0.4)' }} />
            {/* Egg in glass circle */}
            <div className="relative z-10 p-10 rounded-full"
                 style={{ background: 'rgba(255,248,242,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 24px 40px rgba(30,27,23,0.05)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <img src={base + 'art/egg-glow.webp'} alt="Dein Ei"
                   className="w-40 h-48 object-contain"
                   style={{ filter: 'drop-shadow(0 20px 30px rgba(18,67,70,0.2))' }} />
            </div>
            {/* Sparkle accents */}
            <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full flex items-center justify-center"
                 style={{ background: '#fcd34d', boxShadow: '0 4px 16px rgba(252,211,77,0.3)' }}>
              <span className="material-symbols-outlined text-lg"
                    style={{ color: '#574500', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div className="absolute bottom-6 -left-5 w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(255,248,242,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <span className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
            </div>
          </div>

          {/* Text */}
          <div className="max-w-md space-y-5">
            <h1 className="text-5xl font-bold text-primary tracking-tight leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Wachse zusammen
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed px-4">
              Pflege deinen Freund und sieh ihm beim Wachsen zu. Bist du bereit?
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 w-full max-w-xs">
            <PrimaryButton onClick={() => setStep(4)}>
              Weiter
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
          </div>

          {/* Decorative */}
          <div className="absolute bottom-16 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '120px' }}>eco</span>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 4: Quick guide + launch
  // ══════════════════════════════════════════
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden font-body bg-background">
      <img src={base + 'art/bg-parchment.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-30" style={{ zIndex: 0 }} />

      <div className="relative z-10 flex-1 overflow-y-auto pb-40 px-8"
           style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
        <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
          <ProgressBar />

          {/* Egg confirmation */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                 style={{ background: EGGS[selectedEgg].iconBg, boxShadow: `0 0 30px ${EGGS[selectedEgg].glowColor}` }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: EGGS[selectedEgg].iconColor, fontVariationSettings: "'FILL' 1" }}>
                {EGGS[selectedEgg].icon}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-on-surface"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Dein {EGGS[selectedEgg].name}!
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-xs mx-auto">
              Dein Abenteuer in Thang Long beginnt jetzt.
            </p>
          </div>

          {/* Quick guide */}
          <div className="flex flex-col gap-4 w-full">
            {[
              { icon: 'task_alt', title: 'Quests erledigen', body: 'Morgens und abends warten Aufgaben. Jede gibt Energie und vertreibt den Nebel!', color: '#124346' },
              { icon: 'pets', title: 'Freund pflegen', body: 'Füttere, streichle und spiele — schau deinem Begleiter beim Wachsen zu!', color: '#f59e0b' },
              { icon: 'swords', title: 'Nebel besiegen', body: 'Für jede Quest schlägst du den Tages-Boss. Sammle Trophäen und Ausrüstung!', color: '#ba1a1a' },
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
      <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-8" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
        <div className="max-w-xs mx-auto">
          <button onClick={() => {
              localStorage.setItem('ronki_tour_done', '1');
              onComplete({ eggType: EGGS[selectedEgg].id });
            }}
            className="w-full py-5 rounded-full font-headline text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
            Abenteuer starten!
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

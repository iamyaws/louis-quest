import React, { useState } from 'react';
import HeroCreator from './HeroCreator';

const base = import.meta.env.BASE_URL;

const SLIDES = [
  {
    // 1. Welcome
    bg: 'hero-entrance.webp',
    overlay: 'from-black/40 via-transparent to-black/60',
    topContent: (
      <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
        <img src={base + 'art/dragon-baby.webp'} alt="Ronki" className="w-full h-full object-cover" />
      </div>
    ),
    title: 'Willkommen bei Ronki!',
    body: 'Dein Abenteuer beginnt hier. Begleite uns in ein Reich der Achtsamkeit und Freude.',
    cta: "Los geht's!",
    ctaStyle: 'white',
  },
  {
    // 2. Der Anfang
    bg: 'hero-entrance.webp',
    overlay: 'from-black/30 via-black/10 to-black/70',
    badge: 'Der Anfang',
    title: 'Tief im alten Wald von Ronki schläft ein Geheimnis...',
    body: 'Spürst du das ferne Leuchten?\nEs ruft ganz leise nach dir.',
    cta: 'Dem Licht folgen',
    ctaStyle: 'gold',
    skip: true,
  },
  {
    // 3. Die Legende
    bg: 'egg-chamber.webp',
    overlay: 'from-black/20 via-transparent to-black/60',
    badge: 'Die Legende',
    title: 'Ein Drache, ein Kind, ein Band für immer.',
    body: 'Jede deiner guten Taten schenkt deinem Drachen neue Kraft. In der Wärme des geheimen Waldes beginnt eure magische Reise – Hand in Pfote, Herz an Herz.',
    cta: 'Werde zum Helden',
    ctaStyle: 'gold',
  },
  {
    // 4. Das Erwachen
    bg: 'egg-glow.webp',
    overlay: 'from-black/30 via-transparent to-black/50',
    badge: 'Akt II: Das Erwachen',
    title: 'Nur ein Herz voller Mut kann die Drachen wecken.',
    body: 'Spürst du das goldene Leuchten? Die Schatten tanzen davon, denn in deiner Hand hältst du den Schlüssel zum Licht.',
    cta: 'Ich bin bereit!',
    ctaStyle: 'gold',
    glow: true,
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [showCreator, setShowCreator] = useState(false);

  if (showCreator) {
    return <HeroCreator onComplete={(cfg) => onComplete(cfg)} />;
  }

  const slide = SLIDES[step];

  const advance = () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      setShowCreator(true);
    }
  };

  const ctaClasses = slide.ctaStyle === 'white'
    ? 'bg-white text-[#5300b7] shadow-[0_8px_30px_rgba(255,255,255,0.3)]'
    : 'bg-[#fcd34d] text-[#725b00] shadow-[0_0_20px_rgba(252,211,77,0.3)]';

  return (
    <div className="fixed inset-0 flex flex-col text-white overflow-hidden font-body">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={base + 'art/' + slide.bg} alt="" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-b ${slide.overlay}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Top area */}
        <div className="flex-none px-6 pt-14 flex justify-center">
          {slide.topContent ? slide.topContent : slide.badge ? (
            <span className="font-label font-bold tracking-[0.2em] text-white/70 text-[10px] uppercase px-4 py-2 rounded-full border border-white/10"
                  style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }}>
              {slide.badge}
            </span>
          ) : null}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom content */}
        <div className="px-6 pb-16 max-w-lg mx-auto w-full">

          {step === 0 ? (
            /* Welcome — open layout, no glass card */
            <div className="text-center space-y-8 mb-4">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold font-headline leading-tight"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {slide.title}
                </h1>
                <p className="text-lg text-white/90 max-w-sm mx-auto leading-relaxed"
                   style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {slide.body}
                </p>
              </div>
              <button onClick={advance}
                className={`w-full py-5 rounded-full font-label font-extrabold text-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${ctaClasses}`}>
                {slide.cta}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* Lore slides — glass card */
            <div className="rounded-[2.5rem] p-8 border border-white/10 shadow-2xl mb-4"
                 style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }}>

              {slide.badge && step >= 2 && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-0.5 w-6 rounded-full bg-[#fcd34d]" />
                  <span className="font-label font-bold text-xs tracking-[0.3em] text-[#fcd34d] uppercase">
                    {slide.badge}
                  </span>
                </div>
              )}

              <h1 className="font-headline text-3xl font-bold leading-tight mb-4"
                  style={{ textShadow: '0 0 15px rgba(255,255,255,0.15)' }}>
                {slide.title}
              </h1>

              <p className="text-white/90 text-lg leading-relaxed mb-8" style={{ whiteSpace: 'pre-line' }}>
                {slide.body}
              </p>

              <button onClick={advance}
                className={`w-full py-5 rounded-full font-label font-extrabold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all ${ctaClasses}`}
                style={slide.glow ? { boxShadow: '0 0 20px rgba(252,211,77,0.4)' } : undefined}>
                {slide.cta}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Skip */}
          {slide.skip && (
            <button onClick={() => setShowCreator(true)}
              className="w-full text-center text-white/40 font-label font-semibold text-xs tracking-wide py-2">
              Erzählung überspringen
            </button>
          )}

          {/* Page dots */}
          <div className="flex justify-center items-center gap-3 mt-6">
            {SLIDES.map((_, i) => (
              <div key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 40 : 8,
                  height: i === step ? 6 : 8,
                  background: i === step ? '#fcd34d' : 'rgba(255,255,255,0.2)',
                  boxShadow: i === step ? '0 0 10px rgba(252,211,77,0.5)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full overflow-hidden z-20"
           style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${((step + 1) / SLIDES.length) * 100}%`, background: 'rgba(252,211,77,0.8)' }} />
      </div>
    </div>
  );
}

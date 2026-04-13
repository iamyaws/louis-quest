import React, { useState } from 'react';

const base = import.meta.env.BASE_URL;

// ── Phase 1: Full-screen cinematic slides ──
const SLIDES = [
  {
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
    bg: 'egg-chamber.webp',
    overlay: 'from-black/20 via-transparent to-black/60',
    badge: 'Die Legende',
    title: 'Ein Drache, ein Kind, ein Band für immer.',
    body: 'Jede deiner guten Taten schenkt deinem Drachen neue Kraft. In der Wärme des geheimen Waldes beginnt eure magische Reise – Hand in Pfote, Herz an Herz.',
    cta: 'Werde zum Helden',
    ctaStyle: 'gold',
  },
  {
    bg: 'egg-glow.webp',
    overlay: 'from-black/30 via-transparent to-black/50',
    badge: 'Das Erwachen',
    title: 'Nur ein Herz voller Mut kann die Drachen wecken.',
    body: 'Spürst du das goldene Leuchten? Die Schatten tanzen davon, denn in deiner Hand hältst du den Schlüssel zum Licht.',
    cta: 'Weiter ins Abenteuer',
    ctaStyle: 'gold',
    glow: true,
  },
];

// ── Phase 2: Article-style lore pages ──
const LORE_PAGES = [
  {
    partLabel: 'Kapitel II',
    chapter: 'Das Geheimnis',
    image: 'hero-entrance.webp',
    title: 'Ein altes Geheimnis wartet darauf, geweckt zu werden.',
    body: 'Im dichten Unterholz des Waldes flüsterte das Licht. Es war kein gewöhnliches Feuer, sondern ein Pulsieren, das im Takt deines Herzens schlug.',
  },
  {
    partLabel: 'Kapitel III',
    chapter: 'Die Begegnung',
    image: 'egg-chamber.webp',
    title: 'Welches Schicksal wirst du wählen?',
    body: 'Das Kind entdeckt drei magische Eier auf einem bemoosten Altar. Ein Flüstern weht durch die Blätter...',
    italic: true,
  },
];

// ── Phase 3: Egg selection ──
const EGGS = [
  {
    id: 'fire',
    name: 'Das Feurige Ei',
    element: 'Feuer',
    icon: 'local_fire_department',
    description: 'Geboren in den Tiefen des Schicksalsbergs. Ein Wesen voller Leidenschaft und unbändiger Kraft.',
    glowColor: 'rgba(186,26,26,0.3)',
    iconBg: '#ba1a1a1a',
    iconColor: '#ba1a1a',
    elementColor: '#ba1a1a',
    borderHover: '#ba1a1a33',
  },
  {
    id: 'golden',
    name: 'Das Goldene Ei',
    element: 'Licht',
    icon: 'star',
    description: 'Geküsst vom Sonnenlicht des Äthers. Ein treuer Begleiter für diejenigen, die das Licht suchen.',
    glowColor: 'rgba(252,211,77,0.4)',
    iconBg: '#fcd34d',
    iconColor: '#725b00',
    elementColor: '#735c00',
    borderHover: '#fcd34d66',
  },
  {
    id: 'spirit',
    name: 'Das Geist-Ei',
    element: 'Geist',
    icon: 'fluid_med',
    description: 'Ein Echo aus der Geisterwelt. Still, weise und verbunden mit den verborgenen Strömen der Natur.',
    glowColor: 'rgba(115,49,223,0.2)',
    iconBg: '#5300b71a',
    iconColor: '#5300b7',
    elementColor: '#5300b7',
    borderHover: '#5300b733',
  },
];

const EGG_STEP = SLIDES.length + LORE_PAGES.length;

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedEgg, setSelectedEgg] = useState(1); // default golden

  const advance = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const skipToEgg = () => setStep(EGG_STEP);

  // ── Phase 1: Cinematic slides (steps 0–3) ──
  if (step < SLIDES.length) {
    const slide = SLIDES[step];
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

        <div className="relative z-10 flex flex-col h-full">
          {/* Top area */}
          <div className="flex-none px-6 flex justify-center"
               style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))' }}>
            {slide.topContent ? slide.topContent : slide.badge ? (
              <span className="font-label font-bold tracking-[0.2em] text-white/70 text-[10px] uppercase px-4 py-2 rounded-full border border-white/10"
                    style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }}>
                {slide.badge}
              </span>
            ) : null}
          </div>

          <div className="flex-1" />

          {/* Bottom content */}
          <div className="px-6 pb-16 max-w-lg mx-auto w-full">
            {step === 0 ? (
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

            {slide.skip && (
              <button onClick={skipToEgg}
                className="w-full text-center text-white/40 font-label font-semibold text-xs tracking-wide py-2">
                Erzählung überspringen
              </button>
            )}

            {/* Slide dots */}
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
               style={{ width: `${((step + 1) / (EGG_STEP + 1)) * 100}%`, background: 'rgba(252,211,77,0.8)' }} />
        </div>
      </div>
    );
  }

  // ── Phase 2: Lore pages (steps 4–5) ──
  const loreIndex = step - SLIDES.length;
  if (loreIndex < LORE_PAGES.length) {
    const page = LORE_PAGES[loreIndex];
    return (
      <div className="fixed inset-0 flex flex-col bg-surface overflow-hidden font-body">
        {/* Parchment texture layer */}
        <img src={base + 'art/bg-parchment.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 0, opacity: 0.35 }} />
        {/* Bodhi motifs */}
        <div className="absolute top-20 right-[-5%] w-64 h-64 opacity-[0.03] text-on-surface pointer-events-none" style={{ transform: 'rotate(12deg)' }}>
          <svg fill="currentColor" viewBox="0 0 100 100"><path d="M50 10 C60 40 90 50 90 50 C90 50 60 60 50 90 C40 60 10 50 10 50 C10 50 40 40 50 10" /></svg>
        </div>
        <div className="absolute bottom-20 left-[-10%] w-80 h-80 opacity-[0.05] text-on-surface pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
          <svg fill="currentColor" viewBox="0 0 100 100"><path d="M50 5 C65 35 95 50 95 50 C95 50 65 65 50 95 C35 65 5 50 5 50 C5 50 35 35 50 5" /></svg>
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto pt-12 pb-36 px-6" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col gap-8">
            {/* Chapter label */}
            <div className="text-center">
              <span className="font-label font-bold text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(83,0,183,0.6)' }}>{page.partLabel}</span>
              <h1 className="font-headline text-4xl font-bold mt-2 text-on-surface">{page.chapter}</h1>
            </div>

            {/* Image card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full scale-110 opacity-30" style={{ background: 'rgba(252,211,77,0.2)', filter: 'blur(40px)' }} />
              <div className="relative bg-white rounded-lg overflow-hidden p-3" style={{ boxShadow: '0 25px 50px -12px rgba(30,27,23,0.05)' }}>
                <img src={base + 'art/' + page.image} alt="" className="w-full aspect-[4/3] object-cover rounded-lg" />
                {/* Lotus stamp */}
                <div className="absolute bottom-6 right-6 w-16 h-16 opacity-[0.08] text-on-surface pointer-events-none">
                  <svg fill="currentColor" viewBox="0 0 100 100"><path d="M50 20 C55 40 80 50 80 50 C80 50 55 60 50 80 C45 60 20 50 20 50 C20 50 45 40 50 20" /></svg>
                </div>
              </div>
            </div>

            {/* Story text */}
            <div className="space-y-4 text-center px-2">
              {page.italic ? (
                <>
                  <p className="font-body text-xl leading-relaxed text-on-surface/80 italic">
                    {page.body}
                  </p>
                  <div className="h-[1px] w-12 rounded-full mx-auto" style={{ background: 'rgba(204,195,215,0.3)' }} />
                  <h2 className="font-headline text-3xl font-bold text-primary">
                    {page.title}
                  </h2>
                </>
              ) : (
                <>
                  <p className="font-headline text-3xl font-bold leading-tight text-on-surface">
                    {page.title}
                  </p>
                  <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                    {page.body}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-6" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
          <div className="max-w-lg mx-auto flex justify-between items-center">
            <button onClick={goBack}
              className="flex flex-col items-center justify-center px-6 py-4 active:scale-95 transition-transform" style={{ color: '#5300b7' }}>
              <span className="material-symbols-outlined mb-1">arrow_back_ios</span>
              <span className="font-label font-bold text-xs uppercase tracking-widest">Zurück</span>
            </button>
            <button onClick={advance}
              className="flex items-center gap-2 rounded-full px-10 py-4 active:scale-95 transition-transform"
              style={{ background: '#fcd34d', color: '#1e1b17', boxShadow: '0 10px 25px -5px rgba(30,27,23,0.1)' }}>
              <span className="font-label font-bold text-xs uppercase tracking-widest">Weiter</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>magic_button</span>
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: LORE_PAGES.length }, (_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === loreIndex ? 32 : 8,
                  height: 8,
                  background: i === loreIndex ? '#fcd34d' : 'rgba(30,27,23,0.1)',
                }} />
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // ── Phase 3: Egg selection ──
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden font-body">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={base + 'art/egg-chamber.webp'} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,248,241,0.4), transparent 40%, rgba(255,248,241,1))' }} />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-36 px-6" style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
        <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
          {/* Headline */}
          <div className="text-center space-y-4">
            <h2 className="font-headline text-5xl font-bold text-primary tracking-tight">Wähle dein Ei</h2>
            <p className="text-on-surface-variant max-w-md mx-auto text-lg leading-relaxed">
              Dein Abenteuer beginnt hier. Welcher Pfad ruft nach deinem Herzen?
            </p>
          </div>

          {/* Egg cards */}
          <div className="flex flex-col gap-5 w-full">
            {EGGS.map((egg, i) => {
              const selected = i === selectedEgg;
              return (
                <button
                  key={egg.id}
                  onClick={() => setSelectedEgg(i)}
                  className="relative flex flex-col bg-white rounded-lg p-6 text-left overflow-hidden active:scale-[0.98] transition-all duration-300"
                  style={{
                    boxShadow: selected
                      ? `0 0 40px -10px ${egg.glowColor}`
                      : '0 2px 12px rgba(0,0,0,0.06)',
                    border: selected
                      ? '2px solid #6d28d9'
                      : '2px solid transparent',
                    outline: selected ? `4px solid rgba(252,211,77,0.3)` : 'none',
                  }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ background: egg.iconBg }}>
                    <span className="material-symbols-outlined text-3xl"
                      style={{ color: egg.iconColor, fontVariationSettings: "'FILL' 1" }}>
                      {egg.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-2 text-on-surface">{egg.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{egg.description}</p>
                  <span className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: egg.elementColor }}>
                    Element: {egg.element}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-6" style={{ background: 'linear-gradient(to top, #fff8f2 60%, transparent)' }}>
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button onClick={goBack}
            className="flex flex-col items-center justify-center px-6 py-4 active:scale-95 transition-transform" style={{ color: '#5300b7' }}>
            <span className="material-symbols-outlined mb-1">arrow_back_ios</span>
            <span className="font-label font-bold text-xs uppercase tracking-widest">Zurück</span>
          </button>
          <button onClick={() => onComplete({ eggType: EGGS[selectedEgg].id })}
            className="flex items-center gap-2 rounded-full px-10 py-4 active:scale-95 transition-transform"
            style={{ background: '#fcd34d', color: '#1e1b17', boxShadow: '0 10px 25px -5px rgba(30,27,23,0.15)' }}>
            <span className="font-label font-bold text-xs uppercase tracking-widest">Wählen</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>magic_button</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

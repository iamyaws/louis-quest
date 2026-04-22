import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import PWAInstallSheet from './PWAInstallSheet';
import VoiceAudio from '../utils/voiceAudio';
import { COMPANION_VARIANTS, DEFAULT_VARIANT_ID, getVariant } from '../data/companionVariants';

const base = import.meta.env.BASE_URL;

// Six Ronki colorways. Louis picks one at onboarding; that choice is the
// companion's lifetime identity (stored as state.companionVariant). Louis's
// feedback on evolution stages — they felt like a progression ladder, not
// one stable friend — is why this replaces the 3-egg + evolution flow in
// public mode. Evolution is kept intact for dev-mode users.
const TOTAL_STEPS = 7;

export default function Onboarding({ onComplete, startStep = 0 }) {
  const { t, lang, setLang } = useTranslation();
  const [step, setStep] = useState(startStep);
  const [selectedVariantId, setSelectedVariantId] = useState(DEFAULT_VARIANT_ID);
  const [heroName, setHeroName] = useState('');
  const [heroGender, setHeroGender] = useState('boy'); // 'boy' | 'girl'
  const { isIOS, androidPrompt, promptInstall } = usePWAInstall();
  const [showPWA, setShowPWA] = useState(false);
  const [pendingCfg, setPendingCfg] = useState(null);

  const selectedVariant = getVariant(selectedVariantId);

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

  // ── Language flag picker ──
  const LangPicker = () => (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full p-1.5"
         style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
      <button
        onClick={() => setLang('de')}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          background: lang === 'de' ? 'rgba(255,255,255,0.9)' : 'transparent',
          boxShadow: lang === 'de' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
        aria-label="Deutsch"
      >
        🇩🇪
      </button>
      <button
        onClick={() => setLang('en')}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          background: lang === 'en' ? 'rgba(255,255,255,0.9)' : 'transparent',
          boxShadow: lang === 'en' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
        aria-label="English"
      >
        🇬🇧
      </button>
    </div>
  );

  // ── Gradient CTA button ──
  const PrimaryButton = ({ children, onClick, disabled }) => (
    <button onClick={onClick}
      disabled={disabled}
      className={`w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all ${disabled ? 'opacity-50' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #124346, #2d5a5e)',
        boxShadow: disabled ? 'none' : '0 12px 30px rgba(18,67,70,0.25)',
      }}>
      {children}
    </button>
  );

  // ══════════════════════════════════════════
  // Step 0: Welcome to Thang Long (lore intro)
  // Trimmed per "Option 1: the lore is the product — trim it, don't cut it."
  // Scroll pattern: `min-h-full` on main + `my-auto` on content = centers
  // when content fits, scroll-from-top when content overflows (fixes iPhone
  // SE bug where CTA was below the fold and parent's overflow-y-auto never
  // fired because flex-1 locked main to viewport height).
  // ══════════════════════════════════════════
  if (step === 0) {
    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Language picker — top right */}
        <div className="fixed top-5 right-5 z-20"
             style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <LangPicker />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-8 text-center py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          {/* my-auto = auto vertical margins: centers inside main when content
              fits, collapses to 0 and stacks from top when content overflows. */}
          <div className="my-auto flex flex-col items-center">
            {/* Lantern illustration — trimmed from w-56 to w-40 for iPhone SE */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 blur-3xl rounded-full scale-150" style={{ background: 'rgba(252,211,77,0.2)' }} />
              <img src={base + 'art/onboarding/lantern.webp'} alt="Laterne"
                   className="relative z-10 w-40 h-auto mx-auto rounded-2xl"
                   style={{ filter: 'drop-shadow(0 20px 40px rgba(252,211,77,0.3))' }} />
            </div>

            {/* Text */}
            <div className="max-w-md space-y-4">
              <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.welcome.title')}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed px-4">
                {t('onboarding.welcome.body')}
              </p>
            </div>

            {/* CTA — closer to the body so it's reachable without scroll on SE */}
            <div className="mt-8 w-full max-w-xs">
              <PrimaryButton onClick={() => setStep(1)}>
                {t('onboarding.continue')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 1: Helden-Aufgaben (quest intro)
  // Same min-h-full + my-auto pattern as step 0; this one was the worst
  // offender on iPhone SE (CTA 99px below fold, unscrollable).
  // ══════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        {/* Background — same teal as welcome for cohesion */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center gap-6">
            {/* Title */}
            <header className="space-y-3 text-center">
              <h1 className="text-4xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.quest.title')}
              </h1>
              <p className="text-white/75 max-w-sm mx-auto text-lg leading-relaxed">
                {t('onboarding.quest.subtitle')}
              </p>
            </header>

            {/* Quest path illustration — height-capped so it doesn't eat
                the viewport on short screens (was 413px tall at max-w-xs). */}
            <div className="w-full max-w-[200px] relative">
              <div className="absolute inset-0 blur-3xl rounded-full opacity-20"
                   style={{ background: 'rgba(252,211,77,0.4)' }} />
              <img src={base + 'art/onboarding/path-fog.webp'} alt="Der Pfad"
                   className="relative z-10 w-full h-auto rounded-2xl"
                   style={{ maxHeight: '180px', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.25))' }} />
            </div>

            {/* CTA */}
            <footer className="w-full max-w-xs space-y-3">
              <PrimaryButton onClick={() => setStep(2)}>
                {t('onboarding.continue')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
              <div className="flex items-center justify-center gap-2 text-white/40 font-label text-sm">
                <span className="material-symbols-outlined text-base">verified_user</span>
                {t('onboarding.secure')}
              </div>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 2: Hero creation — name + gender
  // ══════════════════════════════════════════
  if (step === 2) {
    const canProceed = heroName.trim().length >= 1;
    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto font-body">
        <div className="fixed inset-0 z-0">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto pb-40 px-8"
             style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
            <ProgressBar />

            {/* Hero illustration */}
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-0 blur-3xl rounded-full scale-110 opacity-25"
                   style={{ background: 'rgba(252,211,77,0.4)' }} />
              <img src={base + 'art/onboarding/hero-select.webp'} alt="Held erstellen"
                   className="relative z-10 w-full h-auto rounded-2xl"
                   style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.25))' }} />
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.hero.createTitle')}
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                {t('onboarding.hero.askName')}
              </p>
            </div>

            {/* Name input */}
            <div className="w-full max-w-sm">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-white/60 mb-2 px-1">
                {t('onboarding.hero.namePlaceholder')}
              </label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && heroName.trim().length >= 1) {
                    // Parent setup flow: hitting return on the soft keyboard
                    // advances the step so they don't have to hunt for the
                    // Weiter button that might be hidden behind the keyboard
                    // on older iOS versions.
                    e.preventDefault();
                    e.currentTarget.blur();
                    setStep(3);
                  }
                }}
                placeholder={t('onboarding.hero.namePlaceholder')}
                maxLength={20}
                autoCapitalize="words"
                autoComplete="off"
                enterKeyHint="next"
                className="w-full px-6 py-4 rounded-2xl text-xl font-headline font-bold text-on-surface placeholder:text-on-surface/30 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: heroName.trim() ? '2.5px solid #fcd34d' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: heroName.trim() ? '0 0 20px rgba(252,211,77,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            </div>

            {/* Gender selection */}
            <div className="w-full max-w-sm">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-white/60 mb-3 px-1">
                {t('onboarding.hero.yourHero')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Boy */}
                <button
                  onClick={() => setHeroGender('boy')}
                  className="relative rounded-2xl p-4 flex flex-col items-center gap-3 active:scale-[0.97] transition-all"
                  style={{
                    background: heroGender === 'boy' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                    border: heroGender === 'boy' ? '2.5px solid #fcd34d' : '2px solid rgba(255,255,255,0.2)',
                    boxShadow: heroGender === 'boy' ? '0 0 24px rgba(252,211,77,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-md"
                       style={{ border: heroGender === 'boy' ? '3px solid #fcd34d' : '3px solid rgba(0,0,0,0.08)' }}>
                    <img src={base + 'art/hero-default.webp'} alt="Junge" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-headline font-bold text-lg text-on-surface">{t('onboarding.hero.boy')}</span>
                  {heroGender === 'boy' && (
                    <span className="absolute top-3 right-3 material-symbols-outlined text-lg"
                          style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>

                {/* Girl */}
                <button
                  onClick={() => setHeroGender('girl')}
                  className="relative rounded-2xl p-4 flex flex-col items-center gap-3 active:scale-[0.97] transition-all"
                  style={{
                    background: heroGender === 'girl' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                    border: heroGender === 'girl' ? '2.5px solid #fcd34d' : '2px solid rgba(255,255,255,0.2)',
                    boxShadow: heroGender === 'girl' ? '0 0 24px rgba(252,211,77,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-md"
                       style={{ border: heroGender === 'girl' ? '3px solid #fcd34d' : '3px solid rgba(0,0,0,0.08)' }}>
                    <img src={base + 'art/hero-default-girl.webp'} alt="Mädchen" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-headline font-bold text-lg text-on-surface">{t('onboarding.hero.girl')}</span>
                  {heroGender === 'girl' && (
                    <span className="absolute top-3 right-3 material-symbols-outlined text-lg"
                          style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-8" style={{ background: 'linear-gradient(to top, rgba(12,50,54,0.95) 40%, transparent)' }}>
          <div className="max-w-xs mx-auto flex flex-col gap-3">
            <PrimaryButton onClick={() => setStep(3)} disabled={!canProceed}>
              {t('onboarding.continue')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
          </div>
        </nav>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 3: Egg pick — 6 variants in a 2×3 grid
  // (CSS gradients until Marc's egg art lands)
  // ══════════════════════════════════════════
  if (step === 3) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto font-body">
        <div className="absolute inset-0 z-0">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto pb-40 px-6"
             style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-5">
            <ProgressBar />

            <div className="text-center space-y-2 px-2">
              <h2 className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.egg.title')}
              </h2>
              <p className="text-white/75 text-base leading-relaxed">
                {t('onboarding.egg.hint')}
              </p>
            </div>

            {/* 2×3 grid — big tappable tiles */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {COMPANION_VARIANTS.map((v) => {
                const selected = v.id === selectedVariantId;
                const label = t(`onboarding.egg.variant.${v.id}.name`);
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className="relative flex flex-col items-center gap-3 bg-white rounded-3xl p-4 pt-5 text-center active:scale-[0.97] transition-all duration-300"
                    style={{
                      boxShadow: selected
                        ? `0 0 28px -4px ${v.glowColor}, 0 8px 24px rgba(0,0,0,0.1)`
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      border: selected ? `3px solid ${v.borderColor}` : '2px solid transparent',
                    }}
                    aria-label={label}
                  >
                    {/* Egg placeholder — CSS gradient ellipse */}
                    <div
                      className="w-20 h-24"
                      style={{
                        background: v.eggGradient,
                        borderRadius: '50% 50% 48% 48% / 58% 58% 42% 42%',
                        boxShadow: `inset -6px -10px 18px rgba(0,0,0,0.15), inset 6px 8px 16px rgba(255,255,255,0.35)`,
                      }}
                      aria-hidden="true"
                    />
                    <h3 className="font-headline text-base font-bold text-on-surface leading-tight">
                      {label}
                    </h3>
                    {selected && (
                      <span
                        className="absolute top-2 right-2 material-symbols-outlined text-xl"
                        style={{ color: v.borderColor, fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom nav — "This is my egg!" triggers hatch animation */}
        <nav className="fixed bottom-0 left-0 w-full z-50 pb-8 px-8"
             style={{ background: 'linear-gradient(to top, rgba(12,50,54,0.95) 40%, transparent)' }}>
          <div className="max-w-xs mx-auto flex flex-col gap-3">
            <PrimaryButton onClick={() => setStep(4)}>
              {t('onboarding.egg.confirm')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </PrimaryButton>
          </div>
        </nav>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 4: Hatch animation (NEW)
  // Wobble ~1.2s → crack → reveal → auto-advance
  // ══════════════════════════════════════════
  if (step === 4) {
    return <HatchStep
      variant={selectedVariant}
      heroName={heroName.trim()}
      t={t}
      ProgressBar={ProgressBar}
      onDone={() => setStep(5)}
    />;
  }

  // ══════════════════════════════════════════
  // Step 5: Wachse zusammen (was step 4)
  // Same scroll-safe pattern as steps 0 and 1.
  // ══════════════════════════════════════════
  if (step === 5) {
    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-cream-brush.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-8 text-center"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center">
            {/* World waking up illustration — trimmed from w-72 to w-56 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl rounded-full scale-125 opacity-20"
                   style={{ background: 'rgba(252,211,77,0.4)' }} />
              <img src={base + 'art/onboarding/world-dawn.webp'} alt="Die Welt erwacht"
                   className="relative z-10 w-56 h-auto mx-auto rounded-2xl"
                   style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.12))' }} />
            </div>

            {/* Text — text-4xl for consistency with steps 0/1 + iPhone SE fit */}
            <div className="max-w-md space-y-4">
              <h1 className="text-4xl font-bold text-primary tracking-tight leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {t('onboarding.growth.title')}
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed px-4">
                {t('onboarding.growth.subtitle')}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 w-full max-w-xs">
              <PrimaryButton onClick={() => setStep(6)}>
                {t('onboarding.continue')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 6: Quick guide + launch (was step 5)
  // ══════════════════════════════════════════
  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto font-body bg-background">
      <img src={base + 'art/bg-parchment.webp'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-30" style={{ zIndex: 0 }} />

      <div className="relative z-10 flex-1 overflow-y-auto pb-40 px-8"
           style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
        <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
          <ProgressBar />

          {/* Ronki reveal — hatched companion sprite in the variant colorway */}
          <div className="text-center space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <img src={base + 'art/onboarding/reveal-burst.webp'} alt=""
                   className="absolute inset-0 w-full h-full object-cover rounded-full opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-2xl overflow-hidden"
                     style={{ boxShadow: `0 0 30px ${selectedVariant.glowColor}` }}>
                  <img src={base + selectedVariant.spritePath} alt={selectedVariant.name[lang] || selectedVariant.name.de}
                       className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-on-surface"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {t('onboarding.launch.title', { name: heroName.trim() || t('topbar.heroFallback'), egg: selectedVariant.name[lang] || selectedVariant.name.de })}
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-xs mx-auto">
              {t('onboarding.adventure')}
            </p>
          </div>

          {/* Quick guide */}
          <div className="flex flex-col gap-4 w-full">
            {[
              { icon: 'task_alt', title: t('onboarding.guide.quests'), body: t('onboarding.guide.questsBody'), color: '#124346' },
              { icon: 'pets', title: t('onboarding.guide.care'), body: t('onboarding.guide.careBody'), color: '#f59e0b' },
              { icon: 'swords', title: t('onboarding.guide.boss'), body: t('onboarding.guide.bossBody'), color: '#ba1a1a' },
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
              const cfg = {
                companionVariant: selectedVariantId,
                heroName: heroName.trim() || undefined,
                heroGender,
              };
              // Drachenmutter meets the child — plays before the app loads
              VoiceAudio.playNarrator('narrator_intro_meet', 400);
              // If already installed as PWA, launch immediately
              if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
                onComplete(cfg);
              } else {
                // Store cfg for after PWA prompt
                setPendingCfg(cfg);
                setShowPWA(true);
              }
            }}
            className="w-full py-5 rounded-full font-headline text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
            {t('onboarding.start')}
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </button>
        </div>
      </nav>

      {showPWA && (
        <PWAInstallSheet
          isIOS={isIOS}
          androidPrompt={androidPrompt}
          onInstall={async () => {
            await promptInstall();
            setShowPWA(false);
            onComplete(pendingCfg);
          }}
          onSkip={() => {
            setShowPWA(false);
            onComplete(pendingCfg);
          }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// HatchStep — wobble → crack → reveal (~3s)
// Uses motion/react for smooth transforms. Auto-advances via onDone.
// Stages:
//   0–1200ms: wobble (rotate ±4°)
//   1200–1700ms: crack (egg splits — two halves pull apart)
//   1700–3000ms: reveal (sprite scales up + fades, egg halves fade out)
//   3000ms: onDone → parent bumps step
// ══════════════════════════════════════════
function HatchStep({ variant, heroName, t, ProgressBar, onDone }) {
  const [phase, setPhase] = useState('wobble'); // 'wobble' | 'crack' | 'reveal'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('crack'), 1200);
    const t2 = setTimeout(() => setPhase('reveal'), 1700);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // onDone is stable per render in parent (passed inline); we intentionally
    // only run the timeline once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 overflow-y-auto font-body">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      <main className="relative z-10 min-h-full flex flex-col items-center justify-center px-8 py-6 text-center">
        <ProgressBar />

        {/* Title — swaps when the reveal hits */}
        <div className="max-w-md space-y-3 mb-8 min-h-[92px]">
          {phase !== 'reveal' ? (
            <>
              <h1 className="font-display text-3xl font-bold text-white tracking-tight leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.hatch.title')}
              </h1>
              <p className="text-white/75 text-lg leading-relaxed">
                {t('onboarding.hatch.subtitle')}
              </p>
            </>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl font-bold text-white tracking-tight leading-tight"
              style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
            >
              {t('onboarding.hatch.revealed', { name: heroName || t('topbar.heroFallback') })}
            </motion.h1>
          )}
        </div>

        {/* Stage */}
        <div className="relative w-56 h-64 flex items-center justify-center">
          {/* Glow behind everything */}
          <div
            className="absolute inset-0 blur-3xl rounded-full scale-125"
            style={{ background: variant.glowColor }}
            aria-hidden="true"
          />

          {/* Sprite reveal — appears as the egg cracks open */}
          <AnimatePresence>
            {phase === 'reveal' && (
              <motion.img
                key="sprite"
                src={base + variant.spritePath}
                alt=""
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-44 h-44 object-contain z-10"
                style={{ filter: `drop-shadow(0 8px 24px ${variant.glowColor})` }}
              />
            )}
          </AnimatePresence>

          {/* Egg — wobbles, then splits into two halves */}
          <div className="relative w-40 h-48 z-0">
            {phase === 'wobble' && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -4, 4, -3, 3, 0] }}
                transition={{ duration: 1.2, ease: 'easeInOut', times: [0, 0.18, 0.4, 0.6, 0.8, 1] }}
                className="w-full h-full"
                style={{
                  background: variant.eggGradient,
                  borderRadius: '50% 50% 48% 48% / 58% 58% 42% 42%',
                  boxShadow: `inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35), 0 12px 32px rgba(0,0,0,0.25)`,
                }}
              />
            )}

            {(phase === 'crack' || phase === 'reveal') && (
              <>
                {/* Top half — drifts up and slightly left */}
                <motion.div
                  initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                  animate={
                    phase === 'reveal'
                      ? { y: -70, x: -20, rotate: -18, opacity: 0 }
                      : { y: -10, x: -6, rotate: -6, opacity: 1 }
                  }
                  transition={{ duration: phase === 'reveal' ? 1.2 : 0.4, ease: 'easeOut' }}
                  className="absolute top-0 left-0 w-full h-1/2 overflow-hidden"
                  style={{ transformOrigin: 'bottom center' }}
                >
                  <div
                    className="w-full h-[200%]"
                    style={{
                      background: variant.eggGradient,
                      borderRadius: '50% 50% 48% 48% / 58% 58% 42% 42%',
                      boxShadow: `inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35)`,
                    }}
                    aria-hidden="true"
                  />
                </motion.div>

                {/* Bottom half — drifts down and slightly right */}
                <motion.div
                  initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                  animate={
                    phase === 'reveal'
                      ? { y: 60, x: 20, rotate: 14, opacity: 0 }
                      : { y: 10, x: 6, rotate: 6, opacity: 1 }
                  }
                  transition={{ duration: phase === 'reveal' ? 1.2 : 0.4, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden"
                  style={{ transformOrigin: 'top center' }}
                >
                  <div
                    className="w-full h-[200%] -translate-y-1/2"
                    style={{
                      background: variant.eggGradient,
                      borderRadius: '50% 50% 48% 48% / 58% 58% 42% 42%',
                      boxShadow: `inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35)`,
                    }}
                    aria-hidden="true"
                  />
                </motion.div>

                {/* Bright split line flash between the halves on crack */}
                {phase === 'crack' && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.3 }}
                    animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: 'white', boxShadow: '0 0 18px rgba(255,255,255,0.9)' }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

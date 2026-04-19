import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import {
  COMPANION_VARIANTS,
  DEFAULT_VARIANT_ID,
  getVariant,
} from '../data/companionVariants';

const base = import.meta.env.BASE_URL;

/**
 * One-shot migration for saves created before the variant system.
 *
 * Trigger condition (in parent): onboardingDone === true AND
 * state.companionVariant === undefined. After the user picks or opts out,
 * companionVariant becomes defined and this component never mounts again.
 *
 * Three internal views:
 *   'prompt'  — friendly modal ("Ronki hat eine neue Form gefunden!")
 *   'pick'    — 2×3 grid of the six variants, mirrors Onboarding step 3
 *   'hatch'   — wobble → crack → reveal, mirrors Onboarding step 4,
 *               auto-commits + unmounts when done
 *
 * The hatch path (~3s total) is the payoff. The "keep it" path just writes
 * DEFAULT_VARIANT_ID and disappears silently.
 */
export default function CompanionVariantMigration() {
  const { t, lang } = useTranslation();
  const { actions } = useTask();
  const [view, setView] = useState('prompt'); // 'prompt' | 'pick' | 'hatch'
  const [selectedVariantId, setSelectedVariantId] = useState(DEFAULT_VARIANT_ID);

  const selectedVariant = getVariant(selectedVariantId);

  // Commit the default and let this component unmount.
  const handleKeep = () => {
    actions.patchState({ companionVariant: DEFAULT_VARIANT_ID });
  };

  const handlePicked = () => {
    setView('hatch');
  };

  const handleHatchDone = () => {
    actions.patchState({ companionVariant: selectedVariantId });
  };

  if (view === 'prompt') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 font-body"
           style={{ background: 'rgba(12,50,54,0.78)', backdropFilter: 'blur(6px)' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-md w-full bg-white rounded-3xl p-6 pb-5"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
        >
          {/* Decorative accent */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center"
               style={{ background: 'linear-gradient(160deg, #fde68a 0%, #f59e0b 100%)',
                        boxShadow: '0 8px 20px rgba(245,158,11,0.35)' }}>
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              egg_alt
            </span>
          </div>

          <div className="pt-10 text-center space-y-3">
            <h2 className="font-headline text-2xl font-bold text-on-surface"
                style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {t('migration.variant.title')}
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed px-2">
              {t('migration.variant.body')}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setView('pick')}
              className="w-full py-4 rounded-full font-headline text-lg font-bold text-white active:scale-[0.97] transition-all"
              style={{
                background: 'linear-gradient(135deg, #124346, #2d5a5e)',
                boxShadow: '0 8px 20px rgba(18,67,70,0.3)',
              }}
            >
              {t('migration.variant.choose')}
            </button>
            <button
              onClick={handleKeep}
              className="w-full py-3 rounded-full font-label text-base font-semibold text-on-surface-variant active:scale-[0.97] transition-all"
              style={{ background: 'rgba(18,67,70,0.06)' }}
            >
              {t('migration.variant.keep')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'pick') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden font-body">
        <div className="absolute inset-0 z-0">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto pb-36 px-6"
             style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', scrollbarWidth: 'none' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-5">
            <div className="text-center space-y-2 px-2">
              <h2 className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('onboarding.egg.title')}
              </h2>
              <p className="text-white/75 text-base leading-relaxed">
                {t('onboarding.egg.hint')}
              </p>
            </div>

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
                    <div
                      className="w-20 h-24"
                      style={{
                        background: v.eggGradient,
                        borderRadius: '50% 50% 48% 48% / 58% 58% 42% 42%',
                        boxShadow: 'inset -6px -10px 18px rgba(0,0,0,0.15), inset 6px 8px 16px rgba(255,255,255,0.35)',
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

        <nav className="fixed bottom-0 left-0 w-full z-[70] pb-8 px-8"
             style={{ background: 'linear-gradient(to top, rgba(12,50,54,0.95) 40%, transparent)' }}>
          <div className="max-w-xs mx-auto">
            <button
              onClick={handlePicked}
              className="w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #124346, #2d5a5e)',
                boxShadow: '0 12px 30px rgba(18,67,70,0.25)',
              }}
            >
              {t('onboarding.egg.confirm')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // view === 'hatch' — mirrors HatchStep timeline, auto-commits on done
  return (
    <HatchView
      variant={selectedVariant}
      lang={lang}
      t={t}
      onDone={handleHatchDone}
    />
  );
}

// Wobble → crack → reveal timeline; identical beats to Onboarding's HatchStep
// so returning users feel the same "your egg hatched" moment as new users.
function HatchView({ variant, lang, t, onDone }) {
  const [phase, setPhase] = useState('wobble');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('crack'), 1200);
    const t2 = setTimeout(() => setPhase('reveal'), 1700);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden font-body">
      <div className="fixed inset-0 z-0">
        <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
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
              {variant.name[lang] || variant.name.de}
            </motion.h1>
          )}
        </div>

        <div className="relative w-56 h-64 flex items-center justify-center">
          <div
            className="absolute inset-0 blur-3xl rounded-full scale-125"
            style={{ background: variant.glowColor }}
            aria-hidden="true"
          />

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
                  boxShadow: 'inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35), 0 12px 32px rgba(0,0,0,0.25)',
                }}
              />
            )}

            {(phase === 'crack' || phase === 'reveal') && (
              <>
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
                      boxShadow: 'inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35)',
                    }}
                    aria-hidden="true"
                  />
                </motion.div>

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
                      boxShadow: 'inset -8px -14px 22px rgba(0,0,0,0.2), inset 8px 10px 18px rgba(255,255,255,0.35)',
                    }}
                    aria-hidden="true"
                  />
                </motion.div>

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

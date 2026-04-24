import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import TeachBreathBeat from './onboarding/TeachBreathBeat';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { getVariant } from '../data/companionVariants';

/**
 * TeachRitualModal — full-screen overlay that hosts a post-onboarding
 * fire-breath unlock ritual.
 *
 * Mounted when a milestone fires. Embeds TeachBreathBeat with the
 * target flavor + ritual-specific copy keys. On completion:
 *   1. Calls `actions.teachBreath(flavor)` to persist the unlock.
 *   2. Calls `onClose()` to let the caller dismiss the modal.
 *
 * Each ritual has its own color palette (Herzfeuer = rose; Funkenstern
 * = amber; Glut = ember; Regenbogenfeuer = spectrum) so the
 * environmental backdrop signals which flavor is being taught without
 * requiring the kid to read the title. Props let callers override:
 *
 *   · flavor        (FireBreathFlavor, required) — target for round 2.
 *   · copyKeys      (object, required) — i18n keys for the beat's copy.
 *   · backgroundGradient (CSS gradient string) — atmospheric backdrop.
 *   · onClose       (fn) — called after completion + teachBreath dispatch.
 *   · previewMode   (bool) — if true, skips the teachBreath dispatch
 *                            (useful for the ?teachRitualPreview=1 route
 *                            so replay works without persisting state).
 *
 * See backlog_fire_breath_progression.md for the full unlock schedule.
 */

// Default flavor-keyed backgrounds. Each is a radial gradient tuned to
// feel environmental, not decorative — the modal is the whole view
// during the ritual, so the bg does heavy lifting.
const FLAVOR_BACKGROUNDS = {
  heart:
    'radial-gradient(ellipse at 50% 30%, #7f1d3a 0%, #4a0f27 55%, #1a0610 100%)',
  sparkle:
    'radial-gradient(ellipse at 50% 30%, #b45309 0%, #5c2a08 55%, #1a0f06 100%)',
  ember:
    'radial-gradient(ellipse at 50% 30%, #9a3412 0%, #571c0b 55%, #150604 100%)',
  rainbow:
    'radial-gradient(ellipse at 50% 30%, #5b21b6 0%, #3b0764 55%, #0f0420 100%)',
  // flame fallback (rarely used — onboarding owns the base flame) in
  // case future flows want to re-teach the base flame post-onboarding.
  flame:
    'radial-gradient(ellipse at 50% 30%, #124346 0%, #0a2426 55%, #04100f 100%)',
};

export default function TeachRitualModal({
  flavor,
  copyKeys,
  backgroundGradient,
  onClose,
  previewMode = false,
}) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const variantId = state?.companionVariant || 'amber';
  const variant = getVariant(variantId);

  // Body scroll lock while the modal is mounted. Mirrors the pattern
  // used by other Ronki modals (PlantSeedSheet etc.).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleComplete = () => {
    if (!previewMode) {
      actions.teachBreath?.(flavor);
    }
    onClose?.();
  };

  const bg = backgroundGradient || FLAVOR_BACKGROUNDS[flavor] || FLAVOR_BACKGROUNDS.heart;

  return (
    <motion.div
      className="fixed inset-0 overflow-y-auto font-body"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      {/* Atmospheric backdrop — flavor-keyed radial gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: bg }}
      />

      {/* Subtle particle wash — tiny sparkles drifting up. Adds warmth
          without needing a raster asset. Respects reduced-motion via
          the keyframes below. */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.45 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${8 + i * 9}%`,
              bottom: -10,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(254,243,199,0.9)',
              filter: 'blur(1px)',
              animation: `trmSparkleRise ${8 + (i % 4)}s linear ${i * 0.6}s infinite`,
            }}
          />
        ))}
      </div>

      <main
        className="relative z-10 min-h-full flex flex-col px-8 text-center"
        style={{
          paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Small kicker pill — tells the kid this is a special ritual
            moment, distinct from normal onboarding steps. */}
        <div className="flex justify-center pt-2 pb-4">
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(254,243,199,0.14)',
              color: '#fef3c7',
              font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              border: '1px solid rgba(254,243,199,0.22)',
            }}
          >
            {t('ritual.kicker', 'Neues Ritual')}
          </div>
        </div>

        <div className="my-auto flex flex-col items-center gap-5">
          <TeachBreathBeat
            variant={variant}
            t={t}
            targetFlavor={flavor}
            copyKeys={copyKeys}
            onComplete={handleComplete}
          />
        </div>
      </main>

      <style>{`
        @keyframes trmSparkleRise {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes trmSparkleRise {
            0%,100% { transform: translateY(-50vh); opacity: 0.6; }
          }
        }
      `}</style>
    </motion.div>
  );
}

/**
 * Copy-key sets per ritual. Exported so preview harnesses + milestone
 * triggers share one source of truth. Each set lines up 1:1 with the
 * TeachBreathBeat.copyKeys interface.
 */
export const RITUAL_COPY = {
  heart: {
    title: 'ritual.herzfeuer.title',
    intro: 'ritual.herzfeuer.intro',
    tryFail: 'ritual.herzfeuer.tryFail',
    tryAgain: 'ritual.herzfeuer.tryAgain',
    holdHint: 'ritual.herzfeuer.holdHint',
    smokeFail: 'ritual.herzfeuer.smokeFail',
    celebrate: 'ritual.herzfeuer.celebrate',
    soloLine: 'ritual.herzfeuer.soloLine',
    holdLabel: 'ritual.herzfeuer.holdLabel',
    next: 'ritual.herzfeuer.next',
  },
  sparkle: {
    title: 'ritual.funkenstern.title',
    intro: 'ritual.funkenstern.intro',
    tryFail: 'ritual.funkenstern.tryFail',
    tryAgain: 'ritual.funkenstern.tryAgain',
    holdHint: 'ritual.funkenstern.holdHint',
    smokeFail: 'ritual.funkenstern.smokeFail',
    celebrate: 'ritual.funkenstern.celebrate',
    soloLine: 'ritual.funkenstern.soloLine',
    holdLabel: 'ritual.funkenstern.holdLabel',
    next: 'ritual.funkenstern.next',
  },
  ember: {
    title: 'ritual.glut.title',
    intro: 'ritual.glut.intro',
    tryFail: 'ritual.glut.tryFail',
    tryAgain: 'ritual.glut.tryAgain',
    holdHint: 'ritual.glut.holdHint',
    smokeFail: 'ritual.glut.smokeFail',
    celebrate: 'ritual.glut.celebrate',
    soloLine: 'ritual.glut.soloLine',
    holdLabel: 'ritual.glut.holdLabel',
    next: 'ritual.glut.next',
  },
  rainbow: {
    title: 'ritual.regenbogen.title',
    intro: 'ritual.regenbogen.intro',
    tryFail: 'ritual.regenbogen.tryFail',
    tryAgain: 'ritual.regenbogen.tryAgain',
    holdHint: 'ritual.regenbogen.holdHint',
    smokeFail: 'ritual.regenbogen.smokeFail',
    celebrate: 'ritual.regenbogen.celebrate',
    soloLine: 'ritual.regenbogen.soloLine',
    holdLabel: 'ritual.regenbogen.holdLabel',
    next: 'ritual.regenbogen.next',
  },
};

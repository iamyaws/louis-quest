import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import MiniRonki from './MiniRonki';

const base = import.meta.env.BASE_URL;

/**
 * KidIntro — Phase 1 + Phase 2 of the parent-first onboarding.
 *
 * Phase 1 (sub = 'greeting'): Full-bleed dawn-forest scene, egg in shaft of
 * light, Ronki peeks from behind the egg, speech bubble with the greeting,
 * single CTA. Kid taps through → Phase 2.
 *
 * Phase 2 (sub = 'handoff'): Same forest background (continuity), simplified
 * card with "Mama oder Papa?" + subline + CTA. Kid taps → onComplete()
 * which flips state.kidIntroSeen=true and unlocks ParentOnboarding.
 *
 * Brand anchors carried through:
 *   · Ronki greets first — the relationship begins before any config screen
 *   · Parent stays blind to Ronki (this screen only shows to kid, never parent)
 *   · No friction theater — single-tap handoff, not held-button ceremony
 *
 * See docs/discovery/2026-04-23-onboarding-parent-first/transcript.md
 * (Q1 pick = B "Ronki greets, then hands off", Q4 pick = A "Trust").
 */
export default function KidIntro({ onComplete }) {
  const { t } = useTranslation();
  const [sub, setSub] = useState('greeting'); // 'greeting' | 'handoff'

  return (
    <div className="fixed inset-0 overflow-hidden font-body">
      {/* Background: dawn forest (shared across Phase 1 + 2 for continuity) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={base + 'art/bioms/Morgenwald_dawn-forest.webp'}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Soft vignette to lift the egg + speech bubble off the scene */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>

      {/* Sub-views rendered via plain conditional — previously wrapped in
          AnimatePresence mode="wait" but it could get stuck with the
          nested staggered child animations. Each sub now just fades in
          on mount via its own motion.main initial/animate. */}
      {sub === 'greeting' && (
          <motion.main
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 min-h-full flex flex-col items-center justify-between px-8 py-12"
            style={{
              paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Top: egg in shaft of light with Ronki peek */}
            <div className="flex-1 flex items-center justify-center relative w-full">
              {/* Shaft-of-light glow */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 280,
                    height: 280,
                    background:
                      'radial-gradient(circle, rgba(252,211,77,0.35) 0%, rgba(252,211,77,0) 70%)',
                    filter: 'blur(8px)',
                  }}
                />
              </div>

              {/* Egg + Ronki peek group */}
              <div className="relative" style={{ width: 200, height: 240 }}>
                {/* Egg */}
                <motion.img
                  src={base + 'art/ronki-egg-logo.png'}
                  alt=""
                  className="absolute left-1/2 bottom-0"
                  style={{
                    width: 180,
                    transform: 'translateX(-50%)',
                    filter:
                      'drop-shadow(0 16px 40px rgba(252,211,77,0.45)) drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
                  }}
                  initial={{ scale: 0.9, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                {/* Ronki peek — emerges from behind the top of the egg */}
                <motion.div
                  className="absolute left-1/2"
                  style={{
                    top: 12,
                    transform: 'translateX(-20px)',
                    zIndex: 2,
                  }}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
                >
                  <MiniRonki size={70} mood="happy" breathing />
                </motion.div>
              </div>
            </div>

            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="relative w-full max-w-md mx-auto mb-6"
            >
              <div
                className="rounded-3xl px-6 py-5 text-center"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  border: '2px solid rgba(252,211,77,0.6)',
                }}
              >
                <p
                  className="font-headline text-lg leading-snug"
                  style={{ color: '#124346' }}
                >
                  {t('kidIntro.greeting')}
                </p>
              </div>
              {/* Bubble tail pointing up to Ronki */}
              <div
                className="absolute left-1/2 -top-2"
                style={{
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 16,
                  height: 16,
                  background: 'rgba(255,255,255,0.95)',
                  borderTop: '2px solid rgba(252,211,77,0.6)',
                  borderLeft: '2px solid rgba(252,211,77,0.6)',
                }}
              />
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.0 }}
              onClick={() => setSub('handoff')}
              className="w-full max-w-md py-5 px-8 rounded-full font-headline text-xl font-bold text-white active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #124346, #2d5a5e)',
                boxShadow: '0 12px 30px rgba(18,67,70,0.35)',
              }}
            >
              {t('kidIntro.cta')}
            </motion.button>
          </motion.main>
        )}

      {sub === 'handoff' && (
          <motion.main
            key="handoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 min-h-full flex flex-col"
            style={{
              paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
              paddingLeft: 28,
              paddingRight: 28,
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Cream paper overlay — replaces the dark cinematic look
                with the editorial-flyer aesthetic Marc uses on the A6
                Eltern-Flyer prints (PrintSheetA4ElternFlyer.tsx, 24 Apr
                2026). Background palette + typography pulled from the
                Experiment-front variant: cream #FDF8F0 with a soft sage
                radial in the top-right corner. Plus Jakarta Sans for
                headlines, Be Vietnam Pro for body. The dawn forest is
                masked entirely so the screen reads as a printed letter
                from the parents-of-Ronki to the parent holding the
                phone — same register as the flyer they'd pick up at
                the Elternabend. */}
            <div
              aria-hidden="true"
              className="fixed inset-0 pointer-events-none"
              style={{
                zIndex: -1,
                background: '#FDF8F0',
                backgroundImage:
                  'radial-gradient(ellipse 100% 60% at 100% 0%, rgba(80,160,130,0.14) 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 0% 100%, rgba(252,211,77,0.10) 0%, transparent 55%)',
              }}
            />

            {/* Hairline rule above eyebrow — direct lift from the
                Experiment-front pattern. Sage stroke, narrow width,
                acts as a visual signature of "this is editorial, not
                an app modal." */}
            <hr
              className="m-0 mb-3"
              style={{
                border: 0,
                borderTop: '1px solid #50A082',
                width: 36,
              }}
            />

            <p
              className="m-0 mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#50A082',
              }}
            >
              {t('handoff.kidToParent.eyebrow')}
            </p>

            {/* Headline — dark teal Plus Jakarta with italic sage accent
                on the emphasis word. Mirrors `.ef-essay-headline` from
                the Experiment flyer. The italic word is split out via
                an <em> wrapping the kid-pivot phrase. */}
            <h1
              className="m-0 mb-3"
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                // 28 → 26 to avoid orphan words on 375px iPhones (UI/UX
                // audit 24 Apr 2026). textWrap balance already set.
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
                color: '#1A3C3F',
                textWrap: 'balance',
              }}
            >
              {t('handoff.kidToParent.titleLead')}
              <br />
              <em
                style={{
                  fontStyle: 'italic',
                  color: '#50A082',
                  fontWeight: 700,
                }}
              >
                {t('handoff.kidToParent.titleAccent')}
              </em>
            </h1>

            <p
              className="m-0 mb-7"
              style={{
                fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
                fontSize: 14.5,
                lineHeight: 1.55,
                color: 'rgba(26,60,63,0.82)',
                textWrap: 'balance',
                maxWidth: 320,
              }}
            >
              {t('handoff.kidToParent.body')}
            </p>

            {/* Egg — small, sits in the breathing space between body
                and CTA. Tiny Ronki peek is dropped here (the editorial
                register doesn't want a mascot in frame); the egg alone
                signals continuity with the greeting screen and the
                printed flyer's wordmark. */}
            <div className="flex-1 flex items-center justify-center my-2">
              <motion.img
                src={base + 'art/ronki-egg-logo.png'}
                alt=""
                style={{
                  width: 130,
                  filter:
                    'drop-shadow(0 14px 28px rgba(252,180,90,0.45)) drop-shadow(0 6px 12px rgba(26,60,63,0.18))',
                }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              />
            </div>

            {/* CTA + shortcut — dark teal pill matches the
                FrontExperiment signature zone. Shortcut is a lighter
                text link below, no border. */}
            <button
              onClick={onComplete}
              className="w-full active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{
                background: '#1A3C3F',
                color: '#FDF8F0',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                padding: '16px 28px',
                borderRadius: 999,
                border: 0,
                boxShadow: '0 10px 24px rgba(26,60,63,0.22)',
              }}
            >
              {t('handoff.kidToParent.cta')}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>

            <button
              onClick={onComplete}
              className="w-full mt-2 active:opacity-60 transition-opacity"
              style={{
                background: 'transparent',
                color: 'rgba(26,60,63,0.6)',
                fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
                fontSize: 13,
                padding: '10px 0',
                border: 0,
              }}
            >
              {t('handoff.kidToParent.parentShortcut')}
            </button>
          </motion.main>
        )}
    </div>
  );
}

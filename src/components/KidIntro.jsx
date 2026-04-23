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
                  <MiniRonki size={58} mood="happy" breathing />
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
            className="relative z-10 min-h-full flex flex-col items-center justify-center px-8 py-12"
            style={{
              paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Soft frosted-glass card so the forest stays visible behind */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full max-w-md rounded-3xl px-8 py-10 text-center"
              style={{
                background: 'rgba(255,255,255,0.94)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: '2px solid rgba(252,211,77,0.5)',
              }}
            >
              {/* Small Ronki on top of the card — keeps the relationship alive */}
              <div className="flex justify-center mb-5">
                <MiniRonki size={64} mood="happy" breathing />
              </div>

              <h1
                className="font-headline text-3xl font-bold mb-3"
                style={{ color: '#124346' }}
              >
                {t('handoff.kidToParent.title')}
              </h1>
              <p
                className="font-body text-base mb-8 leading-relaxed"
                style={{ color: '#124346', opacity: 0.85 }}
              >
                {t('handoff.kidToParent.body')}
              </p>

              <button
                onClick={onComplete}
                className="w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #124346, #2d5a5e)',
                  boxShadow: '0 12px 30px rgba(18,67,70,0.35)',
                }}
              >
                {t('handoff.kidToParent.cta')}
              </button>
            </motion.div>
          </motion.main>
        )}
    </div>
  );
}

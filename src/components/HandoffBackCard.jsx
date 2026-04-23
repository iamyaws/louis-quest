import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';

const base = import.meta.env.BASE_URL;

/**
 * HandoffBackCard — Phase 4 of parent-first onboarding.
 *
 * Displayed once, after the parent finishes ParentOnboarding (Lean 5 steps)
 * and before the kid enters Onboarding.jsx (egg hatch + name).
 *
 * Design notes (from Q2 + Q4 picks):
 *   · Parent stays blind to Ronki — no chibi, no egg, no forest.
 *     First Ronki reveal belongs to the kid in Phase 5.
 *   · Trust handoff, not held-button ceremony (Q4=A) — single tap-anywhere
 *     dismisses and opens the kid flow. The humans moderate the handoff,
 *     not the app.
 *   · Neutral warm-cream background matches ParentOnboarding chrome so the
 *     transition feels continuous to the parent, not cinematic.
 *
 * See docs/discovery/2026-04-23-onboarding-parent-first/transcript.md
 */
export default function HandoffBackCard({ onContinue }) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 overflow-hidden font-body"
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onContinue();
      }}
      aria-label={t('handoff.parentToKid.title')}
    >
      {/* Neutral parent-chrome background — matches ParentOnboarding */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={base + 'art/bg-warm-cream.webp'}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 min-h-full flex flex-col items-center justify-center px-8 py-12 text-center"
        style={{
          paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Big warm checkmark / sunburst — simple, not a character */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'backOut' }}
          className="mb-8 relative"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 blur-3xl rounded-full scale-150"
            style={{ background: 'rgba(252,211,77,0.28)' }}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #fde68a, #fcd34d)',
              boxShadow:
                '0 12px 32px rgba(252,211,77,0.35), inset 0 -4px 8px rgba(180,120,30,0.15)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 56, color: '#124346' }}
            >
              check
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="font-headline text-4xl font-bold mb-3"
          style={{ color: '#124346' }}
        >
          {t('handoff.parentToKid.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="font-body text-lg mb-12 max-w-md leading-relaxed"
          style={{ color: '#124346', opacity: 0.85 }}
        >
          {t('handoff.parentToKid.body')}
        </motion.p>

        {/* Subtle "tap anywhere" hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="font-body text-sm uppercase tracking-wider"
          style={{ color: '#124346', letterSpacing: '0.12em' }}
        >
          {t('handoff.parentToKid.hint')}
        </motion.p>
      </motion.main>
    </div>
  );
}

import { motion, useReducedMotion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant F — Dark hero with character art + story-driven B+E copy. */
export function HeroVariantF() {
  const reduced = useReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[92vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-teal-dark"
      aria-label="Hero"
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.07 } : { opacity: [0.05, 0.10, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.06 } : { opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, #50a082 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(62,116,120,0.18) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Main content: two-column on md+ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 lg:gap-16 items-center">

        {/* Left column: copy */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          {/* Eyebrow */}
          <motion.p
            {...fade(0.1)}
            className="text-sm uppercase tracking-[0.18em] text-cream/60 mb-8 font-medium"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
            Bald verfügbar · 2026
          </motion.p>

          {/* Headline — B copy */}
          <motion.h1
            {...fade(0.2)}
            className="font-display font-extrabold leading-[0.95] tracking-tight text-[2.5rem] sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.5rem] text-cream"
          >
            Stell dir vor, du sagst es{' '}
            <span className="relative inline-block">
              <span className="relative z-10">nur einmal.</span>
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-3 rounded-sm bg-mustard/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          {/* Subtitle — B copy */}
          <motion.p
            {...fade(0.4)}
            className="mt-8 text-lg sm:text-xl text-cream/80 leading-relaxed max-w-lg"
          >
            Zähne putzen, Tasche packen, Schuhe an. Ronki ist der Drachen-Gefährte, der dein Kind daran erinnert. Nicht du. Nicht zum zehnten Mal.
          </motion.p>

          {/* CTA form */}
          <motion.div {...fade(0.55)} className="mt-10 w-full max-w-md text-cream">
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>

          {/* Secondary hook — E copy */}
          <motion.p
            {...fade(0.7)}
            className="mt-6 text-base sm:text-lg font-display font-semibold text-mustard/80 italic"
          >
            Was, wenn dein Kind die Routine selbst will?
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            {...fade(0.8)}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center md:justify-start"
          >
            <TrustBadge label="Keine Werbung" />
            <TrustBadge label="Keine Streaks" />
            <TrustBadge label="Keine In-App-Käufe" />
          </motion.div>
        </div>

        {/* Right column: illustration + app preview stacked (md+) */}
        <div className="hidden md:flex items-center justify-center">
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative"
          >
            <motion.div
              animate={reduced ? {} : { y: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Warm glow */}
              <div
                aria-hidden
                className="absolute -inset-8 rounded-full blur-3xl opacity-25"
                style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }}
              />

              {/* Illustration card — back */}
              <img
                src="/art/routines/brushing-teeth.webp"
                alt="Ein Junge und sein Drache Ronki beim Zähneputzen."
                width={380}
                height={380}
                className="relative w-[280px] lg:w-[320px] xl:w-[360px] rounded-[1.5rem] shadow-2xl"
                style={{ boxShadow: '0 24px 56px rgba(0,0,0,0.35)' }}
              />

              {/* App routine card — overlapping bottom-right */}
              <motion.div
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                className="absolute -bottom-6 -right-8 lg:-right-12 w-[220px] lg:w-[240px]"
              >
                <RoutinePreviewCard />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile: both cards stacked */}
      <motion.div
        {...fade(0.5)}
        className="relative z-10 mt-8 flex md:hidden justify-center w-full"
      >
        <div className="relative">
          <img
            src="/art/routines/brushing-teeth.webp"
            alt="Ein Junge und sein Drache Ronki beim Zähneputzen."
            width={280}
            height={280}
            className="w-56 sm:w-64 rounded-[1.5rem] shadow-2xl"
            style={{ boxShadow: '0 20px 48px rgba(0,0,0,0.3)' }}
          />
          <div className="absolute -bottom-4 -right-4 w-[180px] sm:w-[200px]">
            <RoutinePreviewCard compact />
          </div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-cream/35"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll ↓
        </motion.span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TrustBadge                                                          */
/* ------------------------------------------------------------------ */

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-cream/50 font-medium">
      <span aria-hidden className="h-1 w-1 rounded-full bg-cream/30" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* RoutinePreviewCard — mock of the real app task list                  */
/* ------------------------------------------------------------------ */

function RoutinePreviewCard({ compact = false }: { compact?: boolean }) {
  const items = [
    { label: 'Zähne putzen', done: true, icon: '🪥' },
    { label: 'Anziehen', done: true, icon: '👕' },
    { label: 'Tasche packen', done: false, icon: '🎒' },
  ];
  const doneCount = items.filter(i => i.done).length;

  return (
    <div
      className={`rounded-2xl bg-cream shadow-2xl overflow-hidden select-none ${
        compact ? 'p-3.5' : 'p-4'
      }`}
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)' }}
      role="img"
      aria-label="Vorschau der Ronki-App: Morgenroutine"
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #d97706 0%, #FCD34D 100%)' }}
      />

      {/* Header */}
      <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-3.5'}`}>
        <span className="text-sm" aria-hidden>☀️</span>
        <div className="flex-1 min-w-0">
          <p className={`font-display font-bold text-teal-dark leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
            Morgenroutine
          </p>
          <p className={`text-teal/50 ${compact ? 'text-[10px]' : 'text-xs'}`}>Heute, 7:15</p>
        </div>
        <span className={`flex items-center gap-1 font-display font-bold text-sage ${compact ? 'text-[10px]' : 'text-xs'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
          Aktiv
        </span>
      </div>

      {/* Task items */}
      <ul className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 rounded-xl ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} ${
              item.done
                ? 'bg-teal-dark/[0.06]'
                : 'bg-mustard/10 ring-1 ring-mustard/20'
            }`}
          >
            <span
              className={`flex-none flex items-center justify-center rounded-full text-[8px] font-bold ${
                compact ? 'w-4 h-4' : 'w-5 h-5'
              } ${
                item.done ? 'bg-teal text-cream' : 'ring-2 ring-mustard bg-transparent'
              }`}
            >
              {item.done ? '✓' : null}
            </span>
            <span className={`flex-1 font-medium leading-none ${
              compact ? 'text-[11px]' : 'text-xs'
            } ${
              item.done ? 'text-teal-dark/60 line-through decoration-teal/30' : 'text-teal-dark'
            }`}>
              {item.label}
            </span>
            <span className={compact ? 'text-[10px]' : 'text-xs'} aria-hidden>{item.icon}</span>
          </li>
        ))}
      </ul>

      {/* Progress */}
      <div className={`${compact ? 'mt-2.5' : 'mt-3'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-teal/50 font-medium ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Fortschritt</span>
          <span className={`font-display font-bold text-teal-dark ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {doneCount}/{items.length}
          </span>
        </div>
        <div className={`w-full rounded-full bg-teal/10 overflow-hidden ${compact ? 'h-1' : 'h-1.5'}`}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(doneCount / items.length) * 100}%`,
              background: 'linear-gradient(90deg, #d97706 0%, #FCD34D 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

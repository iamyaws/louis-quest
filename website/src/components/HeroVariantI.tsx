import { motion, useReducedMotion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant I — Stacked Editorial. Bold typographic sculpture with cascading headline lines,
 *  dragon accent, two-column layout on desktop, and editorial trust pills. */
export function HeroVariantI() {
  const reduced = useReducedMotion();

  const slide = (delay: number, xOffset = 0) =>
    reduced
      ? { initial: { opacity: 1, y: 0, x: 0 }, animate: { opacity: 1, y: 0, x: 0 } }
      : {
          initial: { opacity: 0, y: 28, x: xOffset },
          animate: { opacity: 1, y: 0, x: 0 },
          transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
        };

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay, ease: 'easeOut' },
        };

  const TRUST_PILLS = ['Keine Werbung', 'Keine Streaks', 'DSGVO-konform'] as const;

  return (
    <section
      className="relative bg-cream min-h-[92vh] flex flex-col justify-between overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Top eyebrow bar ── */}
      <motion.div
        {...fade(0.05)}
        className="relative z-10 flex items-center gap-3 px-6 sm:px-10 lg:px-16 pt-8 sm:pt-10"
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-mustard animate-pulse"
          aria-hidden
        />
        <p className="text-xs uppercase tracking-[0.22em] text-teal font-medium">
          Bald verf&uuml;gbar &middot; 2026
        </p>
      </motion.div>

      {/* ── Main content area ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-0 px-6 sm:px-10 lg:px-16 pt-10 pb-12 sm:pt-14 sm:pb-16">

        {/* ── Left column: stacked editorial headline (60%) ── */}
        <div className="relative w-full lg:w-[60%] flex-shrink-0">

          {/* Dragon tucked into the headline area — absolute, behind text on mobile */}
          <motion.img
            src="/art/companion/dragon-baby.webp"
            alt=""
            aria-hidden
            initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, rotate: -10 }}
            animate={
              reduced
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, rotate: -10, y: [0, -8, 0] }
            }
            transition={
              reduced
                ? { duration: 0.7, delay: 0.9 }
                : {
                    opacity: { duration: 0.7, delay: 0.9 },
                    scale: { duration: 0.7, delay: 0.9 },
                    y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 },
                  }
            }
            className="absolute -bottom-4 right-0 lg:-right-10 w-28 sm:w-36 lg:w-44 drop-shadow-[0_20px_32px_rgba(45,90,94,0.22)] pointer-events-none z-0 opacity-90"
          />

          {/* Line 1: "Ronki" — huge, featherweight, very faint teal watermark */}
          <motion.span
            {...slide(0.15, -16)}
            aria-hidden
            className="block font-display font-light leading-none tracking-tight select-none
              text-[22vw] sm:text-[16vw] lg:text-[13rem]
              text-teal/[0.12]"
          >
            Ronki
          </motion.span>

          {/* Line 2: "tr&auml;gt die" — medium size, medium weight, anchored teal-dark */}
          <motion.span
            {...slide(0.28)}
            className="block font-display font-medium leading-[1.05] tracking-tight
              text-[7.5vw] sm:text-[5vw] lg:text-[4rem]
              text-teal-dark
              -mt-[0.5em] sm:-mt-[0.45em] lg:-mt-[0.4em]"
          >
            tr&auml;gt die
          </motion.span>

          {/* Line 3: "Routine mit." — bold, commanding, mustard accent on "mit." */}
          <motion.span
            {...slide(0.42)}
            className="block font-display font-extrabold leading-[0.95] tracking-tight
              text-[12vw] sm:text-[8.5vw] lg:text-[7.25rem]
              text-teal-dark
              mt-1 lg:mt-2"
          >
            Routine{' '}
            <span className="text-mustard drop-shadow-[0_2px_0_rgba(45,90,94,0.15)]">
              mit.
            </span>
          </motion.span>

          {/* Invisible full headline for screen readers */}
          <h1 className="sr-only">Ronki tr&auml;gt die Routine mit.</h1>
        </div>

        {/* ── Right column: subtitle + CTA (40%) ── */}
        <div className="w-full lg:w-[40%] lg:pl-10 xl:pl-16 flex flex-col gap-7 lg:pt-4">

          <motion.p
            {...slide(0.52)}
            className="text-base sm:text-lg lg:text-xl text-teal-dark/75 leading-relaxed max-w-md"
          >
            Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet.
            Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal
            durchs Haus rufen musst.
          </motion.p>

          {/* WaitlistCTA */}
          <motion.div {...slide(0.62)} className="max-w-md">
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>

          {/* Trust pills */}
          <motion.div {...fade(0.78)} className="flex flex-wrap gap-2">
            {TRUST_PILLS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal/20 bg-teal/[0.05] px-3.5 py-1 text-xs font-medium tracking-wide text-teal-dark/70"
              >
                <span
                  className="inline-block h-1 w-1 rounded-full bg-sage"
                  aria-hidden
                />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Secondary link */}
          <motion.a
            href="#wie-ronki-arbeitet"
            {...fade(0.88)}
            className="group inline-flex items-center gap-2 text-sm text-teal/70 hover:text-teal transition-colors w-fit py-1"
          >
            So funktioniert Ronki
            <span className="inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.a>
        </div>
      </div>

      {/* ── Thin horizontal rule separating hero from page below ── */}
      <motion.div
        {...fade(1.0)}
        aria-hidden
        className="relative z-10 mx-6 sm:mx-10 lg:mx-16 border-t border-teal/10"
      />

      {/* ── Scroll hint ── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="relative z-10 flex justify-center py-5"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block text-xs tracking-[0.18em] uppercase text-teal/50"
        >
          scroll &darr;
        </motion.span>
      </motion.div>

      {/* ── Subtle background texture: large faint teal circle, editorial counterweight ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 -right-1/4 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(45,90,94,0.055) 0%, rgba(45,90,94,0) 70%)',
        }}
      />
    </section>
  );
}

import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { LAUNCH_STATE } from '../config/launch-state';
import { WaitlistCTA as _WaitlistCTA } from './WaitlistCTA';
import { EASE_OUT } from '../lib/motion';

/** Trust pillars shown beneath the CTA buttons */
const TRUST_PILLARS = ['Keine Werbung', 'Keine Streaks', 'Keine In-App-K\u00e4ufe'] as const;

/**
 * Variant G - Dual Path
 *
 * Clean centered editorial layout inspired by the "Enterprise Dual CTA" pattern
 * (21st.dev / uniquesonu). Two explicit choices for parents: join the waitlist
 * or learn how Ronki works. Warm cream background, massive display headline,
 * pill badge, and a subtle trust row beneath the buttons.
 */
export function HeroVariantG() {
  const reduced = useReducedMotion();

  /** Staggered fade-up factory */
  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.72, delay, ease: EASE_OUT },
        };

  function scrollToWaitlist(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const target = document.getElementById('countdown');
    if (target) {
      target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-24 pb-24 sm:pt-32 sm:pb-28 overflow-hidden bg-cream"
      aria-label="Ronki Hero"
    >
      {/* Radial gradient wash behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(45,90,94,0.07) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 42% at 52% 44%, rgba(252,211,77,0.11) 0%, transparent 58%)',
          ].join(', '),
        }}
      />

      {/* Faint teal arc at the very top for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[140%] h-80 rounded-[50%] opacity-[0.035]"
        style={{ background: '#2D5A5E' }}
      />

      {/* ---- Content column ---- */}
      <div className="relative flex flex-col items-center text-center max-w-5xl mx-auto w-full">

        {/* Badge pill */}
        <motion.div {...fade(0.08)}>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-teal/25 bg-cream px-4 py-1.5 text-xs font-medium tracking-[0.14em] uppercase text-teal shadow-sm mb-10"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-mustard animate-pulse shrink-0"
            />
            Bald verf&uuml;gbar &middot; 2026
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          {...fade(0.2)}
          className="font-display font-extrabold leading-[0.93] tracking-tight text-[11vw] sm:text-[8vw] lg:text-[6.5rem] text-teal-dark"
        >
          Ronki tr&auml;gt die{' '}
          <br className="hidden sm:block" />
          Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 1.0}>
            mit
          </HeroHighlight>
          .
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fade(0.38)}
          className="mt-8 text-lg sm:text-xl leading-relaxed max-w-2xl text-teal-dark/75"
        >
          Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet.
          Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal
          durchs Haus rufen musst.
        </motion.p>

        {/* Dual CTA buttons */}
        <motion.div
          {...fade(0.52)}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
        >
          {/* Primary: scroll to waitlist / countdown */}
          <motion.a
            href="#countdown"
            onClick={scrollToWaitlist}
            whileHover={reduced ? undefined : { scale: 1.03, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full bg-teal-dark px-8 py-4 font-display font-semibold text-base text-cream shadow-md hover:shadow-lg transition-shadow focus-visible:outline-mustard"
          >
            Bin dabei
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </motion.a>

          {/* Secondary: learn-more page */}
          <motion.a
            href="/wie-es-funktioniert"
            whileHover={reduced ? undefined : { scale: 1.03, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full border-2 border-teal/40 bg-transparent px-8 py-[0.9375rem] font-display font-semibold text-base text-teal-dark hover:border-teal hover:bg-teal/5 transition-colors focus-visible:outline-mustard"
          >
            So funktioniert&apos;s
          </motion.a>
        </motion.div>

        {/* Trust row */}
        <motion.div
          {...fade(0.66)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          aria-label="Unsere Versprechen"
        >
          {TRUST_PILLARS.map((pillar, i) => (
            <span
              key={pillar}
              className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-teal-dark/55"
            >
              {i > 0 && (
                <span aria-hidden className="hidden sm:inline text-teal/20 select-none">
                  &middot;
                </span>
              )}
              {pillar}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: reduced ? 0 : 1.6 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-teal/50"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 7, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block text-[10px] tracking-[0.18em] uppercase"
        >
          scroll
        </motion.span>
        {/* Animated chevron line */}
        <motion.svg
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          aria-hidden
          animate={reduced ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        >
          <path
            d="M1 1l7 7 7-7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </section>
  );
}

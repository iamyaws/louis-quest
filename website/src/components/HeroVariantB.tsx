import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';
import { fadeUp } from '../lib/motion';

/** Variant B — Centered & Clean. No image, editorial typography, maximum whitespace. */
export function HeroVariantB() {
  const reduced = useReducedMotion();

  const fade = (delay: number) => fadeUp(delay, reduced);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Subtle radial gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(163,190,140,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 60% 55%, rgba(252,211,77,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Badge */}
        <motion.p
          {...fade(0.1)}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-10 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Public Alpha &middot; jetzt spielbar
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...fade(0.2)}
          className="font-display font-extrabold leading-[0.95] tracking-tight text-[10vw] sm:text-[7vw] lg:text-[6rem] text-teal-dark"
        >
          Ronki trägt die Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 0.9}>mit</HeroHighlight>.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fade(0.4)}
          className="mt-8 text-lg sm:text-xl opacity-80 leading-relaxed max-w-2xl"
        >
          Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet. Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal durchs Haus rufen musst.
        </motion.p>

        {/* CTA */}
        <motion.div {...fade(0.55)} className="mt-10 w-full max-w-md">
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </motion.div>

        {/* Link */}
        <motion.a
          href="#wie-ronki-arbeitet"
          {...fade(0.65)}
          className="group mt-5 inline-flex items-center gap-2 text-sm text-teal/80 hover:text-teal transition-colors py-2"
        >
          So funktioniert Ronki
          <span className="inline-block transition-transform group-hover:translate-x-1">
            &rarr;
          </span>
        </motion.a>
      </div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-teal/70"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll &darr;
        </motion.span>
      </motion.div>
    </section>
  );
}

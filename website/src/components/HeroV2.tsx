import { motion, useReducedMotion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';
import { EASE_OUT } from '../lib/motion';

export function HeroV2() {
  const reduced = useReducedMotion();

  return (
    <section className="relative px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 min-h-[90vh] flex items-center overflow-hidden">
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 30 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: EASE_OUT }}
        className="pointer-events-none absolute right-[-4%] bottom-0 w-[42vw] max-w-[480px] hidden lg:block"
      >
        <div
          className="absolute inset-0 -m-16 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(45,90,94,0.18) 0%, transparent 55%)' }}
        />
        <img
          src="/art/hero-default.webp"
          alt=""
          className="relative w-full h-auto drop-shadow-[0_40px_60px_rgba(45,90,94,0.3)]"
        />
      </motion.div>

      <div className="relative max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] text-teal mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Public Alpha · jetzt spielbar
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
          className="font-display font-extrabold text-[12vw] sm:text-[9vw] lg:text-[7.5rem] xl:text-[8.5rem] leading-[0.95] tracking-tight text-teal-dark max-w-[14ch]"
        >
          Morgens ohne Kampf.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 text-lg sm:text-xl max-w-xl opacity-80 leading-relaxed"
        >
          Ronki ist der Drachen-Gefährte, der deinem Kind hilft, seine Routinen zu entdecken. Und eines Tages nicht mehr gebraucht wird.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 max-w-md"
        >
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </motion.div>
      </div>
    </section>
  );
}

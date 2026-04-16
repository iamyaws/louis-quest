import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section
      ref={ref}
      className="relative px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 flex flex-col justify-center min-h-[88vh] overflow-hidden"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
        animate={reduced ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 1, scale: 1, rotate: 0, y: [0, -14, 0] }}
        transition={reduced ? { duration: 1, delay: 0.6 } : {
          opacity: { duration: 1, delay: 0.6 },
          scale: { duration: 1, delay: 0.6 },
          rotate: { duration: 1, delay: 0.6 },
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
        }}
        className="pointer-events-none absolute right-[2%] top-[6%] w-[28vw] max-w-[320px] lg:right-[4%] lg:top-[10%] lg:w-[24vw] lg:max-w-[420px] hidden md:block"
      >
        <div
          aria-hidden
          className="absolute inset-0 -m-12 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.35) 0%, transparent 65%)' }}
        />
        <img
          src="/art/companion/dragon-baby.webp"
          alt=""
          width={400}
          height={400}
          className="relative w-full h-auto drop-shadow-[0_30px_40px_rgba(45,90,94,0.25)]"
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y, opacity }}
        className="relative max-w-6xl mx-auto w-full"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Bald verfügbar · 2026
        </motion.p>

        <h1 className="font-display font-extrabold leading-[0.95] tracking-tight text-[13vw] sm:text-[10vw] lg:text-[8rem] xl:text-[9rem] text-teal-dark">
          <motion.span
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block mr-[0.2em]"
          >
            Ronki
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block mr-[0.2em]"
          >
            trägt
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block mr-[0.2em]"
          >
            die
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block mr-[0.2em]"
          >
            Routine
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block"
          >
            <HeroHighlight color="#FCD34D" delay={1.1}>mit</HeroHighlight>.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-10 text-lg sm:text-xl opacity-80 leading-relaxed max-w-xl"
        >
          Ein Drachen-Gefährte, der dein Kind durch den Alltag begleitet. Damit du „Zähne putzen!" nicht zum zehnten Mal durchs Haus rufen musst.
        </motion.p>

        <div className="mt-8 flex flex-col gap-4 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>

          <motion.a
            href="#wie-ronki-arbeitet"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.65 }}
            className="group inline-flex items-center gap-2 text-sm text-teal/80 hover:text-teal transition-colors w-fit py-2"
          >
            So funktioniert Ronki
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </motion.a>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-teal/70"
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

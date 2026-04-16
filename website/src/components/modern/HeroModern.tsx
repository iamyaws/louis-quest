import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { WaitlistCTAModern } from './WaitlistCTAModern';
import { LAUNCH_STATE } from '../../config/launch-state';

const WORDS = ['Ronki', 'trägt', 'die', 'Routine', 'mit.'];

export function HeroModern() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(6px)']);

  return (
    <section ref={ref} className="relative min-h-[92vh] px-6 pt-28 pb-16 sm:pt-36 flex flex-col justify-center">
      <motion.div
        style={reduced ? undefined : { y, scale, filter: blur }}
        className="max-w-6xl mx-auto w-full"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] text-[#c48a3a] mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c48a3a] align-middle mr-3 animate-pulse" />
          Bald verfügbar · 2026
        </motion.p>

        <h1 className="font-display leading-[0.95] tracking-tight text-[15vw] sm:text-[12vw] lg:text-[9rem] xl:text-[10rem]">
          {WORDS.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: '0.3em', filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              className="inline-block mr-[0.2em]"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl max-w-xl opacity-80 leading-relaxed"
          >
            Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet. Damit du nicht zum tausendsten Mal „Zähne putzen!" rufen musst.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex flex-col gap-4 lg:items-end"
          >
            <WaitlistCTAModern launchState={LAUNCH_STATE} />
            <a
              href="#wie-ronki-arbeitet"
              className="group inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              Wie Ronki arbeitet
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase opacity-75"
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

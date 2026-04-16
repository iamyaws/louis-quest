import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant C — Biome Immersive Split. Text left, dawn-forest painting right with dragon overlay. */
export function HeroVariantC() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60]);

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
      ref={ref}
      className="relative flex flex-col md:flex-row items-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden gap-8 lg:gap-12"
    >
      {/* ── Mobile: image first ── */}
      <div className="md:hidden w-full flex justify-center">
        <motion.div
          {...fade(0.2)}
          className="relative w-full max-w-sm rounded-2xl overflow-visible"
        >
          <img
            src="/art/bioms/Morgenwald_dawn-forest.webp"
            alt="Morgenwald, dawn forest"
            className="w-full h-auto rounded-2xl border border-teal/10"
          />
          <img
            src="/art/companion/dragon-baby.webp"
            alt=""
            aria-hidden
            className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[45%] drop-shadow-[0_20px_30px_rgba(45,90,94,0.3)]"
          />
        </motion.div>
      </div>

      {/* ── Left: text (60%) ── */}
      <div className="relative w-full md:w-[60%] max-w-3xl mx-auto md:mx-0 md:pl-[max(1.5rem,4vw)]">
        <motion.p
          {...fade(0.1)}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Bald verfügbar &middot; 2026
        </motion.p>

        <motion.h1
          {...fade(0.2)}
          className="font-display font-extrabold leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl text-teal-dark"
        >
          Ronki trägt die Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 0.9}>mit</HeroHighlight>.
        </motion.h1>

        <motion.p
          {...fade(0.4)}
          className="mt-8 text-lg sm:text-xl opacity-80 leading-relaxed max-w-xl"
        >
          Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet. Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal durchs Haus rufen musst.
        </motion.p>

        <div className="mt-8 flex flex-col gap-4 max-w-xl">
          <motion.div {...fade(0.55)}>
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>

          <motion.a
            href="#wie-ronki-arbeitet"
            {...fade(0.65)}
            className="group inline-flex items-center gap-2 text-sm text-teal/80 hover:text-teal transition-colors w-fit py-2"
          >
            So funktioniert Ronki
            <span className="inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.a>
        </div>
      </div>

      {/* ── Right: biome painting (40%) — desktop only ── */}
      <motion.div
        style={reduced ? undefined : { y: imgY }}
        className="hidden md:flex w-[40%] h-full items-center justify-center pr-[max(1.5rem,3vw)]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-full rounded-2xl overflow-visible"
        >
          <img
            src="/art/bioms/Morgenwald_dawn-forest.webp"
            alt="Morgenwald, dawn forest"
            className="w-full h-auto rounded-2xl border border-teal/10 shadow-lg"
          />
          {/* Dragon overlaid at bottom, partially overflowing */}
          <motion.img
            src="/art/companion/dragon-baby.webp"
            alt=""
            aria-hidden
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={
              reduced
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: [0, -8, 0], scale: 1 }
            }
            transition={
              reduced
                ? { duration: 0.8, delay: 0.8 }
                : {
                    opacity: { duration: 0.8, delay: 0.8 },
                    scale: { duration: 0.8, delay: 0.8 },
                    y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
                  }
            }
            className="absolute -bottom-[10%] right-[8%] w-[45%] max-w-[200px] drop-shadow-[0_20px_30px_rgba(45,90,94,0.3)]"
          />
        </motion.div>
      </motion.div>

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

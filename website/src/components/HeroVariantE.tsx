import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant E — Card-on-Canvas. Floating glassmorphic card over washed-out biome background. */
export function HeroVariantE() {
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
    <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-cream">
      {/* Washed-out biome background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <img
          src="/art/bioms/Sonnenglast_sun-highlands.webp"
          alt=""
          className="h-full w-full object-cover opacity-[0.15]"
        />
      </div>

      {/* Floating card with dragon accents */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
        whileHover={reduced ? undefined : { y: -4 }}
        className="relative max-w-3xl w-full rounded-3xl bg-white/80 backdrop-blur-xl border border-teal/10 shadow-2xl px-8 py-12 sm:px-12 sm:py-16 text-center"
      >
        {/* Dragon-baby peeking from top-right */}
        <motion.img
          src="/art/companion/dragon-baby.webp"
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
          animate={
            reduced
              ? { opacity: 1, scale: 1, rotate: 8 }
              : { opacity: 1, scale: 1, rotate: 8, y: [0, -6, 0] }
          }
          transition={
            reduced
              ? { duration: 0.8, delay: 0.6 }
              : {
                  opacity: { duration: 0.8, delay: 0.6 },
                  scale: { duration: 0.8, delay: 0.6 },
                  y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 },
                }
          }
          className="absolute -top-12 -right-8 w-28 sm:w-36 lg:w-40 drop-shadow-[0_16px_24px_rgba(45,90,94,0.2)] pointer-events-none z-10 hidden sm:block"
        />

        {/* Dragon-young peeking from bottom-left */}
        <motion.img
          src="/art/companion/dragon-young.webp"
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={
            reduced
              ? { opacity: 1, scale: 1, rotate: -6 }
              : { opacity: 1, scale: 1, rotate: -6, y: [0, -5, 0] }
          }
          transition={
            reduced
              ? { duration: 0.8, delay: 0.8 }
              : {
                  opacity: { duration: 0.8, delay: 0.8 },
                  scale: { duration: 0.8, delay: 0.8 },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 },
                }
          }
          className="absolute -bottom-8 -left-6 w-20 sm:w-24 lg:w-28 drop-shadow-[0_12px_20px_rgba(45,90,94,0.2)] pointer-events-none z-10 hidden sm:block"
        />

        {/* Card content */}
        <motion.p
          {...fade(0.25)}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Bald verfügbar &middot; 2026
        </motion.p>

        <motion.h1
          {...fade(0.35)}
          className="font-display font-extrabold leading-[0.95] tracking-tight text-3xl sm:text-4xl lg:text-5xl text-teal-dark"
        >
          Ronki trägt die Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 1}>mit</HeroHighlight>.
        </motion.h1>

        <motion.p
          {...fade(0.5)}
          className="mt-8 text-base sm:text-lg opacity-80 leading-relaxed max-w-2xl mx-auto"
        >
          Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet. Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal durchs Haus rufen musst.
        </motion.p>

        <motion.div {...fade(0.6)} className="mt-8 flex justify-center">
          <div className="w-full max-w-md">
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </div>
        </motion.div>

        <motion.a
          href="#wie-ronki-arbeitet"
          {...fade(0.7)}
          className="group mt-5 inline-flex items-center gap-2 text-sm text-teal/80 hover:text-teal transition-colors py-2"
        >
          So funktioniert Ronki
          <span className="inline-block transition-transform group-hover:translate-x-1">
            &rarr;
          </span>
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
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

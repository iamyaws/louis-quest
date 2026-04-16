import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant D — Full Cinematic Background. Sternenmeer painting with dark overlay, cream text. */
export function HeroVariantD() {
  const reduced = useReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  /* Floating star particles — positions & delays */
  const stars = [
    { top: '18%', left: '12%', size: 4, delay: 0 },
    { top: '28%', right: '18%', size: 3, delay: 1.2 },
    { top: '62%', left: '22%', size: 3.5, delay: 0.6 },
    { top: '75%', right: '28%', size: 2.5, delay: 1.8 },
  ];

  return (
    <section className="relative flex flex-col justify-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Full-viewport background image */}
      <div className="absolute inset-0">
        <img
          src="/art/bioms/Sternenmeer_sea-of-stars.webp"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(45,90,94,0.85) 0%, rgba(45,90,94,0.55) 50%, rgba(45,90,94,0.30) 100%)',
          }}
        />
      </div>

      {/* Floating star particles */}
      {!reduced &&
        stars.map((star, i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.4, 1],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-mustard-soft pointer-events-none"
            style={{
              top: star.top,
              left: star.left,
              right: (star as { right?: string }).right,
              width: star.size,
              height: star.size,
            }}
          />
        ))}

      {/* Content */}
      <div className="relative max-w-6xl mx-auto w-full">
        <motion.p
          {...fade(0.1)}
          className="text-xs uppercase tracking-[0.2em] text-cream/80 mb-8 font-medium"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
          Bald verfügbar &middot; 2026
        </motion.p>

        <motion.h1
          {...fade(0.2)}
          className="font-display font-extrabold leading-[0.95] tracking-tight text-[13vw] sm:text-[10vw] lg:text-[8rem] xl:text-[9rem] text-cream"
        >
          Ronki trägt die Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 0.9}>mit</HeroHighlight>.
        </motion.h1>

        <motion.p
          {...fade(0.4)}
          className="mt-10 text-lg sm:text-xl text-cream/80 leading-relaxed max-w-xl"
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
            className="group inline-flex items-center gap-2 text-sm text-cream/70 hover:text-cream transition-colors w-fit py-2"
          >
            So funktioniert Ronki
            <span className="inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.a>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-cream/60"
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

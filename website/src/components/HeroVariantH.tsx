import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';
import { EASE_OUT } from '../lib/motion';

/** Variant H — Floating Biomes. Dark teal background with painterly biome art
 *  peeking through gently floating circular shapes around the edges. */

type BiomeShape = {
  /** Background image path */
  src: string;
  /** Tailwind size classes (w-* h-*) */
  size: string;
  /** Inline positioning — absolute coordinates */
  style: React.CSSProperties;
  /** Whether the shape is hidden on mobile */
  mobileHidden: boolean;
  /** Float animation: y-travel in px, duration in seconds, delay in seconds */
  float: { yPx: number; duration: number; delay: number };
  /** Shape roundedness: 'full' | '3xl' */
  shape: 'full' | '3xl';
  /** opacity 0-100 */
  opacity: number;
};

const BIOME_SHAPES: BiomeShape[] = [
  {
    src: '/art/bioms/Morgenwald_dawn-forest.webp',
    size: 'w-[160px] h-[160px]',
    style: { top: '8%', left: '-3%' },
    mobileHidden: true,
    float: { yPx: 14, duration: 6.8, delay: 0 },
    shape: 'full',
    opacity: 28,
  },
  {
    src: '/art/bioms/Wolkengrat_mountain-ridge.webp',
    size: 'w-[200px] h-[200px]',
    style: { top: '18%', right: '-4%' },
    mobileHidden: true,
    float: { yPx: 18, duration: 7.6, delay: 1.2 },
    shape: 'full',
    opacity: 30,
  },
  {
    src: '/art/bioms/Naschgarten_temptaion-garden.webp',
    size: 'w-[120px] h-[120px]',
    style: { bottom: '22%', left: '2%' },
    mobileHidden: true,
    float: { yPx: 12, duration: 5.9, delay: 0.7 },
    shape: '3xl',
    opacity: 25,
  },
  {
    src: '/art/bioms/Sternenmeer_sea-of-stars.webp',
    size: 'w-[80px] h-[80px]',
    style: { bottom: '12%', right: '6%' },
    mobileHidden: false,
    float: { yPx: 10, duration: 5.4, delay: 1.8 },
    shape: 'full',
    opacity: 35,
  },
  {
    src: '/art/bioms/Sonnenglast_sun-highlands.webp',
    size: 'w-[96px] h-[96px]',
    style: { top: '55%', right: '2%' },
    mobileHidden: false,
    float: { yPx: 8, duration: 6.2, delay: 2.5 },
    shape: 'full',
    opacity: 22,
  },
];

export function HeroVariantH() {
  const reduced = useReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: EASE_OUT },
        };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden"
      style={{ backgroundColor: '#1A3C3F' }}
    >
      {/* Subtle vignette to keep edges dark */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(26,60,63,0.72) 100%)',
        }}
      />

      {/* Floating biome shapes */}
      {BIOME_SHAPES.map((shape, i) => {
        const roundedClass =
          shape.shape === 'full' ? 'rounded-full' : 'rounded-3xl';
        const visibilityClass = shape.mobileHidden ? 'hidden md:block' : 'block';

        return (
          <motion.div
            key={i}
            aria-hidden
            className={`absolute overflow-hidden pointer-events-none ${roundedClass} ${visibilityClass} ${shape.size}`}
            style={{
              ...shape.style,
              opacity: shape.opacity / 100,
              backgroundImage: `url(${shape.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={reduced ? false : { y: 0 }}
            animate={
              reduced
                ? {}
                : { y: [0, -shape.float.yPx, 0] }
            }
            transition={
              reduced
                ? {}
                : {
                    duration: shape.float.duration,
                    delay: shape.float.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        );
      })}

      {/* Content — centered column */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
        {/* Eyebrow */}
        <motion.p
          {...fade(0.15)}
          className="text-xs uppercase tracking-[0.22em] font-medium mb-8"
          style={{ color: 'rgba(253,248,240,0.70)' }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full align-middle mr-3 animate-pulse"
            style={{ backgroundColor: '#FCD34D' }}
          />
          Bald verf&uuml;gbar &middot; 2026
        </motion.p>

        {/* H1 */}
        <motion.h1
          {...fade(0.28)}
          className="font-display font-extrabold leading-[0.94] tracking-tight text-4xl sm:text-5xl lg:text-6xl"
          style={{ color: '#FDF8F0' }}
        >
          Ronki tr&auml;gt die Routine{' '}
          <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 1.1}>
            mit
          </HeroHighlight>
          .
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fade(0.45)}
          className="mt-7 text-base sm:text-lg leading-relaxed max-w-xl"
          style={{ color: 'rgba(253,248,240,0.72)' }}
        >
          Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet.
          Damit du &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal
          durchs Haus rufen musst.
        </motion.p>

        {/* Waitlist CTA */}
        <motion.div {...fade(0.58)} className="mt-9 w-full max-w-md">
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </motion.div>

        {/* Scroll-down link */}
        <motion.a
          href="#wie-ronki-arbeitet"
          {...fade(0.70)}
          className="group mt-6 inline-flex items-center gap-2 text-sm py-2 transition-colors"
          style={{ color: 'rgba(253,248,240,0.55)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              'rgba(253,248,240,0.90)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              'rgba(253,248,240,0.55)')
          }
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
        transition={{ duration: 1.2, delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.18em] uppercase"
        style={{ color: 'rgba(253,248,240,0.45)' }}
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll &darr;
        </motion.span>
      </motion.div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../components/PageMeta';

export default function NotFound() {
  const reduced = useReducedMotion();

  return (
    <>
      <PageMeta
        title="Seite nicht gefunden: Ronki"
        description="Diese Seite existiert nicht."
        noindex={true}
      />

      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-teal-dark">
        {/* Gradient sky */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #1A3C3F 0%, #2D5A5E 40%, #3E7478 65%, #50a082 100%)',
          }}
        />

        {/* Animated cloud/wave layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {/* Cloud layer 1 — slow, back */}
          <motion.div
            className="absolute w-[200%] bottom-[18%]"
            animate={reduced ? {} : { x: [0, '-50%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 2400 200" className="w-full h-32 sm:h-44">
              <path
                d="M0,120 C200,60 400,160 600,100 C800,40 1000,140 1200,120 C1400,100 1600,50 1800,110 C2000,170 2200,80 2400,120 L2400,200 L0,200 Z"
                fill="rgba(253,248,240,0.06)"
              />
            </svg>
          </motion.div>

          {/* Cloud layer 2 — medium speed, middle */}
          <motion.div
            className="absolute w-[200%] bottom-[10%]"
            animate={reduced ? {} : { x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 2400 200" className="w-full h-28 sm:h-36">
              <path
                d="M0,80 C150,140 350,40 600,90 C850,140 1050,60 1200,80 C1350,100 1550,140 1800,70 C2050,0 2200,100 2400,80 L2400,200 L0,200 Z"
                fill="rgba(253,248,240,0.08)"
              />
            </svg>
          </motion.div>

          {/* Cloud layer 3 — faster, front */}
          <motion.div
            className="absolute w-[200%] bottom-0"
            animate={reduced ? {} : { x: ['-50%', '0%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 2400 200" className="w-full h-24 sm:h-32">
              <path
                d="M0,100 C300,50 500,150 800,90 C1100,30 1300,130 1600,100 C1900,70 2100,120 2400,100 L2400,200 L0,200 Z"
                fill="rgba(253,248,240,0.12)"
              />
            </svg>
          </motion.div>

          {/* Mustard glow — top */}
          <div
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.12) 0%, transparent 65%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* 404 — massive, ghosted */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="font-display font-extrabold text-[8rem] sm:text-[12rem] md:text-[16rem] leading-none text-cream/[0.07] select-none"
          >
            404
          </motion.p>

          {/* Dragon image — overlapping the 404 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="-mt-20 sm:-mt-28 md:-mt-36 mb-6 relative"
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-6 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.25) 0%, transparent 60%)' }}
                />
                <img
                  src="/art/companion/dragon-404.webp"
                  alt="Ronki, der kleine Drache, schaut neugierig um eine Steinmauer."
                  width={280}
                  height={280}
                  className="relative w-44 sm:w-52 md:w-64 rounded-2xl shadow-2xl"
                  style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight leading-tight"
          >
            Ronki hat sich verflogen.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-4 text-base sm:text-lg text-cream/60 max-w-md leading-relaxed"
          >
            Diese Seite gibt es leider nicht. Aber keine Sorge. Der kleine Drache findet den Weg zurück.
          </motion.p>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-display font-bold text-teal-dark hover:bg-mustard transition-colors shadow-lg"
            >
              <span aria-hidden>←</span>
              Zurück zur Startseite
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';

export default function NotFound() {
  const reduced = useReducedMotion();

  return (
    <PainterlyShell>
      <PageMeta
        title="Seite nicht gefunden: Ronki"
        description="Diese Seite existiert nicht."
        noindex={true}
      />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center">
        {/* Floating dragon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={
            reduced
              ? { opacity: 1, scale: 1, rotate: 0 }
              : { opacity: 1, scale: 1, rotate: 0, y: [0, -12, 0] }
          }
          transition={
            reduced
              ? { duration: 0.8 }
              : {
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8 },
                  rotate: { duration: 0.8 },
                  y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
                }
          }
          className="relative mb-8"
        >
          <div
            aria-hidden
            className="absolute inset-0 -m-10 rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(252,211,77,0.3) 0%, transparent 65%)',
            }}
          />
          <img
            src="/art/companion/dragon-baby.webp"
            alt=""
            width={280}
            height={280}
            className="relative w-48 sm:w-56 md:w-64 h-auto drop-shadow-[0_24px_36px_rgba(45,90,94,0.2)]"
          />
        </motion.div>

        {/* Copy */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-teal-dark tracking-tight leading-tight"
        >
          Ronki hat sich verflogen.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-base sm:text-lg text-ink/70 max-w-md leading-relaxed"
        >
          Diese Seite gibt es leider nicht. Aber keine Sorge&nbsp;&mdash; der kleine Drache findet den Weg&nbsp;zurück.
        </motion.p>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-dark px-6 py-3 text-sm font-display font-bold text-cream hover:bg-teal transition-colors"
          >
            <span aria-hidden>←</span>
            Zur&uuml;ck zur Startseite
          </Link>
        </motion.div>
      </main>
    </PainterlyShell>
  );
}

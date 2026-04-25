/**
 * /tools — index page listing the available parent tools.
 *
 * V1 contains only the Dark Pattern Scanner (`/tools/app-check`). Future
 * tools (Familien-Medien-Charter Generator, Routine-Builder, etc.) will
 * land as additional cards here.
 */

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { fadeUp } from '../../lib/motion';

export default function ToolsHub() {
  const reduced = useReducedMotion();
  return (
    <PainterlyShell>
      <PageMeta
        title="Werkzeuge für Eltern: Ronki"
        description="Kleine Werkzeuge die Eltern helfen, digitale Entscheidungen für ihr Kind selbst zu treffen. Aktuell: der App-Check für Kinder-Apps."
        canonicalPath="/tools"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0, reduced)}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark focus:outline-none focus-visible:text-teal-dark focus-visible:underline underline-offset-4 transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-6">
              Werkzeuge
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
              Werkzeuge für <em className="italic text-sage">Eltern</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Kleine Tools die dir helfen, digitale Entscheidungen für dein
              Kind selbst zu treffen. Du bewertest, wir geben dir den Rahmen.
              Kostenlos und ohne Anmeldung, wir setzen auch keine Cookies.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-28 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <ul className="grid sm:grid-cols-2 gap-6">
            <li>
              <Link
                to="/tools/app-check"
                className="group block rounded-2xl bg-cream/70 backdrop-blur-sm border border-teal/10 p-7 hover:shadow-lg hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all duration-300"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-teal font-semibold mb-3">
                  App-Check
                </p>
                <h2 className="font-display font-bold text-2xl text-teal-dark leading-snug mb-3">
                  Welche App will dein Kind?
                </h2>
                <p className="text-sm text-ink/70 leading-relaxed mb-5">
                  Beantworte zehn Fragen aus deiner eigenen Beobachtung. Du
                  bekommst eine Einschätzung, was die App-Mechaniken über sie
                  verraten.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-teal font-semibold group-hover:gap-2 transition-all">
                  Tool öffnen <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
            <li className="rounded-2xl bg-cream/40 border border-dashed border-teal/15 p-7 flex flex-col justify-center text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50 font-semibold mb-3">
                Bald
              </p>
              <p className="text-sm text-ink/55 leading-relaxed">
                Weitere Werkzeuge folgen. Schreib uns woran ihr hängt:{' '}
                <a
                  href="mailto:hallo@ronki.de"
                  className="text-teal underline underline-offset-2 focus:outline-none focus-visible:text-teal-dark focus-visible:decoration-2"
                >
                  hallo@ronki.de
                </a>
              </p>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

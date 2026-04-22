import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { getLaunchCopy, LAUNCH_STATE } from '../config/launch-state';

function TapeTopLeft() {
  return (
    <svg
      className="absolute -top-4 left-6 sm:left-10 w-24 h-10 -rotate-[8deg]"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill="#6B8F71" fillOpacity="0.55" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#fff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#fff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}

function TapeBottomRight() {
  return (
    <svg
      className="absolute -bottom-4 right-6 sm:right-10 w-24 h-10 rotate-[8deg]"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill="#6B8F71" fillOpacity="0.55" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#fff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#fff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}

export function Footer() {
  const copy = getLaunchCopy(LAUNCH_STATE);
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-6 pt-10 pb-12">
      <div className="relative max-w-6xl mx-auto rounded-3xl bg-cream/80 backdrop-blur-sm border border-teal/10 px-8 sm:px-12 pt-16 pb-10 shadow-sm">
        <TapeTopLeft />
        <TapeBottomRight />

        <div className="flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10"
          >
            <p className="font-display font-semibold text-2xl sm:text-3xl leading-snug text-teal-dark flex-1">
              {copy.footerMicro}
            </p>
            <div className="w-full sm:w-auto sm:min-w-[320px] shrink-0">
              <WaitlistCTA launchState={LAUNCH_STATE} />
            </div>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-teal/60 mb-4 font-medium">
                Navigation
              </p>
              <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
                <Link to="/" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Start
                </Link>
                <Link to="/wie-es-funktioniert" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Wie es funktioniert
                </Link>
                <Link to="/wissenschaft" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Wissenschaft
                </Link>
                <Link to="/fuer-eltern" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Für Eltern
                </Link>
                <Link to="/faq" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Häufige Fragen
                </Link>
                <Link to="/ratgeber" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Ratgeber
                </Link>
                <Link to="/installieren" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Ronki installieren
                </Link>
                <a
                  href="https://app.ronki.de/?compendium=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5 inline-flex items-center gap-1.5"
                >
                  Drachen-Compendium
                  <span aria-hidden className="text-teal/50 text-[10px] leading-none">↗</span>
                </a>
                <Link to="/vorlagen" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Vorlagen zum Ausdrucken
                </Link>
                <Link to="/drachen-sammelkarten" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Drachen-Sammelkarten
                </Link>
              </nav>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-teal/60 mb-4 font-medium">
                Rechtliches
              </p>
              <nav aria-label="Rechtliches" className="flex flex-col gap-2 text-sm">
                <Link to="/impressum" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Impressum
                </Link>
                <Link to="/datenschutz" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  Datenschutz
                </Link>
                <Link to="/agb" className="text-teal-dark/75 hover:text-teal-dark transition-colors w-fit py-2.5">
                  AGB
                </Link>
              </nav>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-teal/60 mb-4 font-medium">
                Kontakt
              </p>
              <a
                href="mailto:hallo@ronki.de"
                className="text-sm text-teal-dark/75 hover:text-teal-dark transition-colors block mb-4"
              >
                hallo@ronki.de
              </a>
              <a
                href="https://ko-fi.com/ronkiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-teal-dark/75 hover:text-teal-dark transition-colors block mb-4"
              >
                <span aria-hidden>🍨</span> Louis eine Kugel Eis ausgeben
              </a>
              <Link
                to="/en"
                className="inline-flex items-center gap-2 text-xs font-display font-semibold text-teal-dark/60 hover:text-teal-dark transition-colors"
              >
                <span aria-hidden>🇬🇧</span> English version
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-8 border-t border-teal/10">
            <p className="font-display font-extrabold text-6xl sm:text-8xl leading-none tracking-tighter text-teal-dark/10">
              ronki
            </p>
            <p className="text-xs text-teal-dark/70">
              © {year} Ronki · Ein unabhängiges Projekt · Keine Werbepartner, keine Tracker.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { getLaunchCopy, LAUNCH_STATE } from '../../config/launch-state';

export function FooterModern() {
  const copy = getLaunchCopy(LAUNCH_STATE);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 px-6 pt-20 pb-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl sm:text-4xl leading-tight max-w-2xl opacity-85"
        >
          {copy.footerMicro}
        </motion.p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Navigation</p>
            <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
              <Link to="/" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Start
              </Link>
              <Link to="/wie-es-funktioniert" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Wie es funktioniert
              </Link>
              <Link to="/wissenschaft" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Wissenschaft
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Rechtliches</p>
            <nav aria-label="Rechtliches" className="flex flex-col gap-2 text-sm">
              <Link to="/impressum" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Impressum
              </Link>
              <Link to="/datenschutz" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Datenschutz
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Kontakt</p>
            <a
              href="mailto:hallo@ronki.de"
              className="text-sm opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors"
            >
              hallo@ronki.de
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Version</p>
            <Link
              to="/"
              className="text-sm opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors"
            >
              Klassisch (Aquarell) →
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-8 border-t border-white/5">
          <p className="font-display text-6xl sm:text-8xl leading-none opacity-20 tracking-tighter">
            ronki
          </p>
          <p className="text-xs opacity-75">
            © {year} Ronki · Ein unabhängiges Projekt · Keine Werbe-Partner, keine Tracker.
          </p>
        </div>
      </div>
    </footer>
  );
}

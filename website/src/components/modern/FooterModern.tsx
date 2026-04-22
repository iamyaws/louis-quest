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
          style={{
            hyphens: 'manual',
            WebkitHyphens: 'manual',
            MozHyphens: 'manual',
          }}
        >
          {copy.footerMicro}
        </motion.p>

        {/* Four-column grid — same groupings as the main Footer for
            consistency across the two design variants. */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ronki (product) */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Ronki</p>
            <nav aria-label="Ronki" className="flex flex-col gap-2 text-sm">
              <Link to="/" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Start
              </Link>
              <Link to="/wie-es-funktioniert" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Wie es funktioniert
              </Link>
              <Link to="/fuer-eltern" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Für Eltern
              </Link>
              <Link to="/wissenschaft" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Wissenschaft
              </Link>
              <Link to="/faq" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Häufige Fragen
              </Link>
            </nav>
          </div>

          {/* Mitmachen (community hub) */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[#c48a3a] mb-4 font-medium">Mitmachen</p>
            <nav aria-label="Mitmachen" className="flex flex-col gap-2 text-sm">
              <Link
                to="/mitmachen"
                className="font-display font-semibold opacity-100 hover:text-[#c48a3a] transition-colors w-fit"
              >
                Gründungs-Familien
              </Link>
              <a
                href="https://discord.gg/e8yns9A4X"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit inline-flex items-center gap-1.5"
              >
                Discord-Community
                <span aria-hidden className="opacity-60 text-[10px] leading-none">↗</span>
              </a>
              <Link to="/installieren" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Ronki installieren
              </Link>
              <a
                href="mailto:hallo@ronki.de"
                className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit"
              >
                hallo@ronki.de
              </a>
            </nav>
          </div>

          {/* Entdecken (content) */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Entdecken</p>
            <nav aria-label="Entdecken" className="flex flex-col gap-2 text-sm">
              <Link to="/ratgeber" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Ratgeber
              </Link>
              <Link to="/vorlagen" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Vorlagen
              </Link>
              <Link to="/drachen-sammelkarten" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Drachen-Sammelkarten
              </Link>
              <a
                href="https://app.ronki.de/?compendium=1"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit inline-flex items-center gap-1.5"
              >
                Drachen-Compendium
                <span aria-hidden className="opacity-60 text-[10px] leading-none">↗</span>
              </a>
            </nav>
          </div>

          {/* Rechtliches & Mehr */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] opacity-75 mb-4">Rechtliches &amp; Mehr</p>
            <nav aria-label="Rechtliches und Mehr" className="flex flex-col gap-2 text-sm">
              <Link to="/impressum" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Impressum
              </Link>
              <Link to="/datenschutz" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                Datenschutz
              </Link>
              <Link to="/agb" className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit">
                AGB
              </Link>
              <Link
                to="/"
                className="opacity-75 hover:opacity-100 hover:text-[#c48a3a] transition-colors w-fit"
              >
                Klassisch (Aquarell) →
              </Link>
            </nav>
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

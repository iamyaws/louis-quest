import { Link } from 'react-router-dom';
import { getLaunchCopy, LAUNCH_STATE } from '../config/launch-state';

export function Footer() {
  const copy = getLaunchCopy(LAUNCH_STATE);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-cream/60 py-10 px-6 mt-24">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <p className="text-sm opacity-75 max-w-2xl">{copy.footerMicro}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm">
          <Link to="/" className="underline">Start</Link>
          <Link to="/wie-es-funktioniert" className="underline">Wie es funktioniert</Link>
          <Link to="/wissenschaft" className="underline">Wissenschaft</Link>
          <Link to="/impressum" className="underline">Impressum</Link>
          <Link to="/datenschutz" className="underline">Datenschutz</Link>
          <a href="mailto:hallo@ronki.de" className="underline">Kontakt</a>
        </nav>
        <p className="text-xs opacity-60">
          © {year} Ronki. Ein unabhängiges Projekt. Keine Werbe-Partner, keine Tracker.
        </p>
      </div>
    </footer>
  );
}

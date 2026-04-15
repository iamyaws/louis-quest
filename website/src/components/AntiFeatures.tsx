import { SectionHeading } from './SectionHeading';
import { Link } from 'react-router-dom';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität zeigt sich räumlich im Sanctuary — nicht als Zähler.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Nachrichten, die nerven.', detail: 'Ronki wartet im Sanctuary — er kommt nicht hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Tracker, keine Analytics bei Start. Supabase in der EU.' },
];

export function AntiFeatures() {
  return (
    <section className="px-6 py-24" aria-labelledby="anti-features-heading">
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="anti-features-heading" eyebrow="Was Ronki NICHT tut">
          Die ehrliche Liste.
        </SectionHeading>
        <ul className="flex flex-col gap-4 mt-8">
          {ITEMS.map((item) => (
            <li key={item.label} className="flex flex-col gap-1 border-l-2 border-plum/40 pl-4 py-2">
              <p className="font-display text-lg line-through decoration-plum/60 decoration-[1.5px]">{item.label}</p>
              <p className="text-sm opacity-75 leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm opacity-75">
          Ausführliche Begründungen auf <Link to="/wie-es-funktioniert" className="underline">Wie es funktioniert</Link> und <Link to="/wissenschaft" className="underline">Wissenschaft</Link>.
        </p>
      </div>
    </section>
  );
}

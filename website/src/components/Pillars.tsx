import { SectionHeading } from './SectionHeading';

const PILLARS = [
  {
    title: 'Ronki fragt, nie nervt.',
    body: 'Der Drache bietet Routinen als kleine Geschichten an — keine Erinnerungen, keine Streaks, kein „du hast\'s gebrochen". Kinder wählen ihr Tempo selbst.',
    image: '/images/placeholder-pillar-offers.webp',
    alt: 'Ronki reicht dem Kind eine kleine Schriftrolle — ein sanftes Angebot, keine Mahnung.',
  },
  {
    title: 'Das Sanctuary wächst mit.',
    body: 'Jede fertige Routine hinterlässt Spuren in Ronkis Welt. Fortschritt wird zu einem Ort, den das Kind besucht — nicht zu einem Zähler, den es fürchtet zu verlieren.',
    image: '/images/placeholder-pillar-sanctuary.webp',
    alt: 'Ronkis Sanctuary füllt sich über Wochen mit Karten, Kleinwesen und Erinnerungsstücken.',
  },
  {
    title: 'Nach Kinderentwicklung gebaut.',
    body: 'Gebaut auf AAP 2026, UNICEF RITEC-8, D4CR und Self-Determination Theory. Keine Loot-Boxen, keine variablen Belohnungen, keine FOMO-Mechaniken. Nie.',
    image: '/images/placeholder-pillar-science.webp',
    alt: 'Ein aufgeschlagenes Buch neben Ronki — die wissenschaftlichen Grundlagen sind sichtbar.',
  },
];

export function Pillars() {
  return (
    <section id="wie-ronki-arbeitet" className="px-6 py-24" aria-labelledby="pillars-heading">
      <div className="max-w-6xl mx-auto">
        <SectionHeading id="pillars-heading" eyebrow="Die drei Säulen">
          Warum Ronki anders ist.
        </SectionHeading>
        <div className="grid gap-10 md:grid-cols-3 mt-8">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="flex flex-col gap-4">
              <img
                src={pillar.image}
                alt={pillar.alt}
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-sm"
                loading="lazy"
                width={800}
                height={600}
              />
              <h3 className="text-2xl font-display leading-tight">{pillar.title}</h3>
              <p className="opacity-85 leading-relaxed">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

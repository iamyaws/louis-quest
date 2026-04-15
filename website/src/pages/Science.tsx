import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';

type SourceLink = { label: string; href: string };

function SourceLinks({ links }: { links: SourceLink[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-4 text-sm">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="underline" target="_blank" rel="noreferrer noopener">
            {l.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Science() {
  return (
    <>
      <PageMeta
        title="Die Wissenschaft hinter Ronki"
        description="Ronki ist nach dem gebaut, was Kinderentwicklung wirklich braucht — AAP, UNICEF RITEC-8, D4CR, Self-Determination Theory."
        canonicalPath="/wissenschaft"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-20">
          <header className="flex flex-col gap-4">
            <h1 className="text-5xl font-display leading-tight">Die Wissenschaft hinter Ronki</h1>
            <p className="text-lg opacity-85 leading-relaxed">
              Ronki ist nicht „gamifiziert". Ronki ist nach dem gebaut, was Kinderentwicklung wirklich braucht — und gegen das, was digitale Produkte für Kinder seit Jahren falsch machen.
            </p>
          </header>

          <section>
            <SectionHeading eyebrow="Theoretische Grundlage">Self-Determination Theory.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Deci & Ryan zeigen: Motivation hält, wenn drei Bedürfnisse erfüllt sind — <strong>Autonomie, Kompetenz, Zugehörigkeit</strong>. Ronki ist auf diesen drei Säulen gebaut:
              </p>
              <ul className="flex flex-col gap-2 pl-5 list-disc">
                <li><strong>Autonomie.</strong> Das Kind wählt Tempo und Bögen. Ronki bietet an — er befiehlt nicht.</li>
                <li><strong>Kompetenz.</strong> Routinen sind im Sweet Spot — machbar, nicht trivial. Jeder abgeschlossene Bogen hinterlässt etwas Sichtbares.</li>
                <li><strong>Zugehörigkeit.</strong> Die Beziehung Kind ↔ Drache ↔ Familie trägt die Routine — kein einsames Spiel.</li>
              </ul>
              <SourceLinks links={[
                { label: 'Deci & Ryan — Self-Determination Theory (selfdeterminationtheory.org)', href: 'https://selfdeterminationtheory.org' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Bildschirmzeit-Leitlinien">AAP 2026.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Die American Academy of Pediatrics aktualisiert ihre Leitlinien 2026 und betont <strong>async, nicht-abhängig-machendes Design</strong>, <strong>Eltern in der Schleife</strong>, und <strong>werbefreie</strong> Umgebungen. Ronki entspricht jedem dieser Prinzipien.
              </p>
              <SourceLinks links={[
                { label: 'AAP — Media and Children', href: 'https://www.aap.org/en/patient-care/media-and-children/' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Kinderrechte im Digitalen">UNICEF RITEC-8.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                UNICEFs RITEC-Projekt formuliert acht Grundsätze für kinderrechts-orientiertes Produktdesign. Ronki erfüllt alle acht explizit — am wichtigsten: <strong>Privatsphäre</strong>, <strong>Sicherheit</strong>, <strong>Autonomie</strong>, und <strong>Teilhabe</strong>.
              </p>
              <SourceLinks links={[
                { label: 'UNICEF RITEC — Responsible Innovation in Technology for Children', href: 'https://www.unicef.org/globalinsight/responsible-innovation-technology-children' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Design-Prinzipien">D4CR — Designing for Children\'s Rights.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Der D4CR-Verband verbindet Designer:innen, die sich verpflichten, Kinderrechte in jedem Produkt-Entscheid zu tragen. Ronki folgt den D4CR-Prinzipien bei Onboarding, Feedback-Mechanismen und Belohnungsstrukturen.
              </p>
              <SourceLinks links={[
                { label: 'Designing for Children\'s Rights Association', href: 'https://designingforchildrensrights.org' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Kultureller Kontext">Jonathan Haidt — The Anxious Generation.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Haidts Kritik: Die Kombination aus sozialen Medien, unbegrenzter Bildschirmzeit und Engagement-Mechaniken hat eine Generation ängstlicher Kinder produziert. Ronki antwortet: <strong>async Tempo</strong>, <strong>kein Vergleichsdruck</strong>, <strong>keine sozialen Features</strong>, <strong>kein endloses Scrollen</strong>.
              </p>
              <SourceLinks links={[
                { label: 'The Anxious Generation (Offizielle Website)', href: 'https://www.anxiousgeneration.com' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Unsere expliziten Zusagen">Was wir zusichern — öffentlich.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>Wir bauen aktiv <strong>gegen</strong> Dark Patterns. Das heißt konkret:</p>
              <ul className="flex flex-col gap-2 pl-5 list-disc">
                <li>Keine variablen Belohnungen, keine Glücksspiel-Mechaniken.</li>
                <li>Keine Streaks, keine FOMO-Timer, keine „Letzte Chance"-Mechaniken.</li>
                <li>Keine Dark UX — kein Confirmshaming, keine versteckten Kosten, keine manipulativen Dialoge.</li>
                <li>Keine Werbe-Monetarisierung. Jemals.</li>
                <li>Keine Weitergabe von Kind-Daten an Dritte.</li>
              </ul>
              <blockquote className="mt-6 border-l-4 border-ochre pl-6 py-2 text-lg font-display italic">
                Wenn wir das brechen, dürft ihr uns daran erinnern — öffentlich.
              </blockquote>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

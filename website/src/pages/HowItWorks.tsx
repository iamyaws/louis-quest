import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <>
      <PageMeta
        title="Wie Ronki arbeitet"
        description="Arc Engine, Sanctuary, Micropedia. Der Mechanismus hinter Ronki — transparent erklärt."
        canonicalPath="/wie-es-funktioniert"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-20">
          <header className="flex flex-col gap-4">
            <h1 className="text-5xl font-display leading-tight">Wie Ronki arbeitet</h1>
            <p className="text-lg opacity-85 leading-relaxed">
              Ronki ist kein Habit-Tracker. Ronki ist ein <strong>narrativer Routine-Vermittler</strong> — ein Drache, der kleine Geschichten vorschlägt, die Kinder durch ihren Alltag tragen. Hier ist, wie das funktioniert.
            </p>
          </header>

          <section>
            <SectionHeading eyebrow="Kernmechanismus">Die Arc Engine.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>Ein <strong>Bogen</strong> ist eine kurze, mehrtägige Episode, die Ronki erzählt — aus drei Arten von Beats zusammengesetzt:</p>
              <ul className="flex flex-col gap-3 pl-5 list-disc">
                <li><strong>Routine-Beats.</strong> Bestehende Routinen (Zähneputzen, Anziehen), die Ronki narrativ aufnimmt. Das Kind macht, was es sowieso tut; die Geschichte schreitet still voran.</li>
                <li><strong>Bastel-Beats.</strong> Kleine DIY-Aufgaben aus Kinder-Interessen: Malen, Falten, Bauen. Vorlage drucken, machen, zeigen, „Ich hab's geschafft" tippen.</li>
                <li><strong>Lore-Beats.</strong> 2–4 Sätze Geschichte in einfacher Sprache — die Fäden des Bogens.</li>
              </ul>
              <p>
                Etwa 1–2 Bögen pro Woche, dazwischen ruht Ronki. Kein Bogen zur gleichen Zeit. Keine Hetze. Das Kind wählt, wann und ob.
              </p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Der Ort">Das Sanctuary.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Das Sanctuary ist Ronkis Zuhause — und die Erinnerungslandschaft des Kindes. Jeder fertige Bogen hinterlässt eine Spur: eine gemalte Karte an der Wand, ein kleines Wesen im Garten, ein Erinnerungsstück im Regal.
              </p>
              <p>
                Fortschritt ist <strong>räumlich</strong>, nicht zeitlich. Kein Streak kann reißen. Das Sanctuary wächst in dem Tempo, in dem das Kind es besucht.
              </p>
              <img
                src="/images/placeholder-sanctuary-accretion.webp"
                alt="Drei Snapshots des Sanctuary über Wochen: leer, beginnend, gefüllt mit Erinnerungen."
                className="w-full rounded-2xl shadow-sm my-4"
                loading="lazy"
                width={1200}
                height={800}
              />
              <p>Eine Unterzone, die <strong>Hatching Chamber</strong>, hält Eier — die über Tage schlüpfen, nicht über Minuten. Anticipation statt Dopamin.</p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Die Sammlung">Die Micropedia.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Etwa 60 kleine Wesen warten darauf, entdeckt zu werden — über Wochen, nicht an einem Nachmittag. Ein Silhouetten-Katalog, der sich füllt, während das Kind seine Bögen lebt.
              </p>
              <img
                src="/images/placeholder-micropedia-grid.webp"
                alt="Ein Raster aus Kreatur-Silhouetten auf Pergament, einige davon bereits entdeckt und bemalt."
                className="w-full rounded-2xl shadow-sm my-4"
                loading="lazy"
                width={1200}
                height={800}
              />
              <p>
                Unterteilt in fünf Kapitel — <em>Wald, Himmel, Wasser, Traum, Herd</em> — damit die Gesamtzahl sich erreichbar anfühlt. Jede Entdeckung trägt eine Erinnerungszeile: <em>„Gefunden im Wiesen-Abschnitt am dritten Tag des Karten-Abenteuers."</em>
              </p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Was Ronki NICHT tut">Die ehrliche Liste, ausführlich.</SectionHeading>
            <div className="flex flex-col gap-6 leading-relaxed">
              <AntiFeatureDetail
                label="Keine Streaks."
                detail="Streaks belohnen Angst, nicht Wachstum. Sie machen den Tag nach einer Auszeit schwerer statt leichter. Wir haben sie ersetzt durch die räumliche Kontinuität des Sanctuary."
              />
              <AntiFeatureDetail
                label="Keine variablen Belohnungen oder Loot-Boxen."
                detail="Das sind Glücksspiel-Mechaniken. Sie gehören nicht in Produkte für Kinder. Unsere Belohnungen sind vorhersehbar — wer einen Bogen abschließt, weiß, was kommt."
              />
              <AntiFeatureDetail
                label="Keine Push-Nachrichten."
                detail="Ronki wartet im Sanctuary. Er nervt nicht hinterher. Das Kind kommt, wenn es will. Das ist der Kernmechanismus — würden wir nachschieben, würden wir ihn brechen."
              />
              <AntiFeatureDetail
                label="Keine Werbung, keine Partner-Deals, keine In-App-Käufe bei Start."
                detail="Monetarisierung, wenn, dann transparent und Eltern-facing. Nie durch Kinderaufmerksamkeit."
              />
              <AntiFeatureDetail
                label="Keine Tracker, keine Analytics bei Start."
                detail="Wir erfahren nicht, wie lange dein Kind mit Ronki spielt. Das ist Absicht. Falls wir später Analytics brauchen, wird\'s Plausible oder ähnlich — und wir sagen\'s laut."
              />
              <p className="text-sm opacity-75">
                Warum? Siehe <Link to="/wissenschaft" className="underline">Wissenschaft</Link> — jede dieser Entscheidungen hat eine Quelle.
              </p>
            </div>
          </section>

          <Faq />
        </div>
      </main>
      <Footer />
    </>
  );
}

function AntiFeatureDetail({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2 border-l-2 border-plum/40 pl-4 py-1">
      <p className="font-display text-xl">{label}</p>
      <p className="opacity-85 leading-relaxed">{detail}</p>
    </div>
  );
}

const FAQS = [
  { q: 'Ab welchem Alter?', a: 'Ronki ist für Kinder zwischen 6 und 10 Jahren gebaut — das Alter, in dem selbstständige Routinen eingeübt werden, aber Begleitung noch den Unterschied macht.' },
  { q: 'Wie lange dauert eine Sitzung?', a: 'Routinen sind in wenigen Minuten abgetickt. Bastel-Beats laufen über den Tag. Ein ganzer Bogen spannt sich über mehrere Tage. Der App-Screen-Time selbst bleibt kurz (3–15 Min).' },
  { q: 'Was passiert bei Bildschirmzeit-Konflikten?', a: 'Ronki hat eine eingebaute Bildschirmzeit-Logik, die Pause-Phasen respektiert. Das Kind kann in Eile nicht „mehr Zeit" freischalten.' },
  { q: 'Funktioniert Ronki offline?', a: 'Ja. Ronki ist eine PWA — nach dem ersten Laden funktionieren alle Kern-Features ohne Netz.' },
  { q: 'Was kostet Ronki?', a: 'Aktuell kostenlos. Wenn sich das ändert, sagen wir\'s klar und früh — und jede Monetarisierung wird Eltern-facing sein, nie durch Kinderaufmerksamkeit.' },
];

function Faq() {
  return (
    <section>
      <SectionHeading eyebrow="Häufige Fragen">FAQ.</SectionHeading>
      <dl className="flex flex-col gap-6 mt-4">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="flex flex-col gap-2">
            <dt className="font-display text-lg">{q}</dt>
            <dd className="opacity-85 leading-relaxed">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

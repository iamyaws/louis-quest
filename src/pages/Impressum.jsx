import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Impressum für app.ronki.de
 * Identisch in Substanz zum Marketing-Impressum auf ronki.de, um den gleichen
 * Anbieter unter beiden Diensten auszuweisen. Nach § 5 DDG und § 18 MStV.
 */
export default function Impressum() {
  return (
    <div className="min-h-dvh bg-surface px-6 py-10 sm:py-16">
      <main className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors font-label"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Zurück zur App
        </Link>

        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-secondary font-label font-semibold">
          Rechtliches
        </p>
        <h1 className="mt-3 font-headline font-bold text-4xl sm:text-5xl leading-tight text-primary">
          Impressum
        </h1>
        <p className="mt-5 text-base text-on-surface-variant leading-relaxed">
          Anbieterkennzeichnung gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV) für den Dienst app.ronki.de.
        </p>

        <div className="mt-12 flex flex-col gap-10 text-base leading-relaxed text-on-surface">
          <Section heading="Diensteanbieter">
            <address className="not-italic">
              Marc Förster<br />
              Föhringer Allee 33<br />
              85774 Unterföhring<br />
              Deutschland
            </address>
          </Section>

          <Section heading="Kontakt">
            <p>
              E-Mail: <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a><br />
              Telefon: <a href="tel:+4917657904421" className="underline decoration-secondary underline-offset-4 hover:text-primary">+49 176 57904421</a>
            </p>
          </Section>

          <Section heading="Umsatzsteuer-Identifikationsnummer">
            <p className="text-sm text-on-surface-variant">
              Nicht vorhanden (Kleinunternehmerregelung nach § 19 UStG).
            </p>
          </Section>

          <Section heading="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
            <address className="not-italic">
              Marc Förster<br />
              Föhringer Allee 33<br />
              85774 Unterföhring
            </address>
          </Section>

          <Section heading="EU-Streitschlichtung">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-secondary underline-offset-4 hover:text-primary break-words"
              >
                ec.europa.eu/consumers/odr
              </a>.
            </p>
            <p className="mt-3">
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
            </p>
          </Section>

          <Section heading="Haftung für Inhalte und Links">
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Nach den §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mt-3">
              Für Links auf externe Websites (z. B. Google, Supabase, Vercel, Ko-fi) übernehmen wir keine Haftung. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.
            </p>
          </Section>

          <Section heading="Urheberrecht">
            <p>
              Die durch den Anbieter erstellten Inhalte und Werke auf app.ronki.de unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des Verfassers.
            </p>
          </Section>

          <Section heading="Bildnachweise & KI-Transparenz">
            <p>
              Große Teile der Bild-Inhalte in der App, insbesondere die Drachen-Figur Ronki, Begleit-Charaktere und die Szenen-Bilder der Welt, wurden mit Unterstützung generativer KI-Systeme erstellt (Midjourney, Google Gemini / Imagen). Wir haben die Ergebnisse ausgewählt, nachbearbeitet und in den gestalterischen Gesamtkontext der App gesetzt.
            </p>
            <p className="mt-3">
              Nach aktueller Rechtslage genießen rein KI-generierte Bilder in Deutschland grundsätzlich keinen urheberrechtlichen Schutz (§ 2 Abs. 2 UrhG). Soweit wir durch eigene Bearbeitung ein schutzfähiges Werk geschaffen haben, beanspruchen wir das Urheberrecht ausschließlich an dieser Bearbeitung, nicht am KI-Ausgangsbild.
            </p>
            <p className="mt-3">
              Sollte unbeabsichtigt eine Ähnlichkeit mit realen Personen oder geschützten Werken entstanden sein, bitten wir um einen Hinweis an{' '}
              <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a>.
            </p>
          </Section>

          <Section heading="Weitere Dokumente">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link to="/datenschutz" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Datenschutzerklärung
                </Link>{' '}
                — wie wir mit euren Daten und denen eurer Kinder umgehen
              </li>
              <li>
                <Link to="/nutzungsbedingungen" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Nutzungsbedingungen
                </Link>{' '}
                — die Regeln für die Nutzung von Ronki
              </li>
              <li>
                Marketing-Seite:{' '}
                <a href="https://www.ronki.de/impressum" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  ronki.de/impressum
                </a>
              </li>
            </ul>
          </Section>

          <p className="text-sm text-on-surface-variant italic mt-4">
            Stand: April 2026
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-headline font-bold text-xl sm:text-2xl text-primary tracking-tight">
        {heading}
      </h2>
      <div className="text-on-surface">{children}</div>
    </section>
  );
}

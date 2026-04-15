import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

export default function Impressum() {
  return (
    <>
      <PageMeta
        title="Impressum — Ronki"
        description="Impressum und rechtliche Angaben zu Ronki."
        canonicalPath="/impressum"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <h1 className="text-4xl font-display">Impressum</h1>

          <section>
            <h2 className="text-xl font-display mb-2">Angaben gemäß § 5 TMG</h2>
            <address className="not-italic leading-relaxed">
              [Name]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </address>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Kontakt</h2>
            <p>E-Mail: <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a></p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>[Name], [Anschrift wie oben]</p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">EU-Streitschlichtung</h2>
            <p className="leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: {' '}
              <a href="https://ec.europa.eu/consumers/odr/" className="underline" target="_blank" rel="noreferrer noopener">
                https://ec.europa.eu/consumers/odr/
              </a>.
              Unsere E-Mail-Adresse findest du oben.
            </p>
            <p className="leading-relaxed mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Haftung für Inhalte</h2>
            <p className="leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

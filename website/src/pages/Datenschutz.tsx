import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

export default function Datenschutz() {
  return (
    <>
      <PageMeta
        title="Datenschutz — Ronki"
        description="Datenschutzerklärung zu Ronki — GDPR-konform, ohne Tracker."
        canonicalPath="/datenschutz"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 leading-relaxed">
          <h1 className="text-4xl font-display">Datenschutzerklärung</h1>

          <section>
            <h2 className="text-2xl font-display mb-3">Kurzfassung</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc">
              <li>Wir setzen <strong>keine Tracking-Cookies</strong>. Auch keine funktionalen Analytics.</li>
              <li>Wir speichern <strong>nur eine E-Mail-Adresse</strong> — und nur, wenn du dich auf die Warteliste einträgst.</li>
              <li>Wir schicken <strong>genau eine E-Mail</strong> — am Start-Tag. Danach ist Schluss.</li>
              <li>Daten werden <strong>in der EU</strong> gespeichert (Supabase, EU-Region).</li>
              <li>Löschung jederzeit möglich — schreib an <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">1. Verantwortlich</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist der im <a href="/impressum" className="underline">Impressum</a> genannte Betreiber.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">2. Welche Daten wir erheben</h2>
            <p className="mb-3">Wir erheben <strong>ausschließlich</strong> die E-Mail-Adresse, die du in das Warteliste-Formular einträgst — freiwillig.</p>
            <p>Darüber hinaus werden technisch erforderliche Server-Logs temporär geführt (Zugriffszeit, aufgerufene URL, HTTP-Status). Diese enthalten keine IP-Adressen in persistenter Form und werden nach 7 Tagen gelöscht.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">3. Wozu wir die E-Mail-Adresse nutzen</h2>
            <p>Wir nutzen deine E-Mail, um dich <strong>einmal</strong> zu informieren, wenn Ronki startet. Danach wird die Adresse:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc mt-2">
              <li><strong>innerhalb von 30 Tagen gelöscht</strong>, wenn du Ronki nicht nutzt, oder</li>
              <li>in deinen App-Account überführt, wenn du Ronki aktivierst (mit erneuter Einwilligung).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">4. Rechtsgrundlage</h2>
            <p>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Einwilligung ist jederzeit widerrufbar.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">5. Auftragsverarbeiter</h2>
            <p>
              Wir nutzen <strong>Supabase</strong> (Supabase Inc., EU-Region) zur Speicherung der Warteliste. Ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO liegt vor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">6. Deine Rechte</h2>
            <p className="mb-3">Du hast jederzeit das Recht auf:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc">
              <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerruf deiner Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              <li>Beschwerde bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-3">Schreib einfach an <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">7. Cookies & Tracking</h2>
            <p>Diese Website setzt <strong>keine Tracking-Cookies</strong> und keine Drittanbieter-Analytics. Deshalb gibt es auch kein Cookie-Banner.</p>
            <p className="mt-2">Einzige Ausnahme: kurzfristige Session-Cookies für das Warteliste-Formular (Rate-Limiting). Diese werden beim Schließen des Browsers automatisch gelöscht.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">8. Änderungen</h2>
            <p>
              Wenn wir diese Erklärung ändern, sagen wir's hier und datieren die Änderung. Stand: 2026-04-15.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Datenschutzerklärung für app.ronki.de
 *
 * Deckt explizit app-spezifische Datenverarbeitung ab:
 * - Google OAuth (Login)
 * - Kinder-Profile (Art. 8 DSGVO)
 * - Supabase Auth + Datenbank (EU-Region, SCC)
 * - Vercel Hosting (EU-Edge, SCC)
 * - PWA-Storage (LocalStorage, Service Worker) nach TTDSG
 */
export default function Datenschutz() {
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
          Datenschutzerklärung
        </h1>
        <p className="mt-5 text-base text-on-surface-variant leading-relaxed">
          Diese Erklärung beschreibt, wie wir in der App app.ronki.de mit personenbezogenen Daten umgehen. Sie richtet sich insbesondere an Eltern, die für ihre Kinder ein Ronki-Profil anlegen.
        </p>

        <div className="p-5 mt-8 rounded-2xl border-2 border-secondary/30 bg-secondary/5">
          <p className="text-sm font-headline font-bold text-primary mb-2">Kurz gesagt</p>
          <ul className="text-sm text-on-surface-variant space-y-1.5 leading-relaxed">
            <li>• Login per Google oder E-Mail-Magic-Link. Nur das Nötige.</li>
            <li>• Kinder-Profile werden ausschließlich von Eltern angelegt (Art. 8 DSGVO).</li>
            <li>• Alle Daten liegen in der EU (Supabase Frankfurt, Vercel Frankfurt).</li>
            <li>• Keine Werbung, keine Analytics, keine Tracker, keine Push-Nachrichten.</li>
            <li>• Löschung jederzeit per Mail an hallo@ronki.de.</li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-10 text-base leading-relaxed text-on-surface">

          <Section heading="1. Verantwortlicher">
            <address className="not-italic">
              Marc Förster<br />
              Föhringer Allee 33<br />
              85774 Unterföhring<br />
              Deutschland<br />
              E-Mail: <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a>
            </address>
            <p className="mt-3 text-sm text-on-surface-variant">
              Ein Datenschutzbeauftragter ist gesetzlich nicht erforderlich (keine Verarbeitungsskala nach Art. 37 DSGVO).
            </p>
          </Section>

          <Section heading="2. Welche Daten wir verarbeiten">
            <p className="mb-3">
              Wir verarbeiten ausschließlich Daten, die für den Betrieb der App notwendig sind. Konkret:
            </p>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">2.1 Account-Daten (Eltern)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>E-Mail-Adresse (bei Login über Google oder Magic-Link übermittelt)</li>
              <li>Name, sofern vom Google-Profil übermittelt (optional)</li>
              <li>Zeitstempel von Anmeldungen (für Session-Management)</li>
            </ul>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">2.2 Kinder-Profile (besonderer Schutz nach Art. 8 DSGVO)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Vorname (freie Eingabe, kein Nachname erforderlich)</li>
              <li>Alter des Kindes</li>
              <li>Gewählte Drachen-Farbe und Avatar-Einstellungen</li>
              <li>Zugewiesene Routinen und Quests</li>
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Kinder-Profile werden ausschließlich durch Eltern angelegt, die ihre elterliche Einwilligung durch aktives Anlegen des Profils erteilen. Kinder legen keine eigenen Accounts an.
            </p>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">2.3 Fortschritts- und Spieldaten</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Abgeschlossene Routinen und Quests</li>
              <li>Stimmungs-Einträge (Mood-Check-ins)</li>
              <li>Sterne-Stand und Companion-Entwicklung</li>
              <li>Zeitstempel der Interaktionen</li>
              <li>Journal- und Erinnerungs-Einträge</li>
            </ul>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">2.4 Technische Daten</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>IP-Adresse (nur server-seitig während eines Requests, nicht dauerhaft gespeichert)</li>
              <li>User-Agent (Browser-Kennung, nur zur Kompatibilitäts-Sicherung)</li>
              <li>Fehler-Logs (ohne personenbezogene Daten, max. 30 Tage Aufbewahrung)</li>
            </ul>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">2.5 Was wir ausdrücklich NICHT verarbeiten</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Keine Werbe-Profile, kein Retargeting</li>
              <li>Kein Google Analytics, kein Facebook-Pixel, keine Tracker</li>
              <li>Keine Audio- oder Video-Aufnahmen</li>
              <li>Keine Push-Benachrichtigungen</li>
              <li>Kein Cross-App-Tracking, keine Werbe-Identifier</li>
              <li>Keine biometrischen Daten, keine Standortdaten</li>
            </ul>
          </Section>

          <Section heading="3. Rechtsgrundlagen">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-primary">Google OAuth-Login:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktive Wahl des Login-Verfahrens).
              </li>
              <li>
                <strong className="text-primary">Vertragsdurchführung (Account + Kinder-Profil + App-Nutzung):</strong> Art. 6 Abs. 1 lit. b DSGVO. Ohne diese Daten kann die App nicht funktionieren.
              </li>
              <li>
                <strong className="text-primary">Kinder-Daten:</strong> Art. 6 Abs. 1 lit. b in Verbindung mit Art. 8 DSGVO. Einwilligung erfolgt ausschließlich durch die Erziehungsberechtigten beim Anlegen des Kinder-Profils.
              </li>
              <li>
                <strong className="text-primary">Technische Logs und IT-Sicherheit:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am stabilen, sicheren Betrieb).
              </li>
            </ul>
          </Section>

          <Section heading="4. Empfänger und Auftragsverarbeiter">
            <p className="mb-3">
              Wir setzen die folgenden Dienstleister als Auftragsverarbeiter ein. Alle mit AV-Verträgen nach Art. 28 DSGVO und, soweit relevant, Standardvertragsklauseln (SCC) nach Art. 46 Abs. 2 lit. c DSGVO.
            </p>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">4.1 Google Ireland Limited (Authentication)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Adresse: Gordon House, Barrow Street, Dublin 4, Irland</li>
              <li>Zweck: Google OAuth-Login</li>
              <li>Übermittelte Daten: E-Mail, ggf. Name, eindeutige Google-ID</li>
              <li>Datenschutz: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">policies.google.com/privacy</a></li>
              <li>Drittlandsbezug: Mutterkonzern USA; Verarbeitung in EU, SCC für USA-Übermittlung</li>
            </ul>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">4.2 Supabase (Datenbank + Authentifizierung)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Supabase Inc., 970 Toa Payoh North, Singapore 318992</li>
              <li>Zweck: Account-Management, Datenbank für Profile und Fortschritt</li>
              <li>Region: EU (Frankfurt am Main)</li>
              <li>Datenschutz: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">supabase.com/privacy</a></li>
              <li>Drittlandsbezug: US-Muttergesellschaft; SCC abgeschlossen</li>
            </ul>

            <h3 className="font-headline font-bold text-lg text-primary mt-5 mb-2">4.3 Vercel (Hosting)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
              <li>Zweck: Bereitstellung der App über das Web</li>
              <li>Region: EU-Edge (Frankfurt)</li>
              <li>Datenschutz: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">vercel.com/legal/privacy-policy</a></li>
              <li>Drittlandsbezug: US-Unternehmen; SCC abgeschlossen</li>
            </ul>
          </Section>

          <Section heading="5. Drittlandsübermittlung">
            <p>
              Einige unserer Auftragsverarbeiter (Google, Supabase, Vercel) haben Muttergesellschaften in den USA. Die Datenverarbeitung findet jedoch primär innerhalb der EU statt (Frankfurt, Dublin). Für den Fall, dass Daten in die USA übermittelt werden (z. B. für Konzern-interne Verwaltung), schließen wir Standardvertragsklauseln (SCC) nach Art. 46 Abs. 2 lit. c DSGVO ab.
            </p>
            <p className="mt-3">
              Nach dem Schrems-II-Urteil des EuGH bleibt ein Restrisiko, dass US-Behörden auf diese Daten zugreifen könnten. Wir minimieren diesen Risiko durch EU-Regionsauswahl, Datensparsamkeit und Wahl von EU-regulierten Tochtergesellschaften, wo möglich.
            </p>
          </Section>

          <Section heading="6. Lokale Speicherung auf eurem Gerät (TTDSG)">
            <p className="mb-3">
              Die App nutzt ausschließlich technisch notwendige lokale Speicher, keine Tracking-Cookies. Im Einzelnen:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-primary">LocalStorage:</strong> Session-Token (Supabase Auth), Spiel-State-Cache für Offline-Nutzung, UI-Präferenzen</li>
              <li><strong className="text-primary">Service Worker:</strong> App-Code und Assets für PWA-Offline-Modus</li>
              <li><strong className="text-primary">IndexedDB:</strong> Auth-State (durch Supabase Auth verwaltet)</li>
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Alle diese Speicher sind für die Funktion der App zwingend notwendig (§ 25 Abs. 2 Nr. 2 TTDSG). Eine gesonderte Einwilligung ist daher nicht erforderlich. Keine Third-Party-Cookies, keine Werbe-Tracker.
            </p>
          </Section>

          <Section heading="7. Speicherdauer">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-primary">Aktive Accounts:</strong> bis zur aktiven Löschung durch den Nutzer.
              </li>
              <li>
                <strong className="text-primary">Inaktive Accounts</strong> (keine Anmeldung über 24 Monate): geplante automatische Anonymisierung. Benachrichtigung 30 Tage vorher per E-Mail.
              </li>
              <li>
                <strong className="text-primary">Kinder-Daten:</strong> werden gelöscht, sobald der Elternteil das Kinderprofil oder den gesamten Account löscht. Löschung erfolgt in der Regel innerhalb von 72 Stunden.
              </li>
              <li>
                <strong className="text-primary">Fehler-Logs:</strong> maximal 30 Tage.
              </li>
              <li>
                <strong className="text-primary">Gesetzliche Aufbewahrungspflichten</strong> (z. B. Steuerrecht) bleiben davon unberührt, soweit einschlägig.
              </li>
            </ul>
          </Section>

          <Section heading="8. Eure Rechte (Art. 15-22 DSGVO)">
            <p className="mb-3">Ihr habt jederzeit die folgenden Rechte:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p className="mt-4">
              Anfragen richtet ihr formlos an{' '}
              <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a>. Wir antworten innerhalb von 30 Tagen, in der Regel deutlich schneller.
            </p>
          </Section>

          <Section heading="9. Löschung von Kinder-Daten (Art. 8 DSGVO)">
            <p>
              Als Elternteil könnt ihr jederzeit:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>ein einzelnes Kinderprofil direkt in der App löschen</li>
              <li>den gesamten Account mitsamt allen Profilen per E-Mail löschen lassen</li>
              <li>eine Kopie der gespeicherten Daten anfordern (DSGVO-Datenexport)</li>
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Für Löschungsanfragen, die Kinder-Daten betreffen, antworten wir priorisiert innerhalb von 72 Stunden.
            </p>
          </Section>

          <Section heading="10. Beschwerderecht bei der Aufsichtsbehörde">
            <p>
              Ihr habt das Recht, euch bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren:
            </p>
            <address className="not-italic mt-3">
              Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
              Promenade 18<br />
              91522 Ansbach<br />
              Telefon: +49 981 180093-0<br />
              <a href="https://www.lda.bayern.de/" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">www.lda.bayern.de</a>
            </address>
          </Section>

          <Section heading="11. Keine automatisierte Entscheidungsfindung">
            <p>
              Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO findet nicht statt. Die App trifft keine Entscheidungen über Nutzer, die diesen gegenüber rechtliche Wirkung entfalten oder sie in ähnlicher Weise erheblich beeinträchtigen.
            </p>
          </Section>

          <Section heading="12. Änderungen dieser Erklärung">
            <p>
              Wir aktualisieren diese Erklärung, sobald sich relevante Aspekte ändern (neue Funktionen, neue Dienstleister). Wesentliche Änderungen kommunizieren wir per E-Mail an registrierte Nutzer, mindestens 30 Tage vor Inkrafttreten.
            </p>
          </Section>

          <Section heading="13. Weitere Dokumente">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link to="/impressum" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Impressum der App
                </Link>
              </li>
              <li>
                <Link to="/nutzungsbedingungen" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Nutzungsbedingungen
                </Link>
              </li>
              <li>
                Datenschutzerklärung der Marketing-Seite:{' '}
                <a href="https://www.ronki.de/datenschutz" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  ronki.de/datenschutz
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
    <section className="flex flex-col">
      <h2 className="font-headline font-bold text-xl sm:text-2xl text-primary tracking-tight mb-3">
        {heading}
      </h2>
      <div className="text-on-surface">{children}</div>
    </section>
  );
}

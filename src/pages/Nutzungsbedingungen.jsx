import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Nutzungsbedingungen für app.ronki.de
 *
 * BGB-konforme Digital-Dienst-Klauseln 2022+. Kardinalspflichten-
 * Haftungsregelung wie im Marketing-AGB. Explizite Alpha-Kennzeichnung.
 */
export default function Nutzungsbedingungen() {
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
          Nutzungsbedingungen
        </h1>
        <p className="mt-5 text-base text-on-surface-variant leading-relaxed">
          Diese Bedingungen regeln die Nutzung der App app.ronki.de. Wir halten sie so kurz und verständlich wie möglich.
        </p>

        <div className="p-5 mt-8 rounded-2xl border-2 border-secondary/30 bg-secondary/5">
          <p className="text-sm font-headline font-bold text-primary mb-2">Kurz gesagt</p>
          <ul className="text-sm text-on-surface-variant space-y-1.5 leading-relaxed">
            <li>• Ronki ist aktuell kostenlos, in früher Alpha. Dinge können brechen.</li>
            <li>• Accounts sind ausschließlich für Eltern oder Erziehungsberechtigte.</li>
            <li>• Keine Werbung, keine In-App-Käufe, keine Weiterverteilung.</li>
            <li>• Kündigung jederzeit per E-Mail, keine Fristen.</li>
            <li>• Wir haften nur für Vorsatz, grobe Fahrlässigkeit und Kardinalspflichten.</li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-10 text-base leading-relaxed text-on-surface">

          <Section heading="§ 1 Geltungsbereich und Anbieter">
            <p>
              Diese Nutzungsbedingungen regeln das Vertragsverhältnis zwischen dir als Nutzer und dem Anbieter der App Ronki.
            </p>
            <p className="mt-3">Anbieter:</p>
            <address className="not-italic mt-2">
              Marc Förster<br />
              Föhringer Allee 33<br />
              85774 Unterföhring<br />
              E-Mail: <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a>
            </address>
            <p className="mt-3">
              Vollständige Anbieterdaten findest du im{' '}
              <Link to="/impressum" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                Impressum
              </Link>.
            </p>
          </Section>

          <Section heading="§ 2 Zielgruppe und Altersgrenzen">
            <p>
              Ronki ist inhaltlich für Kinder im Alter von 5 bis 9 Jahren konzipiert. Accounts dürfen jedoch ausschließlich von Eltern oder Erziehungsberechtigten angelegt und verwaltet werden.
            </p>
            <p className="mt-3">
              Kinder selbst legen keine Accounts an. Das Kinderprofil wird von den Eltern erstellt und bleibt unter deren Verantwortung. Dies erfüllt Art. 8 DSGVO (Einwilligung eines Kindes in Bezug auf Dienste der Informationsgesellschaft).
            </p>
          </Section>

          <Section heading="§ 3 Zustandekommen des Vertrags">
            <p>
              Der Nutzungsvertrag kommt durch deine Registrierung oder ersten Login via Google zustande. Mit dem Login bestätigst du, dass du diese Nutzungsbedingungen und die{' '}
              <Link to="/datenschutz" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                Datenschutzerklärung
              </Link>{' '}
              zur Kenntnis genommen hast.
            </p>
          </Section>

          <Section heading="§ 4 Alpha- und Beta-Status">
            <p>
              Ronki befindet sich derzeit in einer frühen Entwicklungsphase. Das bedeutet konkret:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Funktionen können sich jederzeit ändern oder entfernt werden.</li>
              <li>Einzelne Features können temporär nicht funktionieren.</li>
              <li>Es gibt keine garantierte Verfügbarkeit und keine Service-Level-Zusage.</li>
              <li>Daten können im Rahmen von Updates verloren gehen. Wir geben unser Bestes, das zu vermeiden, können es aber nicht ausschließen.</li>
            </ul>
            <p className="mt-3">
              Du akzeptierst mit der Nutzung der App diesen Alpha-Zustand ausdrücklich.
            </p>
          </Section>

          <Section heading="§ 5 Kosten und Preise">
            <p>
              Die Nutzung von Ronki ist derzeit kostenlos. Sollten wir zukünftig kostenpflichtige Funktionen einführen (z. B. ein Familien-Abo), gilt:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Ankündigung per E-Mail mindestens 30 Tage vor Inkrafttreten</li>
              <li>Keine automatische Umstellung bestehender Nutzer auf kostenpflichtige Funktionen</li>
              <li>Transparenter Preis, keine versteckten Kosten</li>
              <li>Keine In-App-Käufe, keine Lootboxen, keine Werbung, jetzt und auch später nicht</li>
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Freiwillige Unterstützung ist über Ko-fi möglich:{' '}
              <a href="https://ko-fi.com/ronkiapp" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                ko-fi.com/ronkiapp
              </a>.
            </p>
          </Section>

          <Section heading="§ 6 Nutzungsumfang und Einschränkungen">
            <p>
              Wir räumen dir ein nicht-übertragbares, widerrufliches Recht zur persönlichen, nicht-kommerziellen Nutzung der App ein. Nicht erlaubt sind insbesondere:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Weitergabe deines Accounts an Dritte</li>
              <li>Automatisierter Zugriff (Bots, Scraper)</li>
              <li>Umgehung technischer Schutzmaßnahmen</li>
              <li>Reverse Engineering oder Dekompilierung, soweit gesetzlich unzulässig</li>
              <li>Kommerzielle Nachnutzung von App-Inhalten ohne schriftliche Erlaubnis</li>
            </ul>
            <p className="mt-3">
              Bei wiederholtem oder schwerem Missbrauch können wir den Account sperren. Vor einer Sperrung werden wir dich, soweit möglich, per E-Mail darüber informieren.
            </p>
          </Section>

          <Section heading="§ 7 Geistiges Eigentum">
            <p>
              Sämtliche Inhalte der App (Code, Design, Texte, Sound, Drachen-Artwork) sind urheberrechtlich geschützt oder durch eigene schöpferische Bearbeitung bearbeitet. Die Rechte liegen beim Anbieter.
            </p>
            <p className="mt-3">
              Das Nutzungsrecht ist auf die persönliche Nutzung der App beschränkt. KI-generierte Bilder sind als solche im{' '}
              <Link to="/impressum" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                Impressum
              </Link>{' '}
              offengelegt.
            </p>
          </Section>

          <Section heading="§ 8 Haftung">
            <p>
              Wir haften nach den gesetzlichen Bestimmungen:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-primary">Unbeschränkt</strong> bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit, sowie nach dem Produkthaftungsgesetz.
              </li>
              <li>
                <strong className="text-primary">Bei leichter Fahrlässigkeit</strong> nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalspflicht), deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Vertragspartner regelmäßig vertraut. In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
              </li>
              <li>
                <strong className="text-primary">Im Übrigen ausgeschlossen</strong> ist die Haftung für einfache Fahrlässigkeit, insbesondere für entgangenen Gewinn, mittelbare Schäden und Folgeschäden.
              </li>
              <li>
                <strong className="text-primary">Keine Haftung</strong> für Datenverlust im Alpha-Stand, außer bei Vorsatz oder grober Fahrlässigkeit.
              </li>
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Die verschuldensunabhängige Haftung nach § 536a Abs. 1 BGB für anfängliche Mängel ist ausgeschlossen.
            </p>
          </Section>

          <Section heading="§ 9 Kündigung und Account-Löschung">
            <p>
              Du kannst den Vertrag jederzeit kündigen, ohne Einhaltung einer Frist, durch:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Löschung deines Accounts in den App-Einstellungen</li>
              <li>E-Mail an <a href="mailto:hallo@ronki.de" className="underline decoration-secondary underline-offset-4 hover:text-primary">hallo@ronki.de</a> mit Betreff „Kontolöschung"</li>
            </ul>
            <p className="mt-3">
              Nach der Kündigung werden deine personenbezogenen Daten und die Daten der angelegten Kinderprofile gemäß unserer{' '}
              <Link to="/datenschutz" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                Datenschutzerklärung
              </Link>{' '}
              gelöscht, soweit keine gesetzliche Aufbewahrungspflicht besteht.
            </p>
            <p className="mt-3">
              Wir können den Vertrag ebenfalls mit einer Frist von 30 Tagen per E-Mail kündigen. Das außerordentliche Kündigungsrecht bleibt unberührt.
            </p>
          </Section>

          <Section heading="§ 10 Änderungen der Nutzungsbedingungen">
            <p>
              Wir können diese Nutzungsbedingungen anpassen, insbesondere wenn sich Funktionen der App, eingesetzte Dienstleister oder gesetzliche Anforderungen ändern.
            </p>
            <p className="mt-3">
              Wesentliche Änderungen kommunizieren wir mindestens 30 Tage vor Inkrafttreten per E-Mail. Du hast das Recht, den Änderungen innerhalb dieser Frist zu widersprechen. Widersprichst du, können wir den Vertrag zum Zeitpunkt des Inkrafttretens der Änderungen kündigen. Ohne Widerspruch gelten die Änderungen als akzeptiert, worauf wir in der Änderungsmitteilung ausdrücklich hinweisen.
            </p>
          </Section>

          <Section heading="§ 11 Streitbeilegung">
            <p>
              Europäische Online-Streitbeilegung nach Art. 14 Abs. 1 ODR-VO:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary break-words">
                ec.europa.eu/consumers/odr
              </a>.
            </p>
            <p className="mt-3">
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
            </p>
          </Section>

          <Section heading="§ 12 Anwendbares Recht und Gerichtsstand">
            <p>
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG). Gegenüber Verbrauchern gilt diese Rechtswahl nur insoweit, als dadurch der durch zwingende Bestimmungen des Rechts des Staates des gewöhnlichen Aufenthaltes des Verbrauchers gewährte Schutz nicht entzogen wird.
            </p>
            <p className="mt-3">
              Gerichtsstand ist, soweit zulässig, München. Für Verbraucher bleibt der Verbrauchergerichtsstand unberührt.
            </p>
          </Section>

          <Section heading="§ 13 Schlussbestimmungen">
            <p>
              Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam oder undurchführbar sein, wird die Wirksamkeit der übrigen Bestimmungen nicht berührt.
            </p>
          </Section>

          <Section heading="Weitere Dokumente">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link to="/impressum" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                Marketing-Seite AGB:{' '}
                <a href="https://www.ronki.de/agb" target="_blank" rel="noopener noreferrer" className="underline decoration-secondary underline-offset-4 hover:text-primary">
                  ronki.de/agb
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

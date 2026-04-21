import { PosterShell } from '../components/PosterShell';

/**
 * Kinderarzt-Variante: Wartezimmer-Setting, reflektive Eltern, die über
 * Entwicklung nachdenken. Quiet Sage-Palette, forschungsorientiertes
 * Wording, dragon-baby als sanfter Anker.
 */
export default function PrintA4PosterKinderarzt() {
  return (
    <PosterShell
      config={{
        theme: 'quiet',
        eyebrow: 'Für Eltern im Wartezimmer',
        headline: (
          <>
            Routinen sind keine Disziplin.
            <br />
            <em>Sie sind Entwicklung.</em>
          </>
        ),
        subline: 'Was Kinder zwischen 5 und 9 brauchen, um ihren Alltag allein zu meistern.',
        body: (
          <>
            <p>Die Fähigkeit, mehrere Aufgaben in Folge selbstständig zu erledigen, reift erst im Grundschulalter voll aus.</p>
            <p>Bis dahin hilft Sichtbarkeit: Bilder, die zeigen, was als Nächstes kommt, und die das Kind selbst abhakt.</p>
            <p>Sichtbar machen, dann leiser werden. Genau so haben wir Ronki gebaut.</p>
          </>
        ),
        heroSrc: '/art/flyer/family-kitchen.png',
        heroAlt: 'Malerische Küchen-Szene: Elternteil liest am Tisch, kleines Kind sitzt daneben, ein warmer Drache dazwischen.',
        phoneMockup: {
          variant: 'mood-grid',
          caption: 'Jeder Tag ein kleines Kapitel.',
        },
        qrPath: '/wissenschaft',
        ctaHeading: 'Forschung dahinter:',
        ctaBridge: <>Oder gleich ausprobieren: <strong>app.ronki.de</strong></>,
        steps: [
          { content: <><strong>Selbstbestimmung</strong> · Deci &amp; Ryan</> },
          { content: <><strong>Vorbereitete Umgebung</strong> · Montessori</> },
          { content: <><strong>Fading Scaffolding</strong> · Vygotsky / ZPD</> },
        ],
        footer: 'Marc Förster · Unterföhring · ronki.de/wissenschaft · hallo@ronki.de',
      }}
    />
  );
}

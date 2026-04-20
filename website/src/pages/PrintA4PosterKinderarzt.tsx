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
            Routinen sind keine Disziplin.{' '}
            <em>Sie sind Entwicklung.</em>
          </>
        ),
        subline: 'Was Kinder zwischen 5 und 9 brauchen, um ihren Alltag allein zu meistern.',
        body: (
          <>
            Die Fähigkeit, drei bis vier Aufgaben hintereinander selbstständig zu erledigen, entwickelt sich erst zwischen sieben und zehn Jahren. Bis dahin hilft Sichtbarkeit: eine einfache, bildbasierte Reihenfolge, die das Kind selbst abarbeiten kann. <em>Fading Scaffolding</em>. Genau so ist Ronki gebaut.
          </>
        ),
        heroSrc: '/art/companion/dragon-baby.webp',
        heroAlt: 'Kleiner freundlicher Drache, Begleiter für Grundschulkinder.',
        phoneScreenshot: {
          src: '/art/app/aufgaben-uebersicht.png',
          caption: 'Der Tag als sichtbare Abfolge.',
        },
        qrPath: '/wissenschaft',
        ctaHeading: 'Forschung, Quellen und Praxis:',
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

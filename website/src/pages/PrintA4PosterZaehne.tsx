import { PosterShell } from '../components/PosterShell';

/**
 * Zähneputz-Variante: universeller Parent-Pain, funktioniert in vielen
 * Kontexten (Kita, Bäckerei, Bibliothek). Sehr konkret, cool-mint Palette,
 * brushing-teeth-Hero als direkter Visual-Match.
 */
export default function PrintA4PosterZaehne() {
  return (
    <PosterShell
      config={{
        theme: 'cool',
        eyebrow: 'Das tägliche Zähneputz-Drama',
        headline: (
          <>
            Keine 14 Ermahnungen bis zur{' '}
            <em>Zahnbürste</em>.
          </>
        ),
        subline: 'Morgens und abends. Zwei Minuten. Mit Drache statt Diskussion.',
        body: (
          <>
            Zähneputzen ist einer der Top-drei-Reibungspunkte in Grundschulfamilien. Ronki zeigt deinem Kind, wann Zähne dran sind, baut einen sichtbaren Timer ein und macht die Abfolge zur Gewohnheit statt zum Kampf. Kein Sticker-Belohnungs-Zirkus, kein Streak, kein Druck.
          </>
        ),
        heroSrc: '/art/routines/brushing-teeth.webp',
        heroAlt: 'Malerische Badezimmer-Szene: Kind putzt Zähne mit Drachen-Begleiter.',
        phoneScreenshot: {
          src: '/art/app/morgen-quests.png',
          caption: 'Zähne putzen, eingebettet in die Routine.',
        },
        ctaHeading: 'So läuft euer erster Abend:',
        steps: [
          { content: <><strong>app.ronki.de</strong> auf dem Familien-Tablet öffnen</> },
          { content: <>Routine <strong>„Abend"</strong> einrichten, Zähne fest eingebaut</> },
          { content: <>Drache begleitet die zwei Minuten, dein Kind putzt selbst</> },
        ],
        footer: 'Gebaut in Unterföhring von Marc Förster und seinem Sohn Louis, 7 · hallo@ronki.de',
      }}
    />
  );
}

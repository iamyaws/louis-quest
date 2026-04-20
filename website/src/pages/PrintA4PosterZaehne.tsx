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
            Zähne putzen,{' '}
            <em>ohne dreimal bitten</em>.
          </>
        ),
        subline: 'Morgens und abends. Zwei Minuten. Mit Drache statt Dauerbeschallung.',
        body: (
          <>
            Zähneputzen ist in den meisten Familien eine tägliche Verhandlung. Ronki zeigt deinem Kind, wann Zähne dran sind, baut einen sichtbaren Timer ein und macht die Abfolge zur Gewohnheit statt zum Kampf. Kein Sticker-Zirkus. Kein Streak. Kein Druck.
          </>
        ),
        heroSrc: '/art/flyer/bathroom-teeth.png',
        heroAlt: 'Malerische Familien-Badezimmer-Szene: Kind putzt Zähne, Drache am Waschbecken daneben.',
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

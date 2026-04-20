import { PosterShell } from '../components/PosterShell';

/**
 * Bäckerei-Variante: Eltern, die morgens schnell Brötchen holen und entweder
 * gerade aus dem Morgen-Chaos kommen oder direkt reinmüssen. Warme Morgen-
 * Palette, Getting-Ready-Hero, knackige Schalt-Sätze.
 */
export default function PrintA4PosterBaeckerei() {
  return (
    <PosterShell
      config={{
        theme: 'morning',
        eyebrow: 'Für Eltern, die morgens Brötchen holen',
        headline: (
          <>
            „Zähne putzen!" <em>14 Mal</em> oder <em>einmal</em>.
          </>
        ),
        subline: 'Ronki zeigt deinem Kind, was morgens als Nächstes dran ist.',
        body: (
          <>
            Socken, T-Shirt, Zähne, Frühstück, Ranzen, los. Für dich ist das Autopilot. Für ein Sechsjähriges sind es acht Entscheidungen vor acht Uhr. Ronki macht die Reihenfolge sichtbar. Dein Kind übernimmt das Tempo.
          </>
        ),
        heroSrc: '/art/flyer/morning-sleepy.png',
        heroAlt: 'Malerische Morgenszene: Sechsjähriges Kind im Schlafanzug sitzt auf dem Boden und starrt eine Socke an.',
        phoneScreenshot: {
          src: '/art/app/morgen-quests.png',
          caption: 'Morgen-Quests, eine nach der anderen.',
        },
        ctaHeading: 'Heute Abend einrichten, morgen früh testen:',
        steps: [
          { content: <><strong>app.ronki.de</strong> öffnen (iPhone: Safari, Android: Chrome)</> },
          { content: <>„Zum Home-Bildschirm" / „Installieren" antippen</> },
          { content: <>Routine <strong>„Morgen"</strong> wählen und mit deinem Kind durchgehen</> },
        ],
        footer: 'Aus Unterföhring · Marc Förster mit seinem Sohn Louis, 7 · hallo@ronki.de',
      }}
    />
  );
}

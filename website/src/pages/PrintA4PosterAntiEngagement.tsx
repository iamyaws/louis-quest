import { PosterShell } from '../components/PosterShell';

/**
 * Anti-Engagement-Variante: der Gamer-Vater-Angle für Eltern, die von Roblox/
 * TikTok/Fortnite-Mechaniken genervt sind. Bold dark-teal Palette,
 * dragon-majestic als starker Anker. Spiky-founder-Voice.
 */
export default function PrintA4PosterAntiEngagement() {
  return (
    <PosterShell
      config={{
        theme: 'bold',
        eyebrow: 'Für Eltern, die Roblox satt haben',
        headline: (
          <>
            Andere Apps wollen <em>wiederkommen</em>.
            <br />
            Ronki will <em>überflüssig werden</em>.
          </>
        ),
        subline: 'Ein Drachen-Gefährte, gegen den Zeitgeist gebaut.',
        body: (
          <>
            Keine Streaks, die reißen. Keine Loot-Boxes. Keine Push-Benachrichtigungen. Keine „Dein Freund war gerade online"-Karten. Wenn dein Kind nach zwei Monaten den Drachen fast nicht mehr braucht, haben wir unseren Job gemacht. Als Gamer-Vater gesagt: <em>schlechtes Engagement-Metric, gutes Erziehungs-Metric</em>.
          </>
        ),
        heroSrc: '/art/companion/dragon-majestic.webp',
        heroAlt: 'Imposanter, freundlicher Drache: Gegenentwurf zu aggressiven Kinder-Apps.',
        phoneScreenshot: {
          src: '/art/app/aufgaben-uebersicht.png',
          caption: 'Kein Streak, kein Loot. Nur was dran ist.',
        },
        ctaHeading: 'So probiert ihr Ronki heute aus:',
        steps: [
          { content: <><strong>app.ronki.de</strong> im Browser öffnen</> },
          { content: <>Auf Startbildschirm legen, Elternprofil anlegen</> },
          { content: <>Eine Routine wählen, mit deinem Kind einrichten</> },
        ],
        footer: 'Gebaut in Unterföhring · Marc Förster mit seinem Sohn Louis, 7 · hallo@ronki.de',
      }}
    />
  );
}

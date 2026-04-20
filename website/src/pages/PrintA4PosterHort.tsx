import { PosterShell } from '../components/PosterShell';

/**
 * Hort-Variante: Eltern, die nach 17 Uhr abholen kommen und direkt in den
 * Abendroutine-Marathon reingehen. Abend-Palette, Sternenmeer-Hero.
 */
export default function PrintA4PosterHort() {
  return (
    <PosterShell
      config={{
        theme: 'evening',
        eyebrow: 'Für Eltern, die nach 17 Uhr abholen',
        headline: (
          <>
            Abends zuhause ist ein{' '}
            <em>halber Marathon</em>.
          </>
        ),
        subline: 'Ronki legt ihn für dein Kind sichtbar hin.',
        body: (
          <>
            Hausaufgaben, Abendessen, Baden, Zähne, Schlafanzug, Vorlesen, Licht aus. Immer gleich, jeden Abend, oft auf einmal zu viel für ein Grundschulkind. Ronki zeigt die Reihenfolge, dein Kind hakt selbst ab. Kein App-Store, keine Werbung, keine Streaks.
          </>
        ),
        heroSrc: '/art/bioms/Sternenmeer_sea-of-stars.webp',
        heroAlt: 'Malerischer Sternenhimmel: ruhiger Übergang in den Abend.',
        phoneScreenshot: {
          src: '/art/app/aufgaben-uebersicht.png',
          caption: 'So sieht ein Tag in der App aus.',
        },
        ctaHeading: 'So startet ihr heute Abend:',
        steps: [
          { content: <><strong>app.ronki.de</strong> auf dem Handy oder Tablet öffnen</> },
          { content: <>Einmal auf den <strong>Startbildschirm</strong> legen</> },
          { content: <>Routine <strong>„Abend"</strong> einrichten, einmal gemeinsam durchgehen</> },
        ],
        footer: 'Gebaut in Unterföhring · Marc Förster mit seinem Sohn Louis, 7 · hallo@ronki.de',
      }}
    />
  );
}

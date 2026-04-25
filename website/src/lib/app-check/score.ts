/**
 * Score-band logic for the Dark Pattern Scanner result page.
 *
 * Three bands. The wording always frames the assessment as the parent's
 * view, never as a Ronki claim about the app. Severity is communicated
 * primarily through the density and specificity of the actions list per
 * band, not through color alarm. Colors used are sage, mustard-soft, and
 * teal-dark — all from the defined token set in globals.css. We
 * deliberately avoid red/clay-style danger colors per DESIGN.md (the
 * tool is not a verdict, it's a parent's observation summary).
 */

export type ScoreBand = 'ruhig' | 'hingucken' | 'viel-los';

export interface ScoreBandDef {
  key: ScoreBand;
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
  label: string;
  /** Tailwind-token bundle for the band card. */
  tone: 'sage' | 'mustard' | 'serious';
  /** One-paragraph human-readable summary of what the band means. */
  summary: string;
}

export const SCORE_BANDS: ScoreBandDef[] = [
  {
    key: 'ruhig',
    min: 0,
    max: 2,
    label: 'Aus deiner Sicht: relativ ruhig',
    tone: 'sage',
    summary:
      'Aus deinen Antworten ergeben sich nur wenige Pattern, die Kindern unter neun problematisch werden können. Achte trotzdem auf Zeitrahmen und schau die ersten Wochen genauer hin, gerade in der Anfangszeit.',
  },
  {
    key: 'hingucken',
    min: 3,
    max: 5,
    label: 'Aus deiner Sicht: hingucken und begleiten',
    tone: 'mustard',
    summary:
      'Aus deinen Antworten ergeben sich mehrere Pattern, die Kinder unter neun überfordern können. Setz klare Zeitlimits, schau die ersten Sessions zusammen mit deinem Kind, und prüf ob ihr Push und Werbung systemweit ausschalten könnt.',
  },
  {
    key: 'viel-los',
    min: 6,
    max: 10,
    label: 'Aus deiner Sicht: hier ist viel los',
    tone: 'serious',
    summary:
      'Aus deinen Antworten ergeben sich viele Pattern, die typisch für retentions-optimierte Apps sind. Das heißt nicht "verbieten". Es heißt: bewusst nutzen, klare Zeitlimits, elterliche Begleitung, und einen vorab überlegten Punkt an dem ihr die App wieder löscht falls sie in eurem Alltag kippt.',
  },
];

export function bandForScore(score: number): ScoreBandDef {
  return (
    SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORE_BANDS[0]
  );
}

/**
 * Action lists per band. Each entry is a concrete thing a parent can do
 * tonight. Voice is parent-empowering, not app-condemning. Severity is
 * encoded in the list's length and specificity, not in alarm copy.
 *
 * High-band (viel-los) entries deliberately reference the parent's own
 * answers ("Falls du Push beobachtet hast..."), so the action sticks
 * to what was actually flagged.
 */
export interface BandAction {
  title: string;
  detail: string;
  /** Optional: only show this action if the named question was flagged. */
  onlyIfFlagged?: 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10';
}

export const BAND_ACTIONS: Record<ScoreBand, { intro: string; items: BandAction[] }> = {
  ruhig: {
    intro:
      'Wenig akute Pattern. Das sind drei Dinge die trotzdem den Unterschied machen, gerade in den ersten Wochen.',
    items: [
      {
        title: 'Erste Sessions zusammen',
        detail:
          'Setz dich die ersten zwei oder drei Male einfach daneben und schau zu. Du siehst sofort wo dein Kind hängt, wo es Frust gibt, wo Werbung kommt.',
      },
      {
        title: 'Auf Reaktionen achten',
        detail:
          'Wirkt dein Kind nach der Session ruhig oder gereizt? Will es die App freiwillig schließen oder reagiert es schwer wenn du es bittest aufzuhören? Das verrät mehr als jeder Score.',
      },
      {
        title: 'In vier bis sechs Wochen wieder prüfen',
        detail:
          'Apps verändern sich. Ein neues Update kann Streaks oder Werbung einführen die heute noch nicht da sind. Speicher diese Bewertung und nimm sie in einem Monat nochmal vor.',
      },
    ],
  },
  hingucken: {
    intro:
      'Mittlere Pattern-Dichte. Hier reichen ein paar gezielte Schritte um die App in einen sicheren Rahmen zu setzen.',
    items: [
      {
        title: 'Push-Benachrichtigungen ausschalten',
        detail:
          'In den Geräte-Einstellungen unter Mitteilungen → diese App → Push aus. Macht die App schwächer beim Zurückholen, ohne dass dein Kind etwas merkt.',
        onlyIfFlagged: 'q2',
      },
      {
        title: 'Sichtbares Zeitlimit als Rahmen',
        detail:
          'Eine konkrete Zahl, gemeinsam mit deinem Kind festgelegt: zum Beispiel 30 Minuten am Tag, mit Wecker oder Bildschirmzeit-Limit. Nicht als Strafe, als Spielregel.',
      },
      {
        title: 'Erste drei Sessions begleiten',
        detail:
          'Setz dich daneben, frag was passiert, lass dir erklären was die einzelnen Buttons bedeuten. Du verstehst die App besser, dein Kind merkt dass du dabei bist.',
      },
      {
        title: 'Werbung gemeinsam dekodieren',
        detail:
          'Wenn ihr eine spielbare Werbung seht: kurz pausieren, mit dem Kind besprechen was da gerade passiert. Das macht Werbung sichtbar und entzieht ihr die Macht.',
        onlyIfFlagged: 'q5',
      },
      {
        title: 'Cosmetics-Regel im Haushalt',
        detail:
          'Vorab klar: kein Echtgeld für Skins, Charaktere oder Coins. Wir holen Coole Sachen durch Spielen oder gar nicht. Einmal entschieden, dann durchhalten.',
        onlyIfFlagged: 'q4',
      },
    ],
  },
  'viel-los': {
    intro:
      'Viele Pattern. Das heißt nicht "App löschen". Es heißt eng begleiten und einen klaren Rahmen setzen, gleich am Anfang.',
    items: [
      {
        title: 'Push und In-App-Notifications komplett aus',
        detail:
          'Geräte-Einstellungen → Mitteilungen → diese App → alles aus. Innerhalb der App falls möglich auch jede Maskottchen-Erinnerung deaktivieren. Damit verliert die App ihren stärksten Hebel um euer Kind zurückzuziehen.',
        onlyIfFlagged: 'q2',
      },
      {
        title: 'Zeitlimit als sichtbarer Rahmen',
        detail:
          '20 bis 30 Minuten am Tag, mit Bildschirmzeit-Limit oder physischem Wecker. Wichtig: vorher mit deinem Kind besprechen warum, nicht plötzlich verkünden.',
      },
      {
        title: 'Erste fünf Sessions Co-Play',
        detail:
          'Du sitzt daneben und spielst aktiv mit. Du siehst genau wo dein Kind frustriert wird, wo Werbung anspringt, wo Cosmetics gepushed werden. Diese fünf Sessions sind eure gemeinsame Forschung.',
      },
      {
        title: 'Eine Pause-Woche vorschlagen',
        detail:
          'Nach den ersten Wochen: Vorschlag an dein Kind die App eine Woche zu pausieren. Schauen ob es die App vermisst oder den Inhalt. Falls nur die App-Mechanik fehlt, ist das ein wichtiger Hinweis.',
      },
      {
        title: 'Konversation über App-Design',
        detail:
          'Erklärung in einfachen Worten: viele Apps sind so gebaut, dass du nicht von selbst aufhörst. Erwachsene haben das so entworfen, weil viele dieser Apps Geld verdienen, je länger du dabei bleibst. Das ist nicht deine Schuld wenn du nicht aufhören kannst.',
        onlyIfFlagged: 'q8',
      },
      {
        title: 'Cosmetics-Regel klar machen',
        detail:
          'Kein Echtgeld für Skins, Coins, Charaktere. Punkt. Wenn dein Kind nach Geld fragt: das ist genau das was die App erzeugen soll. Den Frust gemeinsam aushalten ist Teil des Lernens.',
        onlyIfFlagged: 'q4',
      },
      {
        title: 'Vorab überlegen wann die App geht',
        detail:
          'Definiert gemeinsam ein Stop-Signal: zum Beispiel "wenn du dreimal weinst weil du sie zumachen sollst, ist die App eine Woche weg". Das hilft beiden Seiten wenn der Moment kommt.',
      },
      {
        title: 'In zwei Wochen wieder hier prüfen',
        detail:
          'Speicher diese Bewertung. Mach das gleiche in zwei Wochen nochmal. Hat sich was verbessert weil ihr Push abgeschaltet habt? Hat sich was verschlechtert? Der Vergleich ist Gold wert.',
      },
    ],
  },
};

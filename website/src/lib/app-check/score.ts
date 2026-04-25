/**
 * Score-band logic for the Dark Pattern Scanner result page.
 *
 * Three bands map to the three brand accent colors. The wording always
 * frames the assessment as the parent's view ("Aus deiner Sicht ..."),
 * never as a Ronki claim about the app.
 */

export type ScoreBand = 'eher-unbedenklich' | 'aufmerksamkeit' | 'vorsichtig';

export interface ScoreBandDef {
  key: ScoreBand;
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
  label: string;
  /** Tailwind color token to use for the visual band. */
  colorToken: 'sage' | 'mustard' | 'clay';
  /** One-paragraph human-readable summary of what the band means. */
  summary: string;
}

export const SCORE_BANDS: ScoreBandDef[] = [
  {
    key: 'eher-unbedenklich',
    min: 0,
    max: 2,
    label: 'Aus deiner Sicht eher unbedenklich',
    colorToken: 'sage',
    summary:
      'Aus deinen Antworten ergeben sich nur wenige Pattern, die Kindern unter neun problematisch werden können. Achte trotzdem auf Zeitrahmen und Mit-Spielen, gerade in den ersten Wochen.',
  },
  {
    key: 'aufmerksamkeit',
    min: 3,
    max: 5,
    label: 'Aus deiner Sicht aufmerksamkeitswürdig',
    colorToken: 'mustard',
    summary:
      'Aus deinen Antworten ergeben sich mehrere Pattern, die Kinder unter neun überfordern können. Setze klare Zeitlimits, schau die ersten Sessions zusammen mit deinem Kind, und prüfe ob ihr Push und Werbung systemweit ausschalten könnt.',
  },
  {
    key: 'vorsichtig',
    min: 6,
    max: 10,
    label: 'Aus deiner Sicht vorsichtig sein',
    colorToken: 'clay',
    summary:
      'Aus deinen Antworten ergeben sich viele Pattern die typisch für retentions-optimierte Apps sind. Das heißt nicht "verbieten", sondern: bewusst nutzen, klare Zeitlimits, elterliche Begleitung, und eine Exit-Strategie wenn die App in eurem Alltag kippt.',
  },
];

export function bandForScore(score: number): ScoreBandDef {
  return (
    SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORE_BANDS[0]
  );
}

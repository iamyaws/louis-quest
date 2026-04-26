/**
 * Familien-Medien-Charter — data model + step definitions for the
 * generator. The charter is intentionally short (one A4 page) so it
 * can hang on the fridge and stay readable to a six-year-old.
 *
 * The structure is value-driven: parents answer about THEIR family's
 * approach, not about apps. The output is a printable agreement, not
 * a Ronki recommendation.
 */

export type WannChoice =
  | 'morgens-vor-schule'
  | 'nach-schule'
  | 'wochenende'
  | 'abends-nach-hausaufgaben'
  | 'als-belohnung';

export type WoChoice = 'wohnzimmer' | 'kinderzimmer' | 'beides';

export type InhaltChoice = 'lernen' | 'spielen' | 'video' | 'sozial';

export type GeldChoice = 'nie' | 'nur-mit-eltern' | 'monatliches-budget';

export type PushChoice = 'alle-aus' | 'einige-erlauben' | 'je-app';

export type PauseChoice =
  | 'wochentag-pause'
  | 'wochenend-pause'
  | 'urlaubspause'
  | 'familien-zeit';

export interface CharterAnswers {
  familyName: string;
  childCount: number;
  /**
   * Optional comma-separated first names of family members who sign the
   * charter. We render one signature line per parsed name in both the
   * on-screen preview and the printable PDF. Empty string falls back to
   * generic "Erwachsene / Kinder" labels so we don't break older drafts.
   */
  signatures: string;
  wann: WannChoice[];
  wo: WoChoice;
  inhalte: InhaltChoice[];
  geld: GeldChoice;
  push: PushChoice;
  pausen: PauseChoice[];
  versprechen: string;
  /**
   * Optional one-sentence answer to "Wofür macht ihr das?" — the family's
   * positive frame for why the rules exist. Reframes the charter from a
   * defensive list of "no" rules into a constructive household commitment.
   * Renders as the italic subhead under the family name when filled.
   */
  wofuer: string;
}

export const EMPTY_ANSWERS: CharterAnswers = {
  familyName: '',
  childCount: 1,
  signatures: '',
  wann: [],
  wo: 'wohnzimmer',
  inhalte: [],
  geld: 'nur-mit-eltern',
  push: 'alle-aus',
  pausen: [],
  versprechen: '',
  wofuer: '',
};

/**
 * Parses the freeform comma-separated signatures string into a clean
 * list of trimmed names, capped at 6 to keep the printed signature
 * block tidy on A4.
 */
export function parseSignatures(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 6);
}

export const WANN_LABELS: Record<WannChoice, string> = {
  'morgens-vor-schule': 'Morgens, bevor die Schule losgeht.',
  'nach-schule': 'Nach der Schule, wenn die Hausaufgaben durch sind.',
  wochenende: 'Am Wochenende, mit etwas Luft im Tag.',
  'abends-nach-hausaufgaben': 'Abends, nach Hausaufgaben und Bewegung.',
  'als-belohnung': 'Bei besonderen Anlässen, nicht jeden Tag einfach so.',
};

export const WO_LABELS: Record<WoChoice, string> = {
  wohnzimmer: 'Im Wohnzimmer, dort wo auch wir Erwachsenen sitzen.',
  kinderzimmer:
    'Im Kinderzimmer, mit offener Tür. Wir kommen ab und zu rein.',
  beides: 'Beides, je nachdem was gespielt oder geschaut wird.',
};

export const INHALT_LABELS: Record<InhaltChoice, string> = {
  lernen: 'Lern-Apps und alles, was bei der Schule hilft.',
  spielen: 'Spiele, die wir vorher gemeinsam ausgesucht haben.',
  video: 'Videos und Filme, ebenfalls gemeinsam ausgewählt.',
  sozial: 'Familien- und Klassen-Chat. Kein Open-World-Social.',
};

export const GELD_LABELS: Record<GeldChoice, string> = {
  nie: 'Wir geben kein Echtgeld in Apps aus. Punkt.',
  'nur-mit-eltern':
    'Käufe nur, wenn ein Elternteil daneben sitzt und ja sagt.',
  'monatliches-budget':
    'Monatliches Budget, das wir gemeinsam besprechen, bevor etwas geklickt wird.',
};

export const PUSH_LABELS: Record<PushChoice, string> = {
  'alle-aus': 'Push aus. Auf jeder App, auf jedem Gerät.',
  'einige-erlauben':
    'Push nur für die paar Apps, die wir bewusst freigegeben haben (zum Beispiel den Klassen-Chat).',
  'je-app':
    'Pro App entscheiden wir neu. Alle paar Wochen prüfen wir, ob es noch passt.',
};

export const PAUSE_LABELS: Record<PauseChoice, string> = {
  'wochentag-pause': 'Mindestens ein Wochentag bleibt komplett ohne Bildschirm.',
  'wochenend-pause': 'Einen Wochenend-Tag im Monat sind alle Geräte aus.',
  urlaubspause: 'Im Urlaub bleiben die Geräte im Koffer. Auch unsere.',
  'familien-zeit':
    'Bei gemeinsamen Mahlzeiten liegen alle Geräte weg, auch unsere.',
};

/**
 * The seven oath-style article titles that replace the previous question
 * format on the printed Hausverfassung. Each title declares an action the
 * family takes ownership of, rather than asking themselves a question.
 *
 * Order matches the on-screen and PDF rendering order so the Roman /
 * Arabic numerals stay consistent with reading flow.
 */
export const ARTICLE_TITLES = {
  wann: 'Wann wir Bildschirm-Zeit zulassen.',
  wo: 'Wo bei uns gespielt wird.',
  inhalte: 'Was an Inhalten reinkommt.',
  geld: 'Wie wir es mit Echtgeld halten.',
  push: 'Was uns unterbrechen darf.',
  pausen: 'Pausen, die wir uns nehmen.',
  versprechen: 'Was wir euch versprechen.',
} as const;

/**
 * Computes a "wir prüfen am" review date roughly 4 months out from a base
 * date. Family-ritual research suggests an explicit revisit date roughly
 * quadruples the half-life of a pinned household agreement: it gives the
 * family permission to revise, instead of treating the artifact as
 * permanent until silently ignored.
 *
 * Returns a Date object; callers format with `toLocaleDateString('de-DE')`.
 */
export function computeReviewDate(base: Date = new Date()): Date {
  const d = new Date(base.getTime());
  d.setMonth(d.getMonth() + 4);
  return d;
}

export interface StepDef {
  id: string;
  title: string;
  helper?: string;
}

export const STEPS: StepDef[] = [
  { id: 'family', title: 'Eure Familie' },
  { id: 'wann-wo', title: 'Wann und wo' },
  { id: 'inhalte', title: 'Welche Inhalte' },
  { id: 'geld-push', title: 'Geld und Benachrichtigungen' },
  { id: 'pausen', title: 'Pausen und Familien-Zeit' },
  { id: 'versprechen', title: 'Euer Versprechen' },
  { id: 'preview', title: 'Eure Charter' },
];

export function isReady(answers: CharterAnswers, stepIdx: number): boolean {
  const id = STEPS[stepIdx].id;
  if (id === 'family') return answers.childCount >= 1;
  if (id === 'wann-wo') return answers.wann.length > 0;
  if (id === 'inhalte') return answers.inhalte.length > 0;
  if (id === 'geld-push') return true; // both have defaults
  if (id === 'pausen') return true; // optional
  if (id === 'versprechen') return true; // optional
  return true;
}

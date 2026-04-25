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
  wann: WannChoice[];
  wo: WoChoice;
  inhalte: InhaltChoice[];
  geld: GeldChoice;
  push: PushChoice;
  pausen: PauseChoice[];
  versprechen: string;
}

export const EMPTY_ANSWERS: CharterAnswers = {
  familyName: '',
  childCount: 1,
  wann: [],
  wo: 'wohnzimmer',
  inhalte: [],
  geld: 'nur-mit-eltern',
  push: 'alle-aus',
  pausen: [],
  versprechen: '',
};

export const WANN_LABELS: Record<WannChoice, string> = {
  'morgens-vor-schule': 'Morgens vor der Schule',
  'nach-schule': 'Nach der Schule',
  wochenende: 'Am Wochenende',
  'abends-nach-hausaufgaben': 'Abends nach den Hausaufgaben',
  'als-belohnung': 'Als Belohnung für besondere Anlässe',
};

export const WO_LABELS: Record<WoChoice, string> = {
  wohnzimmer: 'Im gemeinsamen Wohnzimmer, sichtbar für alle',
  kinderzimmer: 'Im Kinderzimmer, mit unseren Hausregeln',
  beides: 'Beides, je nach Aktivität und Inhalt',
};

export const INHALT_LABELS: Record<InhaltChoice, string> = {
  lernen: 'Lern-Apps und Schul-Inhalte',
  spielen: 'Spiele, vorab gemeinsam ausgewählt',
  video: 'Videos und Filme, vorab gemeinsam ausgewählt',
  sozial: 'Soziale Apps (Klassenchat, Familienkontakt)',
};

export const GELD_LABELS: Record<GeldChoice, string> = {
  nie: 'Wir geben kein Echtgeld in Apps aus.',
  'nur-mit-eltern':
    'Käufe in Apps nur mit ausdrücklicher Zustimmung eines Elternteils.',
  'monatliches-budget':
    'Wir vereinbaren ein monatliches Budget für In-App-Käufe und besprechen jeden Kauf.',
};

export const PUSH_LABELS: Record<PushChoice, string> = {
  'alle-aus': 'Push-Benachrichtigungen sind in allen Apps aus.',
  'einige-erlauben':
    'Push nur für Apps die wir ausdrücklich freigegeben haben (zum Beispiel Klassenchat).',
  'je-app':
    'Wir entscheiden für jede App neu, ob Push erlaubt ist, und prüfen das alle paar Wochen nach.',
};

export const PAUSE_LABELS: Record<PauseChoice, string> = {
  'wochentag-pause': 'Mindestens ein Wochentag ohne Bildschirm.',
  'wochenend-pause': 'Ein Wochenend-Tag im Monat komplett offline.',
  urlaubspause: 'Im Urlaub bleiben die Geräte zuhause oder im Koffer.',
  'familien-zeit':
    'Bei gemeinsamen Mahlzeiten und Familien-Zeit liegen alle Geräte weg.',
};

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

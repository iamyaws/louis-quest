/**
 * Dark Pattern Scanner — 10-question catalog.
 *
 * Each question is a yes/no observation about an app's behavior, asked of
 * the parent who has actually used the app with their child. The scoring
 * is shifted so that "more dark patterns observed" = higher score.
 *
 * IMPORTANT (legal framing): every question is phrased so that the parent
 * is asserting an observation about an app they personally used. The tool
 * never says "App X has Y"; it asks "did you observe Y in App X?". The
 * resulting score is the parent's interpretation of their own answers,
 * not Ronki's verdict on the app.
 */

export type Answer = 'ja' | 'nein';
export type Q8Answer = 'mechanik' | 'inhalt';
export type Q10Answer = 'ja' | 'nein';

export interface QuestionDef {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10';
  prompt: string;
  options: { value: string; label: string }[];
  /** Two-sentence "why this matters" explainer, shown on toggle. */
  explainer: string;
  /** How this question contributes to the score given the chosen value. */
  scoreContribution: (value: string) => 0 | 1;
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    prompt: 'Hat die App Streaks oder ähnliche "Verliere-nichts"-Mechaniken?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Streaks sind Zähler die fallen wenn dein Kind einen Tag aussetzt. Bei Erwachsenen ist das eine Motivationshilfe. Bei Kindern unter neun, die einen drohenden Verlust noch schwer einordnen können, fühlt sich der Streak-Druck schnell an wie Bestrafung. Die App wird zur Instanz, die täglich Forderungen stellt.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q2',
    prompt: 'Schickt die App Push-Benachrichtigungen an euer Gerät?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Push-Benachrichtigungen für Kinder wirken oft nicht wie eine neutrale Erinnerung, sondern wie ein sozialer Anruf, vor allem wenn sie eine Maskottchen-Figur zitieren. Das Kind fühlt sich aufgefordert zurückzukommen.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q3',
    prompt:
      'Gibt es eine Belohnungsökonomie (Punkte, Coins, Avatare, Sammelstücke)?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Belohnungen für etwas, das ein Kind aus Eigenmotivation getan hätte, senken die Eigenmotivation. Verhaltensforschung beschreibt das seit den 1970ern. Auf Dauer lernt dein Kind, dass es Punkte braucht um etwas tun zu wollen.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q4',
    prompt: 'Sind Skins, Charaktere oder Cosmetics gegen Echtgeld kaufbar?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Sichtbare kostenpflichtige Cosmetics in Kinder-Apps erzeugen für viele Kinder Frust. Wer mit diesem Frust umgeht, der Anbieter durch ein Kaufangebot oder die Eltern durch eine klare Hausregel, entscheidet sich oft am Punkt-of-Sale.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q5',
    prompt: 'Siehst du Werbung in der App?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Werbung in Kinder-Apps ist oft nicht als solche erkennbar für ein Kind. Selbst klassische Video-Werbung lenkt Aufmerksamkeit aus dem eigentlichen Inhalt heraus.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q6',
    prompt: 'Ist die Werbung selbst spielbar (Mini-Games statt Video)?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Spielbare Werbung ist besonders schwer zu durchschauen: das Kind spielt eine bis zwei Minuten ein anderes Spiel als Anzeige, mit kleinen Schließen-Buttons und einem Countdown. Die Wirkung ist, dass Aufmerksamkeit von einer App zur nächsten weiterläuft, oft ohne dass das Kind bewusst entscheidet.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q7',
    prompt: 'Gibt es Leaderboards oder Vergleiche mit anderen Kindern?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Soziale Druckmechaniken wie Ranglisten oder "Ligen" erzeugen FOMO und Wettbewerbsdruck bei Kindern die das kognitiv noch nicht einordnen können. Diese Ranglisten existieren nur in der App.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q8',
    prompt: 'Würde dein Kind den Inhalt vermissen oder die App-Mechanik?',
    options: [
      { value: 'inhalt', label: 'Den Inhalt' },
      { value: 'mechanik', label: 'Die Mechanik' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Wenn dein Kind die Mechanik vermisst (Streaks halten, Punkte sammeln) und nicht den eigentlichen Inhalt, ist die Bindung an die App künstlich erzeugt. Inhalt vermissen ist normal. Mechanik vermissen ist ein Hinweis dass du genauer hinschauen solltest.',
    scoreContribution: (v) => (v === 'mechanik' ? 1 : 0),
  },
  {
    id: 'q9',
    prompt:
      'Werden mehr Daten erhoben als für die Funktion der App nötig wären?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Übermäßige Datensammlung füttert Werbe-Profile oder ML-Modelle, oft ohne klaren Mehrwert für dein Kind. Lies die Datenschutzerklärung oder beobachte ob die App nach Standort, Kontakten oder anderen unnötigen Berechtigungen fragt.',
    scoreContribution: (v) => (v === 'ja' ? 1 : 0),
  },
  {
    id: 'q10',
    prompt: 'Sagt die App deinem Kind irgendwann "du bist fertig für heute"?',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'unklar', label: 'Weiß ich nicht' },
    ],
    explainer:
      'Eine App die nie ein Ende-Signal gibt, optimiert auf Dauer-Engagement statt auf Lernen oder Spielen mit Abschluss. Das natürliche Stop-Signal muss dann das Kind selber setzen, was bei Sechs- bis Neunjährigen schwer ist.',
    scoreContribution: (v) => (v === 'nein' ? 1 : 0),
  },
];

export type AnswersMap = Partial<Record<QuestionDef['id'], string>>;

export function calculateScore(answers: AnswersMap): number {
  return QUESTIONS.reduce((sum, q) => {
    const value = answers[q.id];
    if (!value) return sum;
    return sum + q.scoreContribution(value);
  }, 0);
}

export function isComplete(answers: AnswersMap): boolean {
  return QUESTIONS.every((q) => Boolean(answers[q.id]));
}

export interface AnswerStats {
  /** Number of questions answered with the dark-pattern-positive value (Ja or Mechanik). */
  flagged: number;
  /** Number of questions answered with the safe value (Nein or Inhalt). */
  cleared: number;
  /** Number of questions where the parent picked "Weiß ich nicht". */
  unclear: number;
}

export function summariseAnswers(answers: AnswersMap): AnswerStats {
  let flagged = 0;
  let cleared = 0;
  let unclear = 0;
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (!v) continue;
    if (v === 'unklar') {
      unclear += 1;
    } else if (q.scoreContribution(v) === 1) {
      flagged += 1;
    } else {
      cleared += 1;
    }
  }
  return { flagged, cleared, unclear };
}

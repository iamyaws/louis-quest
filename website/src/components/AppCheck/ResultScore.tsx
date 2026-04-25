/**
 * Result visual: score band gauge plus per-question explanations for
 * each "problematic" answer the parent gave.
 *
 * The framing is always "Aus deiner Sicht" — never "this app is X".
 */

import { QUESTIONS, type AnswersMap } from '../../lib/app-check/questions';
import { bandForScore, type ScoreBandDef } from '../../lib/app-check/score';

interface Props {
  appName: string;
  answers: AnswersMap;
  score: number;
}

const COLOR_CLASSES: Record<ScoreBandDef['colorToken'], { bg: string; ring: string; text: string; pill: string }> = {
  sage: {
    bg: 'bg-sage/15',
    ring: 'ring-sage/30',
    text: 'text-sage-dark',
    pill: 'bg-sage text-cream',
  },
  mustard: {
    bg: 'bg-mustard/20',
    ring: 'ring-mustard/40',
    text: 'text-teal-dark',
    pill: 'bg-mustard text-teal-dark',
  },
  clay: {
    bg: 'bg-clay/15',
    ring: 'ring-clay/30',
    text: 'text-clay',
    pill: 'bg-clay text-cream',
  },
};

export function ResultScore({ appName, answers, score }: Props) {
  const band = bandForScore(score);
  const colors = COLOR_CLASSES[band.colorToken];

  // Identify which questions contributed problematic answers, for the
  // educational explanation list. Q10 is special: "Nein" is the
  // problematic answer.
  const flaggedQuestions = QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return v && q.scoreContribution(v) === 1;
  });

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Band card */}
      <div
        className={`rounded-2xl ${colors.bg} ring-1 ring-inset ${colors.ring} px-7 py-8 sm:px-10 sm:py-10`}
      >
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-6xl font-display font-bold tabular-nums text-teal-dark">
            {score}
          </span>
          <span className="text-lg text-ink/55">/ 10 Pattern beobachtet</span>
        </div>
        <h2
          className={`font-display font-bold text-2xl sm:text-3xl leading-tight ${colors.text} mb-3`}
        >
          {band.label}
        </h2>
        <p className="text-ink/75 leading-relaxed">{band.summary}</p>
      </div>

      {/* App being assessed */}
      <p className="text-sm text-ink/65">
        Bewertete App: <strong className="text-teal-dark">{appName}</strong>
      </p>

      {/* Explanations of flagged answers */}
      {flaggedQuestions.length > 0 && (
        <div className="space-y-5">
          <h3 className="font-display font-bold text-xl text-teal-dark">
            Was deine Antworten zu den einzelnen Pattern bedeuten
          </h3>
          <ul className="space-y-4">
            {flaggedQuestions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl bg-cream/70 border border-teal/10 p-5"
              >
                <p className="font-display font-semibold text-teal-dark mb-2">
                  {q.prompt}
                </p>
                <p className="text-sm text-ink/75 leading-relaxed">
                  {q.explainer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flaggedQuestions.length === 0 && (
        <div className="rounded-xl bg-sage/10 border border-sage/20 p-5 text-sm text-ink/75 leading-relaxed">
          Aus deinen Antworten ergaben sich keine problematischen Pattern.
          Trotzdem gilt: schau die ersten Sessions zusammen mit deinem Kind,
          setze einen Zeitrahmen, und beobachte ob die App Stress oder Ruhe
          erzeugt.
        </div>
      )}
    </div>
  );
}

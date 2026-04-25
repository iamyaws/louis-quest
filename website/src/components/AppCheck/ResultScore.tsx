/**
 * Result visual: score band gauge plus per-question explanations for
 * each "problematic" answer the parent gave.
 *
 * The framing is always "Aus deiner Sicht" — never "this app is X".
 */

import {
  QUESTIONS,
  summariseAnswers,
  type AnswersMap,
} from '../../lib/app-check/questions';
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
  const stats = summariseAnswers(answers);

  // Identify which questions contributed problematic answers, for the
  // educational explanation list. Q10 is special: "Nein" is the
  // problematic answer.
  const flaggedQuestions = QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return v && v !== 'unklar' && q.scoreContribution(v) === 1;
  });

  // Pull the questions the parent flagged as "weiß ich nicht" so we can
  // surface them as a separate "you might want to look this up" section.
  const unclearQuestions = QUESTIONS.filter(
    (q) => answers[q.id] === 'unklar',
  );

  // If too much was unclear, the score itself is conservative — show a
  // soft warning so parents understand "low score with many unknowns"
  // is not the same as "low score with mostly Nein".
  const sparseData = stats.unclear >= 5;

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

      {/* App being assessed + answer breakdown */}
      <div className="space-y-2 text-sm text-ink/65">
        <p>
          Bewertete App: <strong className="text-teal-dark">{appName}</strong>
        </p>
        <p>
          Aus deinen Antworten: <strong className="text-teal-dark">{stats.flagged}</strong> Pattern beobachtet,{' '}
          <strong className="text-teal-dark">{stats.cleared}</strong> verneint,{' '}
          <strong className="text-teal-dark">{stats.unclear}</strong> offen gelassen.
        </p>
      </div>

      {sparseData && (
        <div className="rounded-xl bg-mustard/10 border border-mustard/30 p-5 text-sm text-ink/75 leading-relaxed">
          Du hast bei vielen Fragen "Weiß ich nicht" gewählt. Der Score ist
          deshalb konservativ: er zählt nur, was du selbst beobachten konntest.
          Wenn du mehr Klarheit willst, schau ins App-Menü, in die
          Datenschutzerklärung der App, oder spiel mal eine Session zusammen
          mit deinem Kind.
        </div>
      )}

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

      {flaggedQuestions.length === 0 && stats.cleared > 0 && (
        <div className="rounded-xl bg-sage/10 border border-sage/20 p-5 text-sm text-ink/75 leading-relaxed">
          Aus deinen Antworten ergaben sich keine problematischen Pattern.
          Trotzdem gilt: schau die ersten Sessions zusammen mit deinem Kind,
          setze einen Zeitrahmen, und beobachte ob die App Stress oder Ruhe
          erzeugt.
        </div>
      )}

      {/* Surface unclear questions as a "things you could look into" list. */}
      {unclearQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-teal-dark">
            Diese Fragen waren für dich unklar
          </h3>
          <ul className="space-y-3">
            {unclearQuestions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl bg-cream/50 border border-teal/10 p-4"
              >
                <p className="text-sm text-teal-dark mb-1">{q.prompt}</p>
                <p className="text-xs text-ink/60 leading-relaxed">
                  {q.explainer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

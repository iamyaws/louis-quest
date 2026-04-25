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
import { BandActions } from './BandActions';

interface Props {
  appName: string;
  answers: AnswersMap;
  score: number;
}

// Band tones use only defined Tailwind tokens (cream, teal, sage,
// mustard family). No "danger" colors — the tool is not a verdict.
// Severity is communicated via the actions list density, not via alarm.
const TONE_CLASSES: Record<ScoreBandDef['tone'], { bg: string; ring: string; accent: string }> = {
  sage: {
    bg: 'bg-sage/12',
    ring: 'ring-sage/25',
    accent: 'text-teal-dark',
  },
  mustard: {
    bg: 'bg-mustard-soft/40',
    ring: 'ring-mustard/30',
    accent: 'text-teal-dark',
  },
  serious: {
    bg: 'bg-teal-dark/8',
    ring: 'ring-teal-dark/25',
    accent: 'text-teal-dark',
  },
};

export function ResultScore({ appName, answers, score }: Props) {
  const band = bandForScore(score);
  const tone = TONE_CLASSES[band.tone];
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
  // is not the same as "low score with mostly Nein". When most answers
  // are unclear we hide the band card entirely because it would be
  // misleading; we just show the warning + a nudge to gather more.
  const sparseData = stats.unclear >= 5;
  const tooSparseForBand = stats.unclear >= 7;

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Band card — hidden if data too sparse to be meaningful */}
      {!tooSparseForBand && (
        <div
          className={`rounded-2xl ${tone.bg} ring-1 ring-inset ${tone.ring} px-7 py-8 sm:px-10 sm:py-10`}
        >
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-6xl font-display font-bold tabular-nums text-teal-dark">
              {score}
            </span>
            <span className="text-lg text-ink/55">/ 10 Pattern beobachtet</span>
          </div>
          <h2
            className={`font-display font-bold text-2xl sm:text-3xl leading-tight ${tone.accent} mb-3`}
          >
            {band.label}
          </h2>
          <p className="text-ink/75 leading-relaxed">{band.summary}</p>
        </div>
      )}

      {tooSparseForBand && (
        <div className="rounded-2xl bg-cream/80 ring-1 ring-inset ring-teal/15 px-7 py-8 sm:px-10 sm:py-10 space-y-3">
          <h2 className="font-display font-bold text-2xl text-teal-dark">
            Noch zu wenig zum Einordnen
          </h2>
          <p className="text-ink/75 leading-relaxed">
            Du hast bei den meisten Fragen "Weiß ich nicht" gewählt. Das ist
            ehrlich, aber wir können daraus noch nichts ableiten. Schau die App
            einmal kurz mit deinem Kind an, achte auf Push, Werbung und
            Cosmetics, und komm dann zurück.
          </p>
        </div>
      )}

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

      {sparseData && !tooSparseForBand && (
        <div className="rounded-xl bg-cream/80 border border-teal/15 p-5 text-sm text-ink/75 leading-relaxed">
          Du hast bei vielen Fragen "Weiß ich nicht" gewählt. Der Score zählt
          nur was du selbst beobachten konntest und ist deshalb im Zweifel
          niedriger als die App tatsächlich ist. Wenn du mehr Klarheit willst,
          schau ins App-Menü, in die Datenschutzerklärung der App, oder spiel
          mal eine Session zusammen mit deinem Kind.
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

      {flaggedQuestions.length === 0 && stats.cleared > 0 && !tooSparseForBand && (
        <div className="rounded-xl bg-sage/12 border border-sage/25 p-5 text-sm text-ink/75 leading-relaxed">
          Aus deinen Antworten ergaben sich keine problematischen Pattern.
          Trotzdem gilt: schau die ersten Sessions zusammen mit deinem Kind,
          setz einen Zeitrahmen, und beobachte ob die App Stress oder Ruhe
          erzeugt.
        </div>
      )}

      {/* Band-specific actionable next steps */}
      {!tooSparseForBand && <BandActions band={band} answers={answers} />}

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

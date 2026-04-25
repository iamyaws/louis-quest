/**
 * One-question screen of the app-check questionnaire.
 *
 * Always shows: progress indicator, prompt, yes/no buttons, optional
 * "Erklär mir das" toggle that expands the educational why-this-matters
 * paragraph from the question definition.
 */

import { useState } from 'react';
import type { QuestionDef } from '../../lib/app-check/questions';

interface Props {
  question: QuestionDef;
  index: number;
  total: number;
  current: string | undefined;
  onAnswer: (value: string) => void;
  onBack: () => void;
}

export function QuestionScreen({
  question,
  index,
  total,
  current,
  onAnswer,
  onBack,
}: Props) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-cream/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-ink/60 tabular-nums">
          Frage {index + 1} / {total}
        </span>
      </div>

      {/* Prompt */}
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-teal-dark leading-snug">
        {question.prompt}
      </h2>

      {/* Explainer toggle */}
      <button
        type="button"
        onClick={() => setExplainerOpen((v) => !v)}
        className="text-sm text-teal underline underline-offset-4 decoration-teal/30 hover:decoration-teal transition-colors"
      >
        {explainerOpen ? 'Weniger anzeigen' : 'Erklär mir das'}
      </button>

      {explainerOpen && (
        <div className="rounded-xl bg-cream/80 border border-teal/10 p-5 text-sm text-ink/75 leading-relaxed">
          {question.explainer}
        </div>
      )}

      {/* Answer buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {question.options.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(opt.value)}
              className={`flex-1 rounded-xl border-2 px-6 py-4 text-base font-display font-semibold transition-all ${
                selected
                  ? 'border-teal bg-teal text-cream shadow-md'
                  : 'border-teal/20 bg-cream text-teal-dark hover:border-teal hover:shadow-sm'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Back nav */}
      {index > 0 && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink/55 hover:text-ink/80 transition-colors"
        >
          ← Vorige Frage
        </button>
      )}
    </div>
  );
}

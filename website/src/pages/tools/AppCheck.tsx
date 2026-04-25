/**
 * /tools/app-check — Dark Pattern Scanner V1.
 *
 * Single-page state machine with five phases:
 *   1. landing  — pitch + CTA
 *   2. entry    — pick app from curated list or type free text
 *   3. quiz     — 10 yes/no questions, one per screen
 *   4. result   — score + per-question explanations + save CTA
 *   5. saving   — submitting to Supabase
 *
 * After successful save, navigates to /tools/app-check/r/:id which is
 * a separate, read-only permalink page (AppCheckResult.tsx).
 *
 * Legal framing reminder: every assertion is the parent's, not Ronki's.
 * The ToolDisclaimer is rendered on every phase.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { AppEntry } from '../../components/AppCheck/AppEntry';
import { QuestionScreen } from '../../components/AppCheck/QuestionScreen';
import { ResultScore } from '../../components/AppCheck/ResultScore';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import {
  QUESTIONS,
  calculateScore,
  isComplete,
  type AnswersMap,
} from '../../lib/app-check/questions';
import { saveEval } from '../../lib/app-check/storage';

type Phase = 'landing' | 'entry' | 'quiz' | 'result' | 'saving';

export default function AppCheck() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('landing');
  const [appName, setAppName] = useState<string>('');
  const [curatedId, setCuratedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const score = calculateScore(answers);
  const complete = isComplete(answers);

  function handleAnswer(value: string) {
    const q = QUESTIONS[questionIdx];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      setPhase('result');
    }
  }

  async function handleSave() {
    if (!complete) return;
    setPhase('saving');
    setError(null);
    const result = await saveEval({
      appName,
      appIdCurated: curatedId,
      answers,
      score,
      locale: 'de',
    });
    if (result.ok) {
      navigate(`/tools/app-check/r/${result.id}`);
    } else {
      setPhase('result');
      setError(
        result.reason === 'no-supabase'
          ? 'Speichern aktuell nicht möglich, die Verbindung zur Datenbank fehlt.'
          : 'Speichern hat nicht geklappt. Versuch es bitte gleich noch mal.',
      );
    }
  }

  function handleRestart() {
    setPhase('entry');
    setAnswers({});
    setQuestionIdx(0);
    setAppName('');
    setCuratedId(null);
    setError(null);
  }

  return (
    <PainterlyShell>
      <PageMeta
        title="App-Check: prüfe Kinder-Apps in zehn Fragen"
        description="Beantworte zehn Beobachtungs-Fragen über eine Kinder-App. Du bekommst eine Einschätzung der Pattern aus deiner Sicht. Kostenlos, kein Account, du bewertest."
        canonicalPath="/tools/app-check"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors mb-8"
          >
            <span aria-hidden>←</span> Werkzeuge
          </Link>

          {phase === 'landing' && <Landing onStart={() => setPhase('entry')} />}

          {phase === 'entry' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
                  Schritt 1 von 3
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-teal-dark leading-tight">
                  Welche App willst du prüfen?
                </h1>
              </header>
              <AppEntry
                onContinue={({ name, curatedId }) => {
                  setAppName(name);
                  setCuratedId(curatedId);
                  setPhase('quiz');
                  setQuestionIdx(0);
                }}
              />
              <ToolDisclaimer variant="tool" />
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div
              key={questionIdx}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-2">
                  Schritt 2 von 3 · {appName}
                </p>
              </header>
              <QuestionScreen
                question={QUESTIONS[questionIdx]}
                index={questionIdx}
                total={QUESTIONS.length}
                current={answers[QUESTIONS[questionIdx].id]}
                onAnswer={handleAnswer}
                onBack={() => setQuestionIdx(Math.max(0, questionIdx - 1))}
              />
              <ToolDisclaimer variant="tool" />
            </motion.div>
          )}

          {(phase === 'result' || phase === 'saving') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
                  Schritt 3 von 3 · Ergebnis
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-teal-dark leading-tight">
                  Aus deiner Sicht.
                </h1>
              </header>

              <ResultScore appName={appName} answers={answers} score={score} />

              {error && (
                <div className="rounded-xl bg-clay/10 border border-clay/30 p-4 text-sm text-clay">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={phase === 'saving'}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {phase === 'saving' ? 'Speichere…' : 'Bewertung speichern und teilen'}
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-6 py-3 text-sm text-teal-dark font-display font-medium hover:bg-teal-dark hover:text-cream transition-colors"
                >
                  Andere App prüfen
                </button>
              </div>

              <ToolDisclaimer variant="result" />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="space-y-10"
    >
      <header className="space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium">
          Werkzeug für Eltern
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
          Welche App will dein Kind?
        </h1>
        <p className="text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
          Beantworte zehn Fragen aus deiner eigenen Beobachtung. Du bekommst eine
          Einschätzung, was die App-Mechaniken aus deiner Sicht über sie
          verraten. Du kannst die Bewertung speichern und teilen, wenn du willst.
        </p>
      </header>

      <ul className="space-y-3 text-sm text-ink/70">
        <li className="flex gap-3">
          <span className="text-sage mt-0.5">●</span>
          <span>Etwa drei Minuten, zehn Yes/No-Fragen.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-sage mt-0.5">●</span>
          <span>Kein Account, keine Anmeldung, kein Tracking.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-sage mt-0.5">●</span>
          <span>
            Du bewertest, wir geben dir den Rahmen. Wir machen keine Aussagen
            über einzelne Apps.
          </span>
        </li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full bg-teal-dark px-8 py-4 text-cream font-display font-bold text-base shadow-sm hover:bg-teal hover:shadow-md transition-all"
      >
        App prüfen
        <span aria-hidden>→</span>
      </button>

      <ToolDisclaimer variant="tool" />
    </motion.div>
  );
}

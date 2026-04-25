/**
 * /tools/app-check/r/:id — read-only permalink view of a saved evaluation.
 *
 * Renders the same score band visual as the live tool, plus share buttons
 * and the saved-page disclaimer (which makes the third-party-reading
 * framing explicit: "this is one parent's view, not Ronki's").
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ResultScore } from '../../components/AppCheck/ResultScore';
import { ShareButtons } from '../../components/AppCheck/ShareButtons';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import { fetchEval, type FetchedEval } from '../../lib/app-check/storage';

export default function AppCheckResult() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<
    | { phase: 'loading' }
    | { phase: 'found'; data: FetchedEval }
    | { phase: 'not-found' }
  >({ phase: 'loading' });

  useEffect(() => {
    if (!id) {
      setState({ phase: 'not-found' });
      return;
    }
    let cancelled = false;
    fetchEval(id).then((data) => {
      if (cancelled) return;
      setState(data ? { phase: 'found', data } : { phase: 'not-found' });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PainterlyShell>
      <PageMeta
        title={
          state.phase === 'found'
            ? `App-Check: ${state.data.appName}`
            : 'App-Check Bewertung'
        }
        description="Eine Eltern-Bewertung der App-Pattern, gespeichert über das Ronki App-Check Werkzeug."
        canonicalPath={`/tools/app-check/r/${id ?? ''}`}
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools/app-check"
            className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors mb-8"
          >
            <span aria-hidden>←</span> Eigenen App-Check starten
          </Link>

          {state.phase === 'loading' && (
            <div className="text-ink/60">Lade Bewertung…</div>
          )}

          {state.phase === 'not-found' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h1 className="font-display font-bold text-3xl text-teal-dark">
                Diese Bewertung existiert nicht oder wurde entfernt.
              </h1>
              <p className="text-ink/70">
                Wenn du deinen eigenen App-Check starten willst, geht das hier:{' '}
                <Link
                  to="/tools/app-check"
                  className="text-teal underline underline-offset-2"
                >
                  App prüfen
                </Link>
                .
              </p>
            </motion.div>
          )}

          {state.phase === 'found' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
                  Gespeicherte Bewertung
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-teal-dark leading-tight">
                  Aus Sicht eines Elternteils.
                </h1>
              </header>

              <ResultScore
                appName={state.data.appName}
                answers={state.data.answers}
                score={state.data.score}
              />

              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-teal-dark">
                  Diesen Permalink teilen
                </h2>
                <ShareButtons
                  appName={state.data.appName}
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                />
              </div>

              <ToolDisclaimer variant="saved" />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

/**
 * App selection screen for the Dark Pattern Scanner.
 *
 * Hybrid input:
 *   - Curated dropdown grouped by category (40 most-common DACH kid apps)
 *   - Free-text fallback for any other app
 *
 * After app is chosen, optionally shows the running counter "X parents
 * have evaluated this app" as soft social proof. Counter is the only
 * aggregated info exposed publicly; individual scores stay per-permalink.
 */

import { useEffect, useState } from 'react';
import { CATEGORY_LABELS, CURATED_APPS, type CuratedApp } from '../../lib/app-check/curated-apps';
import { fetchEvalCount } from '../../lib/app-check/storage';

interface Props {
  onContinue: (selection: { name: string; curatedId: string | null }) => void;
}

export function AppEntry({ onContinue }: Props) {
  const [mode, setMode] = useState<'curated' | 'free'>('curated');
  const [curatedId, setCuratedId] = useState<string>('');
  const [freeText, setFreeText] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);

  // Group curated apps by category for the dropdown.
  const grouped = CURATED_APPS.reduce<Record<string, CuratedApp[]>>(
    (acc, app) => {
      (acc[app.category] = acc[app.category] || []).push(app);
      return acc;
    },
    {},
  );

  const selectedApp = CURATED_APPS.find((a) => a.id === curatedId);
  const effectiveName =
    mode === 'curated' ? selectedApp?.name ?? '' : freeText.trim();

  // Load counter when selection becomes meaningful.
  useEffect(() => {
    setCount(null);
    if (!effectiveName || effectiveName.length < 2) return;
    let cancelled = false;
    fetchEvalCount(effectiveName).then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveName]);

  const canContinue = effectiveName.length >= 2;

  return (
    <div className="space-y-8 max-w-xl">
      {/* Mode toggle */}
      <div className="inline-flex rounded-full bg-cream/70 border border-teal/15 p-1">
        <button
          type="button"
          onClick={() => setMode('curated')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'curated'
              ? 'bg-teal text-cream'
              : 'text-teal-dark hover:text-teal'
          }`}
        >
          Aus Liste wählen
        </button>
        <button
          type="button"
          onClick={() => setMode('free')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'free'
              ? 'bg-teal text-cream'
              : 'text-teal-dark hover:text-teal'
          }`}
        >
          Andere App eingeben
        </button>
      </div>

      {/* Input */}
      {mode === 'curated' ? (
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">App auswählen</span>
          <select
            value={curatedId}
            onChange={(e) => setCuratedId(e.target.value)}
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-teal-dark focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="">Bitte wählen…</option>
            {Object.entries(grouped).map(([cat, apps]) => (
              <optgroup
                key={cat}
                label={CATEGORY_LABELS[cat as CuratedApp['category']]}
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="text-sm text-ink/70 mb-2 block">App-Name</span>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="z.B. Roblox, TikTok, Anton"
            maxLength={80}
            className="w-full rounded-xl border border-teal/20 bg-cream px-4 py-3 text-base text-teal-dark focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          />
        </label>
      )}

      {/* Counter */}
      {effectiveName && (
        <div className="text-sm text-ink/65 min-h-[1.25rem]">
          {count === null && <span>Schaue nach…</span>}
          {count === 0 && (
            <span>
              Sei die erste Person, die <strong>{effectiveName}</strong> hier prüft.
            </span>
          )}
          {count !== null && count > 0 && (
            <span>
              {count === 1 ? 'Eine andere Person hat' : `${count} andere Personen haben`}{' '}
              <strong>{effectiveName}</strong> bisher geprüft.
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={() =>
          onContinue({
            name: effectiveName,
            curatedId: mode === 'curated' && curatedId ? curatedId : null,
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Fragebogen starten
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}

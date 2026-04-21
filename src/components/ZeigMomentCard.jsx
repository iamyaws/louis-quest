import React from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';

const BLOCK_LABELS = {
  morning: 'Morgen',
  evening: 'Nachmittag',
  bedtime: 'Abend',
};

const THRESHOLD = 14; // how many times per block before the card fades away

/**
 * ZeigMomentCard — a warm overlay shown once per routine block per day,
 * for the first 14 completions of each block. Encourages Louis to show a
 * parent what he finished ("Zeig Mama oder Papa"), so the parent-sighting
 * becomes part of the routine itself.
 *
 * Two actions (simplified Apr 2026):
 *   - "Hat {Mama|Papa} gesehen" — records sighting, increments count
 *   - "Später"                   — dismiss for today's block without
 *                                   counting; next block still shows
 *
 * On the 14th tap for a block, Ronki gives a small sendoff and the feature
 * goes quiet for that block forever (counts[block] === THRESHOLD).
 */
export default function ZeigMomentCard({ block, onClose }) {
  const { state, actions } = useTask();
  if (!block) return null;

  const label = BLOCK_LABELS[block] || block;
  const counts = state?.zeigMomentCounts || {};
  const currentCount = counts[block] || 0;
  const nextCount = currentCount + 1;
  const isFinal = nextCount >= THRESHOLD;
  // Marc: single-parent vouch is enough — not "did BOTH see". Parents
  // pick which one (Mama/Papa) in Eltern-Bereich settings; default Mama.
  // German pronoun agreement matters here: Papa takes "Er", Mama takes
  // "Sie" — a 6-year-old learning to read shouldn't hit "Zeig Papa. Sie
  // freut sich mit dir!" and get tripped up on the mixed pronoun.
  const isPapa = state?.familyConfig?.zeigMomentParent === 'papa';
  const vouchParent = isPapa ? 'Papa' : 'Mama';
  const vouchPronoun = isPapa ? 'Er' : 'Sie';

  const confirm = () => {
    SFX.play('celeb');
    const today = new Date().toISOString().slice(0, 10);
    const shown = state?.zeigMomentShownDates || {};
    actions.patchState({
      zeigMomentShownDates: { ...shown, [block]: today },
      zeigMomentCounts: { ...counts, [block]: nextCount },
    });
    onClose?.();
  };

  // Später = dismiss THIS block for today without counting toward the 14.
  // Without persisting "shown today", Hub's useEffect immediately re-fires
  // (the quest-done conditions still hold), so the card would pop back up
  // and Später would feel broken. Mark the block as shown-today, but DO
  // NOT bump the counter — next block still gets its prompt.
  const dismiss = () => {
    SFX.play('tap');
    const today = new Date().toISOString().slice(0, 10);
    const shown = state?.zeigMomentShownDates || {};
    actions.patchState({
      zeigMomentShownDates: { ...shown, [block]: today },
    });
    onClose?.();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      className="fixed inset-0 z-[500] flex items-center justify-center px-5"
      style={{ background: 'rgba(10,20,22,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden relative"
           style={{
             background: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)',
             border: '1.5px solid rgba(252,211,77,0.45)',
             boxShadow: '0 24px 48px -12px rgba(161,98,7,0.35)',
           }}>
        <div className="px-6 pt-10 pb-7 flex flex-col items-center text-center">
          <div className="text-5xl mb-3" aria-hidden="true">🌟</div>

          <h2 className="font-headline font-bold text-2xl leading-tight text-on-surface mb-2"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {label}-Routine geschafft!
          </h2>

          {!isFinal ? (
            <>
              <p className="font-body text-base text-on-surface mb-1">
                Zeig {vouchParent}.
              </p>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                {vouchPronoun} freut sich mit dir!
              </p>
            </>
          ) : (
            <>
              <p className="font-body text-base text-on-surface mb-1">
                Super.
              </p>
              <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
                Jetzt kann ich stolz in die Stube laufen, ohne dich zu stören.
              </p>
            </>
          )}

          {/* Single-parent vouch — Marc's reorder (Apr 2026): one grown-up
               suffices for the cheer moment. Parent selection lives in
               Eltern-Bereich Settings. */}
          <div className="w-full flex flex-col gap-2.5 mb-2">
            <button
              onClick={confirm}
              className="w-full py-3.5 rounded-full font-label font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 16px rgba(252,211,77,0.35)' }}
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Hat {vouchParent} gesehen
            </button>
            <button
              onClick={dismiss}
              className="w-full py-3 rounded-full font-label text-sm active:opacity-70 transition-all"
              style={{ color: '#92400e' }}
            >
              Später
            </button>
          </div>

          {/* Progress dots — tiny, just a hint of how long Louis has been learning */}
          {!isFinal && (
            <div className="flex gap-1 mt-3" aria-hidden="true">
              {Array.from({ length: THRESHOLD }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full"
                      style={{
                        background: i < currentCount ? '#fcd34d' : 'rgba(161,98,7,0.18)',
                      }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

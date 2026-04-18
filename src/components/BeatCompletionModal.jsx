import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';
import BaumPoseBeat from './BaumPoseBeat';

/**
 * Registry for per-beat custom UI. Keyed by beat id so future Freunde skills
 * (box breathing, brief meditation, naming feelings, friendship rules) can
 * register their own component without branching logic here. If no entry
 * matches, the default title + steps list renders.
 */
const CRAFT_BEAT_COMPONENTS = {
  'pil-b2-pose': BaumPoseBeat,
};

/**
 * Modal for self-reporting completion of a craft or lore beat.
 * - Craft beats show title + steps checklist + "I did it" button
 *   (or a custom component if registered in CRAFT_BEAT_COMPONENTS)
 * - Lore beats show the lore paragraph + "Done reading" button
 *
 * Routine beats do not open this modal; they complete via the quest tick.
 */
export default function BeatCompletionModal({ beat, onClose }) {
  const { t } = useTranslation();
  const { advance } = useArc();

  if (!beat) return null;

  const handleDone = () => {
    advance(beat.id);
    onClose();
  };

  const CustomCraft = beat.kind === 'craft' ? CRAFT_BEAT_COMPONENTS[beat.id] : null;

  if (CustomCraft) {
    return (
      <div className="fixed inset-0 z-[260] bg-black/50 flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl my-8 overflow-hidden">
          <CustomCraft onComplete={handleDone} />
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full bg-white/60 text-on-surface py-3 rounded-2xl font-label font-bold text-base border border-[color:var(--parchment-gold,#fcd34d)] min-h-[48px]"
            >
              {t('beat.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[260] bg-black/50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl my-8">
        {beat.kind === 'craft' && (
          <>
            <h2 className="font-headline text-2xl font-bold text-primary mb-2">
              {t(beat.title)}
            </h2>
            {beat.narrativeBefore && (
              <p className="font-body text-base text-on-surface mb-4">
                {t(beat.narrativeBefore)}
              </p>
            )}
            <ol className="space-y-3 mb-6">
              {beat.steps.map((stepKey, i) => (
                <li key={stepKey} className="flex gap-3 items-start">
                  <span className="font-headline text-lg font-bold text-primary flex-shrink-0 w-6">
                    {i + 1}.
                  </span>
                  <span className="font-body text-base text-on-surface leading-snug">
                    {t(stepKey)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {beat.kind === 'lore' && (
          <>
            {beat.narrativeBefore && (
              <p className="font-body text-sm text-on-surface-variant italic mb-3">
                {t(beat.narrativeBefore)}
              </p>
            )}
            <p className="font-body text-base text-on-surface leading-relaxed mb-6 whitespace-pre-line">
              {t(beat.text)}
            </p>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/60 text-on-surface py-4 rounded-2xl font-label font-bold text-lg border border-[color:var(--parchment-gold,#fcd34d)]"
          >
            {t('beat.close')}
          </button>
          <button
            onClick={handleDone}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-label font-bold text-lg"
          >
            {beat.kind === 'craft' ? t('beat.didIt') : t('beat.doneReading')}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';
import BaumPoseBeat from './BaumPoseBeat';
import VoiceAudio from '../utils/voiceAudio';
import { resolveBeatNarratorLine } from '../arcs/narratorMap';

/**
 * Registry for per-beat custom UI. Keyed by beat id so future Freunde skills
 * (box breathing, brief meditation, naming feelings, friendship rules) can
 * register their own component without branching logic here. If no entry
 * matches, the default title + steps list renders.
 */
const CRAFT_BEAT_COMPONENTS = {
  'pil-b2-pose': BaumPoseBeat,
};

/** Minimum wait before "Weiter" appears on a lore beat, in ms. */
const LORE_MIN_WAIT_MS = 3000;

/**
 * Modal for self-reporting completion of a craft or lore beat.
 * - Craft beats show title + steps checklist + "I did it" button
 *   (or a custom component if registered in CRAFT_BEAT_COMPONENTS)
 * - Lore beats show the lore paragraph + "Done reading" button
 *
 * Voice-gating for lore beats: the "Fertig gelesen" button is muted until
 * the Drachenmutter narrator finishes speaking the lore text, or 3s have
 * passed (whichever is later). Prevents speed-clicking past the story.
 * Muted mode skips the gate entirely — no artificial waits for parents
 * who keep audio off.
 *
 * Routine beats do not open this modal; they complete via the quest tick.
 */
export default function BeatCompletionModal({ beat, onClose }) {
  const { t } = useTranslation();
  const { advance, activeArc } = useArc();

  const isLore = beat?.kind === 'lore';
  const isMuted = isLore ? VoiceAudio.isMuted() : true; // non-lore beats never gate

  // Voice-gating state: only meaningful for lore beats when audio is on.
  // When muted, start in the "finished" state so button renders immediately.
  const [voiceFinished, setVoiceFinished] = useState(isMuted);
  const [minWaitElapsed, setMinWaitElapsed] = useState(isMuted);

  useEffect(() => {
    if (!beat) return;
    if (!isLore) return;

    // Muted: skip gating. State already initialized unlocked.
    if (VoiceAudio.isMuted()) {
      setVoiceFinished(true);
      setMinWaitElapsed(true);
      return;
    }

    // Reset gate each time a new lore beat opens.
    setVoiceFinished(false);
    setMinWaitElapsed(false);

    // Minimum wait so muted-failed / missing-file paths still show the button.
    const waitTimer = setTimeout(() => setMinWaitElapsed(true), LORE_MIN_WAIT_MS);

    // Fire narrator audio for this lore beat. The useArc advance() already
    // triggered audio when we advanced INTO this beat — but modal mount is
    // when the text is actually on screen, so we replay here with a callback
    // to track end-of-audio. VoiceAudio.stop() runs inside playNarratorWithCallback
    // so any stale line is cut cleanly.
    const beatIndex = activeArc?.beats.findIndex(b => b.id === beat.id) ?? -1;
    const line = resolveBeatNarratorLine(activeArc?.id, beat.id, beatIndex);

    if (!line) {
      // No narrator line known for this lore beat — don't block the kid.
      setVoiceFinished(true);
      return () => clearTimeout(waitTimer);
    }

    VoiceAudio.playNarratorWithCallback(line, 300, () => setVoiceFinished(true));

    return () => clearTimeout(waitTimer);
  }, [beat, isLore, activeArc]);

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

  // Lore beat: "Weiter" button is gated until voice finishes AND min wait elapses.
  const weiterUnlocked = !isLore || (voiceFinished && minWaitElapsed);

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
            disabled={!weiterUnlocked}
            aria-hidden={!weiterUnlocked}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-label font-bold text-lg transition-opacity duration-300"
            style={{
              opacity: weiterUnlocked ? 1 : 0.3,
              pointerEvents: weiterUnlocked ? 'auto' : 'none',
            }}
          >
            {beat.kind === 'craft' ? t('beat.didIt') : t('beat.doneReading')}
          </button>
        </div>
      </div>
    </div>
  );
}

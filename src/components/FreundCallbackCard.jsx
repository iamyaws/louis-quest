import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { FREUND_BY_ID } from '../data/freunde';
import { CHAPTERS } from '../data/creatures';
import VoiceAudio from '../utils/voiceAudio';

const BASE = import.meta.env.BASE_URL;

/**
 * Standalone lore card that fires 5-7 days after a Freund reunion arc's beat 3.
 *
 * Reads state.freundCallbacksPending and shows the first entry whose triggerAt
 * <= now as a reunion "he came by" moment. On dismiss:
 *   - adds the arc id to state.freundArcsCompleted
 *   - removes the entry from state.freundCallbacksPending
 *   - plays the Drachenmutter callback narration (arc_<freundId>_b4_callback.mp3)
 *
 * Audio file path convention: `/audio/narrator/arc_<freundId>_b4_callback.mp3`.
 * Phase A generated `arc_pilzhueter_b4_callback.mp3`; future Freunde follow
 * the same pattern.
 *
 * Mounted at App level near ArcOfferCard — Louis sees it on the Hub when
 * opening the app and the timer has lapsed.
 */
export default function FreundCallbackCard() {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const dueCallback = useMemo(() => {
    const list = state?.freundCallbacksPending || [];
    if (list.length === 0) return null;
    // Day-2 floor: never surface a Freund callback during the first two
    // days of use. The first-run experience needs to stay quiet so new
    // parents aren't ambushed with lore pop-ups they haven't met yet.
    const onboardingDate = state?.onboardingDate;
    if (onboardingDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(onboardingDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSince < 2) return null;
    }
    const now = Date.now();
    return list.find(cb => new Date(cb.triggerAt).getTime() <= now) || null;
  }, [state?.freundCallbacksPending, state?.onboardingDate]);

  const freund = dueCallback ? FREUND_BY_ID.get(dueCallback.freundId) : null;

  // Play Drachenmutter callback audio once when the card mounts
  useEffect(() => {
    if (!freund || audioPlayed) return;
    VoiceAudio.playNarrator(`arc_${freund.id}_b4_callback`, 800);
    setAudioPlayed(true);
  }, [freund, audioPlayed]);

  // Reset the portrait-failed flag if the due callback identity changes
  useEffect(() => {
    setPortraitFailed(false);
  }, [freund?.id]);

  if (!dueCallback || !freund) return null;

  const chapter = CHAPTERS.find(c => c.id === freund.chapter);
  const accent = chapter?.color || '#059669';

  const headline = lang === 'en'
    ? `The ${freund.name.en.replace(/^The /, '')} came by`
    : `Der ${freund.name.de.replace(/^Der |^Die /, '')} war hier`;
  const subcopy = lang === 'en'
    ? 'A message arrived'
    : 'Eine Nachricht ist angekommen';

  const arcId = `freund-${freund.id}`;
  // i18n keys follow the convention `arc.<freundId>.beats.callback.*`
  const beforeKey = `arc.${freund.id}.beats.callback.before`;
  const afterKey = `arc.${freund.id}.beats.callback.after`;
  const before = t(beforeKey);
  const after = t(afterKey);

  const handleDismiss = () => {
    VoiceAudio.stop();
    const currentCompleted = state?.freundArcsCompleted || [];
    const currentPending = state?.freundCallbacksPending || [];
    actions.patchState({
      freundArcsCompleted: currentCompleted.includes(arcId)
        ? currentCompleted
        : [...currentCompleted, arcId],
      freundCallbacksPending: currentPending.filter(
        cb => cb.freundId !== freund.id
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-[255] bg-black/50 flex items-center justify-center p-6 overflow-y-auto">
      <div
        className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full shadow-2xl my-8"
        style={{ border: `2px solid ${accent}` }}
      >
        {/* Portrait + headline */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: `${accent}20`, border: `2px solid ${accent}40` }}
          >
            {!portraitFailed ? (
              <img
                src={BASE + freund.portrait}
                alt=""
                aria-hidden
                className="w-full h-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            ) : (
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 32,
                  color: accent,
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                {chapter?.icon || 'forest'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p
              className="font-label text-xs uppercase tracking-wide"
              style={{ color: accent }}
            >
              {subcopy}
            </p>
            <h2
              className="font-headline text-xl font-bold"
              style={{ color: accent }}
            >
              {headline}
            </h2>
          </div>
        </div>

        {/* Ronki's lead-in */}
        {before && before !== beforeKey && (
          <p className="font-body text-sm text-on-surface-variant italic mb-3 leading-relaxed">
            {before}
          </p>
        )}

        {/* Pilzhüter's message */}
        {after && after !== afterKey && (
          <p className="font-body text-base text-on-surface mb-6 leading-relaxed whitespace-pre-line">
            {after}
          </p>
        )}

        <button
          onClick={handleDismiss}
          className="w-full text-white py-4 rounded-2xl font-label font-bold text-lg min-h-[48px]"
          style={{ background: accent }}
        >
          {lang === 'en' ? 'Thank you' : 'Danke'}
        </button>
      </div>
    </div>
  );
}

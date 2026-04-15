import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';

/**
 * Strip shown on Hub when an arc is active. Displays the current beat's
 * narrativeBefore (Ronki's line) and — for craft/lore beats — opens a
 * BeatCompletionModal when tapped. For routine beats, it's informational only.
 */
export default function ArcActiveBanner({ onOpenBeat }) {
  const { t } = useTranslation();
  const { phase, activeArc, activeBeat } = useArc();

  if (phase !== 'active' || !activeArc || !activeBeat) return null;

  const beatIndex = activeArc.beats.findIndex(b => b.id === activeBeat.id);
  const totalBeats = activeArc.beats.length;
  const line = activeBeat.narrativeBefore ? t(activeBeat.narrativeBefore) : '';

  const isTappable = activeBeat.kind === 'craft' || activeBeat.kind === 'lore';

  const Wrapper = isTappable ? 'button' : 'div';

  return (
    <Wrapper
      onClick={isTappable ? () => onOpenBeat?.(activeBeat) : undefined}
      className={`w-full text-left bg-[var(--parchment-gold-soft,#fef3c7)] border-2 border-[color:var(--parchment-gold,#fcd34d)] rounded-2xl p-4 flex items-start gap-3 shadow ${isTappable ? 'hover:brightness-105 active:scale-[0.98] transition' : ''}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}art/companion/ronki-stage-1.png`}
        alt=""
        aria-hidden
        className="w-12 h-auto drop-shadow flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant">
            {t(activeArc.titleKey)}
          </p>
          <p className="font-label text-xs text-on-surface-variant">
            {beatIndex + 1}/{totalBeats}
          </p>
        </div>
        <p className="font-body text-base text-on-surface leading-snug">
          {line}
        </p>
        {isTappable && (
          <p className="font-label text-xs text-primary mt-2">
            {t('arc.banner.tapToOpen')} →
          </p>
        )}
      </div>
    </Wrapper>
  );
}

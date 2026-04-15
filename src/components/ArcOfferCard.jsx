import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';

/**
 * Modal presented when Ronki has offered a new arc.
 * Louis can accept (starts the arc) or decline (arc returns to idle).
 */
export default function ArcOfferCard() {
  const { t } = useTranslation();
  const { phase, offeredArc, accept, decline } = useArc();

  if (phase !== 'offered' || !offeredArc) return null;

  const firstBeat = offeredArc.beats[0];
  const invitation = firstBeat?.narrativeBefore
    ? t(firstBeat.narrativeBefore)
    : t(offeredArc.titleKey);

  return (
    <div className="fixed inset-0 z-[250] bg-black/50 flex items-center justify-center p-6">
      <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`${import.meta.env.BASE_URL}art/companion/ronki-stage-1.png`}
            alt="Ronki"
            className="w-14 h-auto drop-shadow"
          />
          <div>
            <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant">
              {t('arc.offer.ronkiSays')}
            </p>
            <h2 className="font-headline text-xl font-bold text-primary">
              {t(offeredArc.titleKey)}
            </h2>
          </div>
        </div>

        <p className="font-body text-base text-on-surface mb-6 leading-relaxed">
          {invitation}
        </p>

        <div className="flex gap-3">
          <button
            onClick={accept}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-label font-bold text-lg"
          >
            {t('arc.offer.accept')}
          </button>
          <button
            onClick={decline}
            className="flex-1 bg-white/60 text-on-surface py-4 rounded-2xl font-label font-bold text-lg border border-[color:var(--parchment-gold,#fcd34d)]"
          >
            {t('arc.offer.later')}
          </button>
        </div>
      </div>
    </div>
  );
}

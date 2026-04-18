import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useArc } from '../arcs/useArc';
import { FREUND_BY_ID } from '../data/freunde';
import { CHAPTERS } from '../data/creatures';

const BASE = import.meta.env.BASE_URL;

/**
 * Modal presented when Ronki has offered a new arc.
 * Louis can accept (starts the arc) or decline (arc returns to idle).
 *
 * When the offered arc has `freundId` set, the card reskins as a reunion
 * card: Freund portrait (with chapter-icon fallback), chapter-colored
 * accents, and reunion-specific copy. Non-Freund arcs render exactly as
 * before — zero regression.
 */
export default function ArcOfferCard() {
  const { t, lang } = useTranslation();
  const { phase, offeredArc, accept, decline } = useArc();
  const [portraitFailed, setPortraitFailed] = useState(false);

  // Reset fallback flag when the offered arc changes
  React.useEffect(() => {
    setPortraitFailed(false);
  }, [offeredArc?.id]);

  if (phase !== 'offered' || !offeredArc) return null;

  const freund = offeredArc.freundId ? FREUND_BY_ID.get(offeredArc.freundId) : null;

  if (freund) {
    const chapter = CHAPTERS.find(c => c.id === freund.chapter);
    const accent = chapter?.color || '#059669';
    const headline = lang === 'en'
      ? `${freund.name.en} is back`
      : `${freund.name.de} ist wieder da`;
    const subcopy = lang === 'en'
      ? 'Ronki has found an old friend again'
      : 'Ronki hat einen alten Freund wiedergefunden';
    const invitation = offeredArc.beats[0]?.narrativeBefore
      ? t(offeredArc.beats[0].narrativeBefore)
      : '';

    return (
      <div className="fixed inset-0 z-[250] bg-black/50 flex items-center justify-center p-6">
        <div
          className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full shadow-2xl"
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

          {invitation && (
            <p className="font-body text-base text-on-surface mb-6 leading-relaxed">
              {invitation}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={accept}
              className="flex-1 text-white py-4 rounded-2xl font-label font-bold text-lg"
              style={{ background: accent }}
            >
              {t('arc.offer.accept')}
            </button>
            <button
              onClick={decline}
              className="flex-1 bg-white/60 text-on-surface py-4 rounded-2xl font-label font-bold text-lg"
              style={{ border: `1px solid ${accent}40` }}
            >
              {t('arc.offer.later')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Non-Freund arc — original layout preserved.
  const firstBeat = offeredArc.beats[0];
  const invitation = firstBeat?.narrativeBefore
    ? t(firstBeat.narrativeBefore)
    : t(offeredArc.titleKey);

  return (
    <div className="fixed inset-0 z-[250] bg-black/50 flex items-center justify-center p-6">
      <div className="bg-[var(--parchment-gold-soft,#fef3c7)] rounded-3xl p-6 max-w-md w-full border-2 border-[color:var(--parchment-gold,#fcd34d)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`${BASE}art/companion/ronki-stage-1.png`}
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

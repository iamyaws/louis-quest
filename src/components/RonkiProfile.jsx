import React from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getCatStage } from '../utils/helpers';

/**
 * Phase 1 stub for Ronki Profile. Replaces Hero Profile in the nav slot.
 * Full buildout (About/Details/Traits tabs, Memory card, Micropedia link,
 * Discovery log) lands in Phase 2.
 *
 * Field notes:
 * - state.catEvo exists; getCatStage(catEvo) returns 0–4 (Ei/Baby/Jungtier/Stolz/Legendär)
 * - Dragon art files: dragon-baby.webp (stages 0-1), dragon-young.webp (2),
 *   dragon-majestic.webp (3), dragon-legendary.webp (4)
 * - state.daysTogether does not exist; using state.totalTaskDays (increments each
 *   day all quests are completed — nearest available "days together" proxy)
 * - familyConfig.dragonName does not exist; companion is always called "Ronki"
 */

const DRAGON_ART = ['dragon-baby', 'dragon-baby', 'dragon-young', 'dragon-majestic', 'dragon-legendary'];

export default function RonkiProfile() {
  const { t } = useTranslation();
  const { state } = useTask();
  const evoStage = getCatStage(state?.catEvo || 0);
  const daysTogether = state?.totalTaskDays || 0;
  const dragonName = 'Ronki';
  const artFile = DRAGON_ART[evoStage] || 'dragon-baby';

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <img
          src={`${import.meta.env.BASE_URL}art/companion/${artFile}.webp`}
          alt={dragonName}
          className="w-40 h-auto drop-shadow-lg mb-4"
        />
        <h1 className="font-headline text-3xl font-bold text-primary mb-1">
          {dragonName}
        </h1>
        <p className="font-body text-on-surface-variant mb-6">
          {t('ronki.evoLabel')} {evoStage}
        </p>

        <div className="w-full max-w-sm bg-[var(--parchment-gold-soft,#fef3c7)] rounded-2xl p-6 border border-[color:var(--parchment-gold,#fcd34d)]">
          <p className="font-label text-sm text-on-surface-variant mb-1">
            {t('ronki.daysTogetherLabel')}
          </p>
          <p className="font-headline text-4xl font-bold text-primary">
            {daysTogether}
          </p>
        </div>

        <p className="mt-8 font-body text-sm text-on-surface-variant italic max-w-xs">
          {t('ronki.stubNote')}
        </p>
      </div>
    </div>
  );
}

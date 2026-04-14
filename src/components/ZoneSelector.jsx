import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * Horizontal row of zone pills — Sanctuary / Meadow / Nebel-Höhle.
 * Locked zones appear dimmed with a lock icon; tapping surfaces the
 * unlock hint inline (the parent hook manages the "locked attempt" flag).
 */
export default function ZoneSelector({
  zones,
  activeZone,
  lockedAttemptZoneId,
  onSelect,
  isUnlocked,
}) {
  const { t } = useTranslation();

  const attempted = zones.find(z => z.id === lockedAttemptZoneId);

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto px-1 pb-2"
           style={{ scrollbarWidth: 'none' }}
           role="tablist"
           aria-label={t('zone.selector.label') || 'Orte'}>
        {zones.map(zone => {
          const unlocked = isUnlocked(zone);
          const isActive = activeZone.id === zone.id;
          const bg = isActive ? zone.accent : '#ffffff';
          const fg = isActive ? '#ffffff' : unlocked ? zone.accent : '#9ca3af';
          const border = isActive
            ? zone.accent
            : unlocked
            ? 'rgba(18,67,70,0.12)'
            : 'rgba(156,163,175,0.25)';
          return (
            <button
              key={zone.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={!unlocked}
              onClick={() => onSelect(zone.id)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-label font-bold inline-flex items-center gap-1.5 transition-all active:scale-95"
              style={{
                background: bg,
                color: fg,
                border: `1.5px solid ${border}`,
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <span aria-hidden className="text-base leading-none">{zone.emoji}</span>
              <span>{t(zone.nameKey)}</span>
              {!unlocked && (
                <span
                  aria-hidden
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px', marginLeft: 2 }}
                >
                  lock
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline unlock hint — appears for 3s when user taps a locked zone */}
      {attempted && (
        <div
          className="rounded-xl px-3 py-2 text-xs font-body text-center mt-1"
          style={{
            background: 'rgba(252,211,77,0.18)',
            border: '1px solid rgba(252,211,77,0.4)',
            color: '#124346',
          }}
          role="status"
        >
          {attempted.emoji} {t(attempted.unlockHintKey)}
        </div>
      )}
    </div>
  );
}

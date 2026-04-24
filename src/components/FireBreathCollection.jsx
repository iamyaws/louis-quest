import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import TeachRitualModal, { RITUAL_COPY } from './TeachRitualModal';

/**
 * FireBreathCollection — shows the kid's unlocked + locked fire breaths.
 *
 * Replaces the "Spiele" segment on the RonkiProfile sub-nav (Marc 24 Apr
 * 2026). Five tiles — one per flavor — signal progression:
 *   · flame (always unlocked after onboarding teach beat)
 *   · funkenstern, herzfeuer, glut, regenbogenfeuer (locked until taught)
 *
 * When state.pendingRitual is set (kid crossed a totalTasksDone
 * threshold), the component shows a prominent "Ritual wartet" card
 * at the top that mounts TeachRitualModal when tapped. On completion
 * the modal dispatches teachBreath() — that clears pendingRitual and
 * flips the matching tile from locked to taught on re-render.
 *
 * Locked tiles show the flavor's icon as an outline + grey + a small
 * lock badge so the kid sees what's still to come. Taught tiles show
 * the colored icon + the ISO date of the teach ritual.
 */

// Material icon per flavor, with a fallback rainbow SVG for the
// rainbow flavor (Material Symbols has no direct rainbow glyph).
// The icon + iconFill pair lets the same string drive both the
// filled/taught state and the hollow/locked state via
// font-variation-settings 'FILL' 0|1.
const FLAVOR_META = {
  flame: {
    icon: 'local_fire_department',
    color: '#f97316',  // orange
    bg: 'rgba(249,115,22,0.12)',
    labelKey: 'feuer.tile.flame',
  },
  sparkle: {
    icon: 'auto_awesome',  // sparkle / magic wand with stars
    color: '#fbbf24',  // warm gold
    bg: 'rgba(251,191,36,0.12)',
    labelKey: 'feuer.tile.sparkle',
  },
  heart: {
    icon: 'favorite',
    color: '#ec4899',  // pink
    bg: 'rgba(236,72,153,0.12)',
    labelKey: 'feuer.tile.heart',
  },
  ember: {
    icon: 'whatshot',  // flame with hot/ember connotation
    color: '#dc2626',  // deep red-orange
    bg: 'rgba(220,38,38,0.12)',
    labelKey: 'feuer.tile.ember',
  },
  rainbow: {
    icon: null,  // rendered as custom SVG below
    color: '#a855f7',  // violet center for the SVG arc fallback
    bg: 'rgba(168,85,247,0.12)',
    labelKey: 'feuer.tile.rainbow',
  },
};

const ORDER = ['flame', 'sparkle', 'heart', 'ember', 'rainbow'];

// Tiny rainbow arc SVG for the rainbow tile. Colored when taught,
// greyscale when locked (opacity handles that).
function RainbowIcon({ filled }) {
  const stops = filled
    ? ['#dc2626', '#f97316', '#fbbf24', '#4ade80', '#22d3ee', '#8b5cf6', '#ec4899']
    : ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'];
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
      {stops.map((c, i) => (
        <path
          key={i}
          d={`M ${4 + i * 2} 38 A ${20 - i * 2} ${20 - i * 2} 0 0 1 ${44 - i * 2} 38`}
          stroke={c}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity={filled ? 1 : 0.55}
        />
      ))}
    </svg>
  );
}

function FlavorTile({ flavor, taughtAt, isPending, onTap }) {
  const { t } = useTranslation();
  const meta = FLAVOR_META[flavor];
  const taught = !!taughtAt;
  // Format the teach date as a short localized string (de: "24.04." / en: "04/24")
  const dateLabel = taught ? formatShortDate(taughtAt) : null;

  return (
    <button
      type="button"
      onClick={isPending ? onTap : undefined}
      disabled={!isPending}
      aria-pressed={isPending ? false : undefined}
      aria-label={taught ? `${t(meta.labelKey)} — ${dateLabel}` : `${t(meta.labelKey)} — ${t('feuer.tile.locked')}`}
      className={isPending ? 'active:scale-95 transition-transform' : ''}
      style={{
        flex: 1,
        minWidth: 0,
        padding: '10px 4px 8px',
        borderRadius: 14,
        background: taught ? meta.bg : 'rgba(148,163,184,0.08)',
        border: isPending
          ? `1.5px solid ${meta.color}`
          : taught
          ? `1px solid ${meta.color}33`
          : '1px dashed rgba(148,163,184,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        cursor: isPending ? 'pointer' : 'default',
        boxShadow: isPending ? `0 0 16px ${meta.color}66` : 'none',
      }}
    >
      {/* Icon */}
      <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', marginTop: 2 }}>
        {flavor === 'rainbow' ? (
          <RainbowIcon filled={taught} />
        ) : (
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 34,
              color: taught ? meta.color : '#94a3b8',
              fontVariationSettings: taught ? "'FILL' 1" : "'FILL' 0",
              opacity: taught ? 1 : 0.55,
            }}
          >
            {meta.icon}
          </span>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          font: '700 10px/1.15 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: taught ? '#124346' : '#64748b',
          textAlign: 'center',
          minHeight: 22,
        }}
      >
        {t(meta.labelKey)}
      </div>

      {/* Sub-label — date when taught, "gesperrt" when locked */}
      <div
        style={{
          font: '500 9px/1 "Plus Jakarta Sans", sans-serif',
          color: taught ? meta.color : '#94a3b8',
          letterSpacing: taught ? 0 : '.08em',
          textTransform: taught ? 'none' : 'uppercase',
          opacity: taught ? 0.9 : 0.75,
        }}
      >
        {taught ? dateLabel : t('feuer.tile.locked')}
      </div>

      {/* Lock badge — only on locked tiles */}
      {!taught && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#cbd5e1',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#475569' }}>
            lock
          </span>
        </span>
      )}

      {/* Pulse indicator on the tile matching pendingRitual so the
          kid sees exactly which tile has a waiting ritual. */}
      {isPending && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: meta.color,
            boxShadow: `0 0 10px ${meta.color}`,
            animation: 'fbcPulse 1.6s ease-in-out infinite',
          }}
        />
      )}
    </button>
  );
}

function formatShortDate(iso) {
  // "2026-04-24" → "24.04." (de) — fine for any lang since it's just numerics
  if (!iso || typeof iso !== 'string') return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.`;
}

export default function FireBreathCollection() {
  const { t } = useTranslation();
  const { state } = useTask();
  const taughtBreaths = state?.taughtBreaths || {};
  const pendingRitual = state?.pendingRitual;

  // Ritual modal mount state — separate from pendingRitual so the kid
  // has to actively tap the "Jetzt starten" card to open the modal.
  // That's the design choice per Marc (discoverable, not interruptive).
  const [ritualOpen, setRitualOpen] = useState(false);

  const pendingMeta = pendingRitual ? FLAVOR_META[pendingRitual] : null;
  const pendingLabel = pendingRitual ? t(FLAVOR_META[pendingRitual].labelKey) : '';

  const taughtCount = ORDER.filter(f => !!taughtBreaths[f]).length;

  return (
    <>
      <section style={{ marginBottom: 14 }}>
        {/* Header kicker — mirrors the other Ronki-profile sections */}
        <div
          style={{
            font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#78350f',
            marginBottom: 8,
            paddingLeft: 2,
          }}
        >
          {t('feuer.kicker')}
        </div>

        <div
          className="rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #fffdf5, #fef3c7)',
            border: '1.5px solid rgba(245,158,11,0.25)',
            padding: 14,
            boxShadow: '0 6px 14px -6px rgba(180,83,9,0.2)',
          }}
        >
          {/* Progress line — "N von 5 gelernt" */}
          <div
            style={{
              font: '600 11px/1.2 "Nunito", sans-serif',
              color: '#78350f',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            {t('feuer.progress', { done: taughtCount, total: ORDER.length })}
          </div>

          {/* Ritual-waiting card — shown only when pendingRitual is set */}
          <AnimatePresence>
            {pendingRitual && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={() => setRitualOpen(true)}
                className="w-full text-left active:scale-[0.98] transition-transform"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${pendingMeta.color}22, ${pendingMeta.color}11)`,
                  border: `1.5px solid ${pendingMeta.color}`,
                  boxShadow: `0 8px 18px -6px ${pendingMeta.color}66`,
                  marginBottom: 12,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: pendingMeta.color,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    animation: 'fbcPulse 1.6s ease-in-out infinite',
                  }}
                >
                  {pendingRitual === 'rainbow' ? (
                    <RainbowIcon filled={true} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff', fontVariationSettings: "'FILL' 1" }}>
                      {pendingMeta.icon}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: '#78350f',
                      marginBottom: 3,
                    }}
                  >
                    {t('feuer.ritualWaiting')}
                  </div>
                  <b style={{ font: '800 15px/1.1 "Fredoka", sans-serif', color: '#124346' }}>
                    {pendingLabel}
                  </b>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, color: pendingMeta.color, fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Five flavor tiles in a row. On narrow viewports they squash
              to fit — flex: 1 per tile keeps them equal-width. */}
          <div style={{ display: 'flex', gap: 6 }}>
            {ORDER.map(flavor => (
              <FlavorTile
                key={flavor}
                flavor={flavor}
                taughtAt={taughtBreaths[flavor]}
                isPending={pendingRitual === flavor}
                onTap={() => setRitualOpen(true)}
              />
            ))}
          </div>

          {/* Soft caption below the row — hints progression without
              spoiling the unlock thresholds. */}
          <p
            style={{
              font: '500 10px/1.4 "Nunito", sans-serif',
              color: '#78350f',
              textAlign: 'center',
              marginTop: 10,
              opacity: 0.8,
            }}
          >
            {t('feuer.hint')}
          </p>
        </div>
      </section>

      {/* Ritual modal mounts when ritualOpen=true. Dispatches
          teachBreath() on completion (TeachRitualModal handles this),
          which clears pendingRitual via the reducer. */}
      <AnimatePresence>
        {ritualOpen && pendingRitual && (
          <TeachRitualModal
            flavor={pendingRitual}
            copyKeys={RITUAL_COPY[pendingRitual]}
            onClose={() => setRitualOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Shared pulse keyframe for lock badge + ritual card */}
      <style>{`
        @keyframes fbcPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.12); opacity: 0.75; }
        }
      `}</style>
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SFX from '../utils/sfx';
import { useTask } from '../context/TaskContext';
import { getCreatureSpritePath } from '../data/creatures';

/**
 * MusterMemoryGame — Simon-Says sequence repeat MINT game hosted by Baumbart.
 *
 * Mechanic (per Wave 2.5 spec):
 *   - Baumbart shows a sequence of forest icons.
 *   - Louis taps them back in the same order.
 *   - Correct sequence advances the level; wrong tap replays the same sequence.
 *   - 3 levels: 3 / 4 / 5 item sequences.
 *
 * Badge: first level-1 completion grants badge_mint_muster.
 * Reward: +50 HP on Level 3 completion → onComplete({ hp: 50 }).
 */

const BAUMBART_SPRITE = getCreatureSpritePath({
  art: 'art/micropedia/creatures/baumbart.webp',
});
const base =
  typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// 6 forest icons — 3x2 grid
const ITEMS = [
  { id: 'blatt',   emoji: '🍃', label: 'Blatt',       tint: '#86efac' },
  { id: 'eichel',  emoji: '🌰', label: 'Eichel',      tint: '#fcd34d' },
  { id: 'herbst',  emoji: '🍂', label: 'Herbstblatt', tint: '#fb923c' },
  { id: 'tanne',   emoji: '🌲', label: 'Tanne',       tint: '#4ade80' },
  { id: 'pilz',    emoji: '🍄', label: 'Pilz',        tint: '#fca5a5' },
  { id: 'kraut',   emoji: '🌿', label: 'Kraut',       tint: '#a7f3d0' },
];

const LEVELS = [
  { length: 3, label: 'Stufe 1 von 3' },
  { length: 4, label: 'Stufe 2 von 3' },
  { length: 5, label: 'Stufe 3 von 3' },
];

const SHOW_MS = 700;
const GAP_MS = 400;
const CORRECT_FLASH_MS = 300;
const WRONG_FLASH_MS = 400;

function randomSequence(length) {
  const out = [];
  for (let i = 0; i < length; i++) {
    out.push(ITEMS[Math.floor(Math.random() * ITEMS.length)].id);
  }
  return out;
}

export default function MusterMemoryGame({ onComplete }) {
  const { actions } = useTask();
  const timers = useRef([]);
  const badgeClaimedRef = useRef(false);

  const [levelIdx, setLevelIdx] = useState(0); // 0..2
  const [sequence, setSequence] = useState(() => randomSequence(LEVELS[0].length));
  const [phase, setPhase] = useState('intro'); // intro | showing | awaiting | correctFlash | wrongFlash | levelDone | gameDone
  const [showIndex, setShowIndex] = useState(-1); // which item is currently glowing in the sequence
  const [tapIndex, setTapIndex] = useState(0);    // progress through the user's reproduction
  const [flashId, setFlashId] = useState(null);   // which card to flash (correct/wrong)

  const level = LEVELS[levelIdx];

  // Clean up pending timers
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Start the "show the sequence" playback
  const playSequence = useCallback((seq) => {
    clearTimers();
    setPhase('showing');
    setShowIndex(-1);
    setTapIndex(0);
    seq.forEach((id, i) => {
      const showStart = i * (SHOW_MS + GAP_MS);
      timers.current.push(
        setTimeout(() => {
          setShowIndex(i);
          SFX.play('pop');
          if (navigator.vibrate) navigator.vibrate(20);
        }, showStart)
      );
      timers.current.push(
        setTimeout(() => {
          setShowIndex(-1);
        }, showStart + SHOW_MS)
      );
    });
    // After the last item's gap, move to awaiting
    timers.current.push(
      setTimeout(() => {
        setShowIndex(-1);
        setPhase('awaiting');
        setTapIndex(0);
      }, seq.length * (SHOW_MS + GAP_MS))
    );
  }, [clearTimers]);

  // Kick off the first sequence on mount
  useEffect(() => {
    // Small intro delay so Louis can see "Schau gut zu"
    const t = setTimeout(() => {
      playSequence(sequence);
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Claim badge on first level-1 win (idempotent via action)
  const claimBadgeOnce = useCallback(() => {
    if (badgeClaimedRef.current) return;
    badgeClaimedRef.current = true;
    try {
      actions.claimMintBadge('badge_mint_muster', 'muster-memory');
    } catch {
      // silent
    }
  }, [actions]);

  const handleCardTap = useCallback((itemId) => {
    if (phase !== 'awaiting') return;
    const expected = sequence[tapIndex];
    if (itemId === expected) {
      // correct
      setFlashId(`good-${itemId}-${Date.now()}`);
      SFX.play('coin');
      if (navigator.vibrate) navigator.vibrate(20);
      const newIdx = tapIndex + 1;
      setTapIndex(newIdx);
      if (newIdx >= sequence.length) {
        // sequence complete
        SFX.play('celeb');
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
        claimBadgeOnce();
        // final level?
        if (levelIdx >= LEVELS.length - 1) {
          setPhase('gameDone');
        } else {
          setPhase('levelDone');
          timers.current.push(
            setTimeout(() => {
              const nextIdx = levelIdx + 1;
              const nextSeq = randomSequence(LEVELS[nextIdx].length);
              setLevelIdx(nextIdx);
              setSequence(nextSeq);
              playSequence(nextSeq);
            }, 1500)
          );
        }
      } else {
        setPhase('correctFlash');
        timers.current.push(
          setTimeout(() => {
            setPhase('awaiting');
          }, CORRECT_FLASH_MS)
        );
      }
    } else {
      // wrong
      setFlashId(`bad-${itemId}-${Date.now()}`);
      setPhase('wrongFlash');
      SFX.play('crash');
      if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
      timers.current.push(
        setTimeout(() => {
          // Replay same sequence
          playSequence(sequence);
        }, 1200)
      );
    }
  }, [phase, sequence, tapIndex, levelIdx, claimBadgeOnce, playSequence]);

  // Status message under Baumbart
  let statusText;
  if (phase === 'intro') statusText = 'Schau gut zu.';
  else if (phase === 'showing') statusText = 'Merk dir das Muster...';
  else if (phase === 'awaiting') statusText = 'Jetzt du!';
  else if (phase === 'correctFlash') statusText = 'Gut!';
  else if (phase === 'wrongFlash') statusText = 'Nochmal zusammen.';
  else if (phase === 'levelDone') statusText = 'Super gemacht!';
  else statusText = '';

  // Which card is currently "glowing" during showing?
  const glowingId = phase === 'showing' && showIndex >= 0 ? sequence[showIndex] : null;

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 60%, #a7f3d0 100%)',
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(5,150,105,0.18)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">🔁</span>
          <div className="min-w-0">
            <h1
              className="font-headline font-bold text-lg leading-none truncate"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Muster-Memory
            </h1>
            <p className="font-label text-[11px] leading-tight" style={{ color: '#059669' }}>
              Baumbart zeigt dir ein Muster
            </p>
          </div>
        </div>
        <button
          onClick={() => onComplete?.({ hp: 0 })}
          className="px-4 py-2 rounded-full font-label font-bold text-sm min-h-[40px] active:scale-95 transition-transform"
          style={{ background: 'rgba(5,150,105,0.15)', color: '#065f46' }}
        >
          Beenden
        </button>
      </header>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center px-5"
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Baumbart portrait + speech */}
        <div
          className="relative w-32 h-32 mt-2 rounded-full flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(252,211,77,0.28) 0%, rgba(252,211,77,0) 70%)',
          }}
        >
          <img
            src={base + BAUMBART_SPRITE}
            alt="Baumbart"
            className="w-full h-full object-contain drop-shadow-lg select-none"
            draggable={false}
          />
        </div>

        {/* Level label */}
        <p
          className="font-label font-bold text-xs uppercase tracking-[0.2em] mt-3"
          style={{ color: '#047857' }}
        >
          {level.label}
        </p>

        {/* Speech bubble */}
        <div
          className="relative mt-2 rounded-2xl px-5 py-3 max-w-xs w-full text-center"
          style={{
            background: 'white',
            border: '1.5px solid rgba(5,150,105,0.25)',
            boxShadow: '0 4px 12px rgba(5,150,105,0.1)',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
            style={{
              background: 'white',
              borderTop: '1.5px solid rgba(5,150,105,0.25)',
              borderLeft: '1.5px solid rgba(5,150,105,0.25)',
            }}
          />
          <p
            className="font-headline font-bold text-lg"
            style={{ color: '#065f46', fontFamily: 'Fredoka, sans-serif' }}
          >
            {statusText}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-4">
          {sequence.map((_, i) => {
            const filled =
              (phase === 'showing' && showIndex >= i) ||
              (phase === 'awaiting' && tapIndex > i) ||
              (phase === 'correctFlash' && tapIndex > i) ||
              phase === 'levelDone' ||
              phase === 'gameDone';
            return (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: 14,
                  height: 14,
                  background: filled ? '#059669' : 'rgba(5,150,105,0.2)',
                  border: '1.5px solid rgba(5,150,105,0.4)',
                }}
              />
            );
          })}
        </div>

        {/* 3x2 card grid */}
        <div
          className="grid grid-cols-3 gap-3 mt-5 w-full"
          style={{ maxWidth: 360 }}
        >
          {ITEMS.map((item) => {
            const isGlowing = glowingId === item.id;
            const isGoodFlash =
              flashId?.startsWith(`good-${item.id}`) && phase !== 'awaiting';
            const isBadFlash =
              flashId?.startsWith(`bad-${item.id}`) && phase === 'wrongFlash';

            const ring = isBadFlash
              ? '#dc2626'
              : isGoodFlash
              ? '#16a34a'
              : isGlowing
              ? '#fcd34d'
              : 'rgba(5,150,105,0.22)';
            const glow = isGlowing
              ? '0 0 0 6px rgba(252,211,77,0.45), 0 8px 22px rgba(252,211,77,0.35)'
              : isGoodFlash
              ? '0 0 0 4px rgba(34,197,94,0.35)'
              : isBadFlash
              ? '0 0 0 4px rgba(239,68,68,0.35)'
              : '0 4px 12px rgba(5,150,105,0.12)';

            const disabled = phase !== 'awaiting';
            return (
              <button
                key={item.id}
                onClick={() => handleCardTap(item.id)}
                disabled={disabled}
                aria-label={item.label}
                className="relative rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
                style={{
                  aspectRatio: '1 / 1',
                  minHeight: 100,
                  minWidth: 100, // >= 44px touch target is guaranteed
                  background: `linear-gradient(135deg, white, ${item.tint}33)`,
                  border: `2.5px solid ${ring}`,
                  boxShadow: glow,
                  opacity: disabled && !isGlowing && !isGoodFlash && !isBadFlash ? 0.78 : 1,
                  cursor: disabled ? 'default' : 'pointer',
                }}
              >
                <span
                  className="select-none leading-none"
                  style={{ fontSize: 48, fontFamily: 'Fredoka, sans-serif' }}
                  aria-hidden="true"
                >
                  {item.emoji}
                </span>
                <span
                  className="font-label font-bold text-[11px] mt-1"
                  style={{ color: '#065f46' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-game celebration overlay */}
      {phase === 'gameDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,243,208,0.95), rgba(110,231,183,0.95))',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(5,150,105,0.3)',
            }}
          >
            <div className="text-7xl mb-2">🏆</div>
            <p
              className="font-label font-bold text-xs uppercase tracking-[0.22em] mb-1"
              style={{ color: '#047857' }}
            >
              Neuer Titel
            </p>
            <h2
              className="font-headline font-bold text-3xl mb-2"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Muster-Meister!
            </h2>
            <p className="font-body text-base mb-5" style={{ color: '#059669' }}>
              Baumbart nickt zufrieden.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(252,211,77,0.2)', color: '#92620a' }}
            >
              <span className="text-lg">💛</span>
              <span className="font-label font-bold text-sm">+50 Sterne für Ronki</span>
            </div>
            <button
              onClick={() => onComplete?.({ hp: 50 })}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(5,150,105,0.4)',
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

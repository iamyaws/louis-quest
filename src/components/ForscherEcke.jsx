import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { MINT_GAMES } from '../data/mintGames';
import { FREUND_BY_ID } from '../data/freunde';
import { SEED_BY_ID } from '../data/creatures';
import FreundIntroModal from './FreundIntroModal';
import SFX from '../utils/sfx';

/**
 * ForscherEcke — discovery section for MINT games on the Hub.
 *
 * Behavior:
 *   - Only rendered when AT LEAST ONE game's unlockCheck passes.
 *   - Each slot shows one of four states: locked / unlocked-unplayed /
 *     played (badge earned) / bald (implemented=false even when unlocked).
 *
 * Taps:
 *   - locked             → flash hint "Erst wenn du {Host} kennenlernst."
 *   - unlocked-unplayed  → open FreundIntroModal → on accept call onPlayGame
 *   - played (badge)     → onPlayGame directly (no intro again)
 *   - bald (not built)   → toast "Bald kommt das Abenteuer!"
 *
 * Props:
 *   - onPlayGame: (gameId: string) => void
 */

const getHostName = (hostId) => {
  const freund = FREUND_BY_ID.get(hostId);
  if (freund) return freund.name.de;
  const creature = SEED_BY_ID.get(hostId);
  if (creature) return creature.name.de;
  return hostId;
};

export default function ForscherEcke({ onPlayGame }) {
  const { state } = useTask();
  const [lockedHint, setLockedHint] = useState(null);   // game.id flash
  const [baldToast, setBaldToast] = useState(null);     // game.id flash
  const [introFor, setIntroFor] = useState(null);       // game object

  if (!state) return null;

  // Evaluate each game's unlock state once
  const slots = MINT_GAMES.map(game => {
    const unlocked = game.unlockCheck(state);
    const badgeEarned = (state.mintBadgesEarned || []).includes(game.badgeId);
    const played = (state.mintGamesPlayed || []).includes(game.id);
    const shippable = game.implemented;
    // Derived visual state
    let status;
    if (!unlocked) status = 'locked';
    else if (!shippable) status = 'bald';
    else if (badgeEarned) status = 'played';
    else status = 'unlocked';
    return { game, status, played };
  });

  // Gate: only render if ANY game is unlocked (shippable or bald)
  const anyUnlocked = slots.some(s => s.status !== 'locked');
  if (!anyUnlocked) return null;

  const unlockedCount = slots.filter(s => s.status !== 'locked').length;
  const playedCount = slots.filter(s => s.status === 'played').length;

  const handleTap = (slot) => {
    const { game, status } = slot;
    SFX.play('pop');
    if (status === 'locked') {
      setLockedHint(game.id);
      setTimeout(() => setLockedHint(null), 2400);
      return;
    }
    if (status === 'bald') {
      setBaldToast(game.id);
      setTimeout(() => setBaldToast(null), 2400);
      return;
    }
    if (status === 'played') {
      onPlayGame?.(game.id);
      return;
    }
    // unlocked-unplayed → show intro first
    setIntroFor(game);
  };

  const handleAcceptIntro = () => {
    if (!introFor) return;
    const gameId = introFor.id;
    setIntroFor(null);
    onPlayGame?.(gameId);
  };

  return (
    <section
      className="w-full p-5 rounded-2xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        border: '1.5px solid rgba(5,150,105,0.22)',
        boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🔬</span>
          <div>
            <p
              className="font-headline font-bold text-lg leading-tight"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Forscher-Ecke
            </p>
            <p className="font-label text-xs" style={{ color: '#059669' }}>
              {playedCount} / {MINT_GAMES.length} Knobel-Abenteuer entdeckt
            </p>
          </div>
        </div>
        <span
          className="font-label font-bold text-xs px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(5,150,105,0.12)', color: '#047857' }}
        >
          NEU
        </span>
      </div>

      {/* 5-slot grid */}
      <div className="grid grid-cols-5 gap-2">
        {slots.map((slot) => (
          <SlotCard
            key={slot.game.id}
            slot={slot}
            isLockedHint={lockedHint === slot.game.id}
            isBaldToast={baldToast === slot.game.id}
            onTap={() => handleTap(slot)}
          />
        ))}
      </div>

      {/* Flash hints pinned beneath grid */}
      {lockedHint && (() => {
        const slot = slots.find(s => s.game.id === lockedHint);
        if (!slot) return null;
        const hostName = getHostName(slot.game.hostId);
        return (
          <div
            className="mt-3 rounded-xl p-3 flex items-center gap-2"
            style={{ background: 'rgba(18,67,70,0.06)', border: '1px solid rgba(18,67,70,0.12)' }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: '#124346' }}>lock</span>
            <p className="font-body text-sm text-on-surface">
              Erst wenn du {hostName} kennenlernst.
            </p>
          </div>
        );
      })()}

      {baldToast && (
        <div
          className="mt-3 rounded-xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(252,211,77,0.18)', border: '1px solid rgba(252,211,77,0.35)' }}
        >
          <span className="text-base" aria-hidden="true">⏳</span>
          <p className="font-body text-sm text-on-surface">Bald kommt das Abenteuer!</p>
        </div>
      )}

      {/* Freund intro overlay */}
      {introFor && (
        <FreundIntroModal
          gameId={introFor.id}
          onAccept={handleAcceptIntro}
          onDismiss={() => setIntroFor(null)}
        />
      )}
    </section>
  );
}

// ── Single slot card ──
function SlotCard({ slot, isLockedHint, isBaldToast, onTap }) {
  const { game, status } = slot;
  const isLocked = status === 'locked';
  const isBald = status === 'bald';
  const isPlayed = status === 'played';
  const isNew = status === 'unlocked';

  const ring = isPlayed ? 'rgba(5,150,105,0.55)'
             : isNew     ? 'rgba(252,211,77,0.6)'
             : isBald    ? 'rgba(161,98,7,0.3)'
             :             'rgba(18,67,70,0.18)';
  const bg = isPlayed ? 'rgba(52,211,153,0.12)'
           : isNew     ? 'rgba(252,211,77,0.14)'
           : isBald    ? 'rgba(161,98,7,0.08)'
           :             'rgba(18,67,70,0.05)';

  return (
    <button
      onClick={onTap}
      aria-label={isLocked ? 'Noch gesperrt' : game.name.de}
      className="relative aspect-square rounded-xl flex flex-col items-center justify-center p-1.5 active:scale-95 transition-transform"
      style={{
        background: bg,
        border: `1.5px solid ${ring}`,
        minHeight: 64,
        minWidth: 56,
        animation: (isLockedHint || isBaldToast) ? 'slotShake 0.4s ease-in-out' : undefined,
      }}
    >
      {isLocked ? (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#94a3b8' }}>lock</span>
          <span className="font-label font-bold text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>???</span>
        </>
      ) : isPlayed ? (
        <>
          <span className="select-none leading-none" style={{ fontSize: 26, fontFamily: 'Fredoka, sans-serif' }}>
            {game.emoji}
          </span>
          <span
            className="material-symbols-outlined absolute -top-1 -right-1"
            style={{ fontSize: 18, color: '#059669', fontVariationSettings: "'FILL' 1", background: 'white', borderRadius: '50%' }}
          >
            check_circle
          </span>
          <span
            className="font-label font-bold text-[9px] mt-1 leading-tight text-center px-0.5"
            style={{ color: '#047857' }}
          >
            Bestanden
          </span>
        </>
      ) : isBald ? (
        <>
          <span className="select-none leading-none opacity-55" style={{ fontSize: 26, fontFamily: 'Fredoka, sans-serif' }}>
            {game.emoji}
          </span>
          <span className="font-label font-bold text-[9px] mt-1" style={{ color: '#b45309' }}>Bald...</span>
        </>
      ) : (
        <>
          <span className="select-none leading-none" style={{ fontSize: 26, fontFamily: 'Fredoka, sans-serif' }}>
            {game.emoji}
          </span>
          <span
            className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full font-label font-bold text-[8px]"
            style={{ background: '#fcd34d', color: '#725b00', border: '1.5px solid white' }}
          >
            NEU
          </span>
          <span
            className="font-label font-bold text-[9px] mt-1 leading-tight text-center px-0.5"
            style={{ color: '#1c1b1e' }}
          >
            {game.name.de}
          </span>
        </>
      )}

      <style>{`
        @keyframes slotShake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-3px); }
          75%      { transform: translateX(3px); }
        }
      `}</style>
    </button>
  );
}

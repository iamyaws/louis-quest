import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { MINT_SEQUENCE } from '../data/mintGames';
import FreundIntroModal from './FreundIntroModal';
import SFX from '../utils/sfx';

/**
 * ForscherEcke — sequential MINT-game progression on the Hub.
 *
 * Unlock model (Apr 2026): game N unlocks when game N-1's badge is earned.
 *   - Game 1 is always unlocked.
 *   - Unimplemented games are filtered out of the sequence (see MINT_SEQUENCE
 *     in data/mintGames.ts) and never block progression.
 *   - When all implemented badges are earned, the Hub hides this whole
 *     card (graduation) — handled in Hub.jsx via isForscherGraduated.
 *
 * Slot states:
 *   - locked              → future game, waiting for previous badge
 *   - unlocked-unplayed   → available, emits NEU badge
 *   - played (badgeEarned) → completed, tap replays the game
 *
 * Taps:
 *   - locked             → flash hint "Schließe zuerst {prev} ab"
 *   - unlocked-unplayed  → open FreundIntroModal → on accept call onPlayGame
 *   - played (badge)     → onPlayGame directly (no intro again)
 *
 * Props:
 *   - onPlayGame: (gameId: string) => void
 */

export default function ForscherEcke({ onPlayGame }) {
  const { state, actions } = useTask();
  const [lockedHint, setLockedHint] = useState(null);   // game.id flash
  const [introFor, setIntroFor] = useState(null);       // game object

  if (!state) return null;

  // Evaluate each game's unlock state once, using the implemented-only sequence.
  const slots = MINT_SEQUENCE.map(game => {
    const unlocked = game.unlockCheck(state);
    const badgeEarned = (state.mintBadgesEarned || []).includes(game.badgeId);
    const played = (state.mintGamesPlayed || []).includes(game.id);
    let status;
    if (!unlocked) status = 'locked';
    else if (badgeEarned) status = 'played';
    else status = 'unlocked';
    return { game, status, played };
  });

  const playedCount = slots.filter(s => s.status === 'played').length;

  const handleTap = (slot) => {
    const { game, status } = slot;
    SFX.play('pop');
    if (status === 'locked') {
      setLockedHint(game.id);
      setTimeout(() => setLockedHint(null), 2400);
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
    // Record first-play: distinct from badge earn (recorded on completion).
    // Lets us track "started but bailed" for future analytics/observation.
    actions.recordMintGamePlay?.(gameId);
    setIntroFor(null);
    onPlayGame?.(gameId);
  };

  return (
    <section
      className="w-full p-6 rounded-2xl relative overflow-hidden"
      style={{
        // Match the HEUTE card: cream → soft amber gradient, white hairline,
        // same elevated shadow + inset highlight. One visual system across
        // the Hub's primary cards.
        background: 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,244,224,0.88) 80%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 12px 36px -8px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Decorative sparkles — same flourish as HEUTE */}
      <span className="absolute top-3 right-16 text-base opacity-60 select-none" aria-hidden="true">✦</span>
      <span className="absolute bottom-3 left-5 text-xs opacity-40 select-none" aria-hidden="true">✦</span>

      {/* Header — eyebrow + headline + count, Doktor Funkel anchored right.
           Marc replaced the microscope emoji with a character — Doktor
           Funkel (forest-biome researcher from the Micropedia) gives the
           section a face + story instead of an abstract glyph. The alt
           portrait already sits on a warm cream bg that matches this
           card, so no bg removal needed; a circular mask keeps the crop
           tidy on different card widths. */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[11px] font-label uppercase tracking-[0.22em] text-secondary mb-1.5">
            Forscher-Ecke
          </p>
          <h3 className="font-headline font-extrabold text-lg text-primary-container leading-tight">
            Mit Dr. Funkel
          </h3>
          <p className="font-body text-on-surface-variant text-sm mt-1">
            {playedCount} von {MINT_SEQUENCE.length} entdeckt
          </p>
        </div>
        <div className="shrink-0 rounded-full overflow-hidden"
             style={{
               width: 56,
               height: 56,
               background: 'linear-gradient(160deg, #fffdf5, #fef3c7)',
               border: '2px solid rgba(180,83,9,0.2)',
               boxShadow: '0 4px 14px -4px rgba(180,83,9,0.35), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <img src={`${import.meta.env.BASE_URL}art/characters/doktor-funkel.png`}
               alt="Dr. Funkel"
               className="w-full h-full object-cover"
               style={{ objectPosition: 'center 30%', transform: 'scale(1.2)' }} />
        </div>
      </div>

      {/* Grid — one column per implemented game in the sequence */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}>
        {slots.map((slot) => (
          <SlotCard
            key={slot.game.id}
            slot={slot}
            isLockedHint={lockedHint === slot.game.id}
            onTap={() => handleTap(slot)}
          />
        ))}
      </div>

      {/* Locked flash hint — names the game Louis must finish first */}
      {lockedHint && (() => {
        const idx = slots.findIndex(s => s.game.id === lockedHint);
        if (idx <= 0) return null; // position 0 is always unlocked; defensive
        const prev = slots[idx - 1].game;
        return (
          <div
            className="mt-3 rounded-xl p-3 flex items-center gap-2"
            style={{ background: 'rgba(18,67,70,0.06)', border: '1px solid rgba(18,67,70,0.12)' }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: '#124346' }}>lock</span>
            <p className="font-body text-sm text-on-surface">
              Schließe zuerst <b>{prev.name.de}</b> ab, dann geht's weiter.
            </p>
          </div>
        );
      })()}

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
// Three states after the sequential-unlock rework: locked / unlocked / played.
// The old "bald" state is gone because unimplemented games are filtered out
// of MINT_SEQUENCE entirely.
function SlotCard({ slot, isLockedHint, onTap }) {
  const { game, status } = slot;
  const isLocked = status === 'locked';
  const isPlayed = status === 'played';
  const isNew = status === 'unlocked';

  // Palette matches the Hub's card aesthetic (cream + amber accents).
  // Played → emerald (natural success color, matches the anchor-rail full state).
  // Unlocked (next-up) → amber + soft white halo.
  // Locked → muted cream, minimal edge.
  const ring = isPlayed ? 'rgba(52,211,153,0.5)'
             : isNew     ? 'rgba(252,211,77,0.55)'
             :             'rgba(18,67,70,0.12)';
  const bg = isPlayed ? 'rgba(52,211,153,0.1)'
           : isNew     ? 'rgba(252,211,77,0.18)'
           :             'rgba(255,248,242,0.6)';

  return (
    <button
      onClick={onTap}
      aria-label={isLocked ? 'Noch gesperrt' : game.name.de}
      className="relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 active:scale-95 transition-transform"
      style={{
        background: bg,
        border: `1.5px solid ${ring}`,
        minHeight: 64,
        minWidth: 56,
        // Soft lift on the next-up slot so it draws the eye without shouting.
        boxShadow: isNew ? '0 4px 12px -4px rgba(252,211,77,0.45)' : 'none',
        animation: isLockedHint ? 'slotShake 0.4s ease-in-out' : undefined,
      }}
    >
      {isLocked ? (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'rgba(18,67,70,0.4)' }}>lock</span>
          <span className="font-label font-bold text-[10px] mt-0.5" style={{ color: 'rgba(18,67,70,0.4)' }}>???</span>
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

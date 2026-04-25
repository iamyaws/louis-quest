import React, { useEffect, useState } from 'react';
import { FREUND_BY_ID, getFreundSpritePath } from '../data/freunde';
import { SEED_BY_ID, getCreatureSpritePath } from '../data/creatures';
import { MINT_GAME_BY_ID } from '../data/mintGames';
import VoiceAudio from '../utils/voiceAudio';
import ChibiFriend, { hasChibiFriend } from './drachennest/ChibiFriend';

/**
 * FreundIntroModal — reusable overlay for "a Freund hosts a game".
 *
 * Looks up the host (Freund or Creature) + the game metadata. Shows a sprite,
 * the host's name, Ronki-style speech bubble with the game's intro line, and
 * two buttons: "Los geht's!" (accept) / "Vielleicht später" (dismiss).
 *
 * Props:
 *   - gameId: string          // MINT game id
 *   - onAccept: () => void
 *   - onDismiss: () => void
 */
const base = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

/** Minimum wait before "Los geht's!" appears, in ms. Fallback when audio fails. */
const INTRO_MIN_WAIT_MS = 3000;

export default function FreundIntroModal({ gameId, onAccept, onDismiss }) {
  const game = MINT_GAME_BY_ID.get(gameId);
  const freund = game ? FREUND_BY_ID.get(game.hostId) : null;
  const creature = game && !freund ? SEED_BY_ID.get(game.hostId) : null;

  // Voice-gating: "Los geht's!" button is muted until intro voice ends or
  // min-wait elapses (whichever later). Muted mode skips the gate entirely.
  const muted = VoiceAudio.isMuted();
  const [voiceFinished, setVoiceFinished] = useState(muted);
  const [minWaitElapsed, setMinWaitElapsed] = useState(muted);

  // Escape key dismisses
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onDismiss?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  // Play intro narrator audio (if any) + track end for button activation.
  useEffect(() => {
    if (!game) return;

    if (VoiceAudio.isMuted()) {
      setVoiceFinished(true);
      setMinWaitElapsed(true);
      return;
    }

    setVoiceFinished(false);
    setMinWaitElapsed(false);

    const waitTimer = setTimeout(() => setMinWaitElapsed(true), INTRO_MIN_WAIT_MS);

    if (game.introAudioId) {
      VoiceAudio.playNarratorWithCallback(game.introAudioId, 300, () =>
        setVoiceFinished(true),
      );
    } else {
      // No audio wired — just let the min-wait gate the button.
      setVoiceFinished(true);
    }

    return () => clearTimeout(waitTimer);
  }, [game?.id, game?.introAudioId]);

  if (!game) return null;

  const acceptUnlocked = voiceFinished && minWaitElapsed;

  const hostName = freund?.name.de || creature?.name.de || game.hostId;
  const spritePath = freund
    ? getFreundSpritePath(freund)
    : creature
    ? getCreatureSpritePath(creature)
    : null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onDismiss?.();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[600] flex items-center justify-center px-5 overflow-y-auto py-8"
      style={{ background: 'rgba(10,20,22,0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label="Schließen"
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center z-20 active:scale-95 transition-transform"
          style={{ background: 'rgba(18,67,70,0.08)', border: '1px solid rgba(18,67,70,0.12)' }}
        >
          <span className="material-symbols-outlined text-xl text-primary">close</span>
        </button>

        <div className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.22em]"
            style={{ color: '#047857' }}
          >
            Forscher-Ecke
          </p>
          <p
            className="font-headline font-bold mt-1"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', color: '#059669' }}
          >
            {game.emoji} {game.name.de}
          </p>

          {/* Freund/Creature portrait — chibi-style if covered, MJ
              webp fallback otherwise. */}
          <div
            className="relative w-40 h-40 mt-6 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(252,211,77,0.25) 0%, rgba(252,211,77,0) 70%)',
            }}
          >
            {hasChibiFriend(game.hostId) ? (
              <ChibiFriend id={game.hostId} size={144} withBg={false} />
            ) : spritePath ? (
              <img
                src={base + spritePath}
                alt={hostName}
                className="w-full h-full object-contain drop-shadow-lg select-none"
                draggable={false}
              />
            ) : (
              <span className="text-7xl">✨</span>
            )}
          </div>

          {/* Host name headline */}
          <h3
            className="font-headline font-bold mt-4 text-on-surface"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.65rem' }}
          >
            {hostName}
          </h3>

          {/* Speech bubble */}
          <div
            className="relative mt-4 rounded-2xl px-5 py-4 w-full"
            style={{
              background: 'white',
              border: '1.5px solid rgba(5,150,105,0.2)',
              boxShadow: '0 4px 12px rgba(5,150,105,0.08)',
            }}
          >
            {/* Little bubble tail pointing up toward portrait */}
            <div
              aria-hidden="true"
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{
                background: 'white',
                borderTop: '1.5px solid rgba(5,150,105,0.2)',
                borderLeft: '1.5px solid rgba(5,150,105,0.2)',
              }}
            />
            <p className="font-body text-base text-on-surface leading-relaxed">
              {game.introLine}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-8 w-full">
            <button
              onClick={onAccept}
              disabled={!acceptUnlocked}
              aria-hidden={!acceptUnlocked}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-all duration-300"
              style={{
                background: '#059669',
                color: 'white',
                boxShadow: acceptUnlocked ? '0 6px 18px rgba(5,150,105,0.35)' : 'none',
                opacity: acceptUnlocked ? 1 : 0.3,
                pointerEvents: acceptUnlocked ? 'auto' : 'none',
              }}
            >
              Los geht's!
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full font-label font-bold text-sm min-h-[44px] active:scale-95 transition-transform"
              style={{ background: 'transparent', color: '#124346', border: '1.5px solid rgba(18,67,70,0.15)' }}
            >
              Vielleicht später
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

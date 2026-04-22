import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import SFX from '../utils/sfx';
import FireBreathPuff from './FireBreathPuff';
import MoodChibi from './MoodChibi';

/**
 * KristallKetteGame — drag-a-line MINT minigame.
 *
 * Replaces KristallSortiererGame (tested boring with Louis). Tactile
 * loop: kid drags a finger through crystals of the same color family
 * to build a chain; on release Ronki eats the chain and burps a
 * fire-breath flavor keyed to the chain length.
 *
 *   3-chain → ember puff
 *   5-chain → heart breath
 *   7+ chain → rainbow burst
 *
 * 3 rounds per session, each with a procedurally-scattered board.
 * Each successful chain adds to the HP reward at session end.
 *
 * Uses pointer events so it works on touch + mouse + stylus. The
 * drawn path renders as an SVG polyline for real-time feedback.
 *
 * Contract: <KristallKetteGame onComplete={(reward) => void} />
 * reward = { hp: number }
 */

// ── Color families ──────────────────────────────────────────────────────
// Four families so the kid has enough choice per round without it being
// overwhelming. Each renders as a radial gradient on a circle.
const FAMILIES = {
  ember:   { name: 'Glut',       core: '#fef3c7', mid: '#f97316', deep: '#dc2626', glow: 'rgba(249,115,22,0.55)' },
  lagoon:  { name: 'Lagune',     core: '#e0f2fe', mid: '#38bdf8', deep: '#0369a1', glow: 'rgba(56,189,248,0.55)' },
  meadow:  { name: 'Wiese',      core: '#ecfccb', mid: '#84cc16', deep: '#3f6212', glow: 'rgba(132,204,22,0.55)' },
  blossom: { name: 'Blüte',      core: '#fce7f3', mid: '#ec4899', deep: '#9d174d', glow: 'rgba(236,72,153,0.55)' },
};
const FAMILY_IDS = Object.keys(FAMILIES);

// ── Board generation ─────────────────────────────────────────────────
// 10 crystals per round, 2-3 per family, positioned in a gentle grid
// with jitter so no round feels repeated. Percentages of the play area.
function buildBoard() {
  const positions = [
    { x: 18, y: 28 }, { x: 38, y: 22 }, { x: 58, y: 26 }, { x: 78, y: 30 },
    { x: 22, y: 50 }, { x: 48, y: 52 }, { x: 72, y: 48 },
    { x: 28, y: 74 }, { x: 54, y: 76 }, { x: 76, y: 70 },
  ];
  // Shuffle families so any can be matchable
  const counts = { ember: 3, lagoon: 3, meadow: 2, blossom: 2 };
  const pool = [];
  Object.entries(counts).forEach(([fam, n]) => { for (let i = 0; i < n; i++) pool.push(fam); });
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Slight positional jitter so rounds don't feel stamped
  return positions.map((p, i) => ({
    id: `c${i}`,
    family: pool[i],
    x: p.x + (Math.random() - 0.5) * 4,
    y: p.y + (Math.random() - 0.5) * 4,
  }));
}

export default function KristallKetteGame({ onComplete }) {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();
  const haptic = useHaptic();

  const [round, setRound] = useState(1); // 1..3
  const [board, setBoard] = useState(() => buildBoard());
  const [chain, setChain] = useState([]);             // [{id, family, x, y}]
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState(null); // live cursor for trailing segment
  const [lastReward, setLastReward] = useState(null); // { flavor, length }
  const [fireKey, setFireKey] = useState(0);
  const [totalHp, setTotalHp] = useState(0);
  const boardRef = useRef(null);
  const TOTAL_ROUNDS = 3;

  // Keep previous round's celebration visible for ~1.2s after chain release
  useEffect(() => {
    if (!lastReward) return;
    const timer = setTimeout(() => setLastReward(null), 1400);
    return () => clearTimeout(timer);
  }, [lastReward]);

  const toLocal = (clientX, clientY) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const hitCrystal = (local) => {
    // Tolerance radius in percent units
    return board.find(c => {
      if (chain.some(ch => ch.id === c.id)) return false;
      const dx = c.x - local.x;
      const dy = c.y - local.y;
      return Math.sqrt(dx * dx + dy * dy) < 9; // ~9% radius
    });
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const local = toLocal(e.clientX, e.clientY);
    const hit = hitCrystal(local);
    if (!hit) return;
    setIsDragging(true);
    setChain([hit]);
    setPointerPos(local);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const local = toLocal(e.clientX, e.clientY);
    setPointerPos(local);
    const hit = hitCrystal(local);
    if (!hit) return;
    // Must match family of first crystal in chain
    if (hit.family !== chain[0].family) return;
    setChain(prev => [...prev, hit]);
    haptic('tap');
    SFX.play('pop');
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    const len = chain.length;
    if (len >= 2) {
      // Determine flavor + reward per length
      const flavor = len >= 7 ? 'rainbow' : len >= 5 ? 'heart' : len >= 3 ? 'ember' : 'flame';
      const hp = 5 + len * 2; // 5 + 2 per crystal
      setLastReward({ flavor, length: len, hp });
      setFireKey(k => k + 1);
      setTotalHp(v => v + hp);
      SFX.play('coin');
      haptic('celebration');
      // Remove the dissolved crystals from the board
      setBoard(prev => prev.filter(c => !chain.some(ch => ch.id === c.id)));
    }
    setChain([]);
  };

  // Skip / next round / finish
  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      // Finish session — award badge via claimGameReward pattern
      actions.claimMintBadge?.('badge_mint_kristall');
      onComplete?.({ hp: totalHp });
      return;
    }
    setRound(r => r + 1);
    setBoard(buildBoard());
  };

  const roundCrystalsLeft = board.length;
  const canEndEarly = roundCrystalsLeft <= 4; // once board is mostly cleared

  // Pre-compute SVG path for the active chain + live segment
  const chainPath = useMemo(() => {
    if (chain.length === 0) return '';
    const pts = chain.map(c => `${c.x},${c.y}`);
    if (isDragging && pointerPos) pts.push(`${pointerPos.x},${pointerPos.y}`);
    return `M ${pts.join(' L ')}`;
  }, [chain, isDragging, pointerPos]);

  const chainFamily = chain[0]?.family;
  const chainGlow = chainFamily ? FAMILIES[chainFamily].glow : 'rgba(252,211,77,0.55)';

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a0e22 0%, #2d1638 50%, #1a0e22 100%)',
        color: '#fff8f2',
      }}
    >
      {/* Header strip — round indicator + skip */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
      }}>
        <div>
          <p style={{
            margin: 0, fontSize: 10, letterSpacing: '0.22em', fontWeight: 800,
            textTransform: 'uppercase', color: 'rgba(252,211,77,0.7)',
          }}>
            Kristall-Kette · Runde {round}/{TOTAL_ROUNDS}
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 500 }}>
            Verbinde gleiche Farben
          </p>
        </div>
        <button onClick={() => onComplete?.({ hp: totalHp })}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(252,211,77,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Play area — the draggable crystal grid */}
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          flex: 1,
          margin: '0 20px',
          borderRadius: 24,
          background: 'radial-gradient(ellipse at 50% 50%, #2a1538 0%, #140822 100%)',
          boxShadow: 'inset 0 0 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'crosshair',
        }}
      >
        {/* SVG overlay for the chain line */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {chainPath && (
            <path d={chainPath}
              fill="none"
              stroke={chainFamily ? FAMILIES[chainFamily].mid : '#fcd34d'}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${chainGlow})` }}
            />
          )}
        </svg>

        {/* Crystals */}
        {board.map(c => {
          const fam = FAMILIES[c.family];
          const inChain = chain.some(ch => ch.id === c.id);
          return (
            <div key={c.id} style={{
              position: 'absolute',
              left: `${c.x}%`, top: `${c.y}%`,
              transform: `translate(-50%, -50%) ${inChain ? 'scale(1.12)' : 'scale(1)'}`,
              width: '13%', aspectRatio: '1',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${fam.core} 0%, ${fam.mid} 55%, ${fam.deep} 100%)`,
              boxShadow: inChain
                ? `0 0 20px 4px ${fam.glow}, inset 0 -4px 8px rgba(0,0,0,0.35)`
                : `0 6px 14px rgba(0,0,0,0.45), inset 0 -3px 6px rgba(0,0,0,0.35)`,
              transition: 'transform 0.1s, box-shadow 0.1s',
              pointerEvents: 'none',
              animation: inChain ? 'kkCrystalPulse 0.4s ease-in-out infinite' : undefined,
            }} />
          );
        })}

        {/* Ronki watcher in the corner */}
        <div style={{
          position: 'absolute', left: '8%', bottom: '4%',
          width: 80, height: 80,
          pointerEvents: 'none',
        }}>
          <MoodChibi
            size={80}
            mood={lastReward ? 'magisch' : 'normal'}
            variant={state?.companionVariant || 'amber'}
            stage={Math.min(3, (state?.catEvo || 0) > 18 ? 3 : (state?.catEvo || 0) > 9 ? 2 : (state?.catEvo || 0) > 3 ? 1 : 0)}
            bare
          />
          {/* Ronki's "eaten the chain" fire puff on reward */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <FireBreathPuff fireKey={fireKey} flavor={lastReward?.flavor || 'flame'} />
          </div>
        </div>

        {/* Celebration overlay — chain-length readout that fades */}
        {lastReward && (
          <div style={{
            position: 'absolute', left: '50%', top: '20%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            animation: 'kkCelebrate 1.4s ease-out forwards',
          }}>
            <p style={{
              margin: 0, fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase', fontWeight: 800,
              color: '#fcd34d',
            }}>
              {lastReward.length}-Kette
            </p>
            <p style={{
              margin: '4px 0 0',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: 26, fontWeight: 600,
              color: '#fff8f2',
            }}>
              +{lastReward.hp} ⭐
            </p>
          </div>
        )}
      </div>

      {/* Footer — HP total + next-round CTA */}
      <footer style={{
        padding: '18px 20px',
        paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(252,211,77,0.7)' }}>
            Gesammelt
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 22, fontWeight: 600 }}>
            {totalHp} ⭐
          </p>
        </div>
        <button onClick={nextRound} disabled={!canEndEarly && roundCrystalsLeft > 4}
          style={{
            padding: '14px 24px', borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
            color: '#2d1638',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 800, fontSize: 13, letterSpacing: '0.14em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 22px -8px rgba(252,211,77,0.55)',
            cursor: 'pointer',
            opacity: (canEndEarly || roundCrystalsLeft <= 4) ? 1 : 0.5,
          }}>
          {round >= TOTAL_ROUNDS ? 'Fertig' : 'Nächste Runde'}
        </button>
      </footer>

      <style>{`
        @keyframes kkCrystalPulse {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.3); }
        }
        @keyframes kkCelebrate {
          0%   { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
          25%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.05); }
          80%  { opacity: 1; transform: translateX(-50%) translateY(-6px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

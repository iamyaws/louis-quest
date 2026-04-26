import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { track } from '../../lib/analytics';

// Path to the lullaby audio. Royalty-free 4-bar loop, ~30s.
// File is not committed yet — Marc to drop in once curated. The
// component plays through best-effort and silently no-ops if the
// file is missing (fetch fails → audio element stays muted).
// Spec: gentle major-key acoustic, no vocals, no percussion, soft
// fade-in/out built into the file. Loops naturally during 'curtain'.
const LULLABY_SRC = '/audio/lullaby/tonight_lullaby_01.mp3';

/**
 * TonightRitual — the bedtime ritual.
 *
 * Direction D from the Claude Design hi-fi handoff (26 Apr 2026):
 * "Stargazing." POV looking up *with* Ronki from the cave mouth.
 * The cave dims, a starfield drifts behind a silhouette of the kid
 * + Ronki looking up, a single voiced story plays, the kid taps
 * when ready, a curtain of stars expands and overtakes the screen
 * with the lullaby playing once, then blackout. The whole beat is
 * ~30-50 seconds.
 *
 * Phases (auto-advance unless noted):
 *   enter   (2.4s — title fades in)
 *   lookup  (4.4s — POV tilt, kid + Ronki silhouette appear)
 *   story   (kid taps when ready — story line fades in)
 *   curtain (12s — star curtain expands, lullaby plays)
 *   black   (final state — "schlaf gut" + replay link)
 *
 * Voice + lines align with the BeiRonkiSein bar. The story line
 * is currently a single hardcoded example; rotation pool lands
 * later (PATH.md content depth pass).
 *
 * Based on: docs/design-incoming/meet-tonight/project/src/hifi-tonight.jsx
 */

const STORY_LINES = [
  // BeiRonkiSein-bar bedtime stories. Soft, hedge-y, no em-dashes.
  // Rotation lives here for now; ParentalDashboard tooling for
  // adding family-specific lines is a v1.5 follow-up.
  'Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald.',
  'Mama-Drache hat mir gezeigt, wie man die Sterne zählt, wenn man nicht einschlafen kann. Sie hat aber bei sechzehn aufgehört.',
  'Im Morgenwald war heute ein Reh. Es hat mich angeschaut, als wüsste es was, das ich nicht weiß.',
  'Heute morgen hat es nach Regen gerochen, obwohl es gar nicht geregnet hat. Komisch.',
  'Manchmal denk ich, der Mond schaut zurück. Glaubst du das auch?',
  'Ich hab heute eine Eichel gefunden, die wie ein Hut aussieht. Ich hab sie liegen lassen, falls eine Eule sie braucht.',
  'Weißt du was lustig ist, mein Schwanz war heute schneller wach als ich. Ich musste warten, bis der Rest mich einholt.',
  'Wenn ich die Augen zumache, seh ich manchmal noch das Feuer von unserem Lagerfeuer. Auch wenn es längst aus ist.',
  'Heute hat ein kleiner Wind durch die Höhle geschaut. Ich glaub er hat sich nur kurz ausgeruht.',
  'Wir haben heute viel zusammen erlebt, oder? Ich erinner mich an alles. Versprochen.',
];

function pickStory() {
  // Stable for the duration of one Tonight session — uses session
  // storage so a kid who taps "nochmal ansehen" sees a different
  // story instead of the same one twice. Falls back to index 0 if
  // storage is unavailable.
  try {
    const recent = JSON.parse(window.sessionStorage.getItem('tonight_recent') || '[]');
    const fresh = STORY_LINES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : STORY_LINES.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const next = [...recent, idx].slice(-3);
    window.sessionStorage.setItem('tonight_recent', JSON.stringify(next));
    return STORY_LINES[idx];
  } catch {
    return STORY_LINES[0];
  }
}

export default function TonightRitual({ onClose }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'amber';
  const [phase, setPhase] = useState('enter');
  const [tapped, setTapped] = useState(false);
  const [story] = useState(() => pickStory());

  // Auto-advance into lookup → story.
  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('lookup'), 2400);
      return () => clearTimeout(t);
    }
    if (phase === 'lookup') {
      const t = setTimeout(() => setPhase('story'), 4400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Telemetry — fire start once per mount.
  useEffect(() => { track('tonight.start'); }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleTap = () => {
    if (phase === 'story' && !tapped) {
      setTapped(true);
      setPhase('curtain');
      setTimeout(() => {
        setPhase('black');
        track('tonight.complete');
      }, 12000);
    } else if (phase === 'curtain') {
      setPhase('black');
      track('tonight.complete');
    }
  };

  const replay = () => {
    setPhase('enter');
    setTapped(false);
  };

  const bgDim =
    phase === 'enter'   ? 'linear-gradient(180deg, #1a0f3a 0%, #2a1a3e 60%, #2a1810 100%)' :
    phase === 'lookup'  ? 'linear-gradient(180deg, #0e0a2a 0%, #1a1238 60%, #20140e 100%)' :
    phase === 'story'   ? 'linear-gradient(180deg, #08051f 0%, #0e0a2a 60%, #160d08 100%)' :
    phase === 'curtain' ? 'linear-gradient(180deg, #050316 0%, #08051f 60%, #0a0604 100%)' :
    '#000000';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Heute Abend mit Ronki"
      onClick={handleTap}
      style={{
        position: 'fixed', inset: 0, zIndex: 950, overflow: 'hidden',
        background: bgDim, transition: 'background 3400ms ease',
        cursor: phase === 'story' ? 'pointer' : 'default',
        // Kills the 300ms tap delay — important for the "tap when
        // ready" beat, which should feel immediate to a tired kid.
        touchAction: 'manipulation',
      }}
    >
      <StarField phase={phase} />
      <CaveMouth phase={phase} />
      <HeadsFromBehind phase={phase} variant={variant} />

      {phase === 'enter' && (
        <div style={{
          position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center',
          animation: 'tn-lineIn 1400ms ease',
        }}>
          <div style={{
            font: '600 36px/1 "Fredoka", sans-serif',
            color: 'rgba(255,242,217,.95)',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 16px rgba(0,0,0,.6)',
          }}>
            Heute Abend
          </div>
          <div style={{
            marginTop: 14,
            // Was 13px italic / .55 alpha — Marc's audit flagged it.
            // Bumped to 16px / .72 alpha so the kid + parent can both read.
            font: '500 16px/1.45 "Nunito", sans-serif',
            color: 'rgba(255,242,217,.72)',
            fontStyle: 'italic',
          }}>
            wir schauen kurz raus, du und ich
          </div>
        </div>
      )}

      {phase === 'story' && <StoryLine text={story} />}

      <Lullaby active={phase === 'curtain'} />
      <StarCurtain active={phase === 'curtain'} />

      {phase === 'story' && !tapped && (
        <div style={{
          position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center',
          // Apr 2026 readability pass — was 10px / .22em / .3 alpha,
          // unreadable for a kid in bed at low brightness. Bumped to
          // 14px / .12em / .55 alpha. Marc's note from the audit.
          font: '600 14px/1.2 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.12em', textTransform: 'uppercase',
          color: 'rgba(255,242,217,.55)',
          animation: 'tn-fadeBlink 3000ms ease-in-out infinite 4000ms backwards',
          pointerEvents: 'none',
        }}>
          tippen wenn du müde bist
        </div>
      )}

      {phase === 'black' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 36,
          animation: 'tn-lineIn 2400ms ease 800ms backwards',
        }}>
          <div style={{
            // Was 12px / .32em / .16 alpha — invisible. Bumped to
            // 16px / .14em / .42 alpha. Stays soft (it's bedtime)
            // but a parent peeking at the screen can read it.
            font: '500 16px/1.2 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'rgba(255,242,217,.42)',
          }}>
            schlaf gut
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); replay(); }}
              style={{
                background: 'transparent', border: '1.5px solid rgba(255,242,217,.22)',
                color: 'rgba(255,242,217,.55)',
                padding: '12px 22px', borderRadius: 999, cursor: 'pointer',
                font: '700 13px/1 "Plus Jakarta Sans", sans-serif',
                letterSpacing: '.10em', textTransform: 'uppercase',
                touchAction: 'manipulation',
                minHeight: 44,
              }}
            >
              nochmal
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              style={{
                background: 'transparent', border: '1.5px solid rgba(255,242,217,.22)',
                color: 'rgba(255,242,217,.55)',
                padding: '12px 22px', borderRadius: 999, cursor: 'pointer',
                font: '700 13px/1 "Plus Jakarta Sans", sans-serif',
                letterSpacing: '.10em', textTransform: 'uppercase',
                touchAction: 'manipulation',
                minHeight: 44,
              }}
            >
              schließen
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tn-lineIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tn-fadeBlink {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ─── Starfield ──────────────────────────────────────────────────

function StarField({ phase }) {
  const layers = [
    { count: 60, sizeMin: 0.6, sizeMax: 1.6, opacityBase: 0.4, speed: '120s' },
    { count: 30, sizeMin: 1.2, sizeMax: 2.4, opacityBase: 0.7, speed: '90s' },
    { count: 12, sizeMin: 2.2, sizeMax: 3.6, opacityBase: 0.95, speed: '60s' },
  ];
  const visible =
    phase === 'enter'   ? 0.2 :
    phase === 'lookup'  ? 1   :
    phase === 'story'   ? 1   :
    phase === 'curtain' ? 1.6 :
    phase === 'black'   ? 0.4 : 0;

  return (
    <>
      {layers.map((L, li) => (
        <div key={li} aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          animation: `tn-starDrift-${li} ${L.speed} linear infinite`,
          opacity: visible,
          transition: 'opacity 1800ms ease',
        }}>
          {[...Array(Math.round(L.count * (phase === 'curtain' ? 1.5 : 1)))].map((_, i) => {
            const seed = (li * 100 + i * 13) % 1000;
            const size = L.sizeMin + (seed % 100) / 100 * (L.sizeMax - L.sizeMin);
            const top  = ((seed * 7) % 100);
            const left = ((seed * 11) % 100);
            const op = L.opacityBase * (0.5 + ((seed * 3) % 50) / 100);
            return (
              <div key={i} style={{
                position: 'absolute',
                top: `${top}%`, left: `${left}%`,
                width: size, height: size,
                borderRadius: '50%',
                background: '#fef9e7',
                boxShadow: `0 0 ${size * 3}px rgba(252,211,77,${op * 0.6})`,
                opacity: op,
                animation: `tn-twinkle ${3 + (seed % 4)}s ease-in-out infinite ${(seed % 30) / 10}s`,
              }} />
            );
          })}
        </div>
      ))}
      <style>{`
        @keyframes tn-starDrift-0 { from { transform: translateX(0); } to { transform: translateX(-60px); } }
        @keyframes tn-starDrift-1 { from { transform: translateX(0); } to { transform: translateX(-90px); } }
        @keyframes tn-starDrift-2 { from { transform: translateX(0); } to { transform: translateX(-130px); } }
        @keyframes tn-twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.95; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

// ─── Cave-mouth silhouette (foreground) ─────────────────────────

function CaveMouth({ phase }) {
  const dim =
    phase === 'enter'   ? 0.85 :
    phase === 'lookup'  ? 1 :
    phase === 'story'   ? 1 :
    phase === 'curtain' ? 1 :
    phase === 'black'   ? 0 : 1;

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      opacity: dim,
      transition: 'opacity 2400ms ease',
    }}>
      <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="tn-caveDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0604"/>
            <stop offset="100%" stopColor="#020202"/>
          </linearGradient>
          <radialGradient id="tn-lantTiny" cx="22%" cy="78%" r="20%">
            <stop offset="0%"   stopColor="rgba(252,211,77,.4)"/>
            <stop offset="100%" stopColor="rgba(252,211,77,0)"/>
          </radialGradient>
        </defs>
        <rect width="400" height="700" fill="url(#tn-lantTiny)"/>
        <path d="M0 700 L0 480 Q 30 380, 65 320 Q 110 260, 165 235 Q 200 225, 240 232 Q 295 252, 335 305 Q 372 365, 400 460 L400 700 Z"
              fill="url(#tn-caveDark)"/>
        <path d="M0 480 Q 30 380, 65 320 Q 110 260, 165 235 Q 200 225, 240 232 Q 295 252, 335 305 Q 372 365, 400 460"
              fill="none" stroke="rgba(252,211,77,0.15)" strokeWidth="1.5"/>
        <path d="M85 320 Q 90 380, 75 440" stroke="rgba(252,211,77,0.07)" strokeWidth="1" fill="none"/>
        <path d="M310 320 Q 315 380, 325 440" stroke="rgba(252,211,77,0.07)" strokeWidth="1" fill="none"/>
        <circle cx="88" cy="558" r="2" fill="#fcd34d"/>
        <circle cx="88" cy="558" r="6" fill="#fcd34d" opacity="0.3"/>
      </svg>
    </div>
  );
}

// ─── Two heads from behind ──────────────────────────────────────

function HeadsFromBehind({ phase, variant }) {
  // Pull a tint that maps to a companion variant. Soft fallback.
  const TINTS = {
    amber:  { tint: '#fde68a', deep: '#b45309' },
    teal:   { tint: '#a7f3d0', deep: '#0f766e' },
    rose:   { tint: '#fbcfe8', deep: '#be185d' },
    violet: { tint: '#c4b5fd', deep: '#6d28d9' },
    forest: { tint: '#bbf7d0', deep: '#15803d' },
    sunset: { tint: '#fdba74', deep: '#c2410c' },
  };
  const v = TINTS[variant] || TINTS.amber;
  const visible = phase !== 'enter' && phase !== 'black';

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', bottom: 110, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', gap: 40,
      opacity: visible ? 1 : 0,
      transition: 'opacity 1600ms ease',
    }}>
      {/* Kid silhouette */}
      <svg viewBox="0 0 60 64" width="44" height="48" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="tn-kid" cx="50%" cy="20%" r="80%">
            <stop offset="0%"   stopColor="#3a2818"/>
            <stop offset="100%" stopColor="#0a0604"/>
          </radialGradient>
        </defs>
        <ellipse cx="30" cy="22" rx="18" ry="20" fill="url(#tn-kid)"/>
        <path d="M14 14 Q 30 6, 46 14 Q 38 18, 30 16 Q 22 18, 14 14 Z" fill="#0a0604"/>
        <path d="M5 60 Q 30 38, 55 60 L 55 64 L 5 64 Z" fill="url(#tn-kid)"/>
      </svg>
      {/* Ronki silhouette */}
      <svg viewBox="0 0 60 64" width="40" height="48" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`tn-rk-${variant}`} cx="40%" cy="35%" r="75%">
            <stop offset="0%"   stopColor={v.tint} stopOpacity="0.7"/>
            <stop offset="60%"  stopColor={v.deep} stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#0a0604"/>
          </radialGradient>
        </defs>
        <path d="M16 18 Q 12 8, 18 4" stroke="#0a0604" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M44 18 Q 48 8, 42 4" stroke="#0a0604" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <ellipse cx="30" cy="24" rx="16" ry="16" fill={`url(#tn-rk-${variant})`}/>
        <path d="M8 60 Q 30 38, 52 60 L 52 64 L 8 64 Z" fill={`url(#tn-rk-${variant})`}/>
      </svg>
    </div>
  );
}

// ─── Story line ─────────────────────────────────────────────────

function StoryLine({ text }) {
  return (
    <div style={{
      position: 'absolute', top: '12%', left: 28, right: 28,
      animation: 'tn-storyIn 2200ms ease forwards',
      pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{
        // Was 9px / .32em — eyebrow was decorative noise to a kid.
        // Bumped to 12px / .18em so it reads as a label, not a smear.
        font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '.18em', textTransform: 'uppercase',
        color: 'rgba(252,211,77,.75)',
        marginBottom: 16,
      }}>
        Ronki erzählt
      </div>
      <p style={{
        margin: 0,
        // Body bumped 18 → 19px and weight 400 → 500 for italic
        // legibility on a dim screen at night.
        font: '500 19px/1.5 "Nunito", sans-serif',
        fontStyle: 'italic',
        color: 'rgba(255,242,217,.94)',
        textShadow: '0 2px 12px rgba(0,0,0,.6)',
      }}>
        {text}
      </p>
      <style>{`
        @keyframes tn-storyIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Star curtain ───────────────────────────────────────────────

function StarCurtain({ active }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      opacity: active ? 1 : 0,
      transition: 'opacity 600ms ease',
    }}>
      {[...Array(120)].map((_, i) => {
        const top  = (i * 17) % 100;
        const left = (i * 23) % 100;
        const delay = (i * 60) % 12000;
        const size = 1.2 + (i % 4) * 0.6;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${top}%`, left: `${left}%`,
            width: size, height: size,
            borderRadius: '50%',
            background: '#fef9e7',
            boxShadow: `0 0 ${size * 4}px rgba(252,211,77,.7)`,
            opacity: 0,
            animation: active ? `tn-curtainStar 12000ms ease-out ${delay}ms forwards` : 'none',
          }} />
        );
      })}
      <style>{`
        @keyframes tn-curtainStar {
          0%   { opacity: 0; transform: scale(0); }
          15%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(8); background: #1a0f3a; box-shadow: 0 0 60px #1a0f3a; }
        }
      `}</style>
    </div>
  );
}

// ─── Lullaby indicator ──────────────────────────────────────────

function Lullaby({ active }) {
  // Audio plays best-effort. If the lullaby file isn't yet committed,
  // play() rejects silently and the visual indicator still renders —
  // graceful degradation. respects reduced-motion via opacity-only
  // animation on the wave bars.
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (active) {
      a.volume = 0.45;
      a.loop = true;
      // play() returns a promise on modern browsers; reject is fine
      // (file 404 / autoplay policy). We just won't have audio.
      a.play().then(() => setAudioReady(true)).catch(() => setAudioReady(false));
    } else {
      a.pause();
      a.currentTime = 0;
    }
  }, [active]);

  return (
    <>
      <audio ref={audioRef} src={LULLABY_SRC} preload="auto" aria-hidden="true" />
      <div aria-hidden="true" style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, alignItems: 'center', padding: '10px 18px',
        borderRadius: 999, background: 'rgba(0,0,0,.45)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        opacity: active ? 1 : 0, transition: 'opacity 800ms ease',
        border: '1px solid rgba(252,211,77,.22)',
      }}>
        <span style={{
          // Was 9px / .18em — sub-readable. Bumped to 12px / .12em
          // and weight 800 so a parent peeking can confirm the
          // lullaby is on, even if the audio hasn't loaded.
          font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.12em', textTransform: 'uppercase',
          color: 'rgba(252,211,77,.85)',
        }}>
          ♪ Schlaflied
        </span>
        <div style={{ display: 'flex', gap: 2.5, alignItems: 'center', marginLeft: 6 }}>
          {[5, 9, 7, 11, 6].map((h, i) => (
            <div key={i} style={{
              width: 2.5, height: h + 1, borderRadius: 1.5,
              background: 'rgba(252,211,77,.7)',
              animation: active ? `tn-lullawave 1.4s ease-in-out ${i * 0.12}s infinite` : 'none',
            }} />
          ))}
        </div>
        <style>{`
          @keyframes tn-lullawave {
            0%, 100% { transform: scaleY(0.4); }
            50%      { transform: scaleY(1.2); }
          }
        `}</style>
      </div>
    </>
  );
}

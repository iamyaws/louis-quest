import React, { useState, useEffect, useRef } from 'react';
import { useQuestEater } from './QuestEater';
import { getVariant } from '../data/companionVariants';
import MoodChibi from './MoodChibi';

/**
 * CampfireScene — zero-asset painterly Hub scene.
 *
 * Replaces the earlier Midjourney lager-stageN.png sequence with a fully
 * CSS-built scene (gradients + border-radius + box-shadows). Same
 * construction Claude Design used in the Feature Previews file that Louis
 * reacted to warmly. Wins:
 *
 *   · Zero asset weight — previous campfire PNGs were 2.4–2.9 MB each
 *   · Infinitely scalable, sharp at any pixel density
 *   · Time-of-day variants via CSS gradient swaps (dawn / day / golden /
 *     night), no image pre-loading
 *   · Animation-ready: flame flicker, breath pulse, wing flap, star twinkle
 *   · Expedition-ready: `state` prop switches between 'idle' | 'away' |
 *     'returning' without re-rendering the scene itself
 *
 * Painterly webp lager-stageN.png retained on the Ronki tab's Living
 * Scene where the epic hero frame still reads best.
 *
 * Props:
 *   · hour       (0-23)  — clock hour, auto-derived if omitted
 *   · state      ('idle'|'away'|'returning') — expedition state
 *   · statusText (string, optional) — status strip text (e.g. "Ronki ist
 *     im Morgenwald."). If omitted, no strip shows.
 *   · statusSub  (string, optional) — smaller secondary line
 *   · onDiaryTap (fn, optional) — callback when Louis taps the glowing diary
 *
 * Caller provides height (default 320px).
 */

function pickTimeBand(hour) {
  if (hour >= 5 && hour < 10) return 'dawn';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'golden';
  return 'night';
}

// Palette per time-of-day: sky layers + ground tint. Stars only render on
// night. Dawn is warmer than day (peachy top fade), golden is richer.
const PALETTES = {
  dawn: {
    sky: `
      radial-gradient(ellipse at 50% 18%, #fde68a 0%, transparent 32%),
      linear-gradient(180deg, #fbcfb7 0%, #e7c8a4 38%, #a69a6a 66%, #5a5a3a 100%)
    `,
    ground: 'linear-gradient(180deg, #7a6644 0%, #3f3320 100%)',
    tree: 'radial-gradient(ellipse at 40% 30%, #8da65a, #4a6628 70%)',
    stars: false,
    moon: false,
  },
  day: {
    sky: `
      radial-gradient(ellipse at 50% 12%, #fde68a 0%, transparent 32%),
      linear-gradient(180deg, #e7d8b9 0%, #d4b894 38%, #8a8455 66%, #3f4a2e 100%)
    `,
    ground: 'linear-gradient(180deg, #6b5a3a 0%, #3a2f1a 100%)',
    tree: 'radial-gradient(ellipse at 40% 30%, #7d9a4a, #4a6628 70%)',
    stars: false,
    moon: false,
  },
  golden: {
    sky: `
      radial-gradient(ellipse at 50% 20%, #fde68a 0%, transparent 30%),
      linear-gradient(180deg, #f2b582 0%, #d98d55 40%, #7a5940 68%, #33281a 100%)
    `,
    ground: 'linear-gradient(180deg, #5a3c22 0%, #2a1c0f 100%)',
    tree: 'radial-gradient(ellipse at 40% 30%, #6b7a4a, #3a4a1f 70%)',
    stars: false,
    moon: false,
  },
  night: {
    sky: `
      radial-gradient(ellipse at 22% 18%, rgba(226,232,255,0.35) 0%, transparent 28%),
      radial-gradient(circle at 74% 16%, #f5f3e8 0%, #d5d7d0 40%, transparent 60%),
      linear-gradient(180deg, #1a2344 0%, #2b3158 42%, #1a2338 70%, #0e1525 100%)
    `,
    ground: 'linear-gradient(180deg, #26303b 0%, #0f1520 100%)',
    tree: 'radial-gradient(ellipse at 40% 30%, #2a3e3c, #15221f 70%)',
    stars: true,
    moon: true,
  },
};

// Fixed star positions — seeded so twinkles feel organic, not random on
// each render. Percentages relative to the scene box.
const STAR_POS = [
  { top: 12, left: 20, delay: 0.0 },
  { top: 8,  left: 36, delay: 0.6 },
  { top: 18, left: 54, delay: 1.2 },
  { top: 6,  left: 68, delay: 0.3 },
  { top: 14, left: 82, delay: 1.8 },
  { top: 22, left: 90, delay: 0.9 },
  { top: 26, left: 12, delay: 1.5 },
];

export default function CampfireScene({
  onRonkiTap,
  variant = 'amber',
  stage = 2,
  hour,
  state = 'idle',
  statusText,
  statusSub,
  greetingText,
  onBubbleTap,
  onDiaryTap,
  height = 320,
}) {
  const h = hour ?? new Date().getHours();
  const band = pickTimeBand(h);
  const pal = PALETTES[band];
  const isNight = band === 'night';

  // Expedition visual state — controls Ronki visibility + status strip
  const ronkiVisible = state === 'idle';
  const showPawTrail = state === 'away';
  const showDiary = state === 'returning';
  const showStatus = state !== 'idle' && !!statusText;

  // Greeting speech bubble — appears when Louis opens Hub OR when he
  // taps Ronki to rotate to a new quip. Bumped from 4.2s → 7.5s so
  // first-graders have time to read the whole line (Marc: "make the
  // text stay a little longer"). The effect re-runs when greetingText
  // changes — tapping Ronki feeds a new pool index back through the
  // same prop so the bubble fades in on every tap.
  const [bubbleStage, setBubbleStage] = useState('hidden'); // hidden | visible | fading
  useEffect(() => {
    if (!greetingText || !ronkiVisible) return;
    setBubbleStage('visible');
    const fadeTimer = setTimeout(() => setBubbleStage('fading'), 7500);
    const hideTimer = setTimeout(() => setBubbleStage('hidden'), 8100);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [greetingText, ronkiVisible]);

  return (
    <div
      className="cf-scene"
      style={{
        position: 'relative',
        height,
        overflow: 'hidden',
        background: pal.sky,
        isolation: 'isolate',
      }}
      aria-label="Lagerfeuer"
    >
      {/* Stars — only at night */}
      {pal.stars && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
          {STAR_POS.map((s, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: 2,
                height: 2,
                background: '#fefce8',
                borderRadius: '50%',
                boxShadow: '0 0 4px #fef3c7',
                animation: `cfStar 3s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Distant trees — silhouettes framing the campfire.
          Scaled up ~50% on 24 Apr 2026 to pull the foreground closer.
          Bottom raised on 25 Apr 2026 so the trunks sit on the ground
          line (was 28% when the ground was 28% tall; ground is 38% now,
          so trees rest at 38% too). Added 3 more trees for a denser
          tree-line (Marc: "trees disappearing with ground overlap,
          bring them back and add a few more"). */}
      <Tree left="2%"   scale={1.25} opacity={0.78} tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />
      <Tree left="18%"  scale={0.9}  opacity={0.55} tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />
      <Tree left="78%"  scale={1.35} opacity={1}    tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />
      <Tree right="12%" scale={0.8}  opacity={0.5}  tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />
      <Tree right="0%"  scale={1.1}  opacity={0.7}  tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />
      <Tree left="36%"  scale={0.65} opacity={0.4}  tree={pal.tree} trunk={isNight ? '#1a1411' : '#5a3a22'} />

      {/* Ground band — taller (28% → 38%) so the horizon sits lower
          on the card and the scene feels closer to the ground. */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '38%',
        background: pal.ground,
        boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.25)',
      }} />

      {/* Log — Louis's seat. Bigger (110 × 18 → 155 × 24) to match
          the zoomed-in foreground. */}
      <div style={{
        position: 'absolute',
        left: '16%',
        bottom: '12%',
        width: 155,
        height: 24,
        background: 'linear-gradient(180deg, #9b7447 0%, #5c3e1f 70%)',
        borderRadius: 14,
        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.1)',
      }}>
        <span style={{
          position: 'absolute',
          right: -6,
          top: 3,
          width: 18,
          height: 18,
          background: '#ead5a0',
          border: '2.5px solid #8c6a3a',
          borderRadius: '50%',
        }} />
      </div>

      {/* Campfire — flame + logs + warm glow. Scaled up ~1.4× to
          match the zoomed scene. Pushed right + deeper into the scene
          (left 46% → 58%, bottom 10% → 22%) on 25 Apr 2026 so the
          Veilchen-Ronki nameplate pill (centered below Ronki) no
          longer overlaps the flame. */}
      <div style={{ position: 'absolute', left: '58%', bottom: '22%', width: 60, height: 70 }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 70, height: 14,
          background: '#3a2212',
          borderRadius: 5,
          boxShadow: '0 -2px 4px rgba(252,165,73,0.4)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%', bottom: 12, transform: 'translateX(-50%)',
          width: 40, height: 52,
          background: 'radial-gradient(ellipse at 50% 80%, #fef3c7 0%, #fcd34d 20%, #f97316 55%, #dc2626 100%)',
          borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
          animation: 'cfFlameFlick 1.1s ease-in-out infinite alternate',
          filter: 'drop-shadow(0 0 14px rgba(249,115,22,0.6))',
        }} />
        <div style={{
          position: 'absolute',
          left: -55, bottom: -26,
          width: 180, height: 80,
          background: 'radial-gradient(ellipse, rgba(252,165,73,0.4), transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Side-view Ronki — sits by the fire when idle. Registers with
           the QuestEater context as the 'preferred' flyer target so
           that on Lager, the flying quest icon lands here (not the
           TopBar Ronki, which isn't even rendered on Hub). */}
      {ronkiVisible && <SideRonki onTap={onRonkiTap} variant={variant} stage={stage} />}

      {/* Greeting speech bubble — shows above Ronki on mount, stays
           ~7.5s, then fades. Tapping the bubble (or onBubbleTap) rolls
           a new quip — same behaviour as tapping Ronki himself. Falls
           back to a plain status div when neither tap handler is given. */}
      {ronkiVisible && greetingText && bubbleStage !== 'hidden' && (() => {
        const bubbleTap = onBubbleTap || onRonkiTap;
        const Tag = bubbleTap ? 'button' : 'div';
        return (
          <Tag
            onClick={bubbleTap}
            aria-label={bubbleTap ? greetingText : undefined}
            style={{
              position: 'absolute',
              left: '16%',
              bottom: '52%',
              maxWidth: '62%',
              padding: '9px 14px',
              borderRadius: 14,
              background: isNight ? 'rgba(255,255,255,0.96)' : '#ffffff',
              border: '1px solid rgba(18,67,70,0.12)',
              boxShadow: '0 8px 20px -6px rgba(18,67,70,0.25)',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.3,
              color: '#124346',
              zIndex: 10,
              cursor: bubbleTap ? 'pointer' : 'default',
              textAlign: 'left',
              opacity: bubbleStage === 'fading' ? 0 : 1,
              transform: bubbleStage === 'fading'
                ? 'translateY(-4px) scale(0.95)'
                : 'translateY(0) scale(1)',
              animation: bubbleStage === 'visible' ? 'cfBubbleIn 0.3s cubic-bezier(.34,1.56,.64,1)' : undefined,
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
            role={bubbleTap ? 'button' : 'status'}
          >
            {greetingText}
            {/* Tail pointing down toward Ronki */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -5,
                left: 28,
                width: 10,
                height: 10,
                background: isNight ? 'rgba(255,255,255,0.96)' : '#ffffff',
                borderRight: '1px solid rgba(18,67,70,0.12)',
                borderBottom: '1px solid rgba(18,67,70,0.12)',
                transform: 'rotate(45deg)',
              }}
            />
          </Tag>
        );
      })()}

      {/* Away placeholder — pillow where Ronki sat */}
      {!ronkiVisible && (
        <div style={{
          position: 'absolute',
          left: '23%',
          bottom: '17%',
          width: 32,
          height: 20,
          background: 'linear-gradient(180deg, #e8dcc0, #b8a98a)',
          borderRadius: '40% 40% 20% 20%',
          boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 1px 1px 0 rgba(255,255,255,0.3)',
          opacity: 0.85,
        }} aria-hidden="true" />
      )}

      {/* Paw trail — 5 tiny prints leading out of frame, only when away */}
      {showPawTrail && (
        <div style={{
          position: 'absolute',
          bottom: '14%',
          right: '8%',
          width: 120,
          height: 18,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          opacity: 0.75,
        }} aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} style={{
              width: 8,
              height: 6,
              background: isNight ? 'rgba(94,106,130,0.8)' : 'rgba(90,58,34,0.6)',
              borderRadius: '50% 50% 40% 40%',
              transform: `translateY(${i % 2 === 0 ? 0 : -2}px)`,
            }} />
          ))}
        </div>
      )}

      {/* Diary glow — pulses when Ronki is back with an artifact */}
      {showDiary && onDiaryTap && (
        <button
          onClick={onDiaryTap}
          aria-label="Ronkis Mitbringsel öffnen"
          style={{
            position: 'absolute',
            left: '26%',
            bottom: '22%',
            width: 28,
            height: 22,
            padding: 0,
            background: 'linear-gradient(140deg, #fef3c7, #fcd34d)',
            borderRadius: '3px 8px 3px 3px',
            border: '1px solid rgba(180,83,9,0.4)',
            boxShadow: '0 0 16px rgba(252,211,77,0.7), 0 4px 8px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            animation: 'cfDiaryPulse 1.6s ease-in-out infinite',
            zIndex: 6,
          }}
        />
      )}

      {/* Status strip — only during expedition states */}
      {showStatus && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          padding: '10px 14px',
          background: isNight ? 'rgba(20,28,50,0.8)' : 'rgba(255,248,242,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: isNight ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(18,67,70,0.1)',
          borderRadius: 14,
          boxShadow: '0 6px 16px -6px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }} role="status">
          <span style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: isNight ? 'rgba(148,163,184,0.25)' : 'rgba(94,139,108,0.2)',
            display: 'grid', placeItems: 'center',
            fontSize: 16,
          }} aria-hidden="true">
            {isNight ? '🌙' : '🌲'}
          </span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <b style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: isNight ? '#f8fafc' : '#124346',
              display: 'block',
            }}>{statusText}</b>
            {statusSub && (
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: 11,
                color: isNight ? 'rgba(226,232,240,0.7)' : 'rgba(18,67,70,0.6)',
              }}>{statusSub}</span>
            )}
          </div>
        </div>
      )}

      {/* Scoped keyframes */}
      <style>{`
        @keyframes cfStar {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes cfFlameFlick {
          0%   { transform: translateX(-50%) scale(0.95, 1) rotate(-2deg); }
          100% { transform: translateX(-50%) scale(1.05, 0.95) rotate(2deg); }
        }
        @keyframes cfRonkiBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes cfWingFlap {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes cfDiaryPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(252,211,77,0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(252,211,77,0.9)); }
        }
        @keyframes cfBubbleIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cfFireBreath {
          0%   { opacity: 0; transform: scaleX(0.2) scaleY(0.6); }
          25%  { opacity: 1; transform: scaleX(1) scaleY(1); }
          80%  { opacity: 0.8; transform: scaleX(1.3) scaleY(0.9); }
          100% { opacity: 0; transform: scaleX(1.6) scaleY(0.5); }
        }
      `}</style>
    </div>
  );
}

// ── SideRonki — orange chibi dragon, sitting pose ─────────────────────
// Lives inside the scene; extracted as a sub-component for readability.
// Construction matches Claude Design's Feature Preview exactly.

function SideRonki({ onTap, variant = 'amber', stage = 2 }) {
  const eater = useQuestEater();
  const ref = useRef(null);
  const [fireKey, setFireKey] = useState(0);
  const lastFire = useRef(eater?.fireBreath ?? 0);

  // Register as the preferred flyer target (beats the TopBar Ronki
  // when both are mounted; in practice only one is at a time).
  useEffect(() => {
    if (!eater || !ref.current) return;
    eater.registerRonkiEl(ref.current, 'preferred');
    return () => eater.registerRonkiEl(null, 'preferred');
  }, [eater]);

  // Trigger a one-shot fire-breath puff when QuestEater signals it
  // (Marc: "the dragon at the campfire needs to eat it and breath fire").
  useEffect(() => {
    const ctxKey = eater?.fireBreath ?? 0;
    if (ctxKey !== lastFire.current) {
      lastFire.current = ctxKey;
      setFireKey(k => k + 1);
    }
  }, [eater?.fireBreath]);

  // When onTap is provided (from Hub — rotates Ronki's quip), render as
  // a <button> and add a small haptic + SFX for feedback. aria-label is
  // non-empty then so screen readers can activate the control.
  const Tag = onTap ? 'button' : 'div';
  const handleTap = onTap
    ? (e) => {
        e.stopPropagation();
        try { if (navigator.vibrate) navigator.vibrate(30); } catch (_) { /* noop */ }
        onTap();
      }
    : undefined;

  // Front-facing MoodChibi for the campfire (Marc 24 Apr 2026: "happy
  // to have him look towards the user and not the campfire. maybe that's
  // even more natural."). Drops the old custom side-profile construction
  // in favor of the same chibi we use on the profile — consistent pose,
  // variant palette, no more mixed-perspective issues.
  return (
    <Tag
      ref={ref}
      aria-label={onTap ? 'Ronki antippen' : undefined}
      aria-hidden={onTap ? undefined : 'true'}
      onClick={handleTap}
      style={{
        position: 'absolute',
        left: '20%',
        bottom: '14%',
        width: 130,
        height: 130,
        zIndex: 5,
        animation: 'cfRonkiBreathe 3.4s ease-in-out infinite',
        transformOrigin: '50% 90%',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      {/* Fire-breath puff — extends right toward the campfire, keyed so
          each eat-event remounts a fresh run. Lives above the chibi in
          z-order so it visually bursts from his mouth. */}
      {fireKey > 0 && (
        <span
          key={fireKey}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '42%',
            left: '58%',
            width: 54,
            height: 30,
            background: 'radial-gradient(ellipse at 15% 50%, #fef3c7 0%, #fcd34d 25%, #f97316 55%, #dc2626 100%)',
            borderRadius: '0 50% 50% 0 / 0 60% 60% 0',
            filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.7))',
            pointerEvents: 'none',
            zIndex: 8,
            transformOrigin: '0% 50%',
            animation: 'cfFireBreath 1.1s ease-out forwards',
          }}
        />
      )}

      {/* Front-facing chibi, bare mode (no inner locket bg) so Ronki
          sits directly on the campfire scene. Variant palette matches
          Louis's hatched colorway. Stage threaded through so the
          campfire Ronki matches the profile Ronki's evolution (Marc
          24 Apr 2026 "stage of ronki at the lager and profile isn't
          the same but should be"). */}
      <MoodChibi size={130} mood="normal" bare variant={variant} stage={Math.min(3, stage)} />
    </Tag>
  );
}

// ── Tree ─────────────────────────────────────────────────────────────
// Distant silhouette: brown trunk + rounded canopy. Scale + opacity are
// props so we can dot three varied trees along the horizon for depth.

function Tree({ left, right, scale = 1, opacity = 1, tree, trunk }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        // Trees rest on the ground-line (38% ground height per
        // CampfireScene). Bumped from 28% on 25 Apr 2026 after ground
        // got taller — trunks were getting buried.
        bottom: '36%',
        left, right,
        width: 40,
        height: 70,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* trunk */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '46%',
        width: '8%',
        height: '40%',
        background: trunk,
        transform: 'translateX(-50%)',
      }} />
      {/* canopy */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '30%',
        transform: 'translateX(-50%)',
        width: 36,
        height: 50,
        background: tree,
        borderRadius: '50% 60% 55% 45% / 40% 50% 55% 45%',
      }} />
    </div>
  );
}

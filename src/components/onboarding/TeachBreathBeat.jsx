import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import MoodChibi from '../MoodChibi';
import FireBreathPuff from '../FireBreathPuff';

/**
 * TeachBreathBeat — the reusable "teach Ronki a fire-breath flavor" beat.
 *
 * Pulled out of TeachFireStep v2 so post-onboarding rituals (Herzfeuer
 * / Funkenstern / Glut / Regenbogenfeuer) share the same 2-round
 * failure-first mechanic without each one re-implementing the state
 * machine. Takes props for:
 *   · variant      — chibi colorway (forest/amber/teal/rose/violet/sunset)
 *   · t            — translation function (parent injects its own useTranslation)
 *   · targetFlavor — the flavor that plays on round 2 success. 'flame'
 *                    for onboarding; 'heart' / 'sparkle' / 'ember' /
 *                    'rainbow' for unlock rituals. Round 1 always plays
 *                    'smoke' regardless.
 *   · copyKeys     — { title, intro, tryFail, tryAgain, holdHint,
 *                      smokeFail, celebrate, soloLine, holdLabel,
 *                      next } — i18n keys for each phase's copy. The
 *                      wrapper owns which language namespace to use.
 *   · onComplete   — called when phase='done' (after the solo repeat).
 *                    Wrapper decides what to do next (continue onboarding
 *                    → step 7, or dismiss modal + actions.teachBreath).
 *
 * Renders:
 *   · H1 title (from copyKeys.title)
 *   · Chibi stage (360×360) with fire/smoke puff + mouth glow
 *   · Phase-keyed copy line
 *   · Hold button OR continue button (depending on phase)
 *
 * Does NOT render:
 *   · Outer page chrome (bg image, safe-area paddings, ProgressBar).
 *     Wrapper provides those. See TeachFireStep.jsx for the onboarding
 *     wrapping, TeachRitualModal (future) for the post-onboarding modal
 *     wrapping.
 */

// Minimum press duration to count as a deliberate "hold" — filters
// accidental double-taps. Any release above this advances the round;
// there is no "too early" branch anymore.
const MIN_HOLD_MS = 220;
const SMOKE_TO_PROMPT_DELAY = 2100;
const SUCCESS_TO_SOLO_DELAY = 1300;
const SOLO_TO_DONE_DELAY = 1200;
const INTRO_DURATION_MS = 2200;

// Front-facing chibi mouth anchor inside the 360×360 wrapper.
const MOUTH_TOP = '68%';
const MOUTH_LEFT = '54%';
const FIRE_SCALE = 1.65;
const FIRE_DURATION_S = 1.5;
const SMOKE_DURATION_S = 1.5;

export default function TeachBreathBeat({
  variant,
  t,
  targetFlavor = 'flame',
  copyKeys,
  onComplete,
  // Header rendered above the chibi. Optional — wrappers that have
  // their own heading (e.g. a modal with a title bar) can pass null
  // to skip the inner H1.
  showTitle = true,
}) {
  // 'intro' → 'prompt' → 'inhaling' → 'smoke' → 'prompt' → 'inhaling'
  // → 'released' → 'solo' → 'done'
  const [phase, setPhase] = useState('intro');
  const [attemptNum, setAttemptNum] = useState(1);  // 1 = will smoke; 2 = will fire
  const [fireKey, setFireKey] = useState(0);
  const [fireFlavor, setFireFlavor] = useState(targetFlavor);
  const holdStart = useRef(null);
  const timersRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();

  // Auto-advance intro → prompt
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = setTimeout(() => setPhase('prompt'), INTRO_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Cleanup pending timers on unmount
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startHold = (e) => {
    if (phase !== 'prompt') return;
    e.preventDefault();
    holdStart.current = performance.now();
    setPhase('inhaling');
  };

  const endHold = () => {
    if (phase !== 'inhaling') return;
    const duration = performance.now() - (holdStart.current || 0);
    holdStart.current = null;

    if (duration < MIN_HOLD_MS) {
      setPhase('prompt');
      return;
    }

    if (attemptNum === 1) {
      // Round 1 — always smoke. Deterministic per spec.
      setFireFlavor('smoke');
      setFireKey(k => k + 1);
      setPhase('smoke');

      const t1 = setTimeout(() => {
        setAttemptNum(2);
        setPhase('prompt');
      }, SMOKE_TO_PROMPT_DELAY);
      timersRef.current.push(t1);
    } else {
      // Round 2 — always targetFlavor. Celebration → Ronki solo → done.
      setFireFlavor(targetFlavor);
      setFireKey(k => k + 1);
      setPhase('released');

      const t1 = setTimeout(() => {
        setFireFlavor(targetFlavor);
        setFireKey(k => k + 1);
        setPhase('solo');
      }, SUCCESS_TO_SOLO_DELAY);
      timersRef.current.push(t1);

      const t2 = setTimeout(() => {
        setPhase('done');
      }, SUCCESS_TO_SOLO_DELAY + SOLO_TO_DONE_DELAY);
      timersRef.current.push(t2);
    }
  };

  const isCelebrating = phase === 'released' || phase === 'solo' || phase === 'done';
  const chibiMood =
    phase === 'smoke' ? 'besorgt' :
    isCelebrating     ? 'magisch' :
    'normal';

  const isInhaling = phase === 'inhaling' || phase === 'solo';
  const chibiScale = prefersReducedMotion ? 1 : (isInhaling ? 1.08 : 1);
  const inhaleDuration = prefersReducedMotion ? 0.01 : (
    phase === 'inhaling' ? 2.0 :
    phase === 'solo'     ? 0.9 :
    0.4
  );

  // Copy line per phase × attempt. copyKeys is injected by wrapper.
  const copyKey =
    phase === 'intro'    ? copyKeys.intro :
    phase === 'prompt'   ? (attemptNum === 2 ? copyKeys.tryAgain : copyKeys.tryFail) :
    phase === 'inhaling' ? copyKeys.holdHint :
    phase === 'smoke'    ? copyKeys.smokeFail :
    phase === 'released' ? copyKeys.celebrate :
                           copyKeys.soloLine;

  const showHoldButton = phase === 'prompt' || phase === 'inhaling';
  const showContinue = phase === 'done';

  // Mouth glow suppressed under reduced-motion.
  const showMouthGlow = !prefersReducedMotion && (phase === 'released' || phase === 'solo');

  return (
    <>
      {showTitle && (
        <header className="space-y-2 max-w-md">
          <h1
            className="font-display text-3xl font-bold text-white tracking-tight leading-tight"
            style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)', textWrap: 'balance' }}
          >
            {t(copyKeys.title)}
          </h1>
        </header>
      )}

      {/* Chibi stage — 360×360 container with fire/smoke + mouth glow */}
      <div className="relative" style={{ width: 360, height: 360 }}>
        <motion.div
          animate={{ scale: chibiScale }}
          transition={{ duration: inhaleDuration, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, transformOrigin: '50% 90%' }}
        >
          <MoodChibi
            size={360}
            variant={variant.id}
            stage={1}
            mood={chibiMood}
            bare
          />

          {showMouthGlow && (
            <span
              key={`glow-${fireKey}`}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '72%',
                left: '50%',
                width: 118,
                height: 78,
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(253,224,71,0.72) 0%, rgba(249,115,22,0.42) 45%, rgba(249,115,22,0) 80%)',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(5px)',
                animation: `teachMouthGlow ${FIRE_DURATION_S}s ease-out forwards`,
                pointerEvents: 'none',
                zIndex: 7,
              }}
            />
          )}

          <FireBreathPuff
            fireKey={fireKey}
            flavor={fireFlavor}
            top={MOUTH_TOP}
            left={MOUTH_LEFT}
            scale={FIRE_SCALE}
            duration={fireFlavor === 'smoke' ? SMOKE_DURATION_S : FIRE_DURATION_S}
          />
        </motion.div>
      </div>

      {/* Phase-keyed copy line */}
      <motion.p
        key={copyKey}
        initial={{ opacity: 0.35, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="text-white/90 text-lg leading-relaxed max-w-sm"
        style={{ textWrap: 'balance', minHeight: '3em' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {t(copyKey)}
      </motion.p>

      {/* Action zone — hold button OR continue button */}
      <div className="w-full max-w-xs mt-2 min-h-[120px] flex flex-col items-center justify-center gap-3">
        {showHoldButton && (
          <>
            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              className="w-24 h-24 rounded-full font-headline text-3xl font-bold flex items-center justify-center"
              style={{
                background: phase === 'inhaling'
                  ? 'radial-gradient(circle at 40% 30%, #fed7aa, #f97316 70%, #c2410c)'
                  : 'radial-gradient(circle at 40% 30%, #fde68a, #fcd34d 70%, #f59e0b)',
                boxShadow: phase === 'inhaling'
                  ? '0 0 60px rgba(249,115,22,0.7), inset 0 -4px 8px rgba(0,0,0,0.2)'
                  : '0 0 32px rgba(252,211,77,0.55), inset 0 -4px 8px rgba(0,0,0,0.18)',
                border: 'none',
                transform: phase === 'inhaling' ? 'scale(0.94)' : 'scale(1)',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease',
                cursor: 'pointer',
                touchAction: 'none',
                userSelect: 'none',
              }}
              aria-label={t(copyKeys.holdLabel)}
            >
              <span aria-hidden="true">🔥</span>
            </button>
            <p className="text-white/85 text-sm font-label uppercase tracking-widest inline-flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>touch_app</span>
              {t(copyKeys.holdLabel)}
            </p>
          </>
        )}

        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onComplete}
            className="w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #124346, #2d5a5e)',
              boxShadow: '0 12px 30px rgba(18,67,70,0.25)',
            }}
          >
            {t(copyKeys.next)}
            <span className="material-symbols-outlined">arrow_forward</span>
          </motion.button>
        )}
      </div>

      {/* Local keyframes — cfFireBreath (for flame/targetFlavor puff)
          and teachMouthGlow (for the mouth-pulse) must be available
          even if no campfire-scene stylesheet is mounted. */}
      <style>{`
        @keyframes cfFireBreath {
          0%   { opacity: 0; transform: scaleX(0.2) scaleY(0.6); }
          25%  { opacity: 1; transform: scaleX(1) scaleY(1); }
          80%  { opacity: 0.8; transform: scaleX(1.3) scaleY(0.9); }
          100% { opacity: 0; transform: scaleX(1.6) scaleY(0.5); }
        }
        @keyframes teachMouthGlow {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          25%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </>
  );
}

/**
 * Default copy key set for the original onboarding flame teach.
 * Exported so wrappers + preview harnesses can reuse it.
 */
export const ONBOARDING_FLAME_COPY = {
  title: 'onboarding.teach.title',
  intro: 'onboarding.teach.intro',
  tryFail: 'onboarding.teach.tryFail',
  tryAgain: 'onboarding.teach.tryAgain',
  holdHint: 'onboarding.teach.holdHint',
  smokeFail: 'onboarding.teach.smokeFail',
  celebrate: 'onboarding.teach.celebrate',
  soloLine: 'onboarding.teach.soloLine',
  holdLabel: 'onboarding.teach.holdLabel',
  next: 'onboarding.teach.next',
};

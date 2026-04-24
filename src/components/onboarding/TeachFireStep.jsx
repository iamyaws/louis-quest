import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import MoodChibi from '../MoodChibi';
import FireBreathPuff from '../FireBreathPuff';

/**
 * TeachFireStep — onboarding's "Der erste Funke" beat.
 *
 * v2 (24 Apr 2026): 2-round deterministic failure→success loop + better
 * fire-mouth alignment. See backlog_teach_fire_step_v2.md for the Marc
 * spec. v1 ethos preserved: kid-as-expert / Ronki-as-learner, hold-and-
 * release mechanic that encodes the lesson kinesthetically.
 *
 * Flow:
 *   intro (2.2s auto) → prompt (attempt 1) → inhaling → smoke (cough, 1.6s)
 *                     → prompt (attempt 2) → inhaling → released (fire)
 *                     → solo → done
 *
 * First release always produces a smoke puff with a soft "that was too
 * short" copy. Second release always produces the real flame → Ronki
 * solo repeat → continue. The kid learns "fail once, keep going, make
 * it happen" — failure encoded as part of the path to success.
 *
 * Generative for the time-stack journey tier — the eventual Wave-3
 * farewell surface reads `state.taughtSignature` + `state.taughtAt` to
 * render callbacks like "Weißt du noch, wie du mir das beigebracht hast?"
 *
 * Forgiving by design: no skip button, no retry counter; the loop is
 * always exactly two rounds regardless of how long the kid holds.
 */

const base = import.meta.env.BASE_URL;

// Minimum press duration to count as a deliberate "hold" — filters
// accidental double-taps. Any release above this advances the round;
// there is no "too early" branch anymore (the 2-round loop replaces
// the old duration-gated retry from v1).
const MIN_HOLD_MS = 220;
const SMOKE_TO_PROMPT_DELAY = 1600;  // how long the "cough" beat lingers
const SUCCESS_TO_SOLO_DELAY = 1000;
const SOLO_TO_DONE_DELAY = 1100;
const INTRO_DURATION_MS = 2200;

// Front-facing chibi mouth anchor inside the 360×360 wrapper.
//   Stage-1 chibi renders at bottom:5%, height:360*0.6*0.78 ≈ 168.5px.
//   Mouth sits at top:54% of the chibi body = ~73% of the outer wrapper.
//   Kept as constants so the mouth glow + flame/smoke puff share the
//   same anchor (visual lineage: glow backdrop + puff origin = same spot).
const MOUTH_TOP = '68%';   // slight up-bias so flame reads as above mouth line
const MOUTH_LEFT = '54%';  // right of center so the flame cone extends rightward
const FIRE_SCALE = 1.4;    // bigger than SideRonki's default flame

export default function TeachFireStep({ variant, t, ProgressBar, onComplete }) {
  // 'intro' → 'prompt' → 'inhaling' → 'smoke' → 'prompt' → 'inhaling'
  // → 'released' → 'solo' → 'done'
  const [phase, setPhase] = useState('intro');
  const [attemptNum, setAttemptNum] = useState(1);  // 1 = will smoke; 2 = will fire
  const [fireKey, setFireKey] = useState(0);
  const [fireFlavor, setFireFlavor] = useState('flame');
  const holdStart = useRef(null);
  const timersRef = useRef([]);
  // Motion-a11y: shorten + simplify animations when the OS requests it.
  // The kid still sees the state progression, just without the 2s sustained
  // inhale-scale or the long intro hold. P2 Tier 3 pass 24 Apr 2026.
  const prefersReducedMotion = useReducedMotion();

  // Auto-advance intro → prompt
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = setTimeout(() => setPhase('prompt'), INTRO_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Cleanup pending timers if the component unmounts mid-flow
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

    // Filter accidental double-taps (<MIN_HOLD_MS) by falling straight
    // back to prompt without advancing. Otherwise: round-branch.
    if (duration < MIN_HOLD_MS) {
      setPhase('prompt');
      return;
    }

    if (attemptNum === 1) {
      // Round 1 — always smoke/cough. Deterministic per Marc's spec.
      // Kid reads "Oh, das war zu kurz — nochmal versuchen!" and the
      // loop advances to round 2 after SMOKE_TO_PROMPT_DELAY.
      setFireFlavor('smoke');
      setFireKey(k => k + 1);
      setPhase('smoke');

      const t1 = setTimeout(() => {
        setAttemptNum(2);
        setPhase('prompt');
      }, SMOKE_TO_PROMPT_DELAY);
      timersRef.current.push(t1);
    } else {
      // Round 2 — always fire. Celebration → Ronki solo repeat → done.
      setFireFlavor('flame');
      setFireKey(k => k + 1);
      setPhase('released');

      const t1 = setTimeout(() => {
        setFireFlavor('flame');
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

  // Mood: magisch only on the real success beat + solo repeat. Round-1
  // smoke uses 'besorgt' (worried face) to match the cough vibe without
  // needing a new mood skin. P2 note: once backlog_ronki_mood_animations
  // lands a 'husten'/cough mood, swap to that.
  const isCelebrating = phase === 'released' || phase === 'solo' || phase === 'done';
  const chibiMood =
    phase === 'smoke'     ? 'besorgt' :
    isCelebrating         ? 'magisch' :
    'normal';

  // Inhale-scale on the chibi wrapper. Scales up while holding, then
  // lingers for the solo retry beat (Ronki repeats the lesson on his own).
  // Reduced-motion: flatten the scale entirely (kid sees the state flip
  // via color/copy instead of sustained scale animation).
  const isInhaling = phase === 'inhaling' || phase === 'solo';
  const chibiScale = prefersReducedMotion ? 1 : (isInhaling ? 1.08 : 1);
  const inhaleDuration = prefersReducedMotion ? 0.01 : (
    phase === 'inhaling' ? 2.0 :
    phase === 'solo'     ? 0.9 :
    0.4
  );

  // Copy line per phase × attempt. Attempt 2's prompt uses a "nochmal"
  // framing so the kid hears "alright, one more time" instead of the
  // same intro framing twice.
  const copyKey =
    phase === 'intro'    ? 'onboarding.teach.intro' :
    phase === 'prompt'   ? (attemptNum === 2 ? 'onboarding.teach.tryAgain' : 'onboarding.teach.tryFail') :
    phase === 'inhaling' ? 'onboarding.teach.holdHint' :
    phase === 'smoke'    ? 'onboarding.teach.smokeFail' :
    phase === 'released' ? 'onboarding.teach.celebrate' :
                           'onboarding.teach.soloLine';

  // Hold button shown on prompt + while inhaling. Hidden during the
  // smoke beat (force kid to read the "zu kurz" copy before the next
  // round), during release/solo (Ronki is doing his thing), and at done.
  const showHoldButton = phase === 'prompt' || phase === 'inhaling';
  const showContinue = phase === 'done';

  // Mouth-glow backdrop — warm radial pulse at the mouth anchor when
  // the real flame fires (round 2 release + solo repeat). Creates
  // visual lineage between the face and the flame so fire reads as
  // coming FROM the mouth, not floating beside the chibi. Option A of
  // the v2 spec (keep front-facing pose, fix alignment). Suppressed
  // under reduced-motion to avoid the pulse.
  const showMouthGlow = !prefersReducedMotion && (phase === 'released' || phase === 'solo');

  return (
    <div className="fixed inset-0 overflow-y-auto font-body">
      {/* Background — same teal as the surrounding onboarding steps */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      <main
        className="relative z-10 min-h-full flex flex-col px-8 text-center"
        style={{
          paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <ProgressBar />

        <div className="my-auto flex flex-col items-center gap-5">
          <header className="space-y-2 max-w-md">
            <h1
              className="font-display text-3xl font-bold text-white tracking-tight leading-tight"
              style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)', textWrap: 'balance' }}
            >
              {t('onboarding.teach.title')}
            </h1>
          </header>

          {/* Chibi stage — relative wrapper sized 360 so the freshly-
              hatched Ronki reads as the main character of this beat.
              Fire/smoke puff + mouth glow are siblings of the chibi,
              all anchored to the chibi's mouth (~68% top / 54% left of
              this container). See MOUTH_TOP/LEFT constants. */}
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

              {/* Mouth glow — radial warm pulse behind the flame origin
                  so fire reads as erupting from the mouth. Only pulses
                  on the real-flame beats (round 2). Re-keyed via fireKey
                  so it restarts when the solo retry fires. */}
              {showMouthGlow && (
                <span
                  key={`glow-${fireKey}`}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '72%',
                    left: '50%',
                    width: 90,
                    height: 60,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse at 50% 50%, rgba(253,224,71,0.7) 0%, rgba(249,115,22,0.4) 45%, rgba(249,115,22,0) 80%)',
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(4px)',
                    animation: 'teachMouthGlow 1.1s ease-out forwards',
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
              />
            </motion.div>
          </div>

          {/* Phase-keyed copy line. motion.p with key → re-mounts on
              phase change with a gentle fade-in (initial opacity 0.35
              not 0, so even if animation skips the text stays visible
              — avoids the old StrictMode remount-stuck-at-0 issue). */}
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
                  aria-label={t('onboarding.teach.holdLabel')}
                >
                  <span aria-hidden="true">🔥</span>
                </button>
                {/* Icon + label clarifies "hold" beyond the word alone —
                    kid sees the touch-hold glyph AND reads it. Opacity
                    bumped /65 → /85 for outdoor readability. */}
                <p className="text-white/85 text-sm font-label uppercase tracking-widest inline-flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>touch_app</span>
                  {t('onboarding.teach.holdLabel')}
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
                {t('onboarding.teach.next')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            )}
          </div>
        </div>
      </main>

      {/* The cfFireBreath keyframe is defined inside CampfireScene's
          <style> block, so FireBreathPuff (which references it) only
          plays correctly when CampfireScene is mounted. Onboarding runs
          before that — replicate the keyframe here so the puff plays
          standalone. Also local: teachMouthGlow keyframe for the v2
          mouth pulse. */}
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
    </div>
  );
}

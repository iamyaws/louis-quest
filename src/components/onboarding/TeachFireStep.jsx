import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import MoodChibi from '../MoodChibi';
import FireBreathPuff from '../FireBreathPuff';

/**
 * TeachFireStep — onboarding's "Der erste Funke" beat.
 *
 * Establishes the kid-as-expert / Ronki-as-learner relationship at hatch.
 * Kid holds the button → Ronki visibly inhales (chibi wrapper scale 1→1.08
 * over 2s) → release ≥1.5s fires a full FireBreathPuff → 1s later Ronki
 * does it solo. The hold-and-release encodes the lesson kinesthetically:
 * the kid demonstrated *the breath*, not just tapped a button.
 *
 * Generative for the time-stack journey tier — the eventual Wave-3
 * farewell surface reads `state.taughtSignature` + `state.taughtAt` to
 * render callbacks like "Weißt du noch, wie du mir das beigebracht hast?"
 *
 * Forgiving by design: <1.5s release shows soft retry copy + ember puff;
 * after 2 retries an early release auto-passes. No skip button — the
 * threshold is low enough that a normal hold succeeds.
 */

const base = import.meta.env.BASE_URL;

const HOLD_THRESHOLD_MS = 1500;
const MAX_RETRIES = 2;
const SUCCESS_TO_SOLO_DELAY = 1000;
const SOLO_TO_DONE_DELAY = 1100;
const INTRO_DURATION_MS = 2200;

export default function TeachFireStep({ variant, t, ProgressBar, onComplete }) {
  // 'intro' → 'prompt' → 'inhaling' → 'released' → 'solo' → 'done'
  const [phase, setPhase] = useState('intro');
  const [retries, setRetries] = useState(0);
  const [fireKey, setFireKey] = useState(0);
  const [fireFlavor, setFireFlavor] = useState('flame');
  const holdStart = useRef(null);
  const timersRef = useRef([]);

  // Auto-advance intro → prompt
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = setTimeout(() => setPhase('prompt'), INTRO_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Cleanup pending success-path timers if the component unmounts mid-flow
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

    // Auto-pass the third attempt regardless of duration so a fidgety kid
    // never gets stuck on this step. Threshold + retries together form
    // the safety net; no skip button needed.
    if (duration >= HOLD_THRESHOLD_MS || retries >= MAX_RETRIES) {
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
    } else {
      // Too early — small ember puff (visually distinct from the flame
      // success), tooEarly copy, retry counter ticks. Phase falls back
      // to 'prompt' so the kid can immediately try again.
      setFireFlavor('ember');
      setFireKey(k => k + 1);
      setRetries(r => r + 1);
      setPhase('prompt');
    }
  };

  // Mood: magisch on success/celebration, normal otherwise. Magisch adds
  // the gold-rose aura + sparkle particles which match the "he learned
  // it" beat without us having to author a custom celebration animation.
  const isCelebrating = phase === 'released' || phase === 'solo' || phase === 'done';
  const chibiMood = isCelebrating ? 'magisch' : 'normal';

  // Inhale-scale on the chibi wrapper. Scales up while holding, then
  // lingers for the solo retry beat (Ronki repeats the lesson on his own).
  const isInhaling = phase === 'inhaling' || phase === 'solo';
  const chibiScale = isInhaling ? 1.08 : 1;
  const inhaleDuration =
    phase === 'inhaling' ? 2.0 :
    phase === 'solo'     ? 0.9 :
    0.4;

  // Copy line per phase. Retry uses a softer prompt instead of repeating
  // the intro line, so a too-early kid hears "noch ein bisschen länger"
  // instead of the original "Er will Feuer machen…" framing.
  const copyKey =
    phase === 'intro'    ? 'onboarding.teach.intro' :
    phase === 'prompt'   ? (retries > 0 ? 'onboarding.teach.tooEarly' : 'onboarding.teach.tryFail') :
    phase === 'inhaling' ? 'onboarding.teach.holdHint' :
    phase === 'released' ? 'onboarding.teach.celebrate' :
                           'onboarding.teach.soloLine';

  const showHoldButton = phase === 'prompt' || phase === 'inhaling';
  const showContinue = phase === 'done';

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

          {/* Chibi stage — relative wrapper so FireBreathPuff (absolute,
               default top:42% / left:58%) lands near Ronki's mouth, same
               pattern SideRonki uses inside CampfireScene. Sized 360 so
               the freshly-hatched Ronki reads as the main character of
               this beat, not a thumbnail (Marc 24 Apr 2026). */}
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
              <FireBreathPuff fireKey={fireKey} flavor={fireFlavor} />
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
          standalone. */}
      <style>{`
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

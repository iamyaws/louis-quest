import React, { useState, useEffect, useRef, useCallback } from 'react';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { getVariant } from '../data/companionVariants';
import PinModal from './PinModal';

/**
 * ToothbrushTimer — 3-minute countdown with animated dragon.
 * Launches when Louis taps "Zähne putzen" quest.
 * Dragon progresses through brushing stages as the timer runs.
 *
 * Props:
 *  - duration: seconds (default 180 = 3min, dentist recommendation;
 *    bumped from 2min per Marc 22 Apr 2026 — "should be three")
 *  - onFinish: called when timer completes
 *  - onSkip: called if parent skips (long-press)
 *  - onParentOverride: called when a parent taps the PIN-gated
 *    "Eltern: fertig" button to close the timer early (kid already
 *    finished, no point waiting out the remaining seconds)
 */

const STAGES = [
  { pct: 0.00, label: 'Oben links',   emoji: '🦷', side: 'top-left' },
  { pct: 0.25, label: 'Oben rechts',  emoji: '✨', side: 'top-right' },
  { pct: 0.50, label: 'Unten links',  emoji: '🦷', side: 'bottom-left' },
  { pct: 0.75, label: 'Unten rechts', emoji: '✨', side: 'bottom-right' },
  { pct: 1.00, label: 'Fertig!',      emoji: '🎉', side: 'done' },
];

// Mid-session companion lines — encouragement + "Ronki brushes too" duet.
// Fires at two random points per session (early + late gap) so brushing
// doesn't go silent between quadrant transitions. Pool shared across both
// fire windows, session-local exclusion so we don't hear the same line twice.
const TEETH_MID_POOL = [
  'teeth_mid_01',    // "Nicht aufhören! Die Ecken hinten sind knifflig."
  'teeth_mid_02',    // "Kreise machen! So klein wie Erbsen."
  'teeth_mid_03',    // "Hmm. Meine Zähne jucken auch..."
  'teeth_mid_04',    // "Denk an die Rückseite!..."
  'teeth_ronki_01',  // "Ich putz auch mit! Drachen-Zahnbürsten..."
  'teeth_ronki_02',  // "Meine Zähne sind klein und spitz..."
  'teeth_ronki_03',  // "Moment — wo ist meine Zahnbürste?..."
];
// Three variants for the final cheer so 3 successive brush sessions don't
// close on the same line. Randomized per session.
const TEETH_DONE_POOL = ['teeth_done', 'teeth_done_02', 'teeth_done_03'];

function pickRandom(pool, exclude = null) {
  const choices = exclude ? pool.filter(p => p !== exclude) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

const base = import.meta.env.BASE_URL;

export default function ToothbrushTimer({ duration = 180, onFinish, onSkip, onParentOverride }) {
  const { state } = useTask();
  const haptic = useHaptic();
  const variant = getVariant(state?.companionVariant);

  const [remaining, setRemaining] = useState(duration);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  // Mid-line bookkeeping — picked once per session on mount so we know
  // which line played early and can exclude it from the late slot.
  const midLinesRef = useRef({ early: null, late: null });
  if (midLinesRef.current.early === null) {
    midLinesRef.current.early = pickRandom(TEETH_MID_POOL);
    midLinesRef.current.late = pickRandom(TEETH_MID_POOL, midLinesRef.current.early);
  }
  // Parent-PIN override — when a parent can see the child already
  // finished brushing but the timer still has 30-90s on the clock,
  // tapping "Eltern: fertig" + PIN completes the task immediately.
  // Marc 22 Apr 2026: "mark it done as parents vs. waiting two minutes
  // even though it done." Same "1234" default PIN as the Eltern-Bereich.
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');

  const pct = duration > 0 ? 1 - (remaining / duration) : 1;
  const currentStage = STAGES.reduce((acc, s) => pct >= s.pct ? s : acc, STAGES[0]);
  const stageIdx = STAGES.indexOf(currentStage);

  // Voice on mount
  useEffect(() => { VoiceAudio.playLocalized('teeth_start'); }, []);

  // Countdown
  useEffect(() => {
    // Mid-line fire points — inside the silent gaps between quadrant voices.
    // For a 180s session that lands at ~30s and ~120s elapsed, well clear
    // of the 45/90/135s quadrant transitions. Scales with `duration`.
    const earlyMidTick = Math.max(20, Math.floor(duration / 6));   // ~30s @ 180s
    const lateMidTick  = Math.max(30, Math.floor((2 * duration) / 3)); // ~120s @ 180s
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          SFX.play('alarm');
          // Pick a done variant — 3 options so successive sessions close
          // differently. Falls back to 'teeth_done' naturally.
          VoiceAudio.playLocalized(pickRandom(TEETH_DONE_POOL));
          // Was a long 200/100/200ms alarm — shortened to success pattern
          // so the end feels like a "done chime", not an alarm-clock buzz.
          haptic('success');
          return 0;
        }
        const elapsed = duration - prev;
        // Voice + tick sound at stage transitions
        const newPct = 1 - ((prev - 1) / duration);
        const newStage = STAGES.reduce((acc, s) => newPct >= s.pct ? s : acc, STAGES[0]);
        const newIdx = STAGES.indexOf(newStage);
        if (newIdx !== stageIdx) {
          SFX.play('pop');
          // Stage tick — quadrant-transition micro-feedback. Uses 'tap'
          // (shortest named pattern) so rapid quadrant changes don't feel
          // like repeated punches. Was a single 100ms.
          haptic('tap');
          // Ronki voice for each quadrant — stays stable (spatial guidance).
          // Base IDs (no lang prefix) — playLocalized resolves de_ / en_ at play.
          const voiceMap = ['teeth_start', 'teeth_topright', 'teeth_bottomleft', 'teeth_bottomright'];
          if (voiceMap[newIdx]) VoiceAudio.playLocalized(voiceMap[newIdx]);
        }
        // Mid-session encouragement — fire once early, once late. Picked
        // on mount into midLinesRef, exclusion-pair so we never hear the
        // same line twice in one session.
        if (elapsed === earlyMidTick && midLinesRef.current.early) {
          VoiceAudio.playLocalized(midLinesRef.current.early);
        }
        if (elapsed === lateMidTick && midLinesRef.current.late) {
          VoiceAudio.playLocalized(midLinesRef.current.late);
        }
        // Halfway voice
        if (prev === Math.floor(duration / 2) + 1) {
          VoiceAudio.playLocalized('teeth_halfway');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [duration, stageIdx]);

  const handleFinish = useCallback(() => {
    clearInterval(intervalRef.current);
    SFX.play('coin');
    onFinish?.();
  }, [onFinish]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  // Ring SVG
  const R = 54;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (remaining / duration);

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(160deg, #0c3236 0%, #124346 50%, #1a5e52 100%)' }}>

      {/* Painted bathroom scene backdrop */}
      <img src={base + 'art/routines/brushing-teeth.webp'} alt=""
           className="absolute inset-0 w-full h-full object-cover pointer-events-none"
           style={{ opacity: 0.35, objectPosition: 'center top' }} />
      {/* Darken overlay to keep counter readable */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(12,50,54,0.4) 0%, rgba(12,50,54,0.75) 60%, rgba(12,50,54,0.85) 100%)' }} />

      {/* Floating bubbles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
               style={{
                 width: 6 + Math.random() * 14,
                 height: 6 + Math.random() * 14,
                 left: `${10 + Math.random() * 80}%`,
                 bottom: '-10%',
                 background: 'rgba(255,255,255,0.08)',
                 animation: `toothbubble ${4 + Math.random() * 5}s ease-in-out infinite ${Math.random() * 3}s`,
               }} />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">

        {/* Dragon portrait with progress ring */}
        <div className="relative mb-6">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="70" cy="70" r={R} fill="none"
                    stroke={finished ? '#34d399' : '#fcd34d'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden"
                 style={{ border: `3px solid ${variant.borderColor}66`, boxShadow: `0 0 20px ${variant.glowColor}` }}>
              <img src={base + variant.spritePath} alt="Ronki"
                   className="w-full h-full object-cover"
                   style={{ transform: finished ? 'scale(1.1)' : 'none', transition: 'transform 0.5s' }}
                   onError={(e) => { e.target.src = base + 'art/companion/dragon-young.webp'; }} />
            </div>
          </div>
        </div>

        {/* Timer display */}
        <div className="mb-4">
          <span className="font-headline font-extrabold text-white leading-none"
                style={{ fontSize: finished ? 40 : 56 }}>
            {finished ? '🎉' : `${mm}:${ss}`}
          </span>
        </div>

        {/* Stage indicator */}
        <div className="mb-8">
          <p className="font-headline font-bold text-xl text-white mb-2">
            {finished ? 'Super sauber!' : currentStage.label}
          </p>
          {/* Stage dots */}
          <div className="flex justify-center gap-2.5">
            {STAGES.slice(0, 4).map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                     style={{
                       background: i <= stageIdx ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.08)',
                       border: i === stageIdx ? '2px solid #fcd34d' : '2px solid transparent',
                       boxShadow: i === stageIdx ? '0 0 12px rgba(252,211,77,0.4)' : 'none',
                     }}>
                  <span style={{ fontSize: 18 }}>{i <= stageIdx ? '✨' : '🦷'}</span>
                </div>
                <span className="font-label text-xs text-white/40" style={{ fontSize: 9 }}>
                  {['OL', 'OR', 'UL', 'UR'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ronki encouragement */}
        <div className="px-6 py-3 rounded-full mb-8"
             style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="font-body text-sm text-white/70 italic">
            {finished
              ? 'Ronki strahlt — deine Zähne glänzen! ✨'
              : stageIdx === 0 ? 'Los geht\'s! Oben links anfangen 🪥'
              : stageIdx === 1 ? 'Super! Jetzt die andere Seite oben 💪'
              : stageIdx === 2 ? 'Weiter unten — du schaffst das! 🌟'
              : 'Fast fertig! Noch die letzte Ecke! ⭐'}
          </p>
        </div>

        {/* Action button */}
        {finished ? (
          <button onClick={handleFinish}
            className="w-full max-w-xs py-5 rounded-full font-headline font-bold text-xl active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
            Fertig! 🦷✨
          </button>
        ) : (
          <>
            <p className="font-label text-xs text-white/30 mt-4">
              Weiterputzen — Ronki passt auf! ✨
            </p>
            {/* Parent override — small, discrete. Not meant to catch a
                 kid's eye (which is why it's tiny + low contrast + off to
                 the bottom), but a parent knows to look. */}
            <button
              onClick={() => { setPin(''); setPinOpen(true); }}
              className="mt-6 font-label uppercase tracking-widest active:opacity-70 transition-opacity"
              style={{
                fontSize: 10, letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.35)',
                background: 'transparent', border: 'none',
                padding: '8px 14px', borderRadius: 999,
              }}>
              Eltern: fertig
            </button>
          </>
        )}
      </div>

      {pinOpen && (
        <PinModal
          pin={pin}
          setPin={setPin}
          onSuccess={() => {
            setPinOpen(false); setPin('');
            clearInterval(intervalRef.current);
            SFX.play('coin');
            haptic('success');
            (onParentOverride || onFinish)?.();
          }}
          onClose={() => { setPinOpen(false); setPin(''); }}
        />
      )}

      {/* CSS for bubble animation */}
      <style>{`
        @keyframes toothbubble {
          0% { transform: translateY(0) scale(1); opacity: 0.08; }
          50% { opacity: 0.15; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

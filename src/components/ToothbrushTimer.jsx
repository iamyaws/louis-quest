import React, { useState, useEffect, useRef, useCallback } from 'react';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';

/**
 * ToothbrushTimer — 2-3 minute countdown with animated dragon.
 * Launches when Louis taps "Zähne putzen" quest.
 * Dragon progresses through brushing stages as the timer runs.
 *
 * Props:
 *  - duration: seconds (default 120 = 2min)
 *  - onFinish: called when timer completes
 *  - onSkip: called if parent skips (long-press)
 */

const STAGES = [
  { pct: 0.00, label: 'Oben links',   emoji: '🦷', side: 'top-left' },
  { pct: 0.25, label: 'Oben rechts',  emoji: '✨', side: 'top-right' },
  { pct: 0.50, label: 'Unten links',  emoji: '🦷', side: 'bottom-left' },
  { pct: 0.75, label: 'Unten rechts', emoji: '✨', side: 'bottom-right' },
  { pct: 1.00, label: 'Fertig!',      emoji: '🎉', side: 'done' },
];

const base = import.meta.env.BASE_URL;

export default function ToothbrushTimer({ duration = 120, onFinish, onSkip }) {
  const [remaining, setRemaining] = useState(duration);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  const pct = duration > 0 ? 1 - (remaining / duration) : 1;
  const currentStage = STAGES.reduce((acc, s) => pct >= s.pct ? s : acc, STAGES[0]);
  const stageIdx = STAGES.indexOf(currentStage);

  // Voice on mount
  useEffect(() => { VoiceAudio.play('de_teeth_start'); }, []);

  // Countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          SFX.play('alarm');
          VoiceAudio.play('de_teeth_done');
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        // Voice + tick sound at stage transitions
        const newPct = 1 - ((prev - 1) / duration);
        const newStage = STAGES.reduce((acc, s) => newPct >= s.pct ? s : acc, STAGES[0]);
        const newIdx = STAGES.indexOf(newStage);
        if (newIdx !== stageIdx) {
          SFX.play('pop');
          if (navigator.vibrate) navigator.vibrate(100);
          // Ronki voice for each quadrant
          const voiceMap = ['de_teeth_start', 'de_teeth_topright', 'de_teeth_bottomleft', 'de_teeth_bottomright'];
          if (voiceMap[newIdx]) VoiceAudio.play(voiceMap[newIdx]);
        }
        // Halfway voice
        if (prev === Math.floor(duration / 2) + 1) {
          VoiceAudio.play('de_teeth_halfway');
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
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center"
         style={{ background: 'linear-gradient(160deg, #0c3236 0%, #124346 50%, #1a5e52 100%)' }}>

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
                 style={{ border: '3px solid rgba(252,211,77,0.4)', boxShadow: '0 0 20px rgba(252,211,77,0.2)' }}>
              <img src={base + 'art/companion/dragon-baby.webp'} alt="Ronki"
                   className="w-full h-full object-cover"
                   style={{ transform: finished ? 'scale(1.1)' : 'none', transition: 'transform 0.5s' }} />
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
              ? 'Ronki strahlt — deine Zähne glänzen! 🐉'
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
          <p className="font-label text-xs text-white/30 mt-4">
            Weiterputzen — Ronki passt auf! 🐉
          </p>
        )}
      </div>

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

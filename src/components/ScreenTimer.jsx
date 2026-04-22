import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';
import { useHaptic } from '../hooks/useHaptic';

function AnimatedDigit({ d, size }) {
  // size: 'sm' (badge, text-lg) or 'lg' (expanded panel, text-4xl)
  const h = size === 'lg' ? '2.5rem' : '1.4rem'; // clip box height matches font-size
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', height: h, verticalAlign: 'bottom' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={d}
          initial={{ y: h, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: `-${h}`, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.32, 0, 0.67, 0] }}
          style={{ display: 'block', lineHeight: h }}
        >
          {d}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Floating screen-time timer badge.
 *
 * Props:
 *  - totalSeconds: total duration in seconds
 *  - cost: original screen-minute cost (for proportional refund)
 *  - rewardName: display name ("Hörspiel", etc.)
 *  - onFinish: called when timer hits 0
 *  - onStore: called with {refundMinutes} when user saves remaining time
 *  - onDismiss: called to remove the timer
 */
export default function ScreenTimer({ totalSeconds, cost, rewardName, onFinish, onStore, onDismiss }) {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const warningPlayed = useRef(false);
  const firedThresholdsRef = useRef(new Set());

  // Countdown logic
  useEffect(() => {
    if (paused || finished) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const fired = firedThresholdsRef.current;

        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          SFX.play('alarm');
          VoiceAudio.play('de_screen_done');
          if (!fired.has('done')) {
            fired.add('done');
            VoiceAudio.play('de_screentime_done_01', 0);
          }
          // Was a long 200/100/200/100/200ms alarm — now a short success
          // pattern so the buzz reads as "done" instead of alarm-clock startle.
          haptic('success');
          onFinish?.();
          return 0;
        }
        // Ronki voice milestones
        const halfPoint = Math.floor(totalSeconds / 2);
        if (prev === halfPoint) VoiceAudio.play('de_screen_half');
        if (prev === 300) VoiceAudio.play('de_screen_5min');  // 5 min left
        if (prev === 120) VoiceAudio.play('de_screen_2min');  // 2 min left
        if (prev === 60) VoiceAudio.play('de_screen_1min');   // 1 min left

        // Threshold-based ramp-down voice alerts (ref-deduped per session)
        // 50% threshold — only for sessions >= 10 min, so short redemptions skip it
        if (!fired.has('50') && totalSeconds >= 600 && prev <= totalSeconds * 0.5) {
          fired.add('50');
          VoiceAudio.play('de_screentime_50_01', 0);
        }
        // 20% threshold
        if (!fired.has('20') && prev <= totalSeconds * 0.2) {
          fired.add('20');
          VoiceAudio.play('de_screentime_20_01', 0);
        }
        // 10% / last minute — fires when under 60s remaining
        if (!fired.has('10') && prev <= 60) {
          fired.add('10');
          VoiceAudio.play('de_screentime_10_01', 0);
        }
        // Eye care reminders every 10 minutes
        if (prev > 60 && prev % 600 === 0) {
          const eyeLines = ['de_screen_eyes', 'de_screen_eyes2', 'de_screen_eyes3'];
          VoiceAudio.play(eyeLines[Math.floor(Math.random() * eyeLines.length)]);
        }
        // Warning tick in last 60 seconds
        if (prev <= 61 && prev > 1 && prev % 10 === 0 && !warningPlayed.current) {
          SFX.play('tick');
        }
        if (prev <= 11) {
          SFX.play('tick');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, finished, onFinish]);

  const togglePause = useCallback(() => {
    SFX.play('tap');
    setPaused(p => !p);
  }, []);

  const [refundFlash, setRefundFlash] = useState(null);

  const handleStore = useCallback(() => {
    SFX.play('coin');
    VoiceAudio.play('sfx_celebrate');
    clearInterval(intervalRef.current);
    // Proportional refund in pearls (currency): remaining/total * cost, rounded down
    const refundMinutes = Math.floor((remaining / totalSeconds) * cost);
    // Proportional refund in wall-clock minutes (for Funkelzeit daily-usage tracking).
    // Rounded to the nearest whole minute so usage counter stays clean.
    const totalMinutes = totalSeconds / 60;
    const refundTimeMinutes = Math.round((remaining / totalSeconds) * totalMinutes);
    // Show big flash before dismissing
    setRefundFlash(refundMinutes);
    setTimeout(() => {
      onStore?.({ refundMinutes, refundTimeMinutes });
    }, 2200);
  }, [remaining, totalSeconds, cost, onStore]);

  const handleDismiss = useCallback(() => {
    clearInterval(intervalRef.current);
    onDismiss?.();
  }, [onDismiss]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const isLow = remaining <= 60;

  // SVG ring
  const R = 22;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - pct);

  // ── Refund flash overlay ──
  if (refundFlash !== null) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center"
           style={{ background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease' }}>
        <div className="flex flex-col items-center text-center animate-bounce">
          <span className="text-6xl mb-2">⏳</span>
          <p className="font-headline font-extrabold text-white leading-none"
             style={{ fontSize: 64, textShadow: '0 4px 20px rgba(0,206,201,0.6)' }}>
            +{refundFlash}
          </p>
          <p className="font-headline font-bold text-2xl mt-2"
             style={{ color: '#00CEC9' }}>
            {t('screen.save')} ✨
          </p>
          <p className="font-body text-sm text-white/60 mt-3">
            {t('screen.saveRefund', { min: refundFlash })}
          </p>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="fixed z-[450] bottom-28 right-4 animate-bounce"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <button onClick={handleDismiss}
          className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #ba1a1a, #ef4444)', color: 'white' }}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>alarm</span>
          <span className="font-headline font-bold text-lg">{t('screen.timeUp')}</span>
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed z-[450] bottom-28 right-4"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Expanded panel */}
      {expanded && (
        <div className="mb-3 rounded-2xl p-4 shadow-xl w-56"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          {/* Reward label */}
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">
            {rewardName}
          </p>

          {/* Big time display */}
          <div className="text-center mb-4">
            <span className={`font-headline font-bold text-4xl ${isLow ? 'text-error' : 'text-primary'}`}
                  style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 0 }}>
              <AnimatedDigit d={mm[0]} size="lg" />
              <AnimatedDigit d={mm[1]} size="lg" />
              <span style={{ lineHeight: '2.5rem' }}>:</span>
              <AnimatedDigit d={ss[0]} size="lg" />
              <AnimatedDigit d={ss[1]} size="lg" />
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* Pause / Play */}
            <button onClick={togglePause}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-label font-bold text-sm active:scale-95 transition-all"
              style={{ background: paused ? 'rgba(5,150,105,0.1)' : 'rgba(18,67,70,0.06)', color: paused ? '#059669' : '#124346' }}>
              <span className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                {paused ? 'play_arrow' : 'pause'}
              </span>
              {paused ? t('screen.resume') : t('screen.pause')}
            </button>

            {/* Store remaining */}
            <button onClick={handleStore}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-label font-bold text-sm active:scale-95 transition-all"
              style={{ background: 'rgba(0,206,201,0.1)', color: '#00827e' }}>
              <span className="material-symbols-outlined text-lg">savings</span>
              {t('screen.save')}
            </button>
          </div>

          {/* Refund preview */}
          {remaining < totalSeconds && (
            <p className="text-center text-xs text-on-surface-variant mt-2 font-label">
              {t('screen.saveRefund', { min: Math.floor((remaining / totalSeconds) * cost) })}
            </p>
          )}
        </div>
      )}

      {/* Floating badge (always visible) */}
      <button onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full shadow-xl active:scale-95 transition-all"
        style={{
          background: isLow ? 'linear-gradient(135deg, #fef2f2, #ffffff)' : 'linear-gradient(135deg, #f0fdfa, #ffffff)',
          border: isLow ? '2px solid rgba(186,26,26,0.2)' : '2px solid rgba(0,206,201,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
        {/* Ring progress */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg width="44" height="44" className="absolute -rotate-90">
            <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
            <circle cx="22" cy="22" r={R} fill="none"
                    stroke={isLow ? '#ba1a1a' : '#00CEC9'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear" />
          </svg>
          <span className={`material-symbols-outlined text-lg relative z-10 ${isLow ? 'text-error' : 'text-primary'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}>
            {paused ? 'pause' : 'timer'}
          </span>
        </div>

        {/* Time text */}
        <span className={`font-headline font-bold text-lg ${isLow ? 'text-error' : 'text-primary'}`}
              style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 0 }}>
          <AnimatedDigit d={mm[0]} size="sm" />
          <AnimatedDigit d={mm[1]} size="sm" />
          <span style={{ lineHeight: '1.4rem' }}>:</span>
          <AnimatedDigit d={ss[0]} size="sm" />
          <AnimatedDigit d={ss[1]} size="sm" />
        </span>
      </button>
    </div>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import SFX from '../utils/sfx';
import { useTranslation } from '../i18n/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import CooldownButton from './CooldownButton';

/**
 * ColorMixGame (replaces PotionGame) — teaches color mixing.
 * Ronki shows a target color. Louis picks 2 primary colors to mix.
 * Red + Blue = Purple, Red + Yellow = Orange, Blue + Yellow = Green.
 * 8 rounds, then done. Score = correct matches.
 *
 * Keeps the same export name + props so App.jsx routing doesn't change.
 */

const PRIMARY_COLORS = [
  { id: 'red',    label: { de: 'Rot',  en: 'Red' },    hex: '#ef4444', emoji: '🔴' },
  { id: 'blue',   label: { de: 'Blau', en: 'Blue' },   hex: '#3b82f6', emoji: '🔵' },
  { id: 'yellow', label: { de: 'Gelb', en: 'Yellow' },  hex: '#eab308', emoji: '🟡' },
];

const MIX_RESULTS = {
  'blue+red':    { id: 'purple', label: { de: 'Lila',   en: 'Purple' },  hex: '#8b5cf6', emoji: '🟣' },
  'red+yellow':  { id: 'orange', label: { de: 'Orange', en: 'Orange' },  hex: '#f97316', emoji: '🟠' },
  'blue+yellow': { id: 'green',  label: { de: 'Grün',   en: 'Green' },   hex: '#22c55e', emoji: '🟢' },
  // Same-color mixes (wrong answers)
  'red+red':     { id: 'red',    label: { de: 'Rot',    en: 'Red' },     hex: '#ef4444', emoji: '🔴' },
  'blue+blue':   { id: 'blue',   label: { de: 'Blau',   en: 'Blue' },    hex: '#3b82f6', emoji: '🔵' },
  'yellow+yellow': { id: 'yellow', label: { de: 'Gelb', en: 'Yellow' },  hex: '#eab308', emoji: '🟡' },
};

function getMix(a, b) {
  const key = [a, b].sort().join('+');
  return MIX_RESULTS[key] || null;
}

const TARGETS = ['purple', 'orange', 'green', 'purple', 'green', 'orange', 'purple', 'orange'];
const TARGET_DATA = {
  purple: { label: { de: 'Lila',   en: 'Purple' },  hex: '#8b5cf6', emoji: '🟣', answer: ['blue', 'red'] },
  orange: { label: { de: 'Orange', en: 'Orange' },  hex: '#f97316', emoji: '🟠', answer: ['red', 'yellow'] },
  green:  { label: { de: 'Grün',   en: 'Green' },   hex: '#22c55e', emoji: '🟢', answer: ['blue', 'yellow'] },
};

const base = import.meta.env.BASE_URL;

export default function PotionGame({ onComplete }) {
  const { t, lang } = useTranslation();
  const haptic = useHaptic();
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null); // null | { correct, mix }
  const [finished, setFinished] = useState(false);
  const [animating, setAnimating] = useState(false);

  const target = TARGET_DATA[TARGETS[round]];
  const totalRounds = TARGETS.length;

  const handlePickColor = useCallback((colorId) => {
    if (animating || selected.length >= 2) return;
    SFX.play('pop');
    haptic('select');

    const next = [...selected, colorId];
    setSelected(next);

    if (next.length === 2) {
      setAnimating(true);
      const mix = getMix(next[0], next[1]);
      const correct = mix?.id === TARGETS[round];

      setTimeout(() => {
        setShowResult({ correct, mix });
        if (correct) {
          setScore(s => s + 1);
          SFX.play('coin');
          haptic('success');
        } else {
          SFX.play('tick');
        }

        // Auto-advance after showing result
        setTimeout(() => {
          if (round + 1 >= totalRounds) {
            setFinished(true);
          } else {
            setRound(r => r + 1);
            setSelected([]);
            setShowResult(null);
            setAnimating(false);
          }
        }, 1500);
      }, 600);
    }
  }, [selected, round, animating, totalRounds, haptic]);

  // Reward based on score
  const reward = { xp: 0, hp: Math.max(2, score * 2) };

  // ── Finished screen ──
  if (finished) {
    const perfect = score === totalRounds;
    return (
      <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#fff8f2' }}>
        <header className="flex items-center justify-between p-4"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">palette</span>
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
              {lang === 'de' ? 'Farbmixer' : 'Color Mix'}
            </h1>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-7xl mb-4">{perfect ? '🎨' : '🖌️'}</span>
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-2"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {perfect
              ? (lang === 'de' ? 'Perfekt! Alle richtig!' : 'Perfect! All correct!')
              : (lang === 'de' ? `${score} von ${totalRounds} richtig!` : `${score} of ${totalRounds} correct!`)}
          </h2>
          <p className="font-body text-on-surface-variant mb-6">
            {perfect
              ? (lang === 'de' ? 'Du bist ein echter Farbmeister! 🌈' : 'You\'re a true color master! 🌈')
              : (lang === 'de' ? 'Übung macht den Meister!' : 'Practice makes perfect!')}
          </p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
               style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
            <span className="material-symbols-outlined text-sm" style={{ color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-label font-bold text-sm" style={{ color: '#A83E2C' }}>+{reward.hp}</span>
          </div>

          <CooldownButton delay={3} onClick={() => onComplete(reward)} icon="redeem"
            className="w-full max-w-xs py-5 rounded-full font-headline font-bold text-xl text-white"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
            {t('game.potion.collect')}
          </CooldownButton>
        </main>
      </div>
    );
  }

  // ── Game screen ──
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
         style={{ background: '#fff8f2' }}>
      {/* Painted studio background */}
      <img src={base + 'art/games/colormix/bg-studio.webp'} alt=""
           className="absolute inset-0 w-full h-full object-cover pointer-events-none"
           style={{ opacity: 0.35 }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(255,248,242,0.7) 0%, rgba(255,248,242,0.85) 100%)' }} />

      {/* Header */}
      <header className="relative flex items-center justify-between p-4"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">
            {lang === 'de' ? 'Farbmixer' : 'Color Mix'}
          </h1>
        </div>
        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="bg-primary-container text-white px-5 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-transform">
          {lang === 'de' ? 'Beenden' : 'Quit'}
        </button>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6">
        {/* Round counter */}
        <div className="flex gap-1.5 mb-6">
          {TARGETS.map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all"
                 style={{
                   background: i < round ? '#34d399' : i === round ? '#fcd34d' : 'rgba(0,0,0,0.15)',
                   boxShadow: i === round ? '0 0 8px rgba(252,211,77,0.5)' : 'none',
                 }} />
          ))}
        </div>

        {/* Ronki painter + speech — uses the painted sprite */}
        <div className="flex items-end gap-3 mb-6">
          <img src={base + 'art/games/colormix/ronki-painter.webp'} alt="Ronki"
               className="w-20 h-20 object-contain select-none shrink-0"
               style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
          <div className="px-4 py-3 rounded-2xl flex items-center gap-2 max-w-xs"
               style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <p className="font-body text-sm text-on-surface">
              {lang === 'de'
                ? `Misch mir ${target.label.de}! ${target.emoji}`
                : `Mix me ${target.label.en}! ${target.emoji}`}
            </p>
          </div>
        </div>

        {/* Target color display */}
        <div className="w-28 h-28 rounded-3xl mb-8 flex items-center justify-center shadow-lg transition-all"
             style={{
               background: showResult ? (showResult.mix?.hex || '#ccc') : target.hex,
               boxShadow: `0 8px 32px ${showResult ? (showResult.mix?.hex || '#ccc') : target.hex}40`,
               border: `4px solid ${showResult ? (showResult.correct ? '#34d399' : '#ef4444') : 'rgba(255,255,255,0.5)'}`,
             }}>
          {showResult ? (
            <span className="material-symbols-outlined text-4xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              {showResult.correct ? 'check_circle' : 'close'}
            </span>
          ) : (
            <span className="text-4xl">{target.emoji}</span>
          )}
        </div>

        {/* Selected colors preview */}
        <div className="flex items-center gap-3 mb-8 h-12">
          {selected.map((colorId, i) => {
            const c = PRIMARY_COLORS.find(p => p.id === colorId);
            return (
              <div key={i} className="w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                   style={{ background: c?.hex, border: '3px solid white' }}>
                <span className="text-lg">{c?.emoji}</span>
              </div>
            );
          })}
          {selected.length === 1 && (
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">add</span>
          )}
          {selected.length === 0 && (
            <p className="font-label text-sm text-on-surface-variant">
              {lang === 'de' ? 'Wähle 2 Farben!' : 'Pick 2 colors!'}
            </p>
          )}
        </div>

        {/* Color buttons */}
        <div className="flex gap-5">
          {PRIMARY_COLORS.map(color => (
            <button key={color.id}
              onClick={() => handlePickColor(color.id)}
              disabled={animating}
              className="flex flex-col items-center gap-2 active:scale-90 transition-all"
              style={{ opacity: animating ? 0.5 : 1 }}>
              <div className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center transition-transform"
                   style={{
                     background: color.hex,
                     border: selected.includes(color.id) ? '4px solid #124346' : '4px solid white',
                     boxShadow: `0 6px 20px ${color.hex}50`,
                   }}>
                <span className="text-3xl">{color.emoji}</span>
              </div>
              <span className="font-label font-bold text-sm text-on-surface">
                {color.label[lang] || color.label.de}
              </span>
            </button>
          ))}
        </div>

        {/* Score */}
        <div className="mt-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-label font-bold text-sm text-on-surface-variant">{score}/{round}</span>
        </div>
      </main>
    </div>
  );
}

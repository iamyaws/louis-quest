import React, { useState, useEffect, useCallback } from 'react';
import SFX from '../utils/sfx';
import { useTranslation } from '../i18n/LanguageContext';

// Material icon pairs for the memory cards
const ALL_ICONS = [
  { icon: 'eco', color: '#059669' },
  { icon: 'sentiment_very_satisfied', color: '#6b3000' },
  { icon: 'pets', color: '#5300b7' },
  { icon: 'local_florist', color: '#f59e0b' },
  { icon: 'favorite', color: '#ba1a1a' },
  { icon: 'star', color: '#735c00' },
  { icon: 'auto_awesome', color: '#5300b7' },
  { icon: 'water_drop', color: '#0ea5e9' },
  { icon: 'music_note', color: '#6d28d9' },
  { icon: 'cruelty_free', color: '#059669' },
  { icon: 'sunny', color: '#f59e0b' },
  { icon: 'bolt', color: '#5300b7' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HS_KEY = 'ronki_memory_highscores';

function loadHighscores() {
  try {
    return JSON.parse(localStorage.getItem(HS_KEY) || '[]').slice(0, 5);
  } catch { return []; }
}

function saveHighscore(moves, locale) {
  const list = loadHighscores();
  const entry = { moves, date: new Date().toLocaleDateString(locale) };
  list.push(entry);
  list.sort((a, b) => a.moves - b.moves);
  const top5 = list.slice(0, 5);
  localStorage.setItem(HS_KEY, JSON.stringify(top5));
  return { list: top5, rank: top5.findIndex(e => e === entry) };
}

export default function MemoryGame({ onComplete }) {
  const { t, locale } = useTranslation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [highscores, setHighscores] = useState(loadHighscores);
  const [currentRank, setCurrentRank] = useState(-1);

  const pairs = 8;

  useEffect(() => {
    const picked = shuffle(ALL_ICONS).slice(0, pairs);
    setCards(shuffle([...picked, ...picked]).map((item, i) => ({ id: i, ...item })));
  }, []);

  const flipCard = useCallback((idx) => {
    if (busy || flipped.includes(idx) || matched.has(idx) || won) return;
    SFX.play('tap');

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setMoves(m => m + 1);
      setBusy(true);

      if (cards[next[0]].icon === cards[next[1]].icon) {
        setTimeout(() => {
          SFX.play('match');
          const newMatched = new Set([...matched, next[0], next[1]]);
          setMatched(newMatched);
          setFlipped([]);
          setBusy(false);
          if (newMatched.size === cards.length) {
            setTimeout(() => {
              SFX.play('celeb');
              const finalMoves = moves + 1; // moves hasn't updated yet in this closure
              const { list, rank } = saveHighscore(finalMoves, locale);
              setHighscores(list);
              setCurrentRank(rank);
              setWon(true);
            }, 400);
          }
        }, 400);
      } else {
        setTimeout(() => { setFlipped([]); setBusy(false); }, 1000);
      }
    }
  }, [flipped, matched, cards, busy, won]);

  const reward = {
    xp: 0, // XP only from quests
    hp: moves <= 10 ? 8 : moves <= 16 ? 5 : 3, // small bonus, max 3 games/day
  };

  const pairsFound = matched.size / 2;

  return (
    <div className="fixed inset-0 z-[400] bg-surface flex flex-col overflow-hidden">
      {/* Bodhi motif */}
      <div className="fixed top-20 -right-12 opacity-[0.04] pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
          <path d="M50 10C50 10 30 40 30 60C30 75 40 85 50 85C60 85 70 75 70 60C70 40 50 10 50 10Z" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="fixed -bottom-24 -left-12 opacity-[0.03] pointer-events-none rotate-45">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 10C50 10 30 40 30 60C30 75 40 85 50 85C60 85 70 75 70 60C70 40 50 10 50 10Z" />
        </svg>
      </div>

      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 py-4"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">egg</span>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">Ronki</h1>
        </div>
        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="bg-primary-container text-white px-6 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-transform">
          {t('game.memory.endGame')}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 mb-8 px-6 max-w-md mx-auto w-full flex flex-col items-center"
            style={{ marginTop: 'calc(6rem + env(safe-area-inset-top, 0px))' }}>
        {/* Score header */}
        <section className="w-full rounded-2xl p-4 mb-6 flex justify-center items-center gap-0"
                 style={{ background: 'rgba(249,243,235,0.6)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(30,27,23,0.04)' }}>
          <div className="flex items-center gap-2 px-5 py-1">
            <span className="material-symbols-outlined text-xl" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span className="font-headline font-bold text-lg text-on-surface">{t('game.memory.moves')}: {moves}</span>
          </div>
          <div className="h-6 w-px" style={{ background: 'rgba(204,195,215,0.3)' }} />
          <div className="flex items-center gap-2 px-5 py-1">
            <span className="material-symbols-outlined text-xl" style={{ color: '#735c00', fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-headline font-bold text-lg text-on-surface">{t('game.memory.pairs')}: {pairsFound}/{pairs}</span>
          </div>
        </section>

        {!won ? (
          <>
            {/* Memory grid */}
            <div className="grid grid-cols-4 gap-3 w-full" style={{ maxWidth: 360 }}>
              {cards.map((card, i) => {
                const isFlipped = flipped.includes(i);
                const isMatched = matched.has(i);
                const showFace = isFlipped || isMatched;

                return (
                  <button key={card.id} onClick={() => flipCard(i)}
                    className="aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{
                      background: isMatched
                        ? 'rgba(52,211,153,0.1)'
                        : showFace
                        ? '#ffffff'
                        : 'rgba(109,40,217,0.12)',
                      border: isMatched
                        ? '2px solid rgba(52,211,153,0.3)'
                        : showFace
                        ? '1px solid rgba(0,0,0,0.06)'
                        : '2px solid rgba(83,0,183,0.15)',
                      boxShadow: showFace ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      opacity: isMatched ? 0.6 : 1,
                      cursor: isMatched ? 'default' : 'pointer',
                    }}>
                    {showFace ? (
                      <span className="material-symbols-outlined text-4xl"
                            style={{ color: card.color, fontVariationSettings: "'FILL' 1" }}>
                        {card.icon}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary opacity-40">egg</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint card */}
            <div className="mt-8 p-5 rounded-2xl w-full flex items-center gap-4"
                 style={{ background: 'rgba(232,225,218,0.4)', backdropFilter: 'blur(8px)' }}>
              <div className="p-3 bg-secondary-container rounded-full shrink-0">
                <span className="material-symbols-outlined text-on-surface">lightbulb</span>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t('game.memory.hint')}
              </p>
            </div>
          </>
        ) : (
          /* Victory state */
          <div className="flex flex-col items-center text-center w-full">
            <div className="text-7xl mb-6 animate-bounce">&#x1f389;</div>
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-2">{t('game.memory.won')}</h2>
            <p className="font-body text-lg text-on-surface-variant mb-8">
              {t('game.memory.wonDesc', { moves })}
            </p>

            {moves <= 10 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                   style={{ background: 'rgba(52,211,153,0.1)', color: '#059669' }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label font-bold text-xs uppercase tracking-widest">{t('game.memory.masterBadge')}</span>
              </div>
            )}

            {/* Reward cards */}
            <div className="flex gap-4 mb-8">
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(83,0,183,0.06)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold text-primary">+{reward.xp}</p>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">XP</p>
              </div>
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(252,211,77,0.15)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold" style={{ color: '#735c00' }}>+{reward.hp}</p>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">HP</p>
              </div>
            </div>

            {/* Highscore table */}
            {highscores.length > 0 && (
              <div className="w-full max-w-xs mb-10 rounded-2xl overflow-hidden"
                   style={{ background: 'rgba(18,67,70,0.04)', border: '1px solid rgba(18,67,70,0.08)' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(18,67,70,0.06)' }}>
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <span className="font-headline font-bold text-sm text-primary">{t('game.memory.leaderboard')}</span>
                </div>
                {highscores.map((hs, i) => {
                  const isCurrentGame = i === currentRank;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={i}
                         className="flex items-center justify-between px-4 py-2.5"
                         style={{
                           background: isCurrentGame ? 'rgba(252,211,77,0.15)' : 'transparent',
                           borderBottom: i < highscores.length - 1 ? '1px solid rgba(18,67,70,0.04)' : 'none',
                         }}>
                      <div className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                        <span className={`font-label text-sm ${isCurrentGame ? 'font-bold text-primary' : 'text-on-surface'}`}>
                          {t('game.memory.movesUnit', { count: hs.moves })}
                        </span>
                        {isCurrentGame && (
                          <span className="font-label text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(252,211,77,0.3)', color: '#735c00' }}>
                            {t('game.memory.new')}
                          </span>
                        )}
                      </div>
                      <span className="font-label text-xs text-outline">{hs.date}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => onComplete(reward)}
              className="w-full max-w-xs py-5 rounded-full font-headline font-bold text-xl text-white active:scale-95 transition-all flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
              {t('game.memory.collect')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

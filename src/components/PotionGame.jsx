import React, { useState, useCallback } from 'react';
import SFX from '../utils/sfx';

const INGREDIENTS = [
  { id: 'bloom', name: 'Blüten', icon: 'local_florist', color: '#00b894' },
  { id: 'dew', name: 'Tautropfen', icon: 'opacity', color: '#60a5fa' },
  { id: 'root', name: 'Wurzeln', icon: 'yard', color: '#92400e' },
  { id: 'fern', name: 'Nachtfarn', icon: 'filter_vintage', color: '#a78bfa' },
];

const RECIPES = [
  { combo: ['bloom', 'dew'], name: 'Wachstums-Elixier', desc: 'Lässt deinen Ronki doppelt so schnell wachsen.', badge: '2x EP', badgeBg: '#fcd34d', badgeText: '#725b00', icon: 'eco', reward: { xp: 0, hp: 6 } },
  { combo: ['root', 'fern'], name: 'Stärke-Trank', desc: 'Erhöht Angriffskraft kurzzeitig für Bosskämpfe.', badge: '+20% DMG', badgeBg: '#fecaca', badgeText: '#991b1b', icon: 'bolt', reward: { xp: 0, hp: 5 } },
  { combo: ['bloom', 'fern'], name: 'Nacht-Nektar', desc: 'Gibt deinem Begleiter ruhige Träume und Energie.', badge: '+15 HP', badgeBg: '#d3bbff', badgeText: '#5300b7', icon: 'bedtime', reward: { xp: 0, hp: 8 } },
  { combo: ['dew', 'root'], name: 'Erd-Essenz', desc: 'Stärkt die Verbindung zur Natur und heilt sanft.', badge: 'Heilung', badgeBg: '#a7f3d0', badgeText: '#065f46', icon: 'spa', reward: { xp: 0, hp: 5 } },
  { combo: ['bloom', 'root'], name: 'Wurzel-Blüte', desc: 'Ein seltenes Gebräu aus Erde und Licht.', badge: 'Selten', badgeBg: '#fcd34d', badgeText: '#725b00', icon: 'auto_awesome', reward: { xp: 0, hp: 4 } },
  { combo: ['dew', 'fern'], name: 'Mond-Tropfen', desc: 'Glitzert im Mondlicht und gibt magische Kraft.', badge: 'Magie', badgeBg: '#d3bbff', badgeText: '#5300b7', icon: 'stars', reward: { xp: 0, hp: 5 } },
];

function findRecipe(selected) {
  const ids = selected.map(s => s.id).sort();
  return RECIPES.find(r => {
    const combo = [...r.combo].sort();
    return combo[0] === ids[0] && combo[1] === ids[1];
  });
}

export default function PotionGame({ onComplete }) {
  const [selected, setSelected] = useState([]);
  const [brewing, setBrewing] = useState(false);
  const [result, setResult] = useState(null);
  const [cauldronGlow, setCauldronGlow] = useState(false);

  const toggleIngredient = useCallback((ing) => {
    if (brewing || result) return;
    SFX.play('tap');
    setSelected(prev => {
      const has = prev.find(s => s.id === ing.id);
      if (has) return prev.filter(s => s.id !== ing.id);
      if (prev.length >= 2) return prev;
      const next = [...prev, ing];
      if (next.length === 2) setCauldronGlow(true);
      return next;
    });
  }, [brewing, result]);

  const brew = useCallback(() => {
    if (selected.length !== 2 || brewing) return;
    SFX.play('pop');
    setBrewing(true);
    setCauldronGlow(true);

    setTimeout(() => {
      const recipe = findRecipe(selected);
      SFX.play('celeb');
      setResult(recipe);
      setBrewing(false);
    }, 1800);
  }, [selected, brewing]);

  const reset = () => {
    setSelected([]);
    setResult(null);
    setCauldronGlow(false);
  };

  const reward = result?.reward || { xp: 0, hp: 0 };

  return (
    <div className="fixed inset-0 z-[400] bg-surface flex flex-col overflow-auto">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 py-4"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">storm</span>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">Kräutermischung</h1>
        </div>
        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="bg-primary-container text-white px-6 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-transform">
          Beenden
        </button>
      </header>

      <main className="flex-1 mb-8 px-6 max-w-md mx-auto w-full flex flex-col items-center"
            style={{ marginTop: 'calc(6rem + env(safe-area-inset-top, 0px))' }}>
        {!result ? (
          <>
            {/* Steam clouds */}
            <div className="flex gap-4 mb-4 opacity-70">
              {[0, 0.5, 1].map((delay, i) => (
                <span key={i} className="material-symbols-outlined text-primary"
                      style={{ fontSize: i === 1 ? '2.5rem' : '2rem', animation: `float-steam 3s ease-in-out ${delay}s infinite` }}>
                  cloud
                </span>
              ))}
            </div>

            {/* Cauldron */}
            <div className="relative w-full max-w-[240px] aspect-square flex flex-col items-center mb-4">
              <div className="w-full h-full rounded-b-[4rem] rounded-t-[1.5rem] relative shadow-2xl overflow-hidden transition-all duration-500"
                   style={{
                     background: brewing
                       ? 'linear-gradient(180deg, #fcd34d 0%, #6d28d9 100%)'
                       : cauldronGlow
                       ? 'linear-gradient(180deg, #8b5cf6 0%, #2e1065 100%)'
                       : 'linear-gradient(180deg, #6d28d9 0%, #2e1065 100%)',
                   }}>
                {/* Cauldron lip */}
                <div className="w-full h-[25%] absolute top-0 flex items-center justify-center border-b-2 border-black/10"
                     style={{ background: '#7c3aed' }} />
                {/* Background motif */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-primary-fixed" style={{ fontSize: 80 }}>potted_plant</span>
                </div>
                {/* Selected ingredients inside cauldron */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                  {selected.map(s => (
                    <span key={s.id} className="material-symbols-outlined text-white text-3xl animate-bounce"
                          style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  ))}
                </div>
                {/* Brewing animation */}
                {brewing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-6xl animate-spin">auto_awesome</span>
                  </div>
                )}
                {/* Feet */}
                <div className="absolute -bottom-2 left-1/4 w-4 h-6 bg-[#1a0b36] rounded-full" />
                <div className="absolute -bottom-2 right-1/4 w-4 h-6 bg-[#1a0b36] rounded-full" />
              </div>
              {/* Shadow */}
              <div className="w-48 h-6 bg-black/10 blur-xl rounded-full -mt-2" />
            </div>

            {/* CTA */}
            <div className="text-center mb-6">
              <h2 className="font-headline font-bold text-2xl text-primary mb-1">Mische die Zutaten!</h2>
              <p className="text-on-surface-variant font-medium text-sm">
                {selected.length === 0 ? 'Wähle 2 Zutaten aus dem Tablett.' : selected.length === 1 ? 'Noch 1 Zutat wählen...' : 'Bereit zum Brauen!'}
              </p>
            </div>

            {/* Ingredients tray */}
            <section className="w-full rounded-[2rem] p-6 mb-6" style={{ background: 'rgba(249,243,235,0.8)' }}>
              <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">inventory_2</span>
                Zutaten-Tablett
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {INGREDIENTS.map(ing => {
                  const isSelected = selected.find(s => s.id === ing.id);
                  return (
                    <button key={ing.id} onClick={() => toggleIngredient(ing)}
                      className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-all"
                           style={{
                             background: isSelected ? ing.color : '#ffffff',
                             border: isSelected ? `2px solid ${ing.color}` : '2px solid transparent',
                             boxShadow: isSelected ? `0 0 12px ${ing.color}40` : '0 1px 3px rgba(0,0,0,0.08)',
                           }}>
                        <span className="material-symbols-outlined" style={{ color: isSelected ? '#fff' : ing.color }}>
                          {ing.icon}
                        </span>
                      </div>
                      <span className="text-xs font-bold uppercase text-on-surface-variant">{ing.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex gap-4 w-full mb-6">
              <button onClick={reset}
                className="flex-1 bg-secondary-container text-on-secondary-container font-bold py-4 px-2 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ opacity: selected.length ? 1 : 0.4 }}>
                <span className="material-symbols-outlined">refresh</span>
                <span className="text-xs uppercase tracking-wider">Leeren</span>
              </button>
              <button onClick={brew}
                className="flex-1 bg-primary text-on-primary font-bold py-4 px-2 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                style={{ opacity: selected.length === 2 ? 1 : 0.4 }}>
                <span className="material-symbols-outlined">auto_fix_high</span>
                <span className="text-xs uppercase tracking-wider">Brauen</span>
              </button>
            </div>

            {/* Recipe hints */}
            <div className="w-full p-5 rounded-2xl flex items-center gap-4"
                 style={{ background: 'rgba(232,225,218,0.4)', backdropFilter: 'blur(8px)' }}>
              <div className="p-3 bg-secondary-container rounded-full shrink-0">
                <span className="material-symbols-outlined text-on-surface">lightbulb</span>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Jede Kombination ergibt einen anderen Trank. Probiere alle 6 Rezepte!
              </p>
            </div>
          </>
        ) : (
          /* Result screen */
          <div className="flex flex-col items-center text-center w-full">
            <div className="text-7xl mb-6 animate-bounce">&#x1f9ea;</div>
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-2">{result.name}</h2>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                 style={{ background: result.badgeBg, color: result.badgeText }}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{result.icon}</span>
              <span className="font-label font-bold text-xs uppercase tracking-widest">{result.badge}</span>
            </div>

            <p className="font-body text-lg text-on-surface-variant mb-8 max-w-xs">{result.desc}</p>

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

            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={reset}
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(232,225,218,0.6)', color: '#404849' }}>
                <span className="material-symbols-outlined">refresh</span>
                Nochmal
              </button>
              <button onClick={() => onComplete(reward)}
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                Einsammeln!
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Steam animation keyframes */}
      <style>{`
        @keyframes float-steam {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

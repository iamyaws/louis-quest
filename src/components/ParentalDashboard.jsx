import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';

const PIN_CODE = '1234'; // Default PIN

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊', '🤩'];
const MOOD_COLORS = ['#ba1a1a', '#f59e0b', '#7b7486', '#34d399', '#059669', '#fcd34d'];

export default function ParentalDashboard({ onClose }) {
  const { state } = useTask();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pinError, setPinError] = useState(false);

  if (!state) return null;

  // ── PIN Gate ──
  if (!authed) {
    const handleDigit = (d) => {
      const next = pin + d;
      setPinError(false);
      if (next.length === 4) {
        if (next === PIN_CODE) {
          setAuthed(true);
        } else {
          setPinError(true);
          setPin('');
        }
      } else {
        setPin(next);
      }
    };

    return (
      <div className="fixed inset-0 z-[300] bg-surface flex flex-col items-center justify-center px-6">
        <button onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>

        <span className="material-symbols-outlined text-5xl text-primary mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Eltern-Bereich</h2>
        <p className="font-body text-on-surface-variant text-sm mb-8">PIN eingeben um fortzufahren</p>

        {/* PIN dots */}
        <div className="flex gap-4 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-4 h-4 rounded-full transition-all"
                 style={{
                   background: i < pin.length ? '#5300b7' : 'rgba(0,0,0,0.1)',
                   boxShadow: i < pin.length ? '0 0 8px rgba(83,0,183,0.3)' : 'none',
                 }} />
          ))}
        </div>

        {pinError && (
          <p className="text-error font-label font-bold text-sm mb-4">Falscher PIN</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
          {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((d, i) => {
            if (d === null) return <div key={i} />;
            if (d === 'del') {
              return (
                <button key={i} onClick={() => setPin(p => p.slice(0, -1))}
                  className="h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <span className="material-symbols-outlined text-on-surface-variant">backspace</span>
                </button>
              );
            }
            return (
              <button key={i} onClick={() => handleDigit(String(d))}
                className="h-16 rounded-2xl font-headline font-bold text-2xl text-on-surface flex items-center justify-center active:scale-95 transition-all"
                style={{ background: 'rgba(0,0,0,0.03)' }}>
                {d}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-label text-on-surface-variant/50 mt-6">Standard-PIN: 1234</p>
      </div>
    );
  }

  // ── Dashboard ──
  const completedToday = (state.quests || []).filter(q => q.done && !q.sideQuest).length;
  const totalToday = (state.quests || []).filter(q => !q.sideQuest).length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const totalOrbs = state.orbs ? Object.values(state.orbs).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="fixed inset-0 z-[300] bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-6 pb-4"
              style={{ background: 'linear-gradient(to bottom, #fff8f2, transparent)' }}>
        <div>
          <h1 className="font-headline font-bold text-2xl text-on-surface">Eltern-Bereich</h1>
          <p className="font-label text-xs text-on-surface-variant">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      </header>

      <main className="px-6 pb-12 max-w-lg mx-auto flex flex-col gap-6">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completion rate */}
          <div className="p-5 rounded-2xl"
               style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)', boxShadow: '0 8px 24px rgba(83,0,183,0.2)' }}>
            <p className="font-label font-bold text-[10px] text-white/60 uppercase tracking-widest">Abschlussrate</p>
            <p className="font-headline font-bold text-4xl text-white mt-1">{completionPct}%</p>
            <p className="font-label text-xs text-white/70 mt-1">{completedToday}/{totalToday} heute</p>
          </div>
          {/* HP */}
          <div className="p-5 rounded-2xl"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Heldenpunkte</p>
            <p className="font-headline font-bold text-4xl text-primary mt-1">{state.hp || 0}</p>
            <p className="font-label text-xs text-on-surface-variant mt-1">Verfügbar</p>
          </div>
          {/* Streak */}
          <div className="p-5 rounded-2xl"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Tages-Streak</p>
            <p className="font-headline font-bold text-4xl text-on-surface mt-1">{state.sd || 0}</p>
            <p className="font-label text-xs text-on-surface-variant mt-1">Tage in Folge</p>
          </div>
          {/* Orbs */}
          <div className="p-5 rounded-2xl"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Wachstums-Orbs</p>
            <p className="font-headline font-bold text-4xl text-on-surface mt-1">{totalOrbs}</p>
            <p className="font-label text-xs text-on-surface-variant mt-1">Gesammelt</p>
          </div>
        </div>

        {/* ── Mood Today ── */}
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4">Stimmung heute</h3>
          <div className="flex items-center gap-3">
            {state.moodAM !== null ? (
              <>
                <span className="text-4xl">{MOOD_EMOJIS[state.moodAM]}</span>
                <div>
                  <p className="font-headline font-bold text-lg text-on-surface">
                    {['Traurig','Besorgt','Okay','Gut','Magisch','Müde'][state.moodAM]}
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">Eingetragen im Journal</p>
                </div>
              </>
            ) : (
              <p className="font-body text-on-surface-variant italic">Noch keine Stimmung erfasst</p>
            )}
          </div>
        </div>

        {/* ── Journal Entry ── */}
        {(state.journalMemory || (state.journalGratitude || []).length > 0) && (
          <div className="rounded-2xl p-5"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4">Journal-Eintrag heute</h3>
            {state.journalMemory && (
              <p className="font-body text-on-surface mb-3 p-3 rounded-xl italic" style={{ background: 'rgba(83,0,183,0.04)' }}>
                "{state.journalMemory}"
              </p>
            )}
            {(state.journalGratitude || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="font-label text-xs text-on-surface-variant">Dankbar für:</span>
                {state.journalGratitude.map(g => (
                  <span key={g} className="px-3 py-1 rounded-full font-label text-xs font-bold bg-primary text-white">{g}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Quest Overview ── */}
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4">Aufgaben heute</h3>
          <div className="flex flex-col gap-2">
            {(state.quests || []).filter(q => !q.sideQuest).map(q => (
              <div key={q.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                   style={{ background: q.done ? 'rgba(52,211,153,0.05)' : 'transparent' }}>
                <span className="material-symbols-outlined text-lg"
                      style={{ color: q.done ? '#059669' : '#ccc3d7', fontVariationSettings: q.done ? "'FILL' 1" : undefined }}>
                  {q.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="text-sm">{q.icon}</span>
                <span className={'font-body text-sm flex-1' + (q.done ? ' line-through text-on-surface-variant' : ' text-on-surface')}>
                  {q.name}
                </span>
                <span className="font-label text-xs text-on-surface-variant">{q.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Companion Status ── */}
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4">Begleiter-Pflege</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Gefüttert', done: state.catFed, icon: 'cookie' },
              { label: 'Gestreichelt', done: state.catPetted, icon: 'favorite' },
              { label: 'Gespielt', done: state.catPlayed, icon: 'sports_baseball' },
            ].map(c => (
              <div key={c.label} className="text-center p-3 rounded-xl"
                   style={{ background: c.done ? 'rgba(52,211,153,0.08)' : 'rgba(0,0,0,0.02)' }}>
                <span className="material-symbols-outlined text-xl mb-1 block"
                      style={{ color: c.done ? '#059669' : '#ccc3d7', fontVariationSettings: "'FILL' 1" }}>
                  {c.done ? 'check_circle' : c.icon}
                </span>
                <p className="font-label font-bold text-[10px] uppercase" style={{ color: c.done ? '#059669' : '#7b7486' }}>
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Settings ── */}
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4">Einstellungen</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-3 px-2"
                 style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">lock</span>
                <span className="font-body text-sm text-on-surface">PIN ändern</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
            </div>
            <div className="flex items-center justify-between py-3 px-2"
                 style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">bedtime</span>
                <span className="font-body text-sm text-on-surface">Schlafenszeit-Modus</span>
              </div>
              <span className="font-label text-xs text-on-surface-variant">Aus</span>
            </div>
            <div className="flex items-center justify-between py-3 px-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-lg">restart_alt</span>
                <span className="font-body text-sm text-on-surface">Fortschritt zurücksetzen</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
            </div>
          </div>
        </div>

        {/* ── Help ── */}
        <div className="rounded-2xl p-5"
             style={{ background: 'rgba(83,0,183,0.04)', border: '1px solid rgba(83,0,183,0.1)' }}>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary text-xl shrink-0">help</span>
            <div>
              <p className="font-label font-bold text-sm text-primary">Eltern-Guide</p>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Ronki motiviert durch tägliche Aufgaben, Begleiter-Pflege und Boss-Kämpfe.
                Heldenpunkte können im Laden gegen Belohnungen eingetauscht werden.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

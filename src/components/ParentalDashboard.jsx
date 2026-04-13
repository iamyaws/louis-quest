import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';

const PIN_CODE = '1234';
const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊', '🤩'];
const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function ParentalDashboard({ onClose }) {
  const { state, actions } = useTask();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState('overview'); // 'overview' | 'family'

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

  // ── Main Dashboard ──
  return (
    <div className="fixed inset-0 z-[300] bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-6 pb-2"
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

      {/* Tab Bar */}
      <div className="flex gap-2 px-6 py-3">
        {[
          { id: 'overview', label: 'Übersicht', icon: 'dashboard' },
          { id: 'family', label: 'Familie', icon: 'family_restroom' },
        ].map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-3 rounded-2xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: tab === t.id ? '#5300b7' : 'rgba(0,0,0,0.04)',
              color: tab === t.id ? '#ffffff' : '#7b7486',
            }}>
            <span className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: tab === t.id ? "'FILL' 1" : undefined }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      <main className="px-6 pb-12 max-w-lg mx-auto flex flex-col gap-6">
        {tab === 'overview' ? <OverviewTab state={state} /> : <FamilyTab state={state} actions={actions} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB (existing dashboard content)
// ═══════════════════════════════════════════════════════
function OverviewTab({ state }) {
  const completedToday = (state.quests || []).filter(q => q.done && !q.sideQuest).length;
  const totalToday = (state.quests || []).filter(q => !q.sideQuest).length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const totalOrbs = state.orbs ? Object.values(state.orbs).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl"
             style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)', boxShadow: '0 8px 24px rgba(83,0,183,0.2)' }}>
          <p className="font-label font-bold text-[10px] text-white/60 uppercase tracking-widest">Abschlussrate</p>
          <p className="font-headline font-bold text-4xl text-white mt-1">{completionPct}%</p>
          <p className="font-label text-xs text-white/70 mt-1">{completedToday}/{totalToday} heute</p>
        </div>
        <div className="p-5 rounded-2xl"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Heldenpunkte</p>
          <p className="font-headline font-bold text-4xl text-primary mt-1">{state.hp || 0}</p>
          <p className="font-label text-xs text-on-surface-variant mt-1">Verfügbar</p>
        </div>
        <div className="p-5 rounded-2xl"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Tages-Streak</p>
          <p className="font-headline font-bold text-4xl text-on-surface mt-1">{state.sd || 0}</p>
          <p className="font-label text-xs text-on-surface-variant mt-1">Tage in Folge</p>
        </div>
        <div className="p-5 rounded-2xl"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Wachstums-Orbs</p>
          <p className="font-headline font-bold text-4xl text-on-surface mt-1">{totalOrbs}</p>
          <p className="font-label text-xs text-on-surface-variant mt-1">Gesammelt</p>
        </div>
      </div>

      {/* Mood Today */}
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

      {/* Journal Entry */}
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

      {/* Quest Overview */}
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

      {/* Companion Status */}
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

      {/* Settings */}
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

      {/* Help */}
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
    </>
  );
}


// ═══════════════════════════════════════════════════════
// FAMILY TAB (new Family Config editor)
// ═══════════════════════════════════════════════════════
function FamilyTab({ state, actions }) {
  const config = state.familyConfig || DEFAULT_FAMILY_CONFIG;
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Sync draft when config changes externally
  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(config)));
  }, [config]);

  const update = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    actions.updateFamilyConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <>
      {/* ── Child Profile ── */}
      <SectionCard
        icon="face"
        title="Kind"
        subtitle={draft.childName || 'Name eingeben'}
        expanded={expandedSection === 'child'}
        onToggle={() => toggleSection('child')}
      >
        <div className="space-y-4">
          <FieldRow label="Name">
            <input
              type="text"
              value={draft.childName}
              onChange={e => update('childName', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              placeholder="Name des Kindes"
            />
          </FieldRow>
          <FieldRow label="Geburtstag">
            <input
              type="date"
              value={draft.childBirthday || ''}
              onChange={e => update('childBirthday', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </FieldRow>
          <FieldRow label="Pronomen">
            <div className="flex gap-2">
              {[
                { value: 'er', label: 'Er' },
                { value: 'sie', label: 'Sie' },
                { value: 'they', label: 'They' },
              ].map(p => (
                <button key={p.value}
                  onClick={() => update('childPronouns', p.value)}
                  className="flex-1 py-3 rounded-xl font-label font-bold text-sm transition-all"
                  style={{
                    background: draft.childPronouns === p.value ? '#5300b7' : 'rgba(0,0,0,0.04)',
                    color: draft.childPronouns === p.value ? '#ffffff' : '#7b7486',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Siblings ── */}
      <SectionCard
        icon="group"
        title="Geschwister"
        subtitle={draft.siblings.length === 0 ? 'Keine' : draft.siblings.map(s => s.name).join(', ')}
        expanded={expandedSection === 'siblings'}
        onToggle={() => toggleSection('siblings')}
      >
        <div className="space-y-4">
          {draft.siblings.map((sib, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex justify-between items-center">
                <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                  Geschwister {i + 1}
                </span>
                <button onClick={() => {
                  const next = [...draft.siblings];
                  next.splice(i, 1);
                  update('siblings', next);
                }} className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(186,26,26,0.08)' }}>
                  <span className="material-symbols-outlined text-error text-base">delete</span>
                </button>
              </div>
              <input
                type="text"
                value={sib.name}
                onChange={e => {
                  const next = [...draft.siblings];
                  next[i] = { ...next[i], name: e.target.value };
                  update('siblings', next);
                }}
                className="w-full h-11 px-4 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface focus:border-primary/40 outline-none transition-all text-sm"
                placeholder="Name"
              />
              <div className="flex gap-2">
                {['Bruder', 'Schwester', 'Geschwister'].map(rel => (
                  <button key={rel}
                    onClick={() => {
                      const next = [...draft.siblings];
                      next[i] = { ...next[i], relationship: rel };
                      update('siblings', next);
                    }}
                    className="flex-1 py-2 rounded-lg font-label text-xs font-bold transition-all"
                    style={{
                      background: sib.relationship === rel ? '#6d28d9' : 'rgba(0,0,0,0.04)',
                      color: sib.relationship === rel ? '#ffffff' : '#7b7486',
                    }}>
                    {rel}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['er', 'sie', 'they'].map(pr => (
                  <button key={pr}
                    onClick={() => {
                      const next = [...draft.siblings];
                      next[i] = { ...next[i], pronouns: pr };
                      update('siblings', next);
                    }}
                    className="flex-1 py-2 rounded-lg font-label text-xs font-bold transition-all"
                    style={{
                      background: sib.pronouns === pr ? '#5300b7' : 'rgba(0,0,0,0.04)',
                      color: sib.pronouns === pr ? '#ffffff' : '#7b7486',
                    }}>
                    {pr === 'er' ? 'Er' : pr === 'sie' ? 'Sie' : 'They'}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={sib.birthday || ''}
                onChange={e => {
                  const next = [...draft.siblings];
                  next[i] = { ...next[i], birthday: e.target.value };
                  update('siblings', next);
                }}
                className="w-full h-11 px-4 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
                placeholder="Geburtstag"
              />
            </div>
          ))}

          <button
            onClick={() => {
              const next = [...draft.siblings, { name: '', relationship: 'Geschwister', pronouns: 'er', birthday: '' }];
              update('siblings', next);
            }}
            className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'rgba(83,0,183,0.06)', color: '#5300b7', border: '1px dashed rgba(83,0,183,0.2)' }}>
            <span className="material-symbols-outlined text-lg">add</span>
            Geschwister hinzufügen
          </button>
        </div>
      </SectionCard>

      {/* ── Daily Habits ── */}
      <SectionCard
        icon="routine"
        title="Tägliche Gewohnheiten"
        subtitle={`${draft.dailyHabits.length} Gewohnheit${draft.dailyHabits.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'habits'}
        onToggle={() => toggleSection('habits')}
      >
        <div className="space-y-4">
          {draft.dailyHabits.map((habit, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    Gewohnheit {i + 1}
                  </span>
                </div>
                <button onClick={() => {
                  const next = [...draft.dailyHabits];
                  next.splice(i, 1);
                  update('dailyHabits', next);
                }} className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(186,26,26,0.08)' }}>
                  <span className="material-symbols-outlined text-error text-base">delete</span>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={habit.name}
                  onChange={e => {
                    const next = [...draft.dailyHabits];
                    next[i] = { ...next[i], name: e.target.value };
                    update('dailyHabits', next);
                  }}
                  className="flex-1 h-11 px-4 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
                  placeholder="Name der Gewohnheit"
                />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={habit.xp}
                  onChange={e => {
                    const next = [...draft.dailyHabits];
                    next[i] = { ...next[i], xp: parseInt(e.target.value) || 5 };
                    update('dailyHabits', next);
                  }}
                  className="w-20 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm text-center focus:border-primary/40 outline-none transition-all"
                />
                <span className="font-label text-xs text-on-surface-variant self-center">XP</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-label text-xs text-on-surface-variant">Icon:</span>
                <input
                  type="text"
                  value={habit.icon}
                  onChange={e => {
                    const next = [...draft.dailyHabits];
                    next[i] = { ...next[i], icon: e.target.value };
                    update('dailyHabits', next);
                  }}
                  className="w-16 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 text-center text-lg focus:border-primary/40 outline-none transition-all"
                />
                <span className="font-label text-xs text-on-surface-variant ml-2">Erledigt:</span>
                <input
                  type="text"
                  value={habit.iconDone}
                  onChange={e => {
                    const next = [...draft.dailyHabits];
                    next[i] = { ...next[i], iconDone: e.target.value };
                    update('dailyHabits', next);
                  }}
                  className="w-16 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 text-center text-lg focus:border-primary/40 outline-none transition-all"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              const id = 'habit_' + Date.now();
              const next = [...draft.dailyHabits, { id, name: '', icon: '⭐', iconDone: '✅', xp: 5 }];
              update('dailyHabits', next);
            }}
            className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'rgba(83,0,183,0.06)', color: '#5300b7', border: '1px dashed rgba(83,0,183,0.2)' }}>
            <span className="material-symbols-outlined text-lg">add</span>
            Gewohnheit hinzufügen
          </button>
        </div>
      </SectionCard>

      {/* ── Recurring Activities ── */}
      <SectionCard
        icon="event_repeat"
        title="Wiederkehrende Aktivitäten"
        subtitle={`${draft.recurringActivities.length} Aktivität${draft.recurringActivities.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'activities'}
        onToggle={() => toggleSection('activities')}
      >
        <div className="space-y-4">
          {draft.recurringActivities.map((act, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{act.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    {act.name || `Aktivität ${i + 1}`}
                  </span>
                </div>
                <button onClick={() => {
                  const next = [...draft.recurringActivities];
                  next.splice(i, 1);
                  update('recurringActivities', next);
                }} className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(186,26,26,0.08)' }}>
                  <span className="material-symbols-outlined text-error text-base">delete</span>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={act.name}
                  onChange={e => {
                    const next = [...draft.recurringActivities];
                    next[i] = { ...next[i], name: e.target.value };
                    update('recurringActivities', next);
                  }}
                  className="flex-1 h-11 px-4 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
                  placeholder="z.B. Fußball Training"
                />
                <input
                  type="text"
                  value={act.icon}
                  onChange={e => {
                    const next = [...draft.recurringActivities];
                    next[i] = { ...next[i], icon: e.target.value };
                    update('recurringActivities', next);
                  }}
                  className="w-16 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 text-center text-lg focus:border-primary/40 outline-none transition-all"
                />
              </div>
              {/* Day picker */}
              <div className="space-y-2">
                <span className="font-label text-xs text-on-surface-variant">Wochentage:</span>
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, dayIdx) => (
                    <button key={dayIdx}
                      onClick={() => {
                        const next = [...draft.recurringActivities];
                        const days = [...(next[i].days || [])];
                        const pos = days.indexOf(dayIdx);
                        if (pos >= 0) days.splice(pos, 1);
                        else days.push(dayIdx);
                        days.sort();
                        next[i] = { ...next[i], days };
                        update('recurringActivities', next);
                      }}
                      className="flex-1 py-2 rounded-lg font-label text-xs font-bold transition-all"
                      style={{
                        background: (act.days || []).includes(dayIdx) ? '#5300b7' : 'rgba(0,0,0,0.04)',
                        color: (act.days || []).includes(dayIdx) ? '#ffffff' : '#7b7486',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number" min="1" max="50"
                    value={act.xp}
                    onChange={e => {
                      const next = [...draft.recurringActivities];
                      next[i] = { ...next[i], xp: parseInt(e.target.value) || 5 };
                      update('recurringActivities', next);
                    }}
                    className="w-16 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm text-center focus:border-primary/40 outline-none transition-all"
                  />
                  <span className="font-label text-xs text-on-surface-variant">XP</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number" min="0" max="120"
                    value={act.minutes}
                    onChange={e => {
                      const next = [...draft.recurringActivities];
                      next[i] = { ...next[i], minutes: parseInt(e.target.value) || 0 };
                      update('recurringActivities', next);
                    }}
                    className="w-16 h-11 px-3 rounded-xl bg-white border border-outline-variant/30 font-body text-on-surface text-sm text-center focus:border-primary/40 outline-none transition-all"
                  />
                  <span className="font-label text-xs text-on-surface-variant">Min</span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              const id = 'activity_' + Date.now();
              const next = [...draft.recurringActivities, { id, name: '', icon: '🏃', days: [], xp: 10, minutes: 10 }];
              update('recurringActivities', next);
            }}
            className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'rgba(83,0,183,0.06)', color: '#5300b7', border: '1px dashed rgba(83,0,183,0.2)' }}>
            <span className="material-symbols-outlined text-lg">add</span>
            Aktivität hinzufügen
          </button>
        </div>
      </SectionCard>

      {/* ── Parent Message ── */}
      <SectionCard
        icon="mail"
        title="Eltern-Nachricht"
        subtitle={draft.parentMessage.title}
        expanded={expandedSection === 'message'}
        onToggle={() => toggleSection('message')}
      >
        <div className="space-y-4">
          <FieldRow label="Titel">
            <input
              type="text"
              value={draft.parentMessage.title}
              onChange={e => update('parentMessage.title', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
              placeholder="z.B. Botschaft für Louis"
            />
          </FieldRow>
          <FieldRow label="Nachricht">
            <textarea
              value={draft.parentMessage.body}
              onChange={e => update('parentMessage.body', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all resize-none"
              placeholder="Eine liebe Nachricht an dein Kind..."
            />
          </FieldRow>
          <FieldRow label="Unterschrift">
            <input
              type="text"
              value={draft.parentMessage.signature}
              onChange={e => update('parentMessage.signature', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
              placeholder="z.B. Mama & Papa lieben dich"
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Motto & Affirmation ── */}
      <SectionCard
        icon="auto_awesome"
        title="Motto & Affirmation"
        subtitle={draft.familyMotto.slice(0, 30) + (draft.familyMotto.length > 30 ? '...' : '')}
        expanded={expandedSection === 'motto'}
        onToggle={() => toggleSection('motto')}
      >
        <div className="space-y-4">
          <FieldRow label="Familien-Motto">
            <input
              type="text"
              value={draft.familyMotto}
              onChange={e => update('familyMotto', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
              placeholder="z.B. Zusammen sind wir stark"
            />
          </FieldRow>
          <FieldRow label="Tägliche Affirmation">
            <input
              type="text"
              value={draft.affirmation}
              onChange={e => update('affirmation', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
              placeholder="z.B. Ich bin geliebt, so wie ich bin."
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        className="w-full py-5 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all"
        style={{
          background: saved ? '#059669' : '#5300b7',
          color: '#ffffff',
          boxShadow: saved ? '0 4px 16px rgba(5,150,105,0.3)' : '0 4px 16px rgba(83,0,183,0.25)',
        }}>
        <span className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
          {saved ? 'check_circle' : 'save'}
        </span>
        {saved ? 'Gespeichert!' : 'Änderungen speichern'}
      </button>

      {/* Spacer for safe area */}
      <div className="h-4" />
    </>
  );
}


// ═══════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function SectionCard({ icon, title, subtitle, expanded, onToggle, children }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
         style={{
           background: '#ffffff',
           border: expanded ? '1.5px solid rgba(83,0,183,0.15)' : '1px solid rgba(0,0,0,0.06)',
           boxShadow: expanded ? '0 4px 20px rgba(83,0,183,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
         }}>
      {/* Header — always visible */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left active:bg-surface-container-low transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: expanded ? '#5300b7' : 'rgba(83,0,183,0.08)' }}>
          <span className="material-symbols-outlined text-lg"
                style={{
                  color: expanded ? '#ffffff' : '#5300b7',
                  fontVariationSettings: "'FILL' 1",
                }}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-on-surface">{title}</p>
          <p className="font-label text-xs text-on-surface-variant truncate">{subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-outline-variant text-lg transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {/* Content — collapsible */}
      {expanded && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs font-semibold text-primary/60 px-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

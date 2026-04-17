import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';
import { getCatStage } from '../utils/helpers';
import FeedbackModal from './FeedbackModal';

const PIN_CODE = '1234';
const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊', '🤩'];
const MOOD_LABELS = ['Traurig', 'Besorgt', 'Okay', 'Gut', 'Toll', 'Müde'];
const MOOD_COLORS = ['#ef4444', '#f97316', '#94a3b8', '#34d399', '#fcd34d', '#a78bfa'];
const DAY_LABELS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const base = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// ── Bodhi Leaf Decoration ──
function BodhiLeaf({ className = '' }) {
  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.15 }}>
        <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#124346" />
      </svg>
    </div>
  );
}

export default function ParentalDashboard({ onClose, currentView }) {
  const { state, actions } = useTask();
  const { t, lang, setLang } = useTranslation();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState('overview');
  const [showFeedback, setShowFeedback] = useState(false);
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;

  if (!state) return null;

  // ── PIN Gate ──
  if (!authed) {
    const handleDigit = (d) => {
      const next = pin + d;
      setPinError(false);
      if (next.length === 4) {
        if (next === (localStorage.getItem('ronki_pin') || PIN_CODE)) {
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
      <div className="fixed inset-0 z-[300] bg-surface flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background texture */}
        <img src={base + 'art/bg-parchment.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,248,241,0.6)' }} />

        <button onClick={onClose}
          aria-label="Schließen"
          className="fixed right-3 z-[300] w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}>
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">close</span>
        </button>

        <div className="relative z-10 flex flex-col items-center">
          {/* Lock icon with glow */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
               style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-1">Eltern-Bereich</h2>
          <p className="font-body text-on-surface-variant text-sm mb-8">PIN eingeben um fortzufahren</p>

          {/* PIN dots */}
          <div className="flex gap-4 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-4 h-4 rounded-full transition-all duration-300"
                   style={{
                     background: i < pin.length ? '#124346' : 'rgba(18,67,70,0.12)',
                     boxShadow: i < pin.length ? '0 0 8px rgba(18,67,70,0.25)' : 'none',
                     transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
                   }} />
            ))}
          </div>

          {pinError && (
            <p className="text-error font-label font-bold text-sm mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              Falscher PIN
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
            {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((d, i) => {
              if (d === null) return <div key={i} />;
              if (d === 'del') {
                return (
                  <button key={i} onClick={() => setPin(p => p.slice(0, -1))}
                    className="h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <span className="material-symbols-outlined text-on-surface-variant">backspace</span>
                  </button>
                );
              }
              return (
                <button key={i} onClick={() => handleDigit(String(d))}
                  className="h-16 rounded-2xl font-headline font-bold text-2xl text-on-surface flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                  {d}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-label text-on-surface-variant/40 mt-6 uppercase tracking-widest">Standard-PIN: 1234</p>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="fixed inset-0 z-[300] bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Background */}
      <img src={base + 'art/bg-warm-cream.png'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'rgba(255,248,241,0.5)' }} />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 pb-2"
              style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_person
            </span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl text-primary"
                style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>Eltern-Bereich</h1>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      </header>

      {/* Tab Bar */}
      <div className="relative z-10 flex gap-2 px-6 py-3">
        {[
          { id: 'overview', label: t('parent.tab.overview'), icon: 'dashboard' },
          { id: 'family', label: t('parent.tab.family'), icon: 'family_restroom' },
          { id: 'settings', label: t('parent.tab.settings'), icon: 'settings' },
        ].map(tb => (
          <button key={tb.id}
            onClick={() => setTab(tb.id)}
            className="flex-1 py-3 rounded-full font-label font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: tab === tb.id ? '#124346' : 'rgba(255,255,255,0.6)',
              backdropFilter: tab !== tb.id ? 'blur(12px)' : undefined,
              border: tab === tb.id ? 'none' : '1px solid rgba(255,255,255,0.5)',
              color: tab === tb.id ? '#ffffff' : '#707979',
              boxShadow: tab === tb.id ? '0 4px 16px rgba(18,67,70,0.2)' : 'none',
            }}>
            <span className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: tab === tb.id ? "'FILL' 1" : undefined }}>
              {tb.icon}
            </span>
            {tb.label}
          </button>
        ))}
      </div>

      <main className="relative z-10 px-6 pb-12 max-w-lg mx-auto flex flex-col gap-5">
        {tab === 'overview' && <OverviewTab state={state} lang={lang} />}
        {tab === 'family' && <FamilyTab state={state} actions={actions} lang={lang} />}
        {tab === 'settings' && <SettingsTab lang={lang} setLang={setLang} t={t} actions={actions} state={state} onOpenFeedback={() => setShowFeedback(true)} />}
        <BodhiLeaf />
      </main>

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          currentView={currentView}
          ronkiStage={getCatStage(state?.catEvo || 0)}
          catEvo={state?.catEvo || 0}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════
function OverviewTab({ state, lang }) {
  const completedToday = (state.quests || []).filter(q => q.done && !q.sideQuest).length;
  const totalToday = (state.quests || []).filter(q => !q.sideQuest).length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const totalOrbs = state.orbs ? Object.values(state.orbs).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Completion Rate — Hero Card */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)', boxShadow: '0 8px 24px rgba(18,67,70,0.25)' }}>
          <p className="font-label font-bold text-xs text-white/50 uppercase tracking-widest">Abschlussrate</p>
          <p className="font-headline font-bold text-4xl text-white mt-1">{completionPct}%</p>
          <p className="font-label text-xs text-white/60 mt-1">{completedToday}/{totalToday} heute</p>
        </div>
        {/* HP */}
        <StatCard label="Heldenpunkte" value={state.hp || 0} sub="Verfügbar" />
        {/* Orbs */}
        <StatCard label="Wachstums-Orbs" value={totalOrbs} sub="Gesammelt" />
      </div>

      {/* Mood — today + 7-day history */}
      <div className="mm-card p-5">
        <div className="flex items-center justify-between">
          <SectionLabel icon="mood" text="Stimmung (7 Tage)" />
          {state.moodAM !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xl">{MOOD_EMOJIS[state.moodAM]}</span>
              <span className="font-label font-bold text-sm" style={{ color: MOOD_COLORS[state.moodAM] }}>
                {MOOD_LABELS[state.moodAM]}
              </span>
            </div>
          )}
        </div>
        <MoodHistoryChart history={state.journalHistory} lang={lang} />
        {state.moodAM === null && (
          <p className="font-body text-on-surface-variant italic text-xs mt-2">Noch keine Stimmung heute erfasst</p>
        )}
      </div>

      {/* Journal Entry */}
      {(state.journalMemory || (state.journalGratitude || []).length > 0) && (
        <div className="mm-card p-5">
          <SectionLabel icon="auto_stories" text="Journal-Eintrag heute" />
          {state.journalMemory && (
            <p className="font-body text-on-surface mt-3 p-3 rounded-xl italic text-sm"
               style={{ background: 'rgba(18,67,70,0.04)', border: '1px solid rgba(18,67,70,0.06)' }}>
              &ldquo;{state.journalMemory}&rdquo;
            </p>
          )}
          {(state.journalGratitude || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest self-center">Dankbar für:</span>
              {state.journalGratitude.map(g => (
                <span key={g} className="px-3 py-1 rounded-full font-label text-xs font-bold"
                      style={{ background: '#fcd34d', color: '#725b00' }}>{g}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quest Overview */}
      <div className="mm-card p-5">
        <SectionLabel icon="checklist" text="Aufgaben heute" />
        <div className="flex flex-col gap-1 mt-3">
          {(state.quests || []).filter(q => !q.sideQuest).map(q => (
            <div key={q.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors"
                 style={{ background: q.done ? 'rgba(52,211,153,0.06)' : 'transparent' }}>
              <span className="material-symbols-outlined text-lg"
                    style={{ color: q.done ? '#059669' : '#c0c8c9', fontVariationSettings: q.done ? "'FILL' 1" : undefined }}>
                {q.done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="text-sm">{q.icon}</span>
              <span className={'font-body text-sm flex-1' + (q.done ? ' line-through text-on-surface-variant/60' : ' text-on-surface')}>
                {t('quest.' + q.id)}
              </span>
              <span className="font-label text-xs font-bold uppercase tracking-wider"
                    style={{ color: q.done ? '#059669' : '#707979' }}>{q.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Companion Status */}
      <div className="mm-card p-5">
        <SectionLabel icon="pets" text="Begleiter-Pflege" />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Gefüttert', done: state.catFed, icon: 'cookie' },
            { label: 'Gestreichelt', done: state.catPetted, icon: 'favorite' },
            { label: 'Gespielt', done: state.catPlayed, icon: 'sports_baseball' },
          ].map(c => (
            <div key={c.label} className="text-center p-3 rounded-xl"
                 style={{
                   background: c.done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.5)',
                   border: c.done ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(0,0,0,0.06)',
                 }}>
              <span className="material-symbols-outlined text-xl mb-1 block"
                    style={{ color: c.done ? '#059669' : '#c0c8c9', fontVariationSettings: "'FILL' 1" }}>
                {c.done ? 'check_circle' : c.icon}
              </span>
              <p className="font-label font-bold text-xs uppercase tracking-widest"
                 style={{ color: c.done ? '#059669' : '#707979' }}>
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="p-5 rounded-2xl"
           style={{ background: 'rgba(18,67,70,0.04)', border: '1.5px solid rgba(18,67,70,0.08)', borderRadius: '1.25rem' }}>
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary text-xl shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
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
// FAMILY TAB
// ═══════════════════════════════════════════════════════
function FamilyTab({ state, actions, lang }) {
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;
  const config = state.familyConfig || DEFAULT_FAMILY_CONFIG;
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(config)));
  }, [config]);

  const update = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
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

  const toggle = (id) => setExpandedSection(prev => prev === id ? null : id);

  return (
    <>
      {/* Child Profile */}
      <SectionCard icon="face" title="Kind" subtitle={draft.childName || 'Name eingeben'}
        expanded={expandedSection === 'child'} onToggle={() => toggle('child')} tint="#124346">
        <div className="space-y-4">
          <FieldRow label="Name">
            <TextInput value={draft.childName} onChange={v => update('childName', v)} placeholder="Name des Kindes" />
          </FieldRow>
          <FieldRow label="Geburtstag">
            <input type="date" value={draft.childBirthday || ''}
              onChange={e => update('childBirthday', e.target.value)}
              className="w-full h-12 px-4 rounded-xl font-body text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
          </FieldRow>
          <FieldRow label="Pronomen">
            <ToggleRow options={[{ v: 'er', l: 'Er' }, { v: 'sie', l: 'Sie' }, { v: 'they', l: 'They' }]}
              value={draft.childPronouns} onChange={v => update('childPronouns', v)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Siblings */}
      <SectionCard icon="group" title="Geschwister"
        subtitle={draft.siblings.length === 0 ? 'Keine' : draft.siblings.map(s => s.name).join(', ')}
        expanded={expandedSection === 'siblings'} onToggle={() => toggle('siblings')} tint="#004532">
        <div className="space-y-4">
          {draft.siblings.map((sib, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                  Geschwister {i + 1}
                </span>
                <DeleteBtn onClick={() => { const n = [...draft.siblings]; n.splice(i, 1); update('siblings', n); }} />
              </div>
              <TextInput value={sib.name} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], name: v }; update('siblings', n); }} placeholder="Name" />
              <ToggleRow options={[{ v: 'Bruder', l: 'Bruder' }, { v: 'Schwester', l: 'Schwester' }, { v: 'Geschwister', l: 'Geschwister' }]}
                value={sib.relationship} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], relationship: v }; update('siblings', n); }} />
              <ToggleRow options={[{ v: 'er', l: 'Er' }, { v: 'sie', l: 'Sie' }, { v: 'they', l: 'They' }]}
                value={sib.pronouns} onChange={v => { const n = [...draft.siblings]; n[i] = { ...n[i], pronouns: v }; update('siblings', n); }} />
              <input type="date" value={sib.birthday || ''}
                onChange={e => { const n = [...draft.siblings]; n[i] = { ...n[i], birthday: e.target.value }; update('siblings', n); }}
                className="w-full h-11 px-4 rounded-xl font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
            </div>
          ))}
          <AddBtn label="Geschwister hinzufügen" onClick={() => {
            update('siblings', [...draft.siblings, { name: '', relationship: 'Geschwister', pronouns: 'er', birthday: '' }]);
          }} />
        </div>
      </SectionCard>

      {/* Daily Habits */}
      <SectionCard icon="routine" title="Tägliche Gewohnheiten"
        subtitle={`${draft.dailyHabits.length} Gewohnheit${draft.dailyHabits.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'habits'} onToggle={() => toggle('habits')} tint="#735c00">
        <div className="space-y-4">
          {draft.dailyHabits.map((habit, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{habit.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    Gewohnheit {i + 1}
                  </span>
                </div>
                <DeleteBtn onClick={() => { const n = [...draft.dailyHabits]; n.splice(i, 1); update('dailyHabits', n); }} />
              </div>
              <div className="flex gap-2">
                <TextInput value={habit.name} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], name: v }; update('dailyHabits', n); }} placeholder="Name" className="flex-1" />
                <div className="flex items-center gap-1">
                  <input type="number" min="1" max="50" value={habit.xp}
                    onChange={e => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], xp: parseInt(e.target.value) || 5 }; update('dailyHabits', n); }}
                    className="w-16 h-12 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">XP</span>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="font-label text-xs text-outline uppercase tracking-widest">Icon:</span>
                <EmojiInput value={habit.icon} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], icon: v }; update('dailyHabits', n); }} />
                <span className="font-label text-xs text-outline uppercase tracking-widest ml-2">Erledigt:</span>
                <EmojiInput value={habit.iconDone} onChange={v => { const n = [...draft.dailyHabits]; n[i] = { ...n[i], iconDone: v }; update('dailyHabits', n); }} />
              </div>
            </div>
          ))}
          <AddBtn label="Gewohnheit hinzufügen" onClick={() => {
            update('dailyHabits', [...draft.dailyHabits, { id: 'habit_' + Date.now(), name: '', icon: '⭐', iconDone: '✅', xp: 5 }]);
          }} />
        </div>
      </SectionCard>

      {/* Recurring Activities */}
      <SectionCard icon="event_repeat" title="Wiederkehrende Aktivitäten"
        subtitle={`${draft.recurringActivities.length} Aktivität${draft.recurringActivities.length !== 1 ? 'en' : ''}`}
        expanded={expandedSection === 'activities'} onToggle={() => toggle('activities')} tint="#124346">
        <div className="space-y-4">
          {draft.recurringActivities.map((act, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{act.icon}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                    {act.name || `Aktivität ${i + 1}`}
                  </span>
                </div>
                <DeleteBtn onClick={() => { const n = [...draft.recurringActivities]; n.splice(i, 1); update('recurringActivities', n); }} />
              </div>
              <div className="flex gap-2">
                <TextInput value={act.name} onChange={v => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], name: v }; update('recurringActivities', n); }} placeholder="z.B. Fußball Training" className="flex-1" />
                <EmojiInput value={act.icon} onChange={v => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], icon: v }; update('recurringActivities', n); }} />
              </div>
              {/* Day picker */}
              <div className="space-y-1.5">
                <span className="font-label text-xs text-outline uppercase tracking-widest">Wochentage:</span>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, dayIdx) => (
                    <button key={dayIdx}
                      onClick={() => {
                        const n = [...draft.recurringActivities];
                        const days = [...(n[i].days || [])];
                        const pos = days.indexOf(dayIdx);
                        if (pos >= 0) days.splice(pos, 1); else days.push(dayIdx);
                        days.sort();
                        n[i] = { ...n[i], days };
                        update('recurringActivities', n);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-label text-xs font-bold transition-all duration-200"
                      style={{
                        background: (act.days || []).includes(dayIdx) ? '#124346' : 'rgba(255,255,255,0.5)',
                        color: (act.days || []).includes(dayIdx) ? '#ffffff' : '#707979',
                        border: (act.days || []).includes(dayIdx) ? 'none' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: (act.days || []).includes(dayIdx) ? '0 2px 8px rgba(18,67,70,0.2)' : 'none',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <input type="number" min="1" max="50" value={act.xp}
                    onChange={e => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], xp: parseInt(e.target.value) || 5 }; update('recurringActivities', n); }}
                    className="w-16 h-11 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="number" min="0" max="120" value={act.minutes}
                    onChange={e => { const n = [...draft.recurringActivities]; n[i] = { ...n[i], minutes: parseInt(e.target.value) || 0 }; update('recurringActivities', n); }}
                    className="w-16 h-11 px-2 rounded-xl font-body text-on-surface text-sm text-center outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
                  <span className="font-label text-xs text-outline uppercase tracking-widest">Min</span>
                </div>
              </div>
            </div>
          ))}
          <AddBtn label="Aktivität hinzufügen" onClick={() => {
            update('recurringActivities', [...draft.recurringActivities, { id: 'activity_' + Date.now(), name: '', icon: '🏃', days: [], xp: 10, minutes: 10 }]);
          }} />
        </div>
      </SectionCard>

      {/* Parent Message */}
      <SectionCard icon="mail" title="Eltern-Nachricht" subtitle={draft.parentMessage.title}
        expanded={expandedSection === 'message'} onToggle={() => toggle('message')} tint="#735c00">
        <div className="space-y-4">
          <FieldRow label="Titel">
            <TextInput value={draft.parentMessage.title} onChange={v => update('parentMessage.title', v)} placeholder="z.B. Botschaft für Louis" />
          </FieldRow>
          <FieldRow label="Nachricht">
            <textarea value={draft.parentMessage.body}
              onChange={e => update('parentMessage.body', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl font-body text-on-surface text-sm focus:border-primary/40 outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }}
              placeholder="Eine liebe Nachricht an dein Kind..." />
          </FieldRow>
          <FieldRow label="Unterschrift">
            <TextInput value={draft.parentMessage.signature} onChange={v => update('parentMessage.signature', v)} placeholder="z.B. Mama & Papa lieben dich" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Motto & Affirmation */}
      <SectionCard icon="auto_awesome" title="Motto & Affirmation"
        subtitle={draft.familyMotto.slice(0, 30) + (draft.familyMotto.length > 30 ? '...' : '')}
        expanded={expandedSection === 'motto'} onToggle={() => toggle('motto')} tint="#124346">
        <div className="space-y-4">
          <FieldRow label="Familien-Motto">
            <TextInput value={draft.familyMotto} onChange={v => update('familyMotto', v)} placeholder="z.B. Zusammen sind wir stark" />
          </FieldRow>
          <FieldRow label="Tägliche Affirmation">
            <TextInput value={draft.affirmation} onChange={v => update('affirmation', v)} placeholder="z.B. Ich bin geliebt, so wie ich bin." />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Save Button — Golden CTA */}
      <button onClick={handleSave}
        className="w-full py-4 rounded-full font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all duration-200"
        style={{
          background: saved ? '#34d399' : '#fcd34d',
          color: saved ? '#ffffff' : '#725b00',
          boxShadow: saved ? '0 8px 24px rgba(52,211,153,0.3)' : '0 8px 24px rgba(252,211,77,0.4)',
        }}>
        <span className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
          {saved ? 'check_circle' : 'save'}
        </span>
        {saved ? 'Gespeichert!' : 'Änderungen speichern'}
      </button>

      <div className="h-2" />
    </>
  );
}


// ═══════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

// ── 7-day mood bar chart ──
function MoodHistoryChart({ history, lang }) {
  const DAY_LABELS = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_DE;
  // Build last-7-days array
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const entry = (history || []).find(e => e.date === iso);
    return {
      label: DAY_LABELS[d.getDay()],
      mood: entry?.mood ?? null,
      iso,
    };
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-end gap-1.5 mt-4 h-20">
      {days.map((day, i) => {
        const hasMood = day.mood !== null;
        const barPct = hasMood ? (day.mood + 1) / 6 : 0;
        const color = hasMood ? MOOD_COLORS[day.mood] : 'rgba(18,67,70,0.08)';
        const isToday = day.iso === today;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {hasMood && (
              <span className="text-xs" title={MOOD_LABELS[day.mood]}>
                {MOOD_EMOJIS[day.mood]}
              </span>
            )}
            {!hasMood && <div className="h-5" />}
            <div className="w-full rounded-t-md transition-all duration-500"
                 style={{
                   height: hasMood ? `${Math.max(barPct * 44, 8)}px` : '4px',
                   background: color,
                   opacity: hasMood ? 1 : 0.4,
                   boxShadow: hasMood ? `0 2px 8px ${color}60` : 'none',
                 }} />
            <span className="font-label text-xs uppercase tracking-widest"
                  style={{ color: isToday ? '#124346' : 'rgba(18,67,70,0.4)', fontWeight: isToday ? 700 : 500, fontSize: '0.6rem' }}>
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline">{text}</h3>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="mm-card p-5">
      <p className="font-label font-bold text-xs text-outline uppercase tracking-widest">{label}</p>
      <p className="font-headline font-bold text-3xl text-on-surface mt-1">{value}</p>
      <p className="font-label text-xs text-on-surface-variant mt-1">{sub}</p>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, expanded, onToggle, children, tint = '#124346' }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
         style={{
           background: '#ffffff',
           border: expanded ? `1.5px solid ${tint}20` : '1.5px solid rgba(0,0,0,0.12)',
           boxShadow: expanded
             ? `0 4px 20px ${tint}12, 0 2px 6px rgba(0,0,0,0.06)`
             : '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
           borderRadius: '1.25rem',
         }}>
      {/* Header */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
             style={{
               background: expanded ? tint : `${tint}12`,
             }}>
          <span className="material-symbols-outlined text-lg transition-colors duration-300"
                style={{
                  color: expanded ? '#ffffff' : tint,
                  fontVariationSettings: "'FILL' 1",
                }}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-on-surface">{title}</p>
          <p className="font-label text-xs text-on-surface-variant truncate uppercase tracking-wider">{subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/40 text-lg transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(18,67,70,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className={`w-full h-12 px-4 rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary/10 outline-none transition-all ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }}
      placeholder={placeholder} />
  );
}

function EmojiInput({ value, onChange }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-14 h-12 px-2 rounded-xl text-center text-lg outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
  );
}

function ToggleRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className="flex-1 py-3 rounded-xl font-label text-xs font-bold transition-all duration-200"
          style={{
            background: value === o.v ? '#124346' : 'rgba(255,255,255,0.5)',
            color: value === o.v ? '#ffffff' : '#707979',
            border: value === o.v ? 'none' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: value === o.v ? '0 2px 8px rgba(18,67,70,0.2)' : 'none',
          }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
      style={{ background: 'rgba(186,26,26,0.06)', border: '1px solid rgba(186,26,26,0.1)' }}>
      <span className="material-symbols-outlined text-error text-sm">delete</span>
    </button>
  );
}

function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full py-3.5 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ background: 'rgba(18,67,70,0.04)', color: '#124346', border: '1.5px dashed rgba(18,67,70,0.15)' }}>
      <span className="material-symbols-outlined text-lg">add</span>
      {label}
    </button>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs font-bold text-on-surface-variant/60 px-1 block uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS TAB (Language Toggle)
// ═══════════════════════════════════════════════════════

function SettingsTab({ lang, setLang, t, actions, state, onOpenFeedback }) {
  const [pinPhase, setPinPhase] = useState(null); // null | 'current' | 'new' | 'confirm'
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState(null); // { ok: bool, text: string }
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const storedPin = () => localStorage.getItem('ronki_pin') || PIN_CODE;

  const handlePinDigit = (d) => {
    const next = pinInput + d;
    setPinMsg(null);
    if (next.length < 4) { setPinInput(next); return; }
    // 4th digit — evaluate
    if (pinPhase === 'current') {
      if (next === storedPin()) {
        setPinPhase('new'); setPinInput('');
      } else {
        setPinMsg({ ok: false, text: 'Falscher PIN' }); setPinInput('');
      }
    } else if (pinPhase === 'new') {
      setNewPin(next); setPinPhase('confirm'); setPinInput('');
    } else if (pinPhase === 'confirm') {
      if (next === newPin) {
        localStorage.setItem('ronki_pin', next);
        setPinMsg({ ok: true, text: 'PIN geändert!' });
        setPinPhase(null); setPinInput(''); setNewPin('');
      } else {
        setPinMsg({ ok: false, text: 'Stimmt nicht überein' }); setPinInput(''); setPinPhase('new');
      }
    }
  };

  const handleResetDay = () => {
    actions?.patchState?.({
      quests: (state?.quests || []).map(q => ({ ...q, done: false })),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      waterIntake: 0,
      moodAM: null,
      moodPM: null,
    });
    setResetDone(true);
    setTimeout(() => { setResetDone(false); setShowResetConfirm(false); }, 1500);
  };

  const pinPrompts = { current: 'Aktuellen PIN eingeben', new: 'Neuen PIN wählen (4 Ziffern)', confirm: 'PIN wiederholen' };

  return (
    <>
      {/* Language */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          {t('parent.lang.title')}
        </p>
        <div className="flex gap-3">
          {[{ code: 'de', flag: '🇩🇪', label: 'Deutsch' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map(opt => (
            <button key={opt.code} onClick={() => setLang(opt.code)}
              className="flex-1 py-3.5 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{
                background: lang === opt.code ? '#124346' : 'rgba(18,67,70,0.05)',
                color: lang === opt.code ? '#ffffff' : '#124346',
                border: lang === opt.code ? '2px solid #124346' : '2px solid rgba(18,67,70,0.1)',
                boxShadow: lang === opt.code ? '0 4px 16px rgba(18,67,70,0.2)' : 'none',
              }}>
              <span className="text-xl">{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* PIN Change */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(18,67,70,0.08)' }}>
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">PIN ändern</p>
        </div>

        {pinPhase === null ? (
          <>
            {pinMsg && (
              <p className="font-label text-sm font-bold mb-3 flex items-center gap-1.5"
                 style={{ color: pinMsg.ok ? '#059669' : '#ba1a1a' }}>
                <span className="material-symbols-outlined text-sm">{pinMsg.ok ? 'check_circle' : 'error'}</span>
                {pinMsg.text}
              </p>
            )}
            <button onClick={() => { setPinPhase('current'); setPinInput(''); setPinMsg(null); }}
              className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'rgba(18,67,70,0.06)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.12)' }}>
              <span className="material-symbols-outlined text-base">key</span>
              PIN jetzt ändern
            </button>
          </>
        ) : (
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              {pinPrompts[pinPhase]}
            </p>
            {/* PIN dots */}
            <div className="flex gap-3 mb-4 justify-center">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-3.5 h-3.5 rounded-full transition-all duration-200"
                     style={{ background: i < pinInput.length ? '#124346' : 'rgba(18,67,70,0.12)', transform: i < pinInput.length ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
            {pinMsg && <p className="font-label text-xs text-error mb-2 text-center">{pinMsg.text}</p>}
            {/* Mini numpad */}
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((d, i) => {
                if (d === null) return <div key={i} />;
                if (d === 'del') return (
                  <button key={i} onClick={() => setPinInput(p => p.slice(0, -1))}
                    className="h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.08)' }}>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">backspace</span>
                  </button>
                );
                return (
                  <button key={i} onClick={() => handlePinDigit(String(d))}
                    className="h-12 rounded-xl font-headline font-bold text-xl text-on-surface flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.08)' }}>
                    {d}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setPinPhase(null); setPinInput(''); setNewPin(''); }}
              className="w-full mt-3 py-2 font-label text-xs text-on-surface-variant active:opacity-70">
              Abbrechen
            </button>
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(252,211,77,0.18)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#a16207', fontVariationSettings: "'FILL' 1" }}>forum</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Feedback an Marc</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Bug, Idee oder was komisch war? Schreib's auf — kommt direkt zu mir.
        </p>
        <button onClick={onOpenFeedback}
          className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 14px rgba(252,211,77,0.35)' }}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          Feedback senden
        </button>
      </div>

      {/* Reset */}
      <div className="rounded-2xl p-5"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(186,26,26,0.06)' }}>
            <span className="material-symbols-outlined text-error text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restart_alt</span>
          </div>
          <p className="font-label font-bold text-sm text-on-surface">Tag zurücksetzen</p>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
          Setzt alle heutigen Aufgaben zurück, ohne HP oder Gesamtfortschritt zu löschen.
        </p>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: 'rgba(186,26,26,0.06)', color: '#ba1a1a', border: '1.5px solid rgba(186,26,26,0.12)' }}>
            Tag zurücksetzen
          </button>
        ) : resetDone ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <span className="material-symbols-outlined text-lg" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label font-bold text-sm" style={{ color: '#059669' }}>Zurückgesetzt!</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.1)' }}>
              Abbrechen
            </button>
            <button onClick={handleResetDay}
              className="flex-1 py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#ba1a1a', color: 'white' }}>
              Ja, zurücksetzen
            </button>
          </div>
        )}
      </div>
    </>
  );
}

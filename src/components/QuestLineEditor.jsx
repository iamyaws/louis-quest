import React, { useState, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { QUEST_LINE_TEMPLATES, TEMPLATE_BY_ID } from '../data/questLineTemplates';

// ── Helper: generate a stable quest-line ID ──
function genQuestLineId() {
  return `ql_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Helper: add N days to a date, return ISO YYYY-MM-DD ──
function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Main editor ──
export default function QuestLineEditor() {
  const { state, actions } = useTask();
  const { lang } = useTranslation();

  // Modes: 'list' | 'picking-template' | 'editing-form'
  const [mode, setMode] = useState('list');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const parentQuestLines = state?.parentQuestLines || [];
  const activeLines = parentQuestLines.filter(q => !q.completed && !q.archived);
  const completedLines = parentQuestLines.filter(q => q.completed && !q.archived);
  const archivedLines = parentQuestLines.filter(q => q.archived);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setEditingId(null);
    setMode('picking-template');
  };

  const handlePickTemplate = (id) => {
    setSelectedTemplate(id);
    setEditingId(null);
    setMode('editing-form');
  };

  const handleEdit = (ql) => {
    setSelectedTemplate(ql.templateId);
    setEditingId(ql.id);
    setMode('editing-form');
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
    setEditingId(null);
    setMode('list');
  };

  if (mode === 'picking-template') {
    return (
      <TemplatePicker
        lang={lang}
        onPick={handlePickTemplate}
        onBack={handleBackToList}
      />
    );
  }

  if (mode === 'editing-form' && selectedTemplate) {
    const editingQL = editingId ? parentQuestLines.find(q => q.id === editingId) : null;
    return (
      <FormMode
        lang={lang}
        templateId={selectedTemplate}
        editingQL={editingQL}
        onSave={handleBackToList}
        onCancel={handleBackToList}
        actions={actions}
      />
    );
  }

  // ── Default: list mode ──
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-headline font-bold text-xl text-on-surface">Quest-Linien</h2>
        <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">
          Erstelle persönliche Abenteuer für Louis. Referate, Geburtstage, neue Fertigkeiten.
        </p>
      </div>

      {/* Empty state */}
      {parentQuestLines.length === 0 && (
        <div className="rounded-2xl p-8 text-center"
             style={{ background: 'rgba(252,211,77,0.12)', border: '1.5px dashed rgba(252,211,77,0.4)' }}>
          <div className="text-5xl mb-3">✨</div>
          <p className="font-headline font-bold text-base text-on-surface mb-1">Noch keine Quest-Linien.</p>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Erstelle die erste. Ein Meerschweinchen-Referat, Omas Geburtstag, Schwimmen lernen.
          </p>
        </div>
      )}

      {/* Active */}
      {activeLines.length > 0 && (
        <Section title="Aktiv" count={activeLines.length}>
          <div className="space-y-3">
            {activeLines.map(ql => (
              <ActiveQuestLineCard
                key={ql.id}
                ql={ql}
                onEdit={() => handleEdit(ql)}
                onArchive={() => actions.archiveQuestLine(ql.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Primary CTA */}
      <button onClick={handleCreateNew}
        className="w-full py-4 rounded-full font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all duration-200"
        style={{
          background: '#fcd34d',
          color: '#725b00',
          boxShadow: '0 8px 24px rgba(252,211,77,0.4)',
        }}>
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          add_circle
        </span>
        Neue Quest-Linie
      </button>

      {/* Completed */}
      {completedLines.length > 0 && (
        <CollapsibleSection title="Abgeschlossen" icon="task_alt" count={completedLines.length}>
          <div className="space-y-3">
            {completedLines.map(ql => (
              <ReadOnlyQuestLineCard key={ql.id} ql={ql} tint="#059669" />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Archived */}
      {archivedLines.length > 0 && (
        <CollapsibleSection title="Archiviert" icon="archive" count={archivedLines.length}>
          <div className="space-y-3">
            {archivedLines.map(ql => (
              <ReadOnlyQuestLineCard
                key={ql.id}
                ql={ql}
                tint="#707979"
                restoreAction={() => actions.updateQuestLine(ql.id, { archived: false })}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TEMPLATE PICKER
// ═══════════════════════════════════════════════════════
function TemplatePicker({ lang, onPick, onBack }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-on-surface-variant font-label text-sm mb-3 active:opacity-60">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Zurück
        </button>
        <h2 className="font-headline font-bold text-xl text-on-surface">Vorlage wählen</h2>
        <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">
          Welche Art Abenteuer passt zu eurem Projekt?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {QUEST_LINE_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onPick(t.id)}
            className="text-left rounded-2xl p-5 flex items-start gap-4 transition-all active:scale-[0.98]"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderRadius: '1.25rem',
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(18,67,70,0.06)' }}>
              <span className="text-3xl">{t.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-base text-on-surface">{t.title[lang]}</h3>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                {t.description[lang]}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-lg shrink-0 mt-3">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FORM MODE. Renders template-specific form + preview.
// ═══════════════════════════════════════════════════════
function FormMode({ lang, templateId, editingQL, onSave, onCancel, actions }) {
  const template = TEMPLATE_BY_ID.get(templateId);

  // Extract existing milestones from editingQL.days for skill template
  const existingMilestones = editingQL && templateId === 'skill'
    ? (editingQL.days || []).map(d => d.title)
    : [];
  // Extract prep items from event template days (titles before the 3-day countdown tail)
  const existingPrepItems = editingQL && templateId === 'event'
    ? (editingQL.days || []).slice(0, Math.max(0, (editingQL.days || []).length - 3))
        .map(d => d.title)
        .filter(t => t && t !== 'Vorbereiten')
    : [];

  const [title, setTitle] = useState(editingQL?.title || '');
  const [subtitle, setSubtitle] = useState(editingQL?.subtitle || '');
  // Event template REQUIRES a target date so we prefill to +7 days.
  // Learn template marks it "optional" so we leave it empty — no UX lie.
  const [targetDate, setTargetDate] = useState(
    editingQL?.targetDate || (templateId === 'event' ? addDaysISO(7) : '')
  );
  const [prepItems, setPrepItems] = useState(() => {
    const base = ['', '', ''];
    existingPrepItems.slice(0, 3).forEach((p, i) => { base[i] = p; });
    return base;
  });
  const [milestones, setMilestones] = useState(() => {
    if (existingMilestones.length >= 4) return existingMilestones.slice(0, 6);
    const base = ['', '', '', ''];
    existingMilestones.forEach((m, i) => { if (i < 4) base[i] = m; });
    return base;
  });

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const previewDays = useMemo(() => {
    if (!template) return [];
    try {
      return template.dayGenerator({
        title: title.trim() || template.title[lang],
        subtitle: subtitle.trim() || undefined,
        targetDate: targetDate || undefined,
        prepItems: prepItems.map(p => p.trim()).filter(Boolean),
        milestones: milestones.map(m => m.trim()).filter(Boolean),
      });
    } catch {
      return [];
    }
  }, [template, title, subtitle, targetDate, prepItems, milestones, lang]);

  // Validation
  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (templateId === 'event' && !targetDate) return false;
    if (templateId === 'skill') {
      const filled = milestones.filter(m => m.trim()).length;
      if (filled < 4) return false;
    }
    if (previewDays.length === 0) return false;
    return true;
  }, [title, targetDate, templateId, milestones, previewDays]);

  const doSave = () => {
    const patch = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      emoji: template.emoji,
      targetDate: targetDate || undefined,
      days: previewDays,
    };
    if (editingQL) {
      // Regenerating days changes day IDs, which wipes completedDayIds.
      actions.updateQuestLine(editingQL.id, {
        ...patch,
        completedDayIds: [],
        completed: false,
        completedAt: undefined,
      });
    } else {
      const newQL = {
        id: genQuestLineId(),
        templateId: templateId,
        title: patch.title,
        subtitle: patch.subtitle,
        emoji: template.emoji,
        createdAt: new Date().toISOString(),
        targetDate: patch.targetDate,
        days: previewDays,
        completedDayIds: [],
        completed: false,
      };
      actions.createQuestLine(newQL);
    }
    onSave();
  };

  const handleSaveClick = () => {
    if (!canSave) return;
    if (editingQL) {
      // Confirm before regenerating days
      setShowRegenerateConfirm(true);
    } else {
      doSave();
    }
  };

  const addMilestone = () => {
    if (milestones.length >= 6) return;
    setMilestones([...milestones, '']);
  };
  const removeMilestone = (i) => {
    if (milestones.length <= 4) return;
    const next = [...milestones];
    next.splice(i, 1);
    setMilestones(next);
  };
  const updateMilestone = (i, v) => {
    const next = [...milestones];
    next[i] = v;
    setMilestones(next);
  };
  const updatePrepItem = (i, v) => {
    const next = [...prepItems];
    next[i] = v;
    setPrepItems(next);
  };

  if (!template) {
    return (
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(186,26,26,0.06)', border: '1px solid rgba(186,26,26,0.1)' }}>
        <p className="font-body text-error">Vorlage nicht gefunden.</p>
        <button onClick={onCancel} className="mt-3 font-label text-sm underline">Zurück</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 text-on-surface-variant font-label text-sm mb-3 active:opacity-60">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Zurück
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'rgba(18,67,70,0.06)' }}>
            <span className="text-2xl">{template.emoji}</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">
              {editingQL ? 'Bearbeiten' : template.title[lang]}
            </h2>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {editingQL ? template.title[lang] : 'Neue Quest-Linie'}
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-5 space-y-4"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* T1: Learn */}
        {templateId === 'learn' && (
          <>
            <FieldRow label="Titel" required>
              <TextInput value={title} onChange={setTitle} placeholder="z.B. Meerschweinchen-Referat" />
            </FieldRow>
            <FieldRow label="Untertitel (optional)">
              <TextInput value={subtitle} onChange={setSubtitle} placeholder="Für die Schule" />
            </FieldRow>
            <FieldRow label="Zieltag (optional)">
              <DateInput value={targetDate} onChange={setTargetDate} />
              <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                7 Tage lang mit wachsender Übung. Der Zieltag ist der Präsentationstag.
              </p>
            </FieldRow>
          </>
        )}

        {/* T2: Event */}
        {templateId === 'event' && (
          <>
            <FieldRow label="Titel" required>
              <TextInput value={title} onChange={setTitle} placeholder="z.B. Omas Geburtstag" />
            </FieldRow>
            <FieldRow label="Datum des Ereignisses" required>
              <DateInput value={targetDate} onChange={setTargetDate} />
            </FieldRow>
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant/60 px-1 block uppercase tracking-widest mb-1.5">
                Vorbereitungsschritte (optional)
              </label>
              <p className="font-body text-xs text-on-surface-variant mb-3 leading-relaxed">
                Was muss vorher passieren? Optional.
              </p>
              <div className="space-y-2">
                {prepItems.map((item, i) => (
                  <TextInput key={i} value={item} onChange={v => updatePrepItem(i, v)}
                    placeholder={`Schritt ${i + 1}, z.B. Geschenk aussuchen`} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* T3: Skill */}
        {templateId === 'skill' && (
          <>
            <FieldRow label="Titel" required>
              <TextInput value={title} onChange={setTitle} placeholder="z.B. Schwimmen lernen" />
            </FieldRow>
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant/60 px-1 block uppercase tracking-widest mb-1.5">
                Meilensteine <span className="text-on-surface-variant/40">(mind. 4, max. 6)</span>
              </label>
              <p className="font-body text-xs text-on-surface-variant mb-3 leading-relaxed">
                Kleine, klare Etappen in Louis' Tempo. Kein Zeitdruck.
              </p>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-label font-bold text-xs w-6 text-center text-on-surface-variant shrink-0">
                      {i + 1}.
                    </span>
                    <TextInput value={m} onChange={v => updateMilestone(i, v)}
                      placeholder={`Meilenstein ${i + 1}`} className="flex-1" />
                    {milestones.length > 4 && (
                      <button onClick={() => removeMilestone(i)}
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 shrink-0"
                        style={{ background: 'rgba(186,26,26,0.06)', border: '1px solid rgba(186,26,26,0.1)' }}>
                        <span className="material-symbols-outlined text-error text-base">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {milestones.length < 6 && (
                <button onClick={addMilestone}
                  className="w-full mt-3 py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(18,67,70,0.04)', color: '#124346', border: '1.5px dashed rgba(18,67,70,0.15)' }}>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Meilenstein hinzufügen
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Live preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            preview
          </span>
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline">
            Vorschau ({previewDays.length} {templateId === 'skill' ? 'Meilensteine' : 'Tage'})
          </h3>
        </div>
        <p className="font-body text-xs text-on-surface-variant mb-3 leading-relaxed">
          So sieht Louis das Abenteuer Tag für Tag.
        </p>

        {previewDays.length === 0 ? (
          <div className="rounded-2xl p-5 text-center"
               style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px dashed rgba(0,0,0,0.08)' }}>
            <p className="font-body text-sm text-on-surface-variant italic">
              {templateId === 'event' && !targetDate
                ? 'Wähle ein Datum, um die Vorschau zu sehen.'
                : templateId === 'skill'
                ? 'Fülle mindestens 4 Meilensteine aus.'
                : 'Gib einen Titel ein, um die Vorschau zu sehen.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {previewDays.map((day, i) => (
              <div key={day.id || i} className="rounded-2xl p-4 flex items-start gap-3"
                   style={{ background: '#ffffff', border: '1.5px solid rgba(18,67,70,0.08)', boxShadow: '0 2px 6px rgba(18,67,70,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(252,211,77,0.2)' }}>
                  <span className="text-xl">{day.icon || '⭐'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label font-bold text-xs uppercase tracking-widest"
                          style={{ color: '#a16207' }}>
                      {day.isMilestone ? `Meilenstein ${day.dayNumber}` : `Tag ${day.dayNumber}`}
                    </span>
                  </div>
                  <p className="font-headline font-bold text-sm text-on-surface">{day.title}</p>
                  <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {day.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3.5 rounded-full font-label font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.1)' }}>
          Abbrechen
        </button>
        <button onClick={handleSaveClick} disabled={!canSave}
          className="flex-1 py-3.5 rounded-full font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: canSave ? '#fcd34d' : 'rgba(18,67,70,0.08)',
            color: canSave ? '#725b00' : '#c0c8c9',
            boxShadow: canSave ? '0 6px 20px rgba(252,211,77,0.4)' : 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}>
          <span className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
          {editingQL ? 'Änderungen speichern' : 'Quest-Linie anlegen'}
        </button>
      </div>

      {/* Regenerate confirmation modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-[400] bg-black/40 flex items-end sm:items-center justify-center p-4"
             onClick={() => setShowRegenerateConfirm(false)}>
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4"
               onClick={e => e.stopPropagation()}
               style={{ background: '#fff8f1', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(252,211,77,0.2)' }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: '#a16207', fontVariationSettings: "'FILL' 1" }}>
                  refresh
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-base text-on-surface">Tage werden neu erzeugt</h3>
                <p className="font-body text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  Das Speichern erzeugt die Tage neu. Louis' bisherige Haken werden zurückgesetzt.
                  Nur weitermachen, wenn das okay ist.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRegenerateConfirm(false)}
                className="flex-1 py-3 rounded-full font-label font-bold text-sm transition-all active:scale-[0.98]"
                style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.1)' }}>
                Abbrechen
              </button>
              <button onClick={() => { setShowRegenerateConfirm(false); doSave(); }}
                className="flex-1 py-3 rounded-full font-headline font-bold text-sm transition-all active:scale-[0.98]"
                style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 14px rgba(252,211,77,0.35)' }}>
                Ja, neu erzeugen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CARD COMPONENTS
// ═══════════════════════════════════════════════════════

function ActiveQuestLineCard({ ql, onEdit, onArchive }) {
  const total = ql.days?.length || 0;
  const done = ql.completedDayIds?.length || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-4"
         style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
             style={{ background: 'rgba(18,67,70,0.06)' }}>
          <span className="text-2xl">{ql.emoji || '✨'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-sm text-on-surface truncate">{ql.title}</h3>
          {ql.subtitle && (
            <p className="font-body text-xs text-on-surface-variant truncate">{ql.subtitle}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden"
                 style={{ background: 'rgba(18,67,70,0.08)' }}>
              <div className="h-full transition-all duration-500"
                   style={{ width: `${pct}%`, background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.4)' }} />
            </div>
            <span className="font-label font-bold text-xs text-on-surface-variant tabular-nums shrink-0">
              {done}/{total}
            </span>
          </div>
        </div>
        <button onClick={onArchive}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 shrink-0"
          style={{ background: 'rgba(186,26,26,0.05)', border: '1px solid rgba(186,26,26,0.1)' }}>
          <span className="material-symbols-outlined text-error text-base">delete</span>
        </button>
      </div>
      <button onClick={onEdit}
        className="w-full mt-3 py-2.5 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        style={{ background: 'rgba(18,67,70,0.05)', color: '#124346', border: '1px solid rgba(18,67,70,0.1)' }}>
        <span className="material-symbols-outlined text-base">edit</span>
        Bearbeiten
      </button>
    </div>
  );
}

function ReadOnlyQuestLineCard({ ql, tint = '#707979', restoreAction }) {
  const total = ql.days?.length || 0;
  const done = ql.completedDayIds?.length || 0;
  return (
    <div className="rounded-2xl p-4"
         style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: `${tint}12` }}>
          <span className="text-xl" style={{ opacity: 0.8 }}>{ql.emoji || '✨'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-sm text-on-surface truncate">{ql.title}</h3>
          {ql.subtitle && (
            <p className="font-body text-xs text-on-surface-variant truncate">{ql.subtitle}</p>
          )}
          <p className="font-label text-xs text-on-surface-variant/60 mt-1 uppercase tracking-widest">
            {done}/{total} erledigt
          </p>
        </div>
        {restoreAction && (
          <button onClick={restoreAction}
            className="font-label font-bold text-xs text-primary active:opacity-60 shrink-0 px-3 py-2 rounded-full"
            style={{ background: 'rgba(18,67,70,0.06)' }}>
            Wiederherstellen
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LAYOUT HELPERS
// ═══════════════════════════════════════════════════════

function Section({ title, count, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-outline">
          {title}
        </h3>
        <span className="font-label font-bold text-xs text-on-surface-variant/60 tabular-nums">
          ({count})
        </span>
      </div>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, icon, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <span className="material-symbols-outlined text-on-surface-variant text-lg">
          {icon}
        </span>
        <span className="font-label font-bold text-sm text-on-surface flex-1">{title}</span>
        <span className="font-label font-bold text-xs text-on-surface-variant/60 tabular-nums">
          {count}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant/40 text-lg transition-transform duration-300"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs font-bold text-on-surface-variant/60 px-1 block uppercase tracking-widest">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
      className={`w-full h-12 px-4 rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary/10 outline-none transition-all ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }}
      placeholder={placeholder} />
  );
}

function DateInput({ value, onChange }) {
  return (
    <input type="date" value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full h-12 px-4 rounded-xl font-body text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)' }} />
  );
}

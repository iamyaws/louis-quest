import type { QuestLineDay } from '../context/TaskContext';

export interface QuestLineInput {
  title: string;
  subtitle?: string;
  targetDate?: string;     // ISO date (T2 only)
  prepItems?: string[];    // T2 only — up to 3
  milestones?: string[];   // T3 only — 4-6 labels
}

export interface QuestLineTemplate {
  id: 'learn' | 'event' | 'skill' | 'homework';
  emoji: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  scheduleKind: 'daily' | 'target-date' | 'milestones';
  defaultDurationDays?: number;
  dayGenerator: (input: QuestLineInput) => QuestLineDay[];
}

function uid(): string {
  return `ql_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// T1 — Lern-Projekt
export const LEARN_TEMPLATE: QuestLineTemplate = {
  id: 'learn',
  emoji: '📚',
  title: { de: 'Lern-Projekt', en: 'Learning Project' },
  description: {
    de: 'Für Referate, Einmaleins, Gedichte lernen — alles, was Übung braucht.',
    en: 'Presentations, multiplication tables, poems — anything that needs practice.',
  },
  scheduleKind: 'daily',
  defaultDurationDays: 7,
  dayGenerator: ({ title }) => {
    const topic = title || 'dein Thema';
    return [
      { id: uid(), dayNumber: 1, icon: '🔍', title: 'Worum geht\'s?',       description: `Sammle Fragen zu ${topic} mit Mama oder Papa.` },
      { id: uid(), dayNumber: 2, icon: '✍️', title: 'Hauptpunkte',          description: 'Was willst du wissen? Was willst du sagen? Schreib es auf.' },
      { id: uid(), dayNumber: 3, icon: '🗣️', title: 'Erste Übung',          description: 'Lies einmal laut vor.' },
      { id: uid(), dayNumber: 4, icon: '💪', title: 'Zweite Übung',         description: 'Noch einmal, diesmal ohne nachschauen.' },
      { id: uid(), dayNumber: 5, icon: '🐉', title: 'Ronki vortragen',      description: 'Trag es Ronki vor. Er hört gut zu.' },
      { id: uid(), dayNumber: 6, icon: '🎭', title: 'Generalprobe',         description: 'Noch einmal üben. Morgen ist der Tag.' },
      { id: uid(), dayNumber: 7, icon: '🌟', title: 'Der große Tag!',        description: 'Du schaffst das. Ronki glaubt an dich.' },
    ];
  },
};

// T2 — Ereignis-Vorbereitung
export const EVENT_TEMPLATE: QuestLineTemplate = {
  id: 'event',
  emoji: '🎁',
  title: { de: 'Ereignis-Vorbereitung', en: 'Event Preparation' },
  description: {
    de: 'Für Geburtstage, Klassenausflüge, Familienfeiern — Countdown bis zum Tag.',
    en: 'Birthdays, school trips, family events — countdown to the big day.',
  },
  scheduleKind: 'target-date',
  dayGenerator: ({ targetDate, prepItems = [] }) => {
    if (!targetDate) return [];
    const target = new Date(targetDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const daysUntil = Math.max(0, Math.round((target.getTime() - now.getTime()) / (24 * 3600 * 1000)));
    const duration = Math.min(14, Math.max(3, daysUntil + 1));
    const days: QuestLineDay[] = [];
    // Prep items fill early days if provided
    const prepSlots = Math.max(0, duration - 3);
    for (let i = 0; i < prepSlots; i++) {
      const prepTitle = prepItems[i] || 'Vorbereiten';
      const prepDesc = prepItems[i]
        ? `Heute: ${prepItems[i]}.`
        : 'Eine kleine Vorbereitung für den großen Tag.';
      days.push({ id: uid(), dayNumber: i + 1, icon: '📝', title: prepTitle, description: prepDesc });
    }
    // Always end with the same 3-day countdown
    days.push({ id: uid(), dayNumber: duration - 2, icon: '⏳', title: 'Noch zwei Tage...',   description: 'Der Tag kommt näher. Freu dich schon drauf?' });
    days.push({ id: uid(), dayNumber: duration - 1, icon: '🌙', title: 'Morgen ist es soweit.', description: 'Alles bereit? Heute Abend nochmal kurz durchdenken.' });
    days.push({ id: uid(), dayNumber: duration,     icon: '🎉', title: 'Heute ist der Tag!',   description: 'Hab einen wunderbaren Tag!' });
    return days;
  },
};

// T3 — Neue Fertigkeit
export const SKILL_TEMPLATE: QuestLineTemplate = {
  id: 'skill',
  emoji: '🌱',
  title: { de: 'Neue Fertigkeit', en: 'New Skill' },
  description: {
    de: 'Für Schwimmen, Fahrrad fahren, Schnürsenkel binden — Meilensteine in deinem Tempo.',
    en: 'Swimming, cycling, tying shoelaces — milestones at your own pace.',
  },
  scheduleKind: 'milestones',
  dayGenerator: ({ milestones = [] }) => {
    return milestones.map((label, i) => ({
      id: uid(),
      dayNumber: i + 1,
      icon: ['🌱', '🌿', '🌳', '🌟', '✨', '🏆'][i] || '🎯',
      title: label,
      description: 'Wenn du das geschafft hast, hak es ab.',
      isMilestone: true,
    }));
  },
};

// T4 — Hausaufgaben (single-session, parent check-in at the end)
export const HAUSAUFGABEN_TEMPLATE: QuestLineTemplate = {
  id: 'homework',
  emoji: '📝',
  title: { de: 'Hausaufgaben', en: 'Homework' },
  description: {
    de: 'Für einzelne Hausaufgaben-Sessions. Leg das Handy weg, Timer läuft, Ronki meldet sich wenn fertig. Eltern schauen am Ende drüber.',
    en: 'For individual homework sessions. Phone goes away, timer runs, Ronki announces when done. Parents check at the end.',
  },
  scheduleKind: 'daily',
  defaultDurationDays: 1, // homework is typically a single-session quest
  dayGenerator: ({ title, subtitle }) => {
    const focus = title || 'Hausaufgaben';
    return [
      { id: uid(), dayNumber: 1, icon: '📝', title: 'Hinsetzen', description: 'Such dir deinen Platz. Stifte raus. Handy weg.' },
      { id: uid(), dayNumber: 2, icon: '⏱️', title: 'Los geht\'s', description: `Jetzt ${focus}. Ronki wartet im Hintergrund.` },
      { id: uid(), dayNumber: 3, icon: '🌟', title: 'Fertig!', description: 'Zeig Mama oder Papa. Du hast es geschafft.' },
    ];
  },
};

export const QUEST_LINE_TEMPLATES: QuestLineTemplate[] = [LEARN_TEMPLATE, EVENT_TEMPLATE, SKILL_TEMPLATE, HAUSAUFGABEN_TEMPLATE];
export const TEMPLATE_BY_ID: Map<string, QuestLineTemplate> = new Map(QUEST_LINE_TEMPLATES.map(t => [t.id, t]));

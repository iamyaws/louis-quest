import type { TaskState } from '../context/TaskContext';

export interface EggTrigger {
  id: string;
  view: string;
  labelDe: string;
  labelEn: string;
  accentColor: string;
  condition: (s: TaskState) => boolean;
}

export const EGG_TRIGGERS: EggTrigger[] = [
  {
    id: 'egg_five_tasks',
    view: 'quests',
    labelDe: 'Helden-Ei',
    labelEn: 'Hero Egg',
    accentColor: '#fcd34d',
    condition: (s) => (s.totalTasksDone || 0) >= 5,
  },
  {
    id: 'egg_first_boss',
    view: 'hub',
    labelDe: 'Drachen-Ei',
    labelEn: 'Dragon Egg',
    accentColor: '#ef4444',
    condition: (s) => (s.bossTrophies || []).length >= 1,
  },
  {
    id: 'egg_journal',
    view: 'journal',
    labelDe: 'Tagebuch-Ei',
    labelEn: 'Journal Egg',
    accentColor: '#a78bfa',
    condition: (s) => (s.journalHistory || []).length >= 1,
  },
  {
    id: 'egg_sanctuary',
    view: 'care',
    labelDe: 'Natur-Ei',
    labelEn: 'Nature Egg',
    accentColor: '#34d399',
    condition: (s) => (s.viewsVisited || []).includes('care'),
  },
  {
    id: 'egg_memories',
    view: 'memories',
    labelDe: 'Erinnerungs-Ei',
    labelEn: 'Memory Egg',
    accentColor: '#60a5fa',
    condition: (s) => (s.viewsVisited || []).includes('memories'),
  },
  {
    id: 'egg_all_games',
    view: 'games',
    labelDe: 'Spiel-Ei',
    labelEn: 'Game Egg',
    accentColor: '#f97316',
    condition: (s) => {
      const played = s.gamesPlayedEver || [];
      return ['memory', 'potion', 'clouds', 'starfall'].every(g => played.includes(g));
    },
  },
  {
    id: 'egg_milestone_20',
    view: 'hub',
    labelDe: 'Wachstums-Ei',
    labelEn: 'Growth Egg',
    accentColor: '#fcd34d',
    condition: (s) => (s.totalTasksDone || 0) >= 20,
  },
];

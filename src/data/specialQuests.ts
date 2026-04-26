export interface SpecialQuest {
  id: string;
  emoji: string;
  titleDe: string;
  titleEn: string;
  descDe: string;
  descEn: string;
  trigger: string; // used in checkTrigger
  xpReward: number;
}

// Special quests: NORTHSTAR-aligned set (Apr 2026 cleanup).
// Removed:
//  - sq_screen (Erste Funkelzeit) — Funkelzeit deleted in cut #6, trigger
//    'screenMin' can never fire.
//  - sq_first_boss — boss system deleted in cut #5.
//  - sq_care (Heiliger Hain) — Sanctuary/Heiligtum deleted in cut #5.
//  - sq_memories (Heldenmemory) — MemoryWall flagged for removal.
// Kept beats are routine + journal + mood + water + first-task milestones,
// which still serve the companion-presence model.
export const SPECIAL_QUESTS: SpecialQuest[] = [
  { id: 'sq_first_task',  emoji: '⚔️', titleDe: 'Erste Aufgabe',    titleEn: 'First Quest',       descDe: 'Schließe deine erste tägliche Aufgabe ab', descEn: 'Complete your first daily task',   trigger: 'totalTasks_1',    xpReward: 15 },
  { id: 'sq_mood',        emoji: '😊', titleDe: 'Stimmungsmesser',   titleEn: 'Mood Check',        descDe: 'Trag deine Stimmung ein',                  descEn: 'Log your mood',                    trigger: 'moodSet',         xpReward: 10 },
  { id: 'sq_water',       emoji: '💧', titleDe: 'Wasserdrache',      titleEn: 'Water Dragon',      descDe: 'Trink 6 Gläser Wasser an einem Tag',       descEn: 'Drink 6 glasses in one day',       trigger: 'waterFull',       xpReward: 10 },
  { id: 'sq_journal',     emoji: '📖', titleDe: 'Tagebuch-Held',     titleEn: 'Journal Hero',      descDe: 'Schreib deinen ersten Tagebucheintrag',    descEn: 'Write your first journal entry',   trigger: 'firstJournal',    xpReward: 15 },
  { id: 'sq_games',       emoji: '🎮', titleDe: 'Entdecker!',        titleEn: 'Explorer!',         descDe: 'Entdecke die Minispiele',                  descEn: 'Discover the mini-games',          trigger: 'gamesVisit',      xpReward: 10 },
  { id: 'sq_ten_tasks',   emoji: '🌟', titleDe: 'Zehn Aufgaben',     titleEn: 'Ten Quests',        descDe: 'Schließe 10 Aufgaben ab',                  descEn: 'Complete 10 quests',               trigger: 'totalTasks_10',   xpReward: 20 },
];

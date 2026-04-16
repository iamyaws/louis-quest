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

export const SPECIAL_QUESTS: SpecialQuest[] = [
  { id: 'sq_first_task',  emoji: '⚔️', titleDe: 'Erste Aufgabe',    titleEn: 'First Quest',       descDe: 'Schließe deine erste tägliche Aufgabe ab', descEn: 'Complete your first daily task',   trigger: 'totalTasks_1',    xpReward: 15 },
  { id: 'sq_mood',        emoji: '😊', titleDe: 'Stimmungsmesser',   titleEn: 'Mood Check',        descDe: 'Trag deine Stimmung ein',                  descEn: 'Log your mood',                    trigger: 'moodSet',         xpReward: 10 },
  { id: 'sq_water',       emoji: '💧', titleDe: 'Wasserdrache',      titleEn: 'Water Dragon',      descDe: 'Trink 6 Gläser Wasser an einem Tag',       descEn: 'Drink 6 glasses in one day',       trigger: 'waterFull',       xpReward: 10 },
  { id: 'sq_journal',     emoji: '📖', titleDe: 'Tagebuch-Held',     titleEn: 'Journal Hero',      descDe: 'Schreib deinen ersten Tagebucheintrag',    descEn: 'Write your first journal entry',   trigger: 'firstJournal',    xpReward: 15 },
  { id: 'sq_care',        emoji: '🌿', titleDe: 'Heiliger Hain',     titleEn: 'Sacred Grove',      descDe: 'Besuche das Heiligtum',                    descEn: 'Visit the Sanctuary',              trigger: 'careVisit',       xpReward: 10 },
  { id: 'sq_games',       emoji: '🎮', titleDe: 'Entdecker!',        titleEn: 'Explorer!',         descDe: 'Entdecke die Minispiele',                  descEn: 'Discover the mini-games',          trigger: 'gamesVisit',      xpReward: 10 },
  { id: 'sq_memories',    emoji: '✨', titleDe: 'Heldenmemory',      titleEn: 'Hero Memory',       descDe: 'Besuche die Erinnerungswand',              descEn: 'Visit the Memory Wall',            trigger: 'memoriesVisit',   xpReward: 10 },
  { id: 'sq_screen',      emoji: '⏱️', titleDe: 'Erste Funkelzeit',  titleEn: 'First Spark Time',  descDe: 'Verdiene deine erste Funkelzeit',          descEn: 'Earn your first screen minute',    trigger: 'screenMin',       xpReward: 15 },
  { id: 'sq_first_boss',  emoji: '🏆', titleDe: 'Boss besiegt!',     titleEn: 'Boss Defeated!',    descDe: 'Besiege deinen ersten Boss',               descEn: 'Defeat your first boss',           trigger: 'firstBoss',       xpReward: 25 },
  { id: 'sq_ten_tasks',   emoji: '🌟', titleDe: 'Zehn Aufgaben',     titleEn: 'Ten Quests',        descDe: 'Schließe 10 Aufgaben ab',                  descEn: 'Complete 10 quests',               trigger: 'totalTasks_10',   xpReward: 20 },
];

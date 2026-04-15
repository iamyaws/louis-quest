// Ronki's voice system — types shared across engine, hook, and line catalogs.
// Voice tone: "curious younger friend" (Baby stage). Never lectures.

import type { ArcLifecyclePhase } from '../arcs/types';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeatherTag = 'rain' | 'cold' | 'hot' | 'clear' | 'snow';
export type MoodTag = 'magisch' | 'gut' | 'okay' | 'besorgt' | 'traurig' | 'müde';
export type StageTag = 'egg' | 'baby' | 'juvenile' | 'adult';
export type Trigger =
  | 'hub_open'
  | 'sanctuary_open'
  | 'quest_complete'
  | 'care_action'
  | 'idle';
export type CareAction = 'fed' | 'petted' | 'played';

export interface VoiceContext {
  trigger: Trigger;
  timeOfDay: TimeOfDay;
  weather: WeatherTag | null;
  mood: MoodTag | null;
  stage: StageTag;
  questsCompletedToday: number;
  careAction?: CareAction;
  arcPhase?: ArcLifecyclePhase;
  lang: 'de' | 'en';
}

export interface VoiceLine {
  id: string;
  text: string;
  // Any of these tags must match context (OR within kind, AND across kinds).
  triggers: Trigger[];
  timeOfDay?: TimeOfDay[];
  weather?: WeatherTag[];
  mood?: MoodTag[];
  stage?: StageTag[];
  careAction?: CareAction[];
  arcPhase?: ArcLifecyclePhase;
  minQuestsToday?: number;
  cooldownHours?: number; // default 24
  weight?: number; // default 1
}

export type VoiceHistory = Record<string, number>; // lineId -> unix ms of last use

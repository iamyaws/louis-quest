import { useCallback, useEffect, useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import useWeather from '../hooks/useWeather';
import { getCatStage } from '../utils/helpers';
import { pickLine, recordUse, pruneHistory } from './VoiceEngine';
import { linesFor } from './voiceLines';
import VoiceAudio from '../utils/voiceAudio';
import type { ArcLifecyclePhase } from '../arcs/types';
import type {
  VoiceContext,
  VoiceLine,
  VoiceHistory,
  Trigger,
  TimeOfDay,
  WeatherTag,
  StageTag,
  CareAction,
} from './types';

const HISTORY_KEY = 'ronki_voice_history_v1';
const BUBBLE_MS = 15000;

/**
 * Replace the `{name}` placeholder with the child's name from familyConfig.
 *
 * Lines using a leading `{name}! …` token gracefully drop the whole prefix
 * when no name is available (e.g., pre-onboarding, or configs with empty
 * childName) — otherwise the bubble reads `"! I was waiting for you!"`
 * which is both grammatically wrong and looks like a bug.
 *
 * Multi-kid rollout requirement (Marc 25 Apr 2026): names must be dynamic.
 * Previously EN bank hard-coded 'Louis!' in two lines. DE bank avoided names
 * entirely. Going forward, any line that wants the child's name uses `{name}`
 * and the substitution happens here right before the text hits the bubble.
 * The pre-generated MP3 audio doesn't contain the name either way — it's a
 * text-bubble-only personalisation.
 */
function substituteName(text: string, name: string): string {
  const clean = (name || '').trim();
  if (!clean) {
    // Drop `{name}` plus adjacent punctuation + spaces so the remaining
    // text reads naturally. Covers leading 'Hey, {name}!' and 'Hi {name}.'
    // patterns as well as the common '{name}! Rest of line.' shape.
    return text
      .replace(/[,\s]*\{name\}[!.,?]?\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return text.replace(/\{name\}/g, clean);
}

// Mood index → MoodTag. Order must match MOOD_EMOJIS in src/constants.ts:
// 0 → 😢 traurig, 1 → 😕 besorgt, 2 → 😐 okay, 3 → 🙂 gut, 4 → 😊 magisch, 5 → 🤩 müde
const MOOD_INDEX_TO_TAG: (import('./types').MoodTag | null)[] = [
  'traurig', 'besorgt', 'okay', 'gut', 'magisch', 'müde',
];

function moodFromState(s: any): import('./types').MoodTag | null {
  // Prefer PM mood if set (later in the day = more current), fall back to AM
  const idx = s.moodPM ?? s.moodAM;
  if (idx === null || idx === undefined) return null;
  return MOOD_INDEX_TO_TAG[idx] ?? null;
}

function loadHistory(): VoiceHistory {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return pruneHistory(JSON.parse(raw));
  } catch {
    return {};
  }
}

function saveHistory(h: VoiceHistory): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    // quota / private mode — ignore
  }
}

function timeOfDay(now: Date = new Date()): TimeOfDay {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function weatherTag(w: ReturnType<typeof useWeather>['weather']): WeatherTag | null {
  if (!w?.current) return null;
  const { weatherCode, temp } = w.current;
  // Open-Meteo weather codes: 51-67 drizzle/rain, 71-77 snow, 80-82 showers, 85-86 snow showers, 95-99 thunder.
  const isRain =
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    weatherCode >= 95;
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  if (isSnow) return 'snow';
  if (isRain) return 'rain';
  if (temp >= 22) return 'hot';
  if (temp <= 5) return 'cold';
  if (weatherCode <= 3) return 'clear';
  return null;
}

const STAGE_MAP: StageTag[] = ['egg', 'baby', 'juvenile', 'adult'];
function stageTag(catEvo: number): StageTag {
  const idx = Math.max(0, Math.min(STAGE_MAP.length - 1, getCatStage(catEvo)));
  return STAGE_MAP[idx];
}

export interface SayExtras {
  careAction?: CareAction;
  arcPhase?: ArcLifecyclePhase;
}

export interface UseVoiceResult {
  line: VoiceLine | null;
  say: (trigger: Trigger, extras?: SayExtras) => void;
  dismiss: () => void;
}

export function useVoice(): UseVoiceResult {
  const { state } = useTask();
  const { lang } = useTranslation();
  const { weather } = useWeather();

  const [line, setLine] = useState<VoiceLine | null>(null);
  const historyRef = useRef<VoiceHistory>(loadHistory());

  const say = useCallback(
    (trigger: Trigger, extras: SayExtras = {}) => {
      if (VoiceAudio.isMuted()) return;
      const s: any = state || {};
      const questsCompletedToday = Array.isArray(s.quests)
        ? s.quests.filter((q: any) => q.done).length
        : 0;

      const ctx: VoiceContext = {
        trigger,
        timeOfDay: timeOfDay(),
        weather: weatherTag(weather),
        mood: moodFromState(s),
        stage: stageTag(s.catEvo || 0),
        questsCompletedToday,
        careAction: extras.careAction,
        arcPhase: extras.arcPhase,
        lang: (lang === 'en' ? 'en' : 'de'),
        earnedTraits: s.earnedTraits || [],
      };

      const picked = pickLine(ctx, linesFor(ctx.lang), historyRef.current);
      if (!picked) return;
      historyRef.current = recordUse(picked.id, historyRef.current);
      saveHistory(historyRef.current);
      // Personalise any `{name}` placeholder in the text bubble before it
      // lands on the screen. Audio is unchanged (MP3s are recorded with
      // no name). See substituteName() comment.
      const childName = s.familyConfig?.childName || '';
      const personalised = substituteName(picked.text, childName);
      setLine(personalised === picked.text ? picked : { ...picked, text: personalised });
      // Play the pre-generated ElevenLabs audio for this line
      // Delay greeting lines so the kid settles into the view first
      const isViewOpen = trigger === 'hub_open' || trigger === 'sanctuary_open';
      VoiceAudio.play(picked.id, isViewOpen ? 1500 : 300);
    },
    [state, weather, lang],
  );

  const dismiss = useCallback(() => setLine(null), []);

  // Auto-dismiss after BUBBLE_MS.
  useEffect(() => {
    if (!line) return;
    const id = window.setTimeout(() => setLine(null), BUBBLE_MS);
    return () => window.clearTimeout(id);
  }, [line]);

  return { line, say, dismiss };
}

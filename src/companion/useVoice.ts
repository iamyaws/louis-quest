import { useCallback, useEffect, useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import useWeather from '../hooks/useWeather';
import { getCatStage } from '../utils/helpers';
import { pickLine, recordUse, pruneHistory } from './VoiceEngine';
import { linesFor } from './voiceLines';
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
      const s: any = state || {};
      const questsCompletedToday = Array.isArray(s.quests)
        ? s.quests.filter((q: any) => q.done).length
        : 0;

      const ctx: VoiceContext = {
        trigger,
        timeOfDay: timeOfDay(),
        weather: weatherTag(weather),
        mood: null, // wired in 1b from Buch mood
        stage: stageTag(s.catEvo || 0),
        questsCompletedToday,
        careAction: extras.careAction,
        lang: (lang === 'en' ? 'en' : 'de'),
      };

      const picked = pickLine(ctx, linesFor(ctx.lang), historyRef.current);
      if (!picked) return;
      historyRef.current = recordUse(picked.id, historyRef.current);
      saveHistory(historyRef.current);
      setLine(picked);
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

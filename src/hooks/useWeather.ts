import { useState, useEffect } from 'react';

// Default: geographic centre of Germany (fallback when geolocation denied/unavailable)
const DEFAULT_LAT = 51.165;
const DEFAULT_LON = 10.451;

function buildApiUrl(lat: number, lon: number): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=3`;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipProb: number;
  }[];
  fetchedAt: number;
}

const CACHE_KEY = 'hdx_weather';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function parseWeatherResponse(data: Record<string, unknown>): WeatherData {
  const current = data.current as Record<string, number>;
  const daily = data.daily as Record<string, unknown[]>;
  return {
    current: {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      weatherCode: current.weathercode,
      windSpeed: Math.round(current.windspeed_10m),
      humidity: current.relative_humidity_2m,
    },
    daily: (daily.time as string[]).map((d, i) => ({
      date: d,
      tempMax: Math.round((daily.temperature_2m_max as number[])[i]),
      tempMin: Math.round((daily.temperature_2m_min as number[])[i]),
      weatherCode: (daily.weathercode as number[])[i],
      precipProb: (daily.precipitation_probability_max as number[])[i],
    })),
    fetchedAt: Date.now(),
  };
}

export default function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Serve from cache if fresh
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherData;
        if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
          setWeather(parsed);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore parse errors */ }

    const fetchWeather = (lat: number, lon: number) => {
      fetch(buildApiUrl(lat, lon))
        .then(r => r.json())
        .then((data: Record<string, unknown>) => {
          const result = parseWeatherResponse(data);
          setWeather(result);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch { /* storage full */ }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON), // denied or unavailable
        { timeout: 5000 },
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
  }, []);

  return { weather, loading, error };
}

// ── Weather code → emoji + label ──────────────────────────────────────────────
export function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0)   return { emoji: '☀️',  label: 'Sonnig' };
  if (code <= 3)    return { emoji: '⛅',  label: 'Bewölkt' };
  if (code <= 48)   return { emoji: '🌫️',  label: 'Nebel' };
  if (code <= 57)   return { emoji: '🌧️',  label: 'Nieselregen' };
  if (code <= 67)   return { emoji: '🌧️',  label: 'Regen' };
  if (code <= 77)   return { emoji: '🌨️',  label: 'Schnee' };
  if (code <= 82)   return { emoji: '🌦️',  label: 'Regenschauer' };
  if (code <= 86)   return { emoji: '🌨️',  label: 'Schneeschauer' };
  if (code <= 99)   return { emoji: '⛈️',  label: 'Gewitter' };
  return { emoji: '☁️', label: 'Bewölkt' };
}

// Weather category — used by the Lager scene to pick an atmospheric layer
// (raindrops, snow, thunder flash). Coarser than getWeatherInfo so the
// CampfireScene only cares about broad buckets.
export type WeatherCategory = 'clear' | 'cloud' | 'fog' | 'rain' | 'snow' | 'thunder';
export function getWeatherCategory(code: number): WeatherCategory {
  if (code === 0)   return 'clear';
  if (code <= 3)    return 'cloud';
  if (code <= 48)   return 'fog';
  if (code <= 67)   return 'rain';
  if (code <= 77)   return 'snow';
  if (code <= 82)   return 'rain';
  if (code <= 86)   return 'snow';
  if (code <= 99)   return 'thunder';
  return 'cloud';
}

// ── Clothing recommendations ──────────────────────────────────────────────────
export interface ClothingItem {
  emoji: string;
  name: string;
  reason: string;
}

export function getClothingRecs(
  temp: number,
  feelsLike: number,
  weatherCode: number,
  windSpeed: number,
): ClothingItem[] {
  const items: ClothingItem[] = [];
  const effective = feelsLike;
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || weatherCode >= 95;
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isWindy = windSpeed >= 25;

  // Unterhemd as a baseline layer for cold + rain + wind — Marc feedback
  // Apr 2026 ("wir sollten auch ein Unterhemd empfehlen"). Different icons
  // per top-layer type so Jacke + Pulli + Unterhemd never share an emoji.
  if (effective < 0) {
    items.push({ emoji: '👕', name: 'Unterhemd',      reason: 'Basis-Schicht' });
    items.push({ emoji: '🧥', name: 'Winterjacke',   reason: 'Es ist eiskalt!' });
    items.push({ emoji: '🧣', name: 'Schal',          reason: 'Hals warm halten' });
    items.push({ emoji: '🧤', name: 'Handschuhe',     reason: 'Finger schützen' });
    items.push({ emoji: '🧢', name: 'Mütze',          reason: 'Kopf warm halten' });
    items.push({ emoji: '👖', name: 'Dicke Hose',     reason: 'Beine warmhalten' });
    items.push({ emoji: '🥾', name: 'Winterstiefel',  reason: 'Füße warmhalten' });
  } else if (effective < 10) {
    items.push({ emoji: '👕', name: 'Unterhemd',      reason: 'Basis-Schicht drunter' });
    items.push({ emoji: '🧶', name: 'Langer Pulli',   reason: 'Extra Wärme' });
    items.push({ emoji: '🧥', name: 'Jacke',          reason: 'Es ist kalt' });
    items.push({ emoji: '👖', name: 'Lange Hose',     reason: 'Beine warmhalten' });
  } else if (effective < 18) {
    items.push({ emoji: '🧶', name: 'Pulli/Hoodie',   reason: 'Kann kühl werden' });
    items.push({ emoji: '🧥', name: 'Leichte Jacke',  reason: 'Für morgens/abends' });
    items.push({ emoji: '👖', name: 'Lange Hose',     reason: 'Angenehm warm' });
  } else if (effective < 25) {
    items.push({ emoji: '👕', name: 'T-Shirt',        reason: 'Schönes Wetter!' });
    items.push({ emoji: '🩳', name: 'Kurze/Lange Hose', reason: 'Wie du magst' });
    items.push({ emoji: '👟', name: 'Sneaker',        reason: 'Bequem unterwegs' });
  } else {
    items.push({ emoji: '👕', name: 'T-Shirt',        reason: 'Es ist heiß!' });
    items.push({ emoji: '🩳', name: 'Kurze Hose',     reason: 'Bleib kühl' });
    items.push({ emoji: '🕶️', name: 'Sonnenbrille',   reason: 'Augen schützen' });
    items.push({ emoji: '🧢', name: 'Kappe/Hut',      reason: 'Sonnenschutz' });
  }

  // Sonnencreme — widened threshold. Clear/mostly-clear days and
  // temp >= 15 (not 20) now trigger the recommendation. Heute relevant
  // hint ("Heute besonders wichtig") appears when BOTH clear AND warm.
  // UV reality: first-graders need cream even at 15°C on a clear day.
  if (weatherCode <= 3 && temp >= 15) {
    const urgent = temp >= 22;
    items.push({
      emoji: '🧴',
      name: 'Sonnencreme',
      reason: urgent ? '☀️ Heute besonders wichtig!' : 'UV-Schutz auch an kühlen Sonnentagen',
    });
  }
  if (isRain) {
    items.push({ emoji: '🌧️', name: 'Regenjacke',    reason: 'Es regnet!' });
    items.push({ emoji: '☂️', name: 'Regenschirm',   reason: 'Trocken bleiben' });
  }
  if (isSnow && effective >= 0) {
    items.push({ emoji: '🥾', name: 'Winterstiefel', reason: 'Rutschfest bleiben' });
  }
  if (isWindy && effective >= 10) {
    items.push({ emoji: '💨', name: 'Windbreaker',   reason: 'Starker Wind!' });
  }

  return items;
}

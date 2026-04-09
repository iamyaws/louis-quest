import { useState, useEffect } from 'react';

const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=48.0833&longitude=11.6167&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=Europe/Berlin&forecast_days=3";

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

const CACHE_KEY = "hdx_weather";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export default function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache first
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
    } catch { /* ignore */ }

    fetch(API_URL)
      .then(r => r.json())
      .then(data => {
        const result: WeatherData = {
          current: {
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            weatherCode: data.current.weathercode,
            windSpeed: Math.round(data.current.windspeed_10m),
            humidity: data.current.relative_humidity_2m,
          },
          daily: data.daily.time.map((d: string, i: number) => ({
            date: d,
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            weatherCode: data.daily.weathercode[i],
            precipProb: data.daily.precipitation_probability_max[i],
          })),
          fetchedAt: Date.now(),
        };
        setWeather(result);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch { /* full */ }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { weather, loading, error };
}

// ── Weather code to emoji + label ──
export function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "\u2600\uFE0F", label: "Sonnig" };
  if (code <= 3) return { emoji: "\u26C5", label: "Bewölkt" };
  if (code <= 48) return { emoji: "\u{1F32B}\uFE0F", label: "Nebel" };
  if (code <= 57) return { emoji: "\u{1F327}\uFE0F", label: "Nieselregen" };
  if (code <= 67) return { emoji: "\u{1F327}\uFE0F", label: "Regen" };
  if (code <= 77) return { emoji: "\u{1F328}\uFE0F", label: "Schnee" };
  if (code <= 82) return { emoji: "\u{1F326}\uFE0F", label: "Regenschauer" };
  if (code <= 86) return { emoji: "\u{1F328}\uFE0F", label: "Schneeschauer" };
  if (code <= 99) return { emoji: "\u26C8\uFE0F", label: "Gewitter" };
  return { emoji: "\u2601\uFE0F", label: "Bewölkt" };
}

// ── Clothing recommendations ──
export interface ClothingItem {
  emoji: string;
  name: string;
  reason: string;
}

export function getClothingRecs(temp: number, feelsLike: number, weatherCode: number, windSpeed: number): ClothingItem[] {
  const items: ClothingItem[] = [];
  const effective = feelsLike;
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || weatherCode >= 95;
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isWindy = windSpeed >= 25;

  // Base layers by temperature
  if (effective < 0) {
    items.push({ emoji: "\u{1F9E5}", name: "Winterjacke", reason: "Es ist eiskalt!" });
    items.push({ emoji: "\u{1F9E3}", name: "Schal", reason: "Hals warm halten" });
    items.push({ emoji: "\u{1F9E4}", name: "Handschuhe", reason: "Finger schützen" });
    items.push({ emoji: "\u{1F9E2}", name: "Mütze", reason: "Kopf warm halten" });
    items.push({ emoji: "\u{1F456}", name: "Dicke Hose", reason: "Beine warmhalten" });
    items.push({ emoji: "\u{1F97E}", name: "Winterstiefel", reason: "Füße warmhalten" });
  } else if (effective < 10) {
    items.push({ emoji: "\u{1F9E5}", name: "Jacke", reason: "Es ist kalt" });
    items.push({ emoji: "\u{1F455}", name: "Langer Pulli", reason: "Extra Wärme" });
    items.push({ emoji: "\u{1F456}", name: "Lange Hose", reason: "Beine warmhalten" });
  } else if (effective < 18) {
    items.push({ emoji: "\u{1F9E5}", name: "Leichte Jacke", reason: "Für morgens/abends" });
    items.push({ emoji: "\u{1F455}", name: "Pulli/Hoodie", reason: "Kann kühl werden" });
    items.push({ emoji: "\u{1F456}", name: "Lange Hose", reason: "Angenehm warm" });
  } else if (effective < 25) {
    items.push({ emoji: "\u{1F455}", name: "T-Shirt", reason: "Schönes Wetter!" });
    items.push({ emoji: "\u{1FA73}", name: "Kurze/Lange Hose", reason: "Wie du magst" });
    items.push({ emoji: "\u{1F45F}", name: "Sneaker", reason: "Bequem unterwegs" });
  } else {
    items.push({ emoji: "\u{1F455}", name: "T-Shirt", reason: "Es ist heiß!" });
    items.push({ emoji: "\u{1FA73}", name: "Kurze Hose", reason: "Bleib kühl" });
    items.push({ emoji: "\u{1F576}\uFE0F", name: "Sonnenbrille", reason: "Augen schützen" });
    items.push({ emoji: "\u{1F9E2}", name: "Kappe/Hut", reason: "Sonnenschutz" });
  }

  // Sun protection
  if (temp >= 20 && weatherCode <= 3) {
    items.push({ emoji: "\u2600\uFE0F", name: "Sonnencreme", reason: "UV-Schutz!" });
  }

  // Rain gear
  if (isRain) {
    items.push({ emoji: "\u{1F327}\uFE0F", name: "Regenjacke", reason: "Es regnet!" });
    items.push({ emoji: "\u2602\uFE0F", name: "Regenschirm", reason: "Trocken bleiben" });
  }

  // Snow gear
  if (isSnow && effective >= 0) {
    items.push({ emoji: "\u{1F97E}", name: "Winterstiefel", reason: "Rutschfest bleiben" });
  }

  // Wind
  if (isWindy && effective >= 10) {
    items.push({ emoji: "\u{1F4A8}", name: "Windbreaker", reason: "Starker Wind!" });
  }

  return items;
}

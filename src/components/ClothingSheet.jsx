import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import useWeather, { getWeatherInfo, getClothingRecs } from '../hooks/useWeather';

/**
 * ClothingSheet — bottom-sheet weather outfit popup.
 * Reusable: works from TaskList (Anziehen quest) and Hub (weather widget tap).
 *
 * Props:
 *  - onClose: () => void
 */
export default function ClothingSheet({ onClose }) {
  const { t } = useTranslation();
  const { weather } = useWeather();

  const currentWeather = weather?.current;
  const todayWeather = weather?.daily?.[0];
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weatherCode) : null;
  const clothingRecs = currentWeather
    ? getClothingRecs(currentWeather.temp, currentWeather.feelsLike, currentWeather.weatherCode, currentWeather.windSpeed)
    : [];

  if (!currentWeather) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center"
         onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-[2rem] pb-10 pt-6 px-6 overflow-auto"
           style={{ background: '#fff8f2', maxHeight: '80vh', animation: 'slideUp 0.3s ease' }}
           onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-11 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'rgba(0,0,0,0.12)' }} />

        {/* Weather header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{weatherInfo?.emoji}</div>
          <h2 className="font-headline text-2xl text-on-surface">{t('task.weather.title')}</h2>
          <p className="font-body text-on-surface-variant mt-1">
            {weatherInfo?.label} · {currentWeather.temp}° ({t('task.weather.feelsLike', { temp: currentWeather.feelsLike })})
          </p>
          {todayWeather && (
            <p className="font-label text-sm text-on-surface-variant mt-1">
              {todayWeather.tempMin}° — {todayWeather.tempMax}°
              {todayWeather.precipProb > 20 && ` · ${t('task.weather.rain', { prob: todayWeather.precipProb })}`}
            </p>
          )}
        </div>

        {/* Clothing recommendations */}
        <div className="flex flex-col gap-3 mb-6">
          {clothingRecs.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                 style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="text-3xl shrink-0">{item.emoji}</span>
              <div className="flex-1">
                <p className="font-label font-bold text-on-surface">{item.name}</p>
                <p className="font-body text-sm text-on-surface-variant">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Close */}
        <button
          className="w-full py-4 rounded-full font-label font-bold text-lg transition-all active:scale-95"
          style={{ background: '#fcd34d', color: '#725b00' }}
          onClick={onClose}
        >
          {t('task.weather.ok')}
        </button>
      </div>
    </div>
  );
}

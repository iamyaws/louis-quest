import { describe, it, expect } from 'vitest';
import { getWeatherInfo } from './useWeather';

describe('getWeatherInfo', () => {
  it('returns sunny for code 0', () => {
    const { emoji, label } = getWeatherInfo(0);
    expect(emoji).toBe('☀️');
    expect(label).toBe('Sonnig');
  });

  it('returns rain emoji for code 61', () => {
    const { emoji } = getWeatherInfo(61);
    expect(emoji).toBe('🌧️');
  });

  it('returns thunderstorm for code 95', () => {
    const { emoji } = getWeatherInfo(95);
    expect(emoji).toBe('⛈️');
  });

  it('returns cloudy fallback for unknown code 999', () => {
    const { emoji } = getWeatherInfo(999);
    expect(emoji).toBe('☁️');
  });
});

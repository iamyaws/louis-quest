import { linesDe } from './lines/de';
import { linesEn } from './lines/en';
import type { VoiceLine } from './types';

export function linesFor(lang: 'de' | 'en'): VoiceLine[] {
  return lang === 'de' ? linesDe : linesEn;
}

export { linesDe, linesEn };

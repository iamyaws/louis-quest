import { LVL, SCHOOL_QUESTS, VACATION_QUESTS, FOOTBALL, CAT_STAGES } from '../constants';
import type { Quest, CatMood } from '../types';

export function getLevel(xp: number): number {
  let l = 1;
  for (let i = 1; i < LVL.length; i++) {
    if (xp >= LVL[i]) l = i + 1; else break;
  }
  return l;
}

export function getLvlProg(xp: number): { cur: number; need: number } {
  const l = getLevel(xp);
  const c = LVL[l - 1] || 0;
  const n = LVL[l] || c + 500;
  return { cur: xp - c, need: n - c };
}

export function buildDay(vac: boolean): Quest[] {
  const b: Quest[] = (vac ? VACATION_QUESTS : SCHOOL_QUESTS).map(q => ({
    ...q, done: false, streak: 0, completions: 0,
  }));
  const d = new Date().getDay();
  if ((d === 1 || d === 3) && !vac) b.push({ ...FOOTBALL, done: false, streak: 0, completions: 0 });
  return b;
}

export function getSky(done: number, total: number): string {
  const p = total > 0 ? done / total : 0;
  if (p >= 1) return "linear-gradient(180deg, #0F172A 0%, #1E1B4B 40%, #312E81 100%)";
  if (p >= 0.66) return "linear-gradient(180deg, #312E81 0%, #6D28D9 20%, #C2410C 55%, #F59E0B 100%)";
  if (p >= 0.33) return "linear-gradient(180deg, #0C4A6E 0%, #0369A1 35%, #38BDF8 70%, #7DD3FC 100%)";
  return "linear-gradient(180deg, #1E3A5F 0%, #2563EB 25%, #60A5FA 50%, #FDE68A 80%, #F97316 100%)";
}

export function getSkyStars(d: number, t: number): boolean { return t > 0 && d / t >= 1; }

export function getTimeLabel(d: number, t: number): string {
  const p = t > 0 ? d / t : 0;
  if (p >= 1) return "Nacht \u{1F319}";
  if (p >= 0.66) return "Abend \u{1F305}";
  if (p >= 0.33) return "Tag \u2600\uFE0F";
  return "Morgen \u{1F305}";
}

export function getMood(allDone: boolean, pct: number): CatMood {
  if (allDone) return "excited";
  if (pct > 0.5) return "happy";
  if (pct > 0) return "neutral";
  return "sleepy";
}

export function getDayName(): string {
  return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Date().getDay()];
}

export function getCatStage(catEvo: number): number {
  for (let i = CAT_STAGES.length - 1; i >= 0; i--) {
    if (catEvo >= CAT_STAGES[i].threshold) return i;
  }
  return 0;
}

export function getCatStageProg(catEvo: number): { cur: number; need: number; stage: number; maxStage: boolean } {
  const s = getCatStage(catEvo);
  const cur = CAT_STAGES[s].threshold;
  const next = CAT_STAGES[s + 1]?.threshold || cur + 100;
  return { cur: catEvo - cur, need: next - cur, stage: s, maxStage: s >= CAT_STAGES.length - 1 };
}

export function getCatMood(hunger?: number, happy?: number, energy?: number): CatMood {
  const avg = ((hunger ?? 100) + (happy ?? 100) + (energy ?? 100)) / 3;
  if (avg >= 75) return "excited";
  if (avg >= 50) return "happy";
  if (avg >= 25) return "neutral";
  return "sleepy";
}

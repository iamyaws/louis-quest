import { LVL, SCHOOL_QUESTS, VACATION_QUESTS, FOOTBALL } from '../constants';

export function getLevel(xp) {
  let l = 1;
  for (let i = 1; i < LVL.length; i++) {
    if (xp >= LVL[i]) l = i + 1; else break;
  }
  return l;
}

export function getLvlProg(xp) {
  const l = getLevel(xp);
  const c = LVL[l - 1] || 0;
  const n = LVL[l] || c + 500;
  return { cur: xp - c, need: n - c };
}

export function buildDay(vac) {
  const b = (vac ? VACATION_QUESTS : SCHOOL_QUESTS).map(q => ({ ...q, done: false, streak: 0 }));
  const d = new Date().getDay();
  if ((d === 1 || d === 3) && !vac) b.push({ ...FOOTBALL, done: false, streak: 0 });
  return b;
}

export function getSky(done, total) {
  const p = total > 0 ? done / total : 0;
  if (p >= 1) return "linear-gradient(180deg, #0F172A 0%, #1E1B4B 40%, #312E81 100%)";
  if (p >= 0.66) return "linear-gradient(180deg, #78350F 0%, #C2410C 25%, #EA580C 50%, #6D28D9 100%)";
  if (p >= 0.33) return "linear-gradient(180deg, #0C4A6E 0%, #0369A1 40%, #0284C7 100%)";
  return "linear-gradient(180deg, #7C2D12 0%, #9A3412 30%, #C2410C 60%, #EA580C 100%)";
}

export function getSkyStars(d, t) { return t > 0 && d / t >= 1; }

export function getTimeLabel(d, t) {
  const p = t > 0 ? d / t : 0;
  if (p >= 1) return "Nacht \u{1F319}";
  if (p >= 0.66) return "Abend \u{1F305}";
  if (p >= 0.33) return "Tag \u2600\uFE0F";
  return "Morgen \u{1F305}";
}

export function getMood(allDone, pct) {
  if (allDone) return "excited";
  if (pct > 0.5) return "happy";
  if (pct > 0) return "neutral";
  return "sleepy";
}

export function getDayName() {
  return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Date().getDay()];
}

// ── Family Config — customizable per-family settings ──

export interface DailyHabit {
  id: string;
  name: string;
  icon: string;
  iconDone: string;
  xp: number;
}

export interface SiblingConfig {
  name: string;
  relationship: 'Bruder' | 'Schwester' | 'Geschwister';
  pronouns: Pronouns;
  birthday?: string;  // ISO date
}

export interface RecurringActivity {
  id: string;
  name: string;
  icon: string;
  days: number[];  // 0=Sun..6=Sat
  xp: number;
  minutes: number;
}

export interface ParentMessage {
  title: string;
  body: string;
  signature: string;
}

export type Pronouns = 'er' | 'sie' | 'they';

export interface DragonVariant {
  palette: 'ember' | 'moss' | 'dusk';
  wings: 'rounded' | 'pointed' | 'feathered';
  horns: 'short' | 'curved' | 'spiraled';
}

// Helper to get pronoun forms for German text
export function pronouns(p: Pronouns) {
  switch (p) {
    case 'er':  return { nom: 'er', acc: 'ihn', dat: 'ihm', pos: 'sein', posE: 'seine', posEm: 'seinem', posEn: 'seinen' };
    case 'sie': return { nom: 'sie', acc: 'sie', dat: 'ihr', pos: 'ihr', posE: 'ihre', posEm: 'ihrem', posEn: 'ihren' };
    case 'they': return { nom: 'they', acc: 'they', dat: 'them', pos: 'their', posE: 'their', posEm: 'their', posEn: 'their' };
  }
}

export type FunkelzeitMode = 'entspannt' | 'normal' | 'strikt' | 'none';

/** How the ToothBrushGuide presents itself.
 *  - 'tasche' (default): dark calm screen, audio cues, encourages putting the phone down.
 *  - 'schau': illustrated zone guide with visible countdown (backup/learning mode). */
export type ToothBrushMode = 'tasche' | 'schau';

export interface FamilyConfig {
  childName: string;
  childBirthday?: string;  // ISO date
  childPronouns: Pronouns;
  siblings: SiblingConfig[];
  dailyHabits: DailyHabit[];
  recurringActivities: RecurringActivity[];
  parentMessage: ParentMessage;
  familyMotto: string;
  affirmation: string;
  dragonVariant?: DragonVariant;
  /** How restrictive the screen-time reward system is. Default 'entspannt' = current behavior. */
  funkelzeitMode?: FunkelzeitMode;
  /** Daily cap in minutes for 'strikt' mode. Default 30. */
  funkelzeitDailyCapMin?: number;
  /** Which tooth-brush UI mode to show by default. Default 'tasche'. */
  toothBrushDefaultMode?: ToothBrushMode;
}

// ── Louis's family as the default template ──
export const DEFAULT_FAMILY_CONFIG: FamilyConfig = {
  childName: 'Louis',
  childBirthday: '2019-10-25',
  childPronouns: 'er',
  siblings: [
    {
      name: 'Liam',
      relationship: 'Bruder',
      pronouns: 'er',
      birthday: '2026-04-26',
    },
  ],
  dailyHabits: [
    { id: 'habit_vitaminD', name: 'Vitamin D', icon: '💊', iconDone: '✅', xp: 5 },
    { id: 'habit_sibling', name: 'Zeit mit Liam', icon: '👶', iconDone: '✅', xp: 10 },
  ],
  recurringActivities: [
    {
      id: 'football',
      name: 'Fußball Training',
      icon: '⚽',
      days: [1, 3],
      xp: 10,
      minutes: 10,
    },
  ],
  parentMessage: {
    title: 'Botschaft für dich',
    body: 'Fehler sind okay. Deine Familie ist immer für dich da. 🧡',
    signature: 'Wir haben dich lieb.',
  },
  familyMotto: 'Lieb sein. Sich Mühe geben.\u00A0Zusammen sein.',
  affirmation: 'Ich bin geliebt, so wie ich bin.',
  funkelzeitMode: 'entspannt',
  funkelzeitDailyCapMin: 30,
  toothBrushDefaultMode: 'tasche',
};

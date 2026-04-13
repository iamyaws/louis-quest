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

export interface FamilyConfig {
  childName: string;
  siblings: SiblingConfig[];
  dailyHabits: DailyHabit[];
  recurringActivities: RecurringActivity[];
  parentMessage: ParentMessage;
  familyMotto: string;
  affirmation: string;
}

// ── Louis's family as the default template ──
export const DEFAULT_FAMILY_CONFIG: FamilyConfig = {
  childName: 'Louis',
  siblings: [
    {
      name: 'Liam',
      relationship: 'Bruder',
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
    title: 'Botschaft für Louis',
    body: 'Fehler sind okay. Mama & Papa sind immer für dich da. 🧡',
    signature: 'Louis, Papa und Mama lieben dich.',
  },
  familyMotto: 'Lieb sein. Sich Mühe geben.\u00A0Zusammen sein.',
  affirmation: 'Ich bin geliebt, so wie ich bin.',
};

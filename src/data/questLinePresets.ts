// ── Quest-Line Presets — one-tap concrete templates for parents ──
//
// These are fully pre-filled quest-lines aimed at 7-8 year olds. A parent taps
// a preset card in the Eltern-Bereich → a new quest-line is created on the
// spot with sensible beats, icons and XP. They can still edit afterwards.
//
// Separate from `questLineTemplates.ts` — that file holds the 4 category-level
// templates (Lernen/Ereignis/Fertigkeit/Hausaufgaben) which drive the *builder*
// flow. These presets are about removing friction: instead of picking a
// category and filling in a form, parents get recognisable real-life
// scenarios with a single tap.
//
// Tone: warm, simple, action-oriented German for 7-year-olds. No corporate
// phrasing, no adult abstractions, no em-dashes.

export interface QuestLineBeat {
  /** Local id — the install step reassigns unique IDs on instantiation. */
  id: string;
  title: string;
  /** Short child-facing description — what the beat actually means. */
  description: string;
  /** Emoji rendered as the beat's icon in Louis' quest-line view. */
  icon: string;
  /** XP reward for completing the beat. Higher for harder beats. */
  xp: number;
  /** Optional bespoke art for this beat (relative to BASE_URL).
   *  Used by QuestLineView to render a banner for "today's" beat.
   *  E.g. P_GEDICHT beats map to `art/quests/poem-day-1.webp` etc. */
  artFile?: string;
}

export interface QuestLinePreset {
  id: string;
  emoji: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  /** Which builder template this preset feeds into on save. Determines how
   *  Louis sees the beats: 'skill' = milestones (no schedule), 'daily' =
   *  one beat per day, 'event' = countdown to a target date. */
  templateId: 'learn' | 'event' | 'skill' | 'homework';
  /** Optional suggested lead time in days — currently unused by the simple
   *  one-tap install path but reserved for date-picker variants. */
  suggestedDurationDays?: number;
  /** Optional hero art shown on the preset card (relative to BASE_URL).
   *  When present the gallery uses it instead of the plain emoji tile. */
  heroImage?: string;
  beats: QuestLineBeat[];
}

// ── P1 — Schwimmen lernen ──
// Milestones, not days: the beat only gets ticked when the child actually
// manages it, however many pool visits that takes.
export const P_SCHWIMMEN: QuestLinePreset = {
  id: 'p_schwimmen',
  emoji: '🏊',
  title: { de: 'Schwimmen lernen', en: 'Learn to swim' },
  description: {
    de: 'Schritt für Schritt vom Plantschen bis zum richtigen Schwimmen.',
    en: 'Step by step from splashing around to real swimming.',
  },
  templateId: 'skill',
  beats: [
    { id: 'b1', icon: '💦', title: 'Wasser im Gesicht', description: 'Kurz mit dem Gesicht unter Wasser. Erst zählen, dann auftauchen.', xp: 10 },
    { id: 'b2', icon: '🫧', title: 'Untertauchen',      description: 'Ganz unter. Augen zu geht auch. Wieder auftauchen, lächeln.', xp: 15 },
    { id: 'b3', icon: '🏄', title: 'Gleiten mit Brett', description: 'Mit dem Schwimmbrett gleiten. Beine strampeln wie ein Frosch.', xp: 15 },
    { id: 'b4', icon: '🐸', title: 'Froschbeine',       description: 'Froschbeine ohne Brett. Erstmal am Rand halten.', xp: 20 },
    { id: 'b5', icon: '🌊', title: 'Kraulen 10 Meter',  description: 'Zehn Meter am Stück. Papa oder Mama zählen mit.', xp: 25 },
    { id: 'b6', icon: '🏅', title: 'Seepferdchen!',     description: 'Das Abzeichen ist deins. Wir sind so stolz.', xp: 40 },
  ],
};

// ── P2 — Schuhe binden lernen ──
// Replaced the older "Fahrrad ohne Stützräder" preset — Marc: a 7-year-old
// typically already rides without training wheels. Schuhe binden is the
// iconic 6-year-old milestone instead: real, concrete, universally relatable,
// and stays meaningful through 1st grade when shoes come off constantly
// (Sport, Hort, Schwimmen). Beats walk the loop from "Hasenohren" practice
// to wearing the tied shoes to school on your own.
export const P_SCHUHE: QuestLinePreset = {
  id: 'p_schuhe',
  emoji: '👟',
  title: { de: 'Schuhe binden lernen', en: 'Learn to tie your shoes' },
  description: {
    de: 'Vom ersten Hasenohr bis zur festen Schleife — Schritt für Schritt.',
    en: "From the first bunny ear to a tight bow — step by step.",
  },
  templateId: 'skill',
  beats: [
    { id: 'b1', icon: '🐰', title: 'Hasenohren formen',   description: 'Zwei Schlaufen formen. Wie zwei Hasenohren aus den Bändern.', xp: 10 },
    { id: 'b2', icon: '🔀', title: 'Überkreuzen',         description: 'Ein Hasenohr über das andere legen. Dann durchziehen.', xp: 15 },
    { id: 'b3', icon: '🪢', title: 'Stramm ziehen',       description: 'Beide Ohren ziehen bis die Schleife hält. Nicht zu fest!', xp: 15 },
    { id: 'b4', icon: '👟', title: 'Einen Schuh alleine', description: 'Einen Schuh ganz alleine binden. Mama oder Papa schaut nur zu.', xp: 20 },
    { id: 'b5', icon: '👟', title: 'Beide Schuhe',        description: 'Jetzt beide. Kein Doppelknoten — nur die Schleife.', xp: 25 },
    { id: 'b6', icon: '🎒', title: 'Zur Schule!',         description: 'Zuhause anziehen, Schleife binden, losgehen. Alles alleine.', xp: 40 },
  ],
};

// ── P6 — Gedicht lernen ──
// Re-surfaces the old 7-day poem quest as a parent-installable preset.
// Template 'learn' (homework-adjacent) since it's literal 1st-grade
// curriculum: one short practice per day, ramping to the big recital.
// Bespoke painterly art per beat — `art/quests/poem-day-N.webp` already
// shipped in the repo (Marc: "we had a really cool poem arc with art").
export const P_GEDICHT: QuestLinePreset = {
  id: 'p_gedicht',
  emoji: '🎤',
  title: { de: 'Gedicht lernen', en: 'Learn a poem' },
  description: {
    de: 'Jeden Tag ein bisschen üben. Am Ende ist das ganze Gedicht dran.',
    en: 'Practice a little every day. At the end you know the whole poem.',
  },
  templateId: 'learn',
  suggestedDurationDays: 7,
  heroImage: 'art/arc/poem/dragon-holding-poem.webp',
  beats: [
    { id: 'b1', icon: '📖', title: 'Gedicht lesen',          description: 'Mit Mama oder Papa einmal durchlesen. Was meint es?',         xp: 10, artFile: 'art/quests/poem-day-1.webp' },
    { id: 'b2', icon: '🗣️', title: 'Erste Strophe üben',     description: 'Die erste Strophe dreimal laut sprechen.',                    xp: 15, artFile: 'art/quests/poem-day-2.webp' },
    { id: 'b3', icon: '🌟', title: 'Zweite Strophe üben',    description: 'Jetzt die zweite Strophe. Auch dreimal laut.',                xp: 15, artFile: 'art/quests/poem-day-3.webp' },
    { id: 'b4', icon: '💪', title: 'Alles zusammen',          description: 'Das ganze Gedicht in einem Rutsch. Kleine Fehler sind okay.', xp: 20, artFile: 'art/quests/poem-day-4.webp' },
    { id: 'b5', icon: '🐉', title: 'Ronki vortragen',         description: 'Ronki ist dein bestes Publikum. Er hört genau zu.',           xp: 15, artFile: 'art/quests/poem-day-5.webp' },
    { id: 'b6', icon: '🎭', title: 'Generalprobe',            description: 'Ein letztes Mal durchgehen. Morgen ist der große Tag.',       xp: 20, artFile: 'art/quests/poem-day-6.webp' },
    { id: 'b7', icon: '🎤', title: 'Der große Tag!',          description: 'Vor der Klasse aufsagen. Du schaffst das.',                   xp: 40, artFile: 'art/quests/poem-day-7.webp' },
  ],
};

// ── P7 — Geburtstag kleiner Bruder ──
// For younger siblings — uses the bespoke painterly hero art we already
// have in public/art/birthday/. Beats mirror Omas Geburtstag but tuned for
// a little sibling (basteln + teilen + feiern, not a formal "Überraschung").
export const P_GESCHWISTER: QuestLinePreset = {
  id: 'p_geschwister_geburtstag',
  emoji: '🎈',
  title: { de: 'Geburtstag kleiner Bruder', en: 'Little brother\'s birthday' },
  description: {
    de: 'Etwas Liebes vorbereiten. Euer Tag zusammen — einfach schön.',
    en: 'Get something lovely ready. Your shared day — simply special.',
  },
  templateId: 'event',
  suggestedDurationDays: 5,
  heroImage: 'art/birthday/birthday-prep-little-brother.webp',
  beats: [
    { id: 'b1', icon: '💡', title: 'Was mag er?',           description: 'Überlege: welches Spielzeug? Welche Farbe? Welche Geschichte liebt er?', xp: 10 },
    { id: 'b2', icon: '🎨', title: 'Karte malen',           description: 'Eine Karte für den kleinen Bruder basteln. Herz drauf, Name drauf.', xp: 15 },
    { id: 'b3', icon: '🎁', title: 'Geschenk aussuchen',    description: 'Ein kleines Geschenk aus deinen Sachen. Oder mit Mama/Papa basteln.', xp: 15 },
    { id: 'b4', icon: '🎶', title: 'Lied üben',              description: '"Happy Birthday" üben. Laut singen macht ihn stolz.', xp: 10 },
    { id: 'b5', icon: '🎂', title: 'Feiern & schenken',      description: 'Kuchen, Lied, Geschenk übergeben. Umarmen nicht vergessen.', xp: 40 },
  ],
};

// ── P3 — Meerschweinchen-Referat ──
// Daily-ish beats building to a presentation day.
export const P_REFERAT: QuestLinePreset = {
  id: 'p_referat',
  emoji: '🐹',
  title: { de: 'Meerschweinchen-Referat', en: 'Guinea pig presentation' },
  description: {
    de: 'Für die Schule. Von Fakten sammeln bis zum Vortrag vor der Klasse.',
    en: 'For school. From gathering facts to presenting to the class.',
  },
  templateId: 'learn',
  suggestedDurationDays: 7,
  beats: [
    { id: 'b1', icon: '🔍', title: 'Fakten sammeln',    description: 'Was weißt du schon? Was willst du rausfinden? Buch oder Internet mit Mama/Papa.', xp: 10 },
    { id: 'b2', icon: '📝', title: 'Notizen schreiben', description: 'Die wichtigsten Sachen aufschreiben. Stichworte reichen.', xp: 10 },
    { id: 'b3', icon: '🎨', title: 'Plakat basteln',    description: 'Ein Bild malen oder ausdrucken. Überschriften dick schreiben.', xp: 15 },
    { id: 'b4', icon: '🗣️', title: 'Vortrag üben',      description: 'Zuhause einmal laut vortragen. Ronki hört zu.', xp: 15 },
    { id: 'b5', icon: '🪞', title: 'Vor dem Spiegel',   description: 'Nochmal üben. Diesmal langsam sprechen und lächeln.', xp: 15 },
    { id: 'b6', icon: '⭐', title: 'Referat halten!',    description: 'Du schaffst das. Deine Klasse hört dir zu.', xp: 40 },
  ],
};

// ── P4 — Omas Geburtstag ──
export const P_OMA: QuestLinePreset = {
  id: 'p_oma',
  emoji: '🎂',
  title: { de: 'Omas Geburtstag', en: "Grandma's birthday" },
  description: {
    de: 'Eine schöne Überraschung vorbereiten. Oma wird sich so freuen.',
    en: 'Prepare a lovely surprise. Grandma will be so happy.',
  },
  templateId: 'event',
  suggestedDurationDays: 7,
  beats: [
    { id: 'b1', icon: '💡', title: 'Idee fürs Geschenk', description: 'Was mag Oma gerne? Was könntest du ihr schenken?', xp: 10 },
    { id: 'b2', icon: '✂️', title: 'Karte basteln',      description: 'Papier falten, malen, etwas Liebes reinschreiben.', xp: 15 },
    { id: 'b3', icon: '🎶', title: 'Lied üben',          description: 'Ein Lied für Oma üben. Oder ein Gedicht aufsagen.', xp: 15 },
    { id: 'b4', icon: '🎁', title: 'Geschenk einpacken', description: 'Schön in Papier wickeln. Schleife drum.', xp: 10 },
    { id: 'b5', icon: '🎉', title: 'Überraschung!',      description: 'Oma besuchen. Lied singen. Geschenk übergeben.', xp: 40 },
  ],
};

// ── P5 — Zimmer aufräumen können ──
export const P_ZIMMER: QuestLinePreset = {
  id: 'p_zimmer',
  emoji: '🧹',
  title: { de: 'Zimmer aufräumen können', en: 'Tidying your room' },
  description: {
    de: 'In kleinen Schritten lernen, alleine Ordnung zu schaffen.',
    en: 'Learn to tidy up on your own, one small step at a time.',
  },
  templateId: 'skill',
  beats: [
    { id: 'b1', icon: '👟', title: 'Boden freiräumen',   description: 'Alles was am Boden liegt einsammeln. Das ist die erste Regel.', xp: 10 },
    { id: 'b2', icon: '👕', title: 'Kleidung sortieren', description: 'Schmutziges in die Wäsche. Sauberes in den Schrank.', xp: 15 },
    { id: 'b3', icon: '📚', title: 'Bücher einräumen',   description: 'Alle Bücher zurück ins Regal. Nebeneinander, nicht gestapelt.', xp: 10 },
    { id: 'b4', icon: '🧸', title: 'Spielzeug in Kisten', description: 'Jedes Spielzeug hat seine Kiste. Ronki passt in welche?', xp: 10 },
    { id: 'b5', icon: '🪶', title: 'Staub wischen',      description: 'Kurz mit dem Tuch über Regal und Tisch.', xp: 15 },
    { id: 'b6', icon: '✨', title: 'Ganz alleine!',      description: 'Einmal das ganze Zimmer aufräumen. Ohne dass Mama/Papa erinnert.', xp: 30 },
  ],
};

export const QUEST_LINE_PRESETS: QuestLinePreset[] = [
  P_SCHWIMMEN,
  P_SCHUHE,           // replaced P_FAHRRAD — Apr 2026 (too easy by 7yo)
  P_REFERAT,
  P_OMA,
  P_GESCHWISTER,      // sibling birthday with bespoke art
  P_GEDICHT,          // 7-day poem learning (re-surfaces legacy PoemQuest)
  P_ZIMMER,
];

export const PRESET_BY_ID: Map<string, QuestLinePreset> = new Map(
  QUEST_LINE_PRESETS.map(p => [p.id, p])
);

/** Convert a preset + language into the full QuestLine payload the
 *  TaskContext action `createQuestLine` expects. Centralised here so the
 *  dashboard UI stays thin and any shape changes ripple from one place. */
export function buildQuestLineFromPreset(
  preset: QuestLinePreset,
  lang: 'de' | 'en' = 'de',
) {
  const now = Date.now();
  const rand = () => Math.random().toString(36).slice(2, 7);
  return {
    id: `ql_${now.toString(36)}_${rand()}`,
    templateId: preset.templateId,
    title: preset.title[lang] ?? preset.title.de,
    emoji: preset.emoji,
    createdAt: new Date().toISOString(),
    days: preset.beats.map((b, i) => ({
      id: `qld_${now.toString(36)}_${i}_${rand()}`,
      dayNumber: i + 1,
      icon: b.icon,
      title: b.title,
      description: b.description,
      // Carry per-beat art through to the quest-line. QuestLineView
      // uses this to render a banner image for today's beat (e.g.
      // `poem-day-1.webp` for P_GEDICHT beat 1). Absent for beats
      // without bespoke art; the renderer falls back to the emoji tile.
      artFile: b.artFile,
      // Skill-template presets render beats as milestones; other templates
      // treat them as day-numbered beats. `isMilestone` lets the child-side
      // renderer pick the right label ("Meilenstein 2" vs "Tag 2").
      isMilestone: preset.templateId === 'skill',
    })),
    completedDayIds: [],
    completed: false,
  };
}

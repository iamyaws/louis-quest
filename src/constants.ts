// ═══ RONKI v1 — Constants (Heldenpunkte Edition) ═══

import type { Quest, Reward, ShopItem, RareDrop, ChestReward, WheelSegment, WeeklyMission, JournalQuestion, Badge, HeroTip, UnlockCondition, Belohnung } from './types';

export const T = {
  bg: "#FFF8F0", surface: "#FFF3E6", surfaceHigh: "#FFE8CC",
  card: "#FFFFFF", cardBorder: "1.5px solid rgba(0,0,0,0.05)",
  primary: "#6D28D9", primaryLight: "#A78BFA", primaryPale: "#EDE9FE",
  accent: "#FCD34D", accentDark: "#F59E0B",
  success: "#34D399", successDark: "#059669",
  teal: "#0EA5E9", tealDark: "#0284C7",
  danger: "#F87171",
  textPrimary: "#1E1B4B", textSecondary: "#64748B", textLight: "#94A3B8", white: "#FFFFFF",
} as const;

export const HERO_SHAPES = ["cube", "circle", "hex", "pill"] as const;
export const HERO_COLORS = ["#6D28D9", "#0EA5E9", "#F97316", "#EF4444", "#34D399", "#F59E0B", "#EC4899", "#475569"] as const;
export const HERO_EYES = ["round", "happy", "cool", "big"] as const;
export const HERO_HAIRS = ["short", "spiky", "curly", "long", "cap", "none"] as const;

export const CAT_VARIANTS: Record<string, { name: string; col: string; ear: string; stripes: boolean; desc: string }> = {
  tiger: { name: "Tiger", col: "#F97316", ear: "#FED7AA", stripes: true, desc: "Mutig wie ein Tiger!" },
  shadow: { name: "Schatten", col: "#475569", ear: "#94A3B8", stripes: false, desc: "Geheimnisvoll & schnell!" },
  snow: { name: "Schnee", col: "#E2E8F0", ear: "#FCA5A5", stripes: false, desc: "Flauschig wie Schnee!" },
  galaxy: { name: "Galaxie", col: "#7C3AED", ear: "#DDD6FE", stripes: false, desc: "Magisch & voller Kraft!" },
  golden: { name: "Gold", col: "#F59E0B", ear: "#FEF3C7", stripes: false, desc: "Strahlt wie die Sonne!" },
  calico: { name: "Gl\u00FCckskatze", col: "#F97316", ear: "#FED7AA", stripes: true, desc: "Bringt Gl\u00FCck!" },
  black: { name: "Panther", col: "#1E293B", ear: "#475569", stripes: false, desc: "Elegant und geheimnisvoll!" },
  siamese: { name: "Siam", col: "#FEF3C7", ear: "#D4A574", stripes: false, desc: "Edel und klug!" },
  tabby: { name: "Tabby", col: "#A3724A", ear: "#D4A574", stripes: true, desc: "Gem\u00FCtlich und lieb!" },
};

export const SCHOOL_QUESTS: Omit<Quest, 'done' | 'streak'>[] = [
  { id: "s1", name: "Gesicht waschen", icon: "\u{1F9FC}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "s2", name: "Bett machen", icon: "\u{1F6CF}\uFE0F", anchor: "morning", xp: 15, minutes: 4 },
  { id: "s3", name: "Z\u00E4hne putzen", icon: "\u{1FAA5}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "s4", name: "Anziehen", icon: "\u{1F455}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "s5", name: "Schultasche packen", icon: "\u{1F392}", anchor: "morning", xp: 15, minutes: 4 },
  { id: "s6", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "morning", xp: 10, minutes: 2 },
  { id: "s6b", name: "Sonnencreme auftragen", icon: "\u2600\uFE0F", anchor: "morning", xp: 10, minutes: 2 },
  { id: "s7", name: "Hausaufgaben", icon: "\u{1F4DA}", anchor: "afternoon", xp: 25, minutes: 8 },
  { id: "s8", name: "5 Min lesen", icon: "\u{1F4D6}", anchor: "afternoon", xp: 20, minutes: 5 },
  { id: "s9", name: "Zimmer aufr\u00E4umen", icon: "\u{1F9F9}", anchor: "afternoon", xp: 20, minutes: 6 },
  { id: "s10", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "afternoon", xp: 10, minutes: 2 },
  { id: "s11", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "evening", xp: 10, minutes: 2 },
  { id: "s12", name: "Z\u00E4hne putzen", icon: "\u{1FAA5}", anchor: "evening", xp: 10, minutes: 3 },
  { id: "s13", name: "Gesicht reinigen", icon: "\u{1F9F4}", anchor: "evening", xp: 10, minutes: 3 },
  { id: "s14", name: "Creme auftragen", icon: "\u2728", anchor: "evening", xp: 10, minutes: 2 },
  { id: "s15", name: "Pyjama anziehen", icon: "\u{1F319}", anchor: "evening", xp: 10, minutes: 2 },
];

export const VACATION_QUESTS: Omit<Quest, 'done' | 'streak'>[] = [
  { id: "v1", name: "Gesicht waschen", icon: "\u{1F9FC}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "v2", name: "Bett machen", icon: "\u{1F6CF}\uFE0F", anchor: "morning", xp: 15, minutes: 4 },
  { id: "v3", name: "Z\u00E4hne putzen", icon: "\u{1FAA5}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "v4", name: "Anziehen", icon: "\u{1F455}", anchor: "morning", xp: 10, minutes: 3 },
  { id: "v5", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "morning", xp: 10, minutes: 2 },
  { id: "v5b", name: "Sonnencreme auftragen", icon: "\u2600\uFE0F", anchor: "morning", xp: 10, minutes: 2 },
  { id: "v6", name: "5 Min lesen", icon: "\u{1F4D6}", anchor: "afternoon", xp: 20, minutes: 5 },
  { id: "v7", name: "Zimmer aufr\u00E4umen", icon: "\u{1F9F9}", anchor: "afternoon", xp: 15, minutes: 5 },
  { id: "v8", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "afternoon", xp: 10, minutes: 2 },
  { id: "v9", name: "Geschirr einr\u00E4umen", icon: "\u{1F37D}\uFE0F", anchor: "evening", xp: 10, minutes: 2 },
  { id: "v10", name: "Z\u00E4hne putzen", icon: "\u{1FAA5}", anchor: "evening", xp: 10, minutes: 3 },
  { id: "v11", name: "Gesicht reinigen", icon: "\u{1F9F4}", anchor: "evening", xp: 10, minutes: 3 },
  { id: "v12", name: "Creme auftragen", icon: "\u2728", anchor: "evening", xp: 10, minutes: 2 },
  { id: "v13", name: "Pyjama anziehen", icon: "\u{1F319}", anchor: "evening", xp: 10, minutes: 2 },
];

export const FOOTBALL: Omit<Quest, 'done' | 'streak'> = { id: "ft", name: "Fu\u00DFball Training", icon: "\u26BD", anchor: "afternoon", xp: 30, minutes: 10 };

export const REWARDS: Reward[] = [
  { id: "r1", name: "H\u00F6rspiel h\u00F6ren", icon: "\u{1F3A7}", minutes: 30 },
  { id: "r2", name: "Videospiel spielen", icon: "\u{1F3AE}", minutes: 15 },
  { id: "r3", name: "Serie schauen", icon: "\u{1F4FA}", minutes: 25 },
  { id: "r4", name: "Film schauen", icon: "\u{1F3AC}", minutes: 60 },
  { id: "r5", name: "S\u00FC\u00DFigkeit", icon: "\u{1F36C}", minutes: 40 },
];

export const RAINBOW = ["\u{1F534}", "\u{1F7E0}", "\u{1F7E1}", "\u{1F7E2}", "\u{1F535}", "\u{1F7E3}"] as const;
export const RAINBOW_LABELS = ["Rot", "Orange", "Gelb", "Gr\u00FCn", "Blau", "Lila"] as const;
export const RAINBOW_EXAMPLES = ["Tomate, Erdbeere", "Karotte, Orange", "Banane, Paprika", "Brokkoli, Gurke", "Blaubeere", "Traube, Aubergine"] as const;
export const MOOD_EMOJIS = ["\u{1F622}", "\u{1F615}", "\u{1F610}", "\u{1F642}", "\u{1F60A}", "\u{1F929}"] as const;

export const SHOP_ITEMS: Record<string, ShopItem[]> = {
  hero: [
    { id: "h_sunglasses", name: "Sonnenbrille", icon: "\u{1F576}\uFE0F", cost: 120, type: "hero" },
    { id: "h_cape_red", name: "Roter Umhang", icon: "\u{1F9B8}", cost: 200, type: "hero" },
    { id: "h_headband", name: "Stirnband", icon: "\u{1F3BD}", cost: 80, type: "hero" },
    { id: "h_wings", name: "Fl\u00FCgel", icon: "\u{1FABD}", cost: 350, type: "hero" },
  ],
  cat: [
    { id: "c_bowtie", name: "Fliege", icon: "\u{1F380}", cost: 80, type: "cat" },
    { id: "c_collar", name: "Halsband", icon: "\u{1F4FF}", cost: 100, type: "cat" },
    { id: "c_crown", name: "Krone", icon: "\u{1F451}", cost: 250, type: "cat" },
    { id: "c_scarf", name: "Schal", icon: "\u{1F9E3}", cost: 90, type: "cat" },
  ],
  room: [
    { id: "rm_poster", name: "Poster", icon: "\u{1F5BC}\uFE0F", cost: 150, type: "room" },
    { id: "rm_plant", name: "Pflanze", icon: "\u{1FAB4}", cost: 100, type: "room" },
    { id: "rm_lamp", name: "Schreibtischlampe", icon: "\u{1FA94}", cost: 200, type: "room" },
    { id: "rm_rug", name: "Teppich", icon: "\u{1F7EA}", cost: 180, type: "room" },
    { id: "rm_trophy", name: "Pokal", icon: "\u{1F3C6}", cost: 300, type: "room" },
    { id: "rm_map", name: "Weltkarte", icon: "\u{1F5FA}\uFE0F", cost: 120, type: "room" },
    { id: "rm_fairy", name: "Lichterkette", icon: "\u2728", cost: 160, type: "room" },
    { id: "rm_computer", name: "Computer", icon: "\u{1F4BB}", cost: 250, type: "room" },
    { id: "rm_globe", name: "Globus", icon: "\u{1F30D}", cost: 130, type: "room" },
    { id: "rm_figure", name: "Actionfigur", icon: "\u{1F9B8}", cost: 90, type: "room" },
    { id: "rm_stars", name: "Leuchtsterne", icon: "\u2B50", cost: 180, type: "room" },
    { id: "rm_skateboard", name: "Skateboard", icon: "\u{1F6F9}", cost: 110, type: "room" },
    { id: "rm_fish", name: "Aquarium", icon: "\u{1F420}", cost: 220, type: "room" },
  ],
};

// ── Heldenpunkte rewards (unified — no more separate XP/coins) ──

export const RARE_DROPS: RareDrop[] = [
  { type: "hp", amount: 25, label: "+25 Bonus-HP!", icon: "\u2B50" },
  { type: "hp", amount: 40, label: "+40 Bonus-HP!", icon: "\u{1F4AB}" },
  { type: "hp", amount: 30, label: "+30 Bonus-HP!", icon: "\u2728" },
  { type: "minutes", amount: 5, label: "+5 Bonus-Minuten!", icon: "\u23F0" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F984}", icon: "\u{1F984}", id: "emoji_unicorn" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F432}", icon: "\u{1F432}", id: "emoji_dragon" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F308}", icon: "\u{1F308}", id: "emoji_rainbow" },
];

export const CHEST_REWARDS: ChestReward[] = [
  { type: "hp", amount: 100, label: "100 Heldenpunkte!", icon: "\u2B50" },
  { type: "hp", amount: 150, label: "150 Heldenpunkte!", icon: "\u{1F4AB}" },
  { type: "hp", amount: 75, label: "75 Bonus-HP!", icon: "\u26A1" },
  { type: "item", id: "c_crown", label: "Katzenkrone!", icon: "\u{1F451}" },
  { type: "item", id: "h_wings", label: "Heldenfl\u00FCgel!", icon: "\u{1FABD}" },
  { type: "item", id: "rm_trophy", label: "Goldpokal!", icon: "\u{1F3C6}" },
  { type: "minutes", amount: 15, label: "+15 Bonus-Minuten!", icon: "\u23F0" },
  { type: "xpboost", label: "Doppel-Power morgen!", icon: "\u{1F525}" },
];

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { type: "hp", amount: 30, label: "+30 HP", icon: "\u2B50", color: "#FCD34D" },
  { type: "hp", amount: 25, label: "+25 HP", icon: "\u{1F4AB}", color: "#A78BFA" },
  { type: "minutes", amount: 5, label: "+5 Min", icon: "\u23F0", color: "#34D399" },
  { type: "hp", amount: 50, label: "+50 HP", icon: "\u{1F31F}", color: "#FB923C" },
  { type: "hp", amount: 40, label: "+40 HP", icon: "\u26A1", color: "#60A5FA" },
  { type: "rare", label: "Seltener Fund!", icon: "\u{1F381}", color: "#EC4899" },
];

export const CHEST_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100] as const;
export const RARE_DROP_CHANCE = 0.12;
export const MAX_MONTHLY_FREEZES = 2;

export const WEEKLY_MISSIONS: WeeklyMission[] = [
  { id: "wm1", title: "Sternenj\u00E4ger", story: "Rocket hat einen Stern verloren! Schaffe 5 Tage alle Aufgaben um ihn zu finden.", goal: "allDone5", target: 5, reward: { type: "hp", amount: 200 }, icon: "\u2B50" },
  { id: "wm2", title: "Regenbogen-Woche", story: "Esse diese Woche jeden Tag alle Farben des Regenbogens!", goal: "rainbow5", target: 5, reward: { type: "hp", amount: 150 }, icon: "\u{1F308}" },
  { id: "wm3", title: "B\u00FCcherwurm", story: "Lies diese Woche jeden Tag! Dein Held wird kl\u00FCger!", goal: "read7", target: 7, reward: { type: "hp", amount: 100 }, icon: "\u{1F4D6}" },
  { id: "wm4", title: "Fr\u00FChaufsteher", story: "Schaffe 5 Tage alle Morgen-Aufgaben vor dem Mittagessen!", goal: "allMorning5", target: 5, reward: { type: "hp", amount: 175 }, icon: "\u{1F305}" },
  { id: "wm5", title: "Sauberheld", story: "Schaffe 7 Tage deine Abend-Pflege komplett!", goal: "allEvening7", target: 7, reward: { type: "hp", amount: 80 }, icon: "\u2728" },
  { id: "wm6", title: "Fu\u00DFball-Star", story: "Geh diese Woche zu allen Trainings!", goal: "football2", target: 2, reward: { type: "hp", amount: 120 }, icon: "\u26BD" },
];

export const GRADUATION_THRESHOLD = 30;

export const CAT_STAGES: import('./types').CatStageInfo[] = [
  { name: "K\u00E4tzchen", threshold: 0, emoji: "\u{1F431}", desc: "Klein aber fein!" },
  { name: "Jungkatze", threshold: 25, emoji: "\u{1F63A}", desc: "W\u00E4chst und gedeiht!" },
  { name: "Katze", threshold: 75, emoji: "\u{1F638}", desc: "Stark und geschickt!" },
  { name: "Prachtkatze", threshold: 150, emoji: "\u{1F63B}", desc: "Wundersch\u00F6n!" },
  { name: "Legend\u00E4r", threshold: 300, emoji: "\u{1F451}", desc: "Eine Legende!" },
];

export const BOSSES: import('./types').BossTemplate[] = [
  { id: "b1", name: "Schlaf-Drache", icon: "\u{1F409}", hp: 80, reward: { hp: 50 }, desc: "Er will, dass du den ganzen Tag schl\u00E4fst!" },
  { id: "b2", name: "Chaos-Monster", icon: "\u{1F47E}", hp: 100, reward: { hp: 60 }, desc: "Es liebt Unordnung und Chaos!" },
  { id: "b3", name: "Faulheits-Troll", icon: "\u{1F9CC}", hp: 90, reward: { hp: 55 }, desc: "Er will, dass du nur auf dem Sofa liegst!" },
  { id: "b4", name: "Vergesslichkeits-Geist", icon: "\u{1F47B}", hp: 110, reward: { hp: 65 }, desc: "Er l\u00E4sst dich alles vergessen!" },
  { id: "b5", name: "Mecker-Goblin", icon: "\u{1F47A}", hp: 85, reward: { hp: 50 }, desc: "Er meckert \u00FCber alles und jeden!" },
  { id: "b6", name: "Bildschirm-Krake", icon: "\u{1F419}", hp: 95, reward: { hp: 55 }, desc: "Will dich den ganzen Tag am Bildschirm festhalten!" },
];

export const ANCHORS: Record<string, { label: string; icon: string; col: string }> = {
  morning: { label: "Morgens", icon: "\u{1F305}", col: "#F97316" },
  afternoon: { label: "Nachmittags", icon: "\u2600\uFE0F", col: "#0EA5E9" },
  evening: { label: "Abends", icon: "\u{1F319}", col: "#6D28D9" },
};

export const LVL = [0, 50, 120, 220, 360, 550, 800, 1100, 1500, 2000, 2600, 3300, 4100, 5000, 6000, 7200] as const;

export const BADGES: Badge[] = [
  { i: "\u{1F31F}", n: "Erster Tag" },
  { i: "\u{1F525}", n: "3-Tage" },
  { i: "\u26A1", n: "7-Tage" },
  { i: "\u{1F451}", n: "Level 5" },
  { i: "\u{1F3AF}", n: "50 Aufgaben" },
  { i: "\u{1F48E}", n: "Level 10" },
  { i: "\u{1F3F0}", n: "30 Tage" },
  { i: "\u{1F409}", n: "100 Aufgaben" },
  { i: "\u{1F431}", n: "Sammler" },
];

export const OB_REWARDS = [
  null,
  { hp: 50, text: "+50 Heldenpunkte!", icon: "\u2B50" },
  { hp: 80, text: "Level 2! +80 HP", icon: "\u26A1" },
  { hp: 40, text: "+40 Heldenpunkte!", icon: "\u{1F381}" },
  { hp: 100, text: "Level 3! +100 HP", icon: "\u26A1" },
  { hp: 100, text: "+100 Start-HP!", icon: "\u{1F4AB}" },
  { hp: 0, text: "", icon: "" },
  { hp: 0, text: "", icon: "" },
  { hp: 150, text: "Sidekick! Level 4!", icon: "\u{1F431}" },
  { hp: 80, text: "+80 Heldenpunkte!", icon: "\u2B50" },
] as const;

export const JOURNAL_QUESTIONS: JournalQuestion[] = [
  {
    id: "best", q: "Was war heute das Beste?", opts: [
      { v: "school", l: "\u{1F3EB} Schule" }, { v: "friends", l: "\u{1F46B} Freunde" }, { v: "sport", l: "\u26BD Sport" },
      { v: "family", l: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466} Familie" }, { v: "play", l: "\u{1F3AE} Spielen" }, { v: "food", l: "\u{1F355} Essen" }, { v: "learn", l: "\u{1F4DA} Gelernt" },
    ]
  },
  {
    id: "proud", q: "Worauf bist du stolz?", opts: [
      { v: "tasks", l: "\u2705 Alle Aufgaben" }, { v: "helped", l: "\u{1F91D} Geholfen" }, { v: "hard", l: "\u{1F4AA} Was Schwieriges" },
      { v: "brave", l: "\u{1F981} Mutig" }, { v: "patient", l: "\u{1F9D8} Geduldig" }, { v: "new", l: "\u{1F31F} Was Neues" },
    ]
  },
  {
    id: "school", q: "Wie war die Schule?", opts: [
      { v: "super", l: "\u{1F929} Super" }, { v: "good", l: "\u{1F60A} Gut" }, { v: "ok", l: "\u{1F610} Ok" }, { v: "meh", l: "\u{1F615} Naja" },
    ]
  },
  {
    id: "tomorrow", q: "Was nimmst du dir morgen vor?", opts: [
      { v: "read", l: "\u{1F4D6} Mehr lesen" }, { v: "move", l: "\u{1F3C3} Mehr bewegen" }, { v: "friends", l: "\u{1F46B} Freunde treffen" },
      { v: "try", l: "\u{1F31F} Was Neues" }, { v: "create", l: "\u{1F3A8} Kreativ sein" }, { v: "kind", l: "\u{1F49B} Nett sein" },
    ]
  },
];

// ═══ NEW: Helden-Tipp (Daily Hero Tips) ═══

export const HERO_TIPS: HeroTip[] = [
  { char: "Sonic", emoji: "\u{1F994}", tip: "Auch wenn's schwer wird \u2014 bleib dran und gib nicht auf!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Jeder gro\u00DFe Held f\u00E4ngt mit einem kleinen Sprung an!" },
  { char: "Ash", emoji: "\u26A1", tip: "Mit jedem Tag wirst du ein bisschen st\u00E4rker!" },
  { char: "Goku", emoji: "\u{1F409}", tip: "\u00DCbung macht den Meister \u2014 gib immer dein Bestes!" },
  { char: "Sonic", emoji: "\u{1F994}", tip: "Schnelligkeit allein reicht nicht \u2014 Mut z\u00E4hlt mehr!" },
  { char: "Pikachu", emoji: "\u26A1", tip: "Kleine Schritte f\u00FChren zu gro\u00DFen Abenteuern!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Fehler machen ist okay \u2014 wichtig ist, dass du weitermachst!" },
  { char: "Xander", emoji: "\u{1F300}", tip: "Ein echter Champion trainiert jeden Tag!" },
  { char: "Ash", emoji: "\u26A1", tip: "Zusammen mit Freunden ist alles leichter!" },
  { char: "Sonic", emoji: "\u{1F994}", tip: "Heute ist ein guter Tag, um etwas Tolles zu schaffen!" },
  { char: "Link", emoji: "\u{1F5E1}\uFE0F", tip: "Mutig sein hei\u00DFt nicht, keine Angst zu haben \u2014 sondern trotzdem loszugehen!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Hilf anderen \u2014 so wirst du zum echten Helden!" },
  { char: "Goku", emoji: "\u{1F409}", tip: "Jede Herausforderung macht dich st\u00E4rker!" },
  { char: "Pikachu", emoji: "\u26A1", tip: "Glaub an dich \u2014 du kannst mehr als du denkst!" },
  { char: "Xander", emoji: "\u{1F300}", tip: "Geduld ist die st\u00E4rkste Superkraft!" },
  { char: "Ash", emoji: "\u26A1", tip: "Ein neuer Tag, ein neues Abenteuer \u2014 los geht's!" },
  { char: "Sonic", emoji: "\u{1F994}", tip: "Sei nett zu anderen \u2014 das ist wahre St\u00E4rke!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Auch kleine Helden k\u00F6nnen Gro\u00DFes bewirken!" },
  { char: "Link", emoji: "\u{1F5E1}\uFE0F", tip: "Jeder Held braucht auch mal eine Pause!" },
  { char: "Goku", emoji: "\u{1F409}", tip: "Wer nie aufgibt, gewinnt am Ende immer!" },
  { char: "Pikachu", emoji: "\u26A1", tip: "Lachen ist die beste Medizin \u2014 hab Spa\u00DF heute!" },
  { char: "Xander", emoji: "\u{1F300}", tip: "Dein Bestes zu geben ist immer genug!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Jeder Tag ist eine Chance, besser zu werden!" },
  { char: "Sonic", emoji: "\u{1F994}", tip: "Vergiss nicht: Du bist einzigartig und toll!" },
  { char: "Ash", emoji: "\u26A1", tip: "Probiere heute etwas Neues aus!" },
  { char: "Goku", emoji: "\u{1F409}", tip: "Starke Helden helfen den Schw\u00E4cheren!" },
  { char: "Link", emoji: "\u{1F5E1}\uFE0F", tip: "Manchmal ist der mutigste Schritt der erste!" },
  { char: "Pikachu", emoji: "\u26A1", tip: "Sei stolz auf das, was du heute geschafft hast!" },
  { char: "Mario", emoji: "\u{1F344}", tip: "Zusammen ist man weniger allein \u2014 sei ein guter Freund!" },
  { char: "Xander", emoji: "\u{1F300}", tip: "Der Weg ist das Ziel \u2014 genie\u00DF jeden Schritt!" },
];

// ═══ NEW: Unlock Conditions (passive item unlocks) ═══

export const UNLOCK_CONDITIONS: Record<string, UnlockCondition> = {
  // Hero items
  h_sunglasses: { type: "streak", value: 3, label: "3-Tage Streak", icon: "\u{1F525}" },
  h_cape_red: { type: "boss", value: 1, label: "1 Boss besiegt", icon: "\u2694\uFE0F" },
  h_headband: { type: "tasks", value: 25, label: "25 Aufgaben", icon: "\u2705" },
  h_wings: { type: "streak", value: 30, label: "30-Tage Streak", icon: "\u{1F525}" },
  // Cat items
  c_bowtie: { type: "catStage", value: 1, label: "Katze: Jungkatze", icon: "\u{1F431}" },
  c_collar: { type: "catStage", value: 2, label: "Katze: Katze", icon: "\u{1F638}" },
  c_crown: { type: "catStage", value: 4, label: "Katze: Legend\u00E4r", icon: "\u{1F451}" },
  c_scarf: { type: "weeklyMission", value: 3, label: "3 Wochen-Missionen", icon: "\u{1F3AF}" },
  // Room items
  rm_poster: { type: "tasks", value: 10, label: "10 Aufgaben", icon: "\u2705" },
  rm_plant: { type: "streak", value: 5, label: "5-Tage Streak", icon: "\u{1F525}" },
  rm_lamp: { type: "tasks", value: 30, label: "30 Aufgaben", icon: "\u2705" },
  rm_rug: { type: "streak", value: 7, label: "7-Tage Streak", icon: "\u{1F525}" },
  rm_trophy: { type: "boss", value: 3, label: "3 Bosse besiegt", icon: "\u2694\uFE0F" },
  rm_map: { type: "tasks", value: 50, label: "50 Aufgaben", icon: "\u2705" },
  rm_fairy: { type: "streak", value: 14, label: "14-Tage Streak", icon: "\u{1F525}" },
  rm_computer: { type: "tasks", value: 100, label: "100 Aufgaben", icon: "\u2705" },
  rm_globe: { type: "weeklyMission", value: 5, label: "5 Wochen-Missionen", icon: "\u{1F3AF}" },
  rm_figure: { type: "boss", value: 2, label: "2 Bosse besiegt", icon: "\u2694\uFE0F" },
  rm_stars: { type: "streak", value: 21, label: "21-Tage Streak", icon: "\u{1F525}" },
  rm_skateboard: { type: "catStage", value: 3, label: "Katze: Prachtkatze", icon: "\u{1F63B}" },
  rm_fish: { type: "weeklyMission", value: 8, label: "8 Wochen-Missionen", icon: "\u{1F3AF}" },
};

// ═══ NEW: Default Belohnungen (parent can customize) ═══

export const DEFAULT_BELOHNUNGEN: Belohnung[] = [
  { id: "bel_game20", name: "20 Min Videospiel", emoji: "\u{1F3AE}", cost: 30, active: true },
  { id: "bel_tv30", name: "30 Min Serie/Film", emoji: "\u{1F4FA}", cost: 40, active: true },
  { id: "bel_candy", name: "S\u00FC\u00DFigkeit", emoji: "\u{1F36C}", cost: 15, active: true },
  { id: "bel_movie", name: "Filmabend", emoji: "\u{1F3AC}", cost: 60, active: true },
  { id: "bel_trip", name: "Besonderer Ausflug", emoji: "\u{1F3A2}", cost: 100, active: true },
];

// ═══ Companion Types & Variants ═══

export const COMPANION_TYPES: Record<string, { name: string; emoji: string; desc: string }> = {
  cat: { name: "Katze", emoji: "\u{1F431}", desc: "Treu und verschmust!" },
  dragon: { name: "Drache", emoji: "\u{1F409}", desc: "Mutig und feurig!" },
  wolf: { name: "Wolf", emoji: "\u{1F43A}", desc: "Stark und klug!" },
  phoenix: { name: "Ph\u00F6nix", emoji: "\u{1F985}", desc: "Magisch und strahlend!" },
};

export const DRAGON_VARIANTS: Record<string, { col: string; belly: string; wing: string; horn: string; name: string; desc: string }> = {
  fire: { col: "#EF4444", belly: "#FEE2E2", wing: "#DC2626", horn: "#92400E", name: "Feuerdrache", desc: "Hei\u00DF und mutig!" },
  ice: { col: "#38BDF8", belly: "#E0F2FE", wing: "#0284C7", horn: "#CBD5E1", name: "Eisdrache", desc: "K\u00FChl und weise!" },
  shadow: { col: "#6D28D9", belly: "#EDE9FE", wing: "#4C1D95", horn: "#1E1B4B", name: "Schattendrache", desc: "Geheimnisvoll!" },
  gold: { col: "#F59E0B", belly: "#FEF3C7", wing: "#D97706", horn: "#78350F", name: "Golddrache", desc: "Strahlend und edel!" },
};

export const WOLF_VARIANTS: Record<string, { col: string; belly: string; ear: string; tail: string; name: string; desc: string }> = {
  forest: { col: "#65A30D", belly: "#ECFCCB", ear: "#A3E635", tail: "#4D7C0F", name: "Waldwolf", desc: "Flink und schlau!" },
  snow: { col: "#E2E8F0", belly: "#F8FAFC", ear: "#CBD5E1", tail: "#94A3B8", name: "Schneewolf", desc: "Sanft wie Schnee!" },
  night: { col: "#1E3A5F", belly: "#BFDBFE", ear: "#3B82F6", tail: "#1E40AF", name: "Nachtwolf", desc: "Stark und still!" },
  fire: { col: "#EA580C", belly: "#FED7AA", ear: "#F97316", tail: "#C2410C", name: "Feuerwolf", desc: "Wild und warm!" },
};

export const PHOENIX_VARIANTS: Record<string, { col: string; chest: string; wing: string; tail: string; glow: string; name: string; desc: string }> = {
  sun: { col: "#F59E0B", chest: "#FEF3C7", wing: "#DC2626", tail: "#EF4444", glow: "#FCD34D", name: "Sonnenph\u00F6nix", desc: "Warm und leuchtend!" },
  storm: { col: "#3B82F6", chest: "#DBEAFE", wing: "#1D4ED8", tail: "#6366F1", glow: "#93C5FD", name: "Sturmph\u00F6nix", desc: "Schnell wie der Blitz!" },
  rose: { col: "#EC4899", chest: "#FCE7F3", wing: "#DB2777", tail: "#F472B6", glow: "#FBCFE8", name: "Rosenph\u00F6nix", desc: "Anmutig und sch\u00F6n!" },
  star: { col: "#7C3AED", chest: "#EDE9FE", wing: "#5B21B6", tail: "#8B5CF6", glow: "#C4B5FD", name: "Sternph\u00F6nix", desc: "Voller Magie!" },
};

export const SKIN_TONES = ["#FDEBD0", "#F5D0B0", "#D4A574", "#A0785A", "#6B4226"] as const;
export const HAIR_COLORS = ["#5B3A1A", "#1E1B4B", "#F59E0B", "#DC2626", "#3B82F6", "#7C3AED", "#EC4899", "#E2E8F0"] as const;

export const EGG_TYPES: Record<string, { col1: string; col2: string; pattern: string; name: string }> = {
  dragon: { col1: "#EF4444", col2: "#FCD34D", pattern: "flame", name: "Feuer-Ei" },
  wolf: { col1: "#64748B", col2: "#E2E8F0", pattern: "paw", name: "Mond-Ei" },
  phoenix: { col1: "#F59E0B", col2: "#FEF3C7", pattern: "feather", name: "Sonnen-Ei" },
};

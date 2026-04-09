// ═══ HERODEX v3 — Constants ═══

export const T = {
  bg: "#FFF8F0", surface: "#FFF3E6", surfaceHigh: "#FFE8CC",
  card: "#FFFBF5", cardBorder: "1.5px solid rgba(0,0,0,0.05)",
  primary: "#6D28D9", primaryLight: "#A78BFA", primaryPale: "#EDE9FE",
  accent: "#FCD34D", accentDark: "#F59E0B",
  success: "#34D399", successDark: "#059669",
  teal: "#0EA5E9", tealDark: "#0284C7",
  danger: "#F87171",
  textPrimary: "#1E1B4B", textSecondary: "#64748B", textLight: "#94A3B8", white: "#FFFFFF",
};

export const HERO_SHAPES = ["cube", "circle", "hex", "pill"];
export const HERO_COLORS = ["#6D28D9", "#0EA5E9", "#F97316", "#EF4444", "#34D399", "#F59E0B", "#EC4899", "#475569"];
export const HERO_EYES = ["round", "happy", "cool", "big"];
export const HERO_HAIRS = ["short", "spiky", "curly", "long", "cap", "none"];

export const CAT_VARIANTS = {
  tiger: { name: "Tiger", col: "#F97316", ear: "#FED7AA", stripes: true, desc: "Mutig wie ein Tiger!" },
  shadow: { name: "Schatten", col: "#475569", ear: "#94A3B8", stripes: false, desc: "Geheimnisvoll & schnell!" },
  snow: { name: "Schnee", col: "#E2E8F0", ear: "#FCA5A5", stripes: false, desc: "Flauschig wie Schnee!" },
  galaxy: { name: "Galaxie", col: "#7C3AED", ear: "#DDD6FE", stripes: false, desc: "Magisch & voller Kraft!" },
  golden: { name: "Gold", col: "#F59E0B", ear: "#FEF3C7", stripes: false, desc: "Strahlt wie die Sonne!" },
};

export const SCHOOL_QUESTS = [
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

export const VACATION_QUESTS = [
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

export const FOOTBALL = { id: "ft", name: "Fu\u00DFball Training", icon: "\u26BD", anchor: "afternoon", xp: 30, minutes: 10 };

export const REWARDS = [
  { id: "r1", name: "H\u00F6rspiel h\u00F6ren", icon: "\u{1F3A7}", minutes: 30 },
  { id: "r2", name: "Videospiel spielen", icon: "\u{1F3AE}", minutes: 15 },
  { id: "r3", name: "Serie schauen", icon: "\u{1F4FA}", minutes: 25 },
  { id: "r4", name: "Film schauen", icon: "\u{1F3AC}", minutes: 60 },
  { id: "r5", name: "S\u00FC\u00DFigkeit", icon: "\u{1F36C}", minutes: 40 },
];

export const RAINBOW = ["\u{1F534}", "\u{1F7E0}", "\u{1F7E1}", "\u{1F7E2}", "\u{1F535}", "\u{1F7E3}"];
export const RAINBOW_LABELS = ["Rot", "Orange", "Gelb", "Gr\u00FCn", "Blau", "Lila"];
export const RAINBOW_EXAMPLES = ["Tomate, Erdbeere", "Karotte, Orange", "Banane, Paprika", "Brokkoli, Gurke", "Blaubeere", "Traube, Aubergine"];
export const MOOD_EMOJIS = ["\u{1F622}", "\u{1F615}", "\u{1F610}", "\u{1F642}", "\u{1F60A}", "\u{1F929}"];

export const SHOP_ITEMS = {
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
    { id: "rm_lamp", name: "Lavalampe", icon: "\u{1FA94}", cost: 200, type: "room" },
    { id: "rm_rug", name: "Teppich", icon: "\u{1F7EA}", cost: 180, type: "room" },
    { id: "rm_trophy", name: "Pokal", icon: "\u{1F3C6}", cost: 300, type: "room" },
  ],
};

export const RARE_DROPS = [
  { type: "coins", amount: 25, label: "+25 Bonus-M\u00FCnzen!", icon: "\u{1FA99}" },
  { type: "coins", amount: 40, label: "+40 Bonus-M\u00FCnzen!", icon: "\u{1F4B0}" },
  { type: "xp", amount: 20, label: "+20 Bonus-XP!", icon: "\u26A1" },
  { type: "xp", amount: 35, label: "+35 Bonus-XP!", icon: "\u2728" },
  { type: "minutes", amount: 5, label: "+5 Bonus-Minuten!", icon: "\u23F0" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F984}", icon: "\u{1F984}", id: "emoji_unicorn" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F432}", icon: "\u{1F432}", id: "emoji_dragon" },
  { type: "emoji", label: "Seltenes Emoji: \u{1F308}", icon: "\u{1F308}", id: "emoji_rainbow" },
];

export const CHEST_REWARDS = [
  { type: "coins", amount: 100, label: "100 M\u00FCnzen!", icon: "\u{1F4B0}" },
  { type: "coins", amount: 150, label: "150 M\u00FCnzen!", icon: "\u{1FA99}" },
  { type: "xp", amount: 75, label: "75 Bonus-XP!", icon: "\u26A1" },
  { type: "item", id: "c_crown", label: "Katzenkrone!", icon: "\u{1F451}" },
  { type: "item", id: "h_wings", label: "Heldenfl\u00FCgel!", icon: "\u{1FABD}" },
  { type: "item", id: "rm_trophy", label: "Goldpokal!", icon: "\u{1F3C6}" },
  { type: "minutes", amount: 15, label: "+15 Bonus-Minuten!", icon: "\u23F0" },
  { type: "xpboost", label: "Doppel-XP morgen!", icon: "\u{1F525}" },
];

export const WHEEL_SEGMENTS = [
  { type: "coins", amount: 30, label: "+30 M\u00FCnzen", icon: "\u{1FA99}", color: "#FCD34D" },
  { type: "xp", amount: 25, label: "+25 XP", icon: "\u26A1", color: "#A78BFA" },
  { type: "minutes", amount: 5, label: "+5 Min", icon: "\u23F0", color: "#34D399" },
  { type: "coins", amount: 50, label: "+50 M\u00FCnzen", icon: "\u{1F4B0}", color: "#FB923C" },
  { type: "xp", amount: 40, label: "+40 XP", icon: "\u2728", color: "#60A5FA" },
  { type: "rare", label: "Seltener Fund!", icon: "\u{1F381}", color: "#EC4899" },
];

export const CHEST_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100];
export const RARE_DROP_CHANCE = 0.12;

export const WEEKLY_MISSIONS = [
  { id: "wm1", title: "Sternenj\u00E4ger", story: "Rocket hat einen Stern verloren! Schaffe 5 Tage alle Quests um ihn zu finden.", goal: "allDone5", target: 5, reward: { type: "coins", amount: 200 }, icon: "\u2B50" },
  { id: "wm2", title: "Regenbogen-Woche", story: "Esse diese Woche jeden Tag alle Farben des Regenbogens!", goal: "rainbow5", target: 5, reward: { type: "coins", amount: 150 }, icon: "\u{1F308}" },
  { id: "wm3", title: "B\u00FCcherwurm", story: "Lies diese Woche jeden Tag! Dein Held wird kl\u00FCger!", goal: "read7", target: 7, reward: { type: "xp", amount: 100 }, icon: "\u{1F4D6}" },
  { id: "wm4", title: "Fr\u00FChaufsteher", story: "Schaffe 5 Tage alle Morgen-Quests vor dem Mittagessen!", goal: "allMorning5", target: 5, reward: { type: "coins", amount: 175 }, icon: "\u{1F305}" },
  { id: "wm5", title: "Sauberheld", story: "Schaffe 7 Tage deine Abend-Pflege komplett!", goal: "allEvening7", target: 7, reward: { type: "xp", amount: 80 }, icon: "\u2728" },
  { id: "wm6", title: "Fu\u00DFball-Star", story: "Geh diese Woche zu allen Trainings!", goal: "football2", target: 2, reward: { type: "coins", amount: 120 }, icon: "\u26BD" },
];

export const GRADUATION_THRESHOLD = 30;

export const ANCHORS = {
  morning: { label: "Morgens", icon: "\u{1F305}", col: "#F97316" },
  afternoon: { label: "Nachmittags", icon: "\u2600\uFE0F", col: "#0EA5E9" },
  evening: { label: "Abends", icon: "\u{1F319}", col: "#6D28D9" },
};

export const LVL = [0, 50, 120, 220, 360, 550, 800, 1100, 1500, 2000, 2600, 3300, 4100, 5000, 6000, 7200];

export const BADGES = [
  { i: "\u{1F31F}", n: "Erster Tag" },
  { i: "\u{1F525}", n: "3-Tage" },
  { i: "\u26A1", n: "7-Tage" },
  { i: "\u{1F451}", n: "Level 5" },
  { i: "\u{1F3AF}", n: "50 Quests" },
  { i: "\u{1F48E}", n: "Level 10" },
  { i: "\u{1F3F0}", n: "30 Tage" },
  { i: "\u{1F409}", n: "100 Quests" },
  { i: "\u{1F431}", n: "Sammler" },
];

export const OB_REWARDS = [
  null,
  { xp: 0, coins: 50, text: "+50 M\u00FCnzen!", icon: "\u{1FA99}" },
  { xp: 55, coins: 25, text: "Level 2! +25\u{1FA99}", icon: "\u26A1" },
  { xp: 0, coins: 40, text: "+40 M\u00FCnzen!", icon: "\u{1F381}" },
  { xp: 70, coins: 30, text: "Level 3! +30\u{1FA99}", icon: "\u26A1" },
  { xp: 0, coins: 100, text: "+100 Startgeld!", icon: "\u{1F4B0}" },
  { xp: 0, coins: 0, text: "", icon: "" },
  { xp: 0, coins: 0, text: "", icon: "" },
  { xp: 100, coins: 50, text: "Sidekick! Level 4!", icon: "\u{1F431}" },
  { xp: 0, coins: 80, text: "+80 M\u00FCnzen!", icon: "\u{1FA99}" },
];

export const JOURNAL_QUESTIONS = [
  {
    id: "best", q: "Was war heute das Beste?", opts: [
      { v: "school", l: "\u{1F3EB} Schule" }, { v: "friends", l: "\u{1F46B} Freunde" }, { v: "sport", l: "\u26BD Sport" },
      { v: "family", l: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466} Familie" }, { v: "play", l: "\u{1F3AE} Spielen" }, { v: "food", l: "\u{1F355} Essen" }, { v: "learn", l: "\u{1F4DA} Gelernt" },
    ]
  },
  {
    id: "proud", q: "Worauf bist du stolz?", opts: [
      { v: "quests", l: "\u2705 Alle Quests" }, { v: "helped", l: "\u{1F91D} Geholfen" }, { v: "hard", l: "\u{1F4AA} Was Schwieriges" },
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

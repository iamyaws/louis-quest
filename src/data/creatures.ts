/** Creature + chapter data — single source of truth for Freunde (Micropedia).
 *  Imported by Micropedia (grid + detail modal) and CreatureDiscoveryToast.
 *  Tone for authored content: warm, specific, sensory. Kid-friendly (6-year-old).
 *  Voice: Ronki's — curious older friend, never lectures.
 */

// ── Creature seed data ──

export interface CreatureSeed {
  id: string;
  chapter: 'forest' | 'sky' | 'water' | 'dream' | 'hearth';
  name: { de: string; en: string };
  art: string;
  flavor: { de: string; en: string };
}

export const SEED_CREATURES: readonly CreatureSeed[] = [
  { id: 'forest_0', chapter: 'forest', name: { de: 'Glutfunke',       en: 'Emberspark' },  art: 'art/micropedia/creatures/creature-1.webp',       flavor: { de: 'Gefunden am ersten Tag im Wald.',                     en: 'Found on the first day in the forest.' } },
  { id: 'forest_1', chapter: 'forest', name: { de: 'Moostänzer',      en: 'Mossdancer' },  art: 'art/micropedia/creatures/creature-2.webp',       flavor: { de: 'Tanzt zwischen den Farnen, wenn niemand hinsieht.',   en: 'Dances between the ferns when nobody looks.' } },
  { id: 'forest_2', chapter: 'forest', name: { de: 'Knorrbart',       en: 'Gnarlfang' },   art: 'art/micropedia/creatures/creature-3.webp',       flavor: { de: 'Sieht grimmig aus, ist aber ganz sanft.',             en: 'Looks fierce, but is quite gentle.' } },
  { id: 'forest_3', chapter: 'forest', name: { de: 'Rotling',         en: 'Redling' },     art: 'art/micropedia/creatures/creature-6.webp',       flavor: { de: 'Versteckt sich unter Pilzen.',                        en: 'Hides under mushrooms.' } },
  { id: 'forest_4', chapter: 'forest', name: { de: 'Baumbart',        en: 'Treebeard' },   art: 'art/micropedia/creatures/baumbart.webp',         flavor: { de: 'Flüstert mit den Wurzeln, hört den Wäldern zu.',       en: 'Whispers with roots, listens to forests.' } },
  { id: 'forest_5', chapter: 'forest', name: { de: 'Mr. Shroom',      en: 'Mr. Shroom' },  art: 'art/micropedia/creatures/mr-shroom.webp',        flavor: { de: 'Trägt immer einen Hut. Manchmal zwei.',               en: 'Always wears a hat. Sometimes two.' } },
  { id: 'forest_6', chapter: 'forest', name: { de: 'Pilz-Jeti',       en: 'Mushroom Yeti' },art: 'art/micropedia/creatures/pilz-jeti.webp',        flavor: { de: 'Groß, plüschig, schüchtern. Hinterlässt fluffige Spuren.', en: 'Big, fluffy, shy. Leaves fluffy tracks.' } },
  { id: 'sky_1',    chapter: 'sky',    name: { de: 'Larson',          en: 'Larson' },       art: 'art/micropedia/creatures/larson.webp',           flavor: { de: 'Fliegt Loopings, wenn keiner guckt.',                 en: 'Flies loops when no one is watching.' } },
  { id: 'dream_3',  chapter: 'dream',  name: { de: 'Brie',            en: 'Brie' },         art: 'art/micropedia/creatures/brie.webp',             flavor: { de: 'Sammelt träumende Gedanken in einem Krug.',           en: 'Collects dreaming thoughts in a jar.' } },
  { id: 'hearth_1', chapter: 'hearth', name: { de: 'Firecracker',     en: 'Firecracker' },  art: 'art/micropedia/creatures/firecracker.webp',      flavor: { de: 'Knistert vor Freude. Ganz sanft.',                    en: 'Crackles with joy. Very gently.' } },
  { id: 'hearth_2', chapter: 'hearth', name: { de: 'Doktor Funkel',   en: 'Dr. Sparkle' },  art: 'art/micropedia/creatures/doktor-funkel.webp',    flavor: { de: 'Forscher, Freund, Funkel. Nur für echte Knobel-Meister.', en: 'Researcher, friend, spark. For true puzzle-masters only.' } },
  { id: 'sky_0',    chapter: 'sky',    name: { de: 'Sturmflügel',     en: 'Stormwing' },   art: 'art/micropedia/creatures/creature-8.webp',       flavor: { de: 'Reitet auf Gewitterwolken.',                          en: 'Rides on thunderclouds.' } },
  { id: 'water_0',  chapter: 'water',  name: { de: 'Perlenfisch',     en: 'Pearlfish' },   art: 'art/micropedia/creatures/creature-water-1.webp', flavor: { de: 'Seine Schuppen leuchten wie Perlen im Mondlicht.',    en: 'Scales glow like pearls in moonlight.' } },
  { id: 'water_1',  chapter: 'water',  name: { de: 'Wellentänzer',    en: 'Wavedancer' },  art: 'art/micropedia/creatures/creature-water-2.webp', flavor: { de: 'Tanzt auf Seerosen, wenn niemand hinsieht.',          en: 'Dances on lily pads when nobody looks.' } },
  { id: 'water_2',  chapter: 'water',  name: { de: 'Muscheljuwel',    en: 'Shellgem' },    art: 'art/micropedia/creatures/creature-water-3.webp', flavor: { de: 'Trägt einen Kristall auf dem Rücken.',                en: 'Carries a crystal on its back.' } },
  { id: 'water_3',  chapter: 'water',  name: { de: 'Nebelkrabbe',     en: 'Mistcrab' },    art: 'art/micropedia/creatures/creature-water-4.webp', flavor: { de: 'Erscheint nur im Morgennebel.',                       en: 'Appears only in morning mist.' } },
  { id: 'dream_0',  chapter: 'dream',  name: { de: 'Lichtflüstern',   en: 'Glowwhisper' }, art: 'art/micropedia/creatures/creature-4.webp',       flavor: { de: 'Erscheint nur im Mondlicht.',                         en: 'Appears only in moonlight.' } },
  { id: 'dream_1',  chapter: 'dream',  name: { de: 'Nachtflügel',     en: 'Nightwing' },   art: 'art/micropedia/creatures/creature-9.webp',       flavor: { de: 'Fliegt durch die Träume mutiger Kinder.',             en: 'Flies through the dreams of brave children.' } },
  { id: 'dream_2',  chapter: 'dream',  name: { de: 'Sternenschatten', en: 'Starshadow' },  art: 'art/micropedia/creatures/creature-10.webp',      flavor: { de: 'Vom Sternenmeer hierher gereist.',                    en: 'Traveled here from the sea of stars.' } },
  { id: 'hearth_0', chapter: 'hearth', name: { de: 'Goldauge',        en: 'Goldeye' },     art: 'art/micropedia/creatures/creature-7.webp',       flavor: { de: 'Sitzt am liebsten am warmen Kamin.',                  en: 'Loves sitting by the warm fireplace.' } },
];

/** O(1) lookup map — build once at module load, not per-render. */
export const SEED_BY_ID: Map<string, CreatureSeed> = new Map(SEED_CREATURES.map(s => [s.id, s]));

/**
 * Sprite path for a creature — transparent-background version for floating use
 * (celebrations, egg rewards, toasts, games). Returns the parallel sprite file
 * inside the `sprites/` subdirectory, next to the painterly original.
 * Example: art/micropedia/creatures/baumbart.webp → art/micropedia/creatures/sprites/baumbart.webp
 */
export function getCreatureSpritePath(seed: Pick<CreatureSeed, 'art'>): string {
  const parts = seed.art.split('/');
  const filename = parts.pop() as string;
  return [...parts, 'sprites', filename].join('/');
}

// ── Chapter definitions ──

export type ChapterId = 'forest' | 'sky' | 'water' | 'dream' | 'hearth';

export interface Chapter {
  id: ChapterId;
  nameKey: { de: string; en: string };
  icon: string;
  color: string;
  bgGradient: string;
  border: string;
  headerArt: string;
  creatureCount: number;
}

export const CHAPTERS: readonly Chapter[] = [
  { id: 'forest', nameKey: { de: 'Wald',    en: 'Forest' }, icon: 'forest',      color: '#059669', bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: 'rgba(5,150,105,0.2)',  headerArt: 'art/micropedia/chapter-forest.webp', creatureCount: 12 },
  { id: 'sky',    nameKey: { de: 'Himmel',  en: 'Sky' },    icon: 'cloud',       color: '#0ea5e9', bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: 'rgba(14,165,233,0.2)', headerArt: 'art/micropedia/chapter-sky.webp',    creatureCount: 12 },
  { id: 'water',  nameKey: { de: 'Wasser',  en: 'Water' },  icon: 'water_drop',  color: '#0891b2', bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', border: 'rgba(8,145,178,0.2)', headerArt: 'art/micropedia/chapter-water.webp',  creatureCount: 12 },
  { id: 'dream',  nameKey: { de: 'Traum',   en: 'Dream' },  icon: 'nights_stay', color: '#7c3aed', bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: 'rgba(124,58,237,0.2)',headerArt: 'art/micropedia/chapter-dream.webp',  creatureCount: 12 },
  { id: 'hearth', nameKey: { de: 'Zuhause', en: 'Hearth' }, icon: 'fireplace',   color: '#d97706', bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: 'rgba(217,119,6,0.2)', headerArt: 'art/micropedia/chapter-hearth.webp', creatureCount: 12 },
];

// ── Authored enrichment content ──

export interface CreatureContent {
  id: string;
  ronkiNote: string;
  favoritePlace: string;
  favoriteFood: string;
  funFacts: string[];
  howMet: string;
  secret: string;
  likes: string[];
  dislikes: string[];
}

export const CREATURE_CONTENT: Record<string, CreatureContent> = {
  forest_0: {
    id: 'forest_0',
    ronkiNote: 'Das ist Glutfunke. Wir haben zusammen die erste Höhle gefunden.',
    favoritePlace: 'Unter alten Eichen',
    favoriteFood: 'Glühwürmchen-Honig',
    funFacts: [
      'Sein Schweif glüht, wenn er sich freut.',
      'Er kann zehn Minuten ganz still sitzen.',
    ],
    howMet: 'Ich war zum ersten Mal im Wald unterwegs. Er saß auf einem Pilz und hat mir den Weg gezeigt. Seitdem treffen wir uns oft.',
    secret: 'Er singt manchmal ganz leise für sich, wenn niemand zuhört.',
    likes: ['warmes Licht', 'Pilze', 'deine Stimme'],
    dislikes: ['laute Geräusche', 'nasse Pfoten'],
  },

  forest_1: {
    id: 'forest_1',
    ronkiNote: 'Moostänzer hört man nie kommen. Man spürt nur ein Kitzeln im Gras.',
    favoritePlace: 'Zwischen weichen Farnwedeln',
    favoriteFood: 'Tautropfen von jungen Blättern',
    funFacts: [
      'Seine Pfoten hinterlassen kleine grüne Abdrücke.',
      'Er schläft tagsüber in einem Moosnest.',
    ],
    howMet: 'Wir waren schon ein paar Mal im Wald, da sah ich plötzlich einen Farnwedel wackeln. Aber kein Wind. Dann schaute er mich an und tanzte weiter.',
    secret: 'Er zählt jede einzelne Blume, die er sieht.',
    likes: ['feuchtes Moos', 'leise Schritte', 'Regentropfen'],
    dislikes: ['trockene Luft', 'Stiefel'],
  },

  forest_2: {
    id: 'forest_2',
    ronkiNote: 'Knorrbart brummt viel. Aber das heißt nur, dass er dich mag.',
    favoritePlace: 'Auf einem alten Baumstumpf',
    favoriteFood: 'Eicheln und wilde Beeren',
    funFacts: [
      'Sein Bart wächst nur im Winter.',
      'Er kennt jeden Baum im Wald beim Namen.',
      'Er kann zehn Eicheln gleichzeitig halten.',
    ],
    howMet: 'Wir sind schon oft an ihm vorbeigelaufen, ohne ihn zu sehen. Nach vielen Tagen hat er gebrummt. Das war sein Hallo.',
    secret: 'Nachts legt er sich Steine in ein Muster, nur so, zum Spass.',
    likes: ['ruhige Tage', 'alte Bäume', 'Blätterrascheln'],
    dislikes: ['schnelle Bewegungen', 'zu viele Fragen'],
  },

  forest_3: {
    id: 'forest_3',
    ronkiNote: 'Rotling ist ganz schüchtern. Er schaut immer erst unter dem Pilz hervor.',
    favoritePlace: 'Unter einem roten Pilzhut',
    favoriteFood: 'Himbeeren, nur die süßen',
    funFacts: [
      'Er ist kleiner als deine Hand.',
      'Seine Ohren werden dunkler, wenn er aufgeregt ist.',
    ],
    howMet: 'Ganz am Ende unseres ersten Abenteuers, als alles vorbei war, sah ich zwei kleine Augen zwischen den Pilzen. Er hat gewartet, bis er sicher war, dass wir Freunde sind.',
    secret: 'Er sammelt heimlich bunte Blätter und legt sie in Reihen.',
    likes: ['süße Beeren', 'weiches Moos', 'leises Flüstern'],
    dislikes: ['große Schatten', 'plötzliches Licht'],
  },

  forest_4: {
    id: 'forest_4',
    ronkiNote: 'Baumbart redet nicht viel. Aber wenn er redet, hört der ganze Wald zu.',
    favoritePlace: 'Die älteste Eiche im Wald',
    favoriteFood: 'Morgentau',
    funFacts: [
      'Sein Bart wächst seit hundert Sommern.',
      'Wenn er niest, fallen Eicheln vom Baum.',
    ],
    howMet: 'Du hast so oft dran gearbeitet, Tag für Tag. Irgendwann hat Baumbart zu mir gesagt: "Der kleine Mensch ist dran geblieben. Zeig ihn mir." Und da war er, langsam aus dem Stamm heraus.',
    secret: 'Er kennt den Namen jedes Baums im Wald.',
    likes: ['Ruhe', 'Regen auf Blättern', 'Kinder die gut zuhören'],
    dislikes: ['laute Stimmen', 'Hektik'],
  },

  forest_5: {
    id: 'forest_5',
    ronkiNote: 'Mr. Shroom hat für jede Stimmung einen anderen Hut. Heute trägt er einen sonnigen.',
    favoritePlace: 'Unter der größten Kastanie',
    favoriteFood: 'Sporen-Tee',
    funFacts: [
      'Er hat 47 Hüte. Angeblich.',
      'Wenn er lacht, wackelt sein Hut.',
    ],
    howMet: 'Nachdem du und Pilzhüter euch wiedergetroffen habt, kam Mr. Shroom um die Ecke. Er hat den Hut gelüftet und gesagt: "Freunde vom Pilzhüter sind auch meine Freunde."',
    secret: 'Er schreibt nachts kleine Briefe und versteckt sie unter Pilzen.',
    likes: ['gute Manieren', 'Tee bei Sonnenaufgang', 'Hüte'],
    dislikes: ['Hektik', 'nasse Hüte'],
  },

  forest_6: {
    id: 'forest_6',
    ronkiNote: 'Pilz-Jeti ist riesig und ganz schüchtern. Er versteckt sich, wenn man schnell geht.',
    favoritePlace: 'Der tiefste Teil des Waldes',
    favoriteFood: 'Kaltes Moos',
    funFacts: [
      'Sein Fell ist eigentlich ein Pilz.',
      'Er läuft rückwärts, wenn er nervös wird.',
    ],
    howMet: 'Du hast deine Abende so oft ruhig ausklingen lassen. An einem besonders stillen Abend ist Pilz-Jeti aus dem Dickicht gekommen. "Ich mag Kinder, die gut Abschied vom Tag nehmen", hat er leise gebrummt.',
    secret: 'Er spricht nur leise, weil er Angst hat, die Bäume aufzuwecken.',
    likes: ['Ruhe', 'tiefe Schatten', 'Bettzeit'],
    dislikes: ['plötzliche Bewegungen', 'grelles Licht'],
  },

  sky_0: {
    id: 'sky_0',
    ronkiNote: 'Sturmflügel liebt Wind. Je wilder, desto besser.',
    favoritePlace: 'Auf der Spitze der dunkelsten Wolke',
    favoriteFood: 'Regentropfen, frisch gefangen',
    funFacts: [
      'Seine Federn knistern bei Gewitter.',
      'Er fliegt lieber nach oben als nach unten.',
    ],
    howMet: 'Als ich mich an die Spiele gewagt habe, flog er plötzlich vorbei. Er hat einmal gekreischt und ist mitgekommen. Jetzt spielen wir zusammen.',
    secret: 'Bei Sonnenschein versteckt er sich und tut so, als wäre er müde.',
    likes: ['starker Wind', 'Donner', 'hohes Fliegen'],
    dislikes: ['Windstille', 'Käfige'],
  },

  water_0: {
    id: 'water_0',
    ronkiNote: 'Perlenfisch schwimmt ganz ruhig. Er wartet gern, bis der Mond kommt.',
    favoritePlace: 'In einer Mondlichtpfütze',
    favoriteFood: 'Silberne Wasserblumen',
    funFacts: [
      'Seine Schuppen ändern die Farbe je nach Mondphase.',
      'Er atmet einmal pro Stunde aus.',
    ],
    howMet: 'Ich habe viele Tage lang auf dich aufgepasst und daran gedacht, dass du genug trinkst. Irgendwann schwamm er aus dem Mondlicht zu mir. Er wollte uns kennenlernen.',
    secret: 'Seine Perlen zählt er jede Nacht nach, damit keine fehlt.',
    likes: ['stilles Wasser', 'Mondlicht', 'kühle Nächte'],
    dislikes: ['Wellen', 'helles Sonnenlicht'],
  },

  water_1: {
    id: 'water_1',
    ronkiNote: 'Wellentänzer lacht viel. Man hört es am Plätschern.',
    favoritePlace: 'Auf einer großen Seerose',
    favoriteFood: 'Blütenpollen vom Wasser',
    funFacts: [
      'Er dreht sich im Kreis, wenn er glücklich ist.',
      'Seine Füsse werden nie nass.',
    ],
    howMet: 'Als du zum ersten Mal etwas in dein Tagebuch geschrieben hast, hörte ich vom Teich ein Platschen. Da war er, auf einer Seerose, und hat mir zugewinkt.',
    secret: 'Er tanzt, wenn er glaubt, dass nur die Fische zuschauen.',
    likes: ['ruhige Teiche', 'Sonnenblumen', 'Kichern'],
    dislikes: ['kaltes Wasser', 'traurige Tage'],
  },

  water_2: {
    id: 'water_2',
    ronkiNote: 'Muscheljuwel trägt einen Kristall. Sie passt sehr gut darauf auf.',
    favoritePlace: 'Auf einem warmen Stein am Ufer',
    favoriteFood: 'Kleine Algen und Meersalz',
    funFacts: [
      'Ihr Kristall leuchtet, wenn es ihr gut geht.',
      'Sie poliert ihn jeden Morgen mit Seegras.',
    ],
    howMet: 'Du hast dich an einem Tag besonders lieb um die Katze gekümmert. Gefüttert, gestreichelt, gespielt. Da kam sie aus dem Wasser und zeigte mir ihren Kristall. Das ist ihr größter Schatz.',
    secret: 'Sie erzählt dem Kristall jeden Abend, was sie erlebt hat.',
    likes: ['warme Steine', 'ruhige Gezeiten', 'glitzerndes Wasser'],
    dislikes: ['trockene Luft', 'Diebe'],
  },

  water_3: {
    id: 'water_3',
    ronkiNote: 'Nebelkrabbe kommt nur früh am Morgen. Ganz leise.',
    favoritePlace: 'Am Ufer, wenn der Nebel liegt',
    favoriteFood: 'Nebeltropfen und weiche Moose',
    funFacts: [
      'Ihre Scheren sehen wie kleine Wolken aus.',
      'Man sieht sie nur aus dem Augenwinkel.',
    ],
    howMet: 'Nach einem besonders großen Abenteuer sah ich sie plötzlich im Nebel stehen. Sie hat mir etwas geschenkt. Dann war sie wieder weg, als wäre sie nie da gewesen.',
    secret: 'Sie versteckt kleine Steine als Andenken an ihre Freunde.',
    likes: ['Morgennebel', 'ruhige Stunden', 'kühle Luft'],
    dislikes: ['grelles Licht', 'laute Stimmen'],
  },

  dream_0: {
    id: 'dream_0',
    ronkiNote: 'Lichtflüstern spricht ganz leise. Man muss gut zuhören.',
    favoritePlace: 'Auf einem Mondstrahl',
    favoriteFood: 'Sternenstaub in einem Blatt',
    funFacts: [
      'Sein Fell leuchtet nur bei Vollmond.',
      'Er kennt alle Wünsche, die vor dem Schlafen gedacht werden.',
    ],
    howMet: 'Als du zum ersten Mal aufgeschrieben hast, wie du dich fühlst, kam er aus dem Mondlicht zu mir. Er hat genickt, als hätte er es gewusst.',
    secret: 'Er sammelt sanfte Gedanken in einer kleinen Schachtel aus Licht.',
    likes: ['Mondlicht', 'ehrliche Gefühle', 'leise Worte'],
    dislikes: ['grelles Licht', 'laute Geräusche'],
  },

  dream_1: {
    id: 'dream_1',
    ronkiNote: 'Nachtflügel hilft Kindern, die mutig sein wollen. Auch nachts.',
    favoritePlace: 'Über den Dächern, wenn alle schlafen',
    favoriteFood: 'Mondbeeren',
    funFacts: [
      'Ihre Flügel sind aus Nachtblau und Silber.',
      'Sie fliegt lautlos, damit niemand aufwacht.',
    ],
    howMet: 'Du hast dreimal in dein Tagebuch geschrieben. Beim dritten Mal flog sie an meinem Fenster vorbei und blieb stehen. Seitdem wissen wir, dass sie auf mutige Kinder aufpasst.',
    secret: 'Sie zählt, wie viele Sterne jedes Kind in seinem Traum sieht.',
    likes: ['Mut', 'ruhige Nächte', 'Sternenhimmel'],
    dislikes: ['Albträume', 'Regen im Schlaf'],
  },

  dream_2: {
    id: 'dream_2',
    ronkiNote: 'Sternenschatten kommt von weit her. Vom Sternenmeer.',
    favoritePlace: 'Zwischen zwei Sternen',
    favoriteFood: 'Mondmilch',
    funFacts: [
      'Er trägt einen kleinen Kometenschweif hinter sich her.',
      'Sein Fell riecht nach kühler Nachtluft.',
    ],
    howMet: 'Nach zwei großen Abenteuern schaute ich nach oben und sah einen Stern fallen. Nur war es kein Stern. Er landete sanft und nickte mir zu.',
    secret: 'Er erinnert sich an Geschichten, die noch keiner erzählt hat.',
    likes: ['Sternenhimmel', 'stille Nächte', 'weite Reisen'],
    dislikes: ['Stadtlichter', 'große Menschenmengen'],
  },

  hearth_0: {
    id: 'hearth_0',
    ronkiNote: 'Goldauge mag es warm. Und gemütlich.',
    favoritePlace: 'Direkt vor dem Kamin, auf dem Teppich',
    favoriteFood: 'Warmer Milchreis mit Zimt',
    funFacts: [
      'Sein Fell wird golden, wenn Feuer brennt.',
      'Er schnurrt beim Einschlafen und beim Aufwachen.',
    ],
    howMet: 'Als deine Katze groß und stark wurde, kam er vom Kamin zu uns. Er legte sich daneben und schlief ein. Jetzt gehört er einfach dazu.',
    secret: 'Er träumt immer vom gleichen warmen Kissen.',
    likes: ['Kaminfeuer', 'weiche Decken', 'lange Nickerchen'],
    dislikes: ['kalter Boden', 'offene Fenster'],
  },

  hearth_1: {
    id: 'hearth_1',
    ronkiNote: 'Firecracker knistert leise vor Freude. Nicht laut. Nie laut.',
    favoritePlace: 'Zwischen den Holzscheiten',
    favoriteFood: 'Funken und Honig',
    funFacts: [
      'Er kann ganz klein werden, wenn er schläft.',
      'Seine Funken sind warm, aber verbrennen nicht.',
    ],
    howMet: 'Wir saßen am Kamin und dachten, wir wären allein. Dann hat jemand ganz leise geknistert. Er saß zwischen den Holzscheiten und winkte.',
    secret: 'Er tanzt manchmal auf einem einzigen Funken.',
    likes: ['ruhige Abende', 'dein Lachen', 'Kaminfeuer'],
    dislikes: ['Zugluft', 'nasses Holz'],
  },

  hearth_2: {
    id: 'hearth_2',
    ronkiNote: 'Doktor Funkel. Er taucht nur auf, wenn jemand wirklich klug geworden ist.',
    favoritePlace: 'Sein winziges Labor unter der Eiche',
    favoriteFood: 'Tee aus Sternenmoos',
    funFacts: [
      'Seine Lupe zeigt Dinge, die man sonst nicht sieht.',
      'Er hat 23 Notizbücher. Angeblich 24.',
    ],
    howMet: 'Du hast alle fünf Knobel-Abenteuer geschafft. Am Ende stand Doktor Funkel einfach da, schaute durch seine Lupe und sagte: "Ah. Du bist angekommen."',
    secret: 'Sein Funkeln kommt von einem winzigen Stern, den er gefangen hat.',
    likes: ['kluge Fragen', 'stille Entdeckungen', 'das erste Licht am Morgen'],
    dislikes: ['Hektik', 'Langeweile'],
  },

  sky_1: {
    id: 'sky_1',
    ronkiNote: 'Larson dreht Loopings, wenn niemand zuguckt. Aber ich guck hin.',
    favoritePlace: 'Hoch oben, zwischen den Wolken',
    favoriteFood: 'Wind mit einem Schuss Sonne',
    funFacts: [
      'Er kann rückwärts fliegen.',
      'Sein Lachen klingt wie fernes Glockenspiel.',
    ],
    howMet: 'Eines Morgens, als der Himmel besonders blau war, flog Larson direkt über uns einen Looping. Und noch einen. Wir haben beide gelacht. Seitdem kommt er manchmal vorbei.',
    secret: 'Er rettet abstürzende Blütenblätter und bringt sie zurück.',
    likes: ['Aufwind', 'blaue Himmel', 'mutige Abenteuer'],
    dislikes: ['Windstille', 'dicke Regenwolken'],
  },

  dream_3: {
    id: 'dream_3',
    ronkiNote: 'Brie sammelt Träume. Nicht alle. Nur die besonders schönen.',
    favoritePlace: 'Zwischen den Sternen und den Wolken',
    favoriteFood: 'Mondlicht im Krug',
    funFacts: [
      'Sie hat Krüge in allen Farben. Jeder für eine andere Traum-Art.',
      'Sie vergisst nie einen Traum, den sie gesammelt hat.',
    ],
    howMet: 'Nachdem du oft und oft geträumt hast, kam Brie vorbei. "Deine Träume sind schön", hat sie gesagt und einen kleinen Krug aufgemacht. Ein warmes Licht kam heraus.',
    secret: 'Einer ihrer Krüge wartet nur auf deinen nächsten schönen Traum.',
    likes: ['ruhige Nächte', 'leise Stimmen', 'warme Erinnerungen'],
    dislikes: ['laute Träume', 'zerbrochene Krüge'],
  },
};

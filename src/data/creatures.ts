/** Per-creature enrichment content for the Freunde detail view.
 *  Tone: warm, specific, sensory. Kid-friendly (6-year-old). German only (DE market).
 *  Voice: Ronki's own, a curious older friend, never lectures.
 */

export interface CreatureContent {
  id: string;
  ronkiNote: string;         // one sentence in Ronki's voice
  favoritePlace: string;     // short string
  favoriteFood: string;      // short string
  funFacts: string[];        // 2-3 kid-friendly trivia strings
  howMet: string;            // 2-3 sentences in Ronki's voice
  secret: string;            // one sentence
  likes: string[];           // 3-5 short strings
  dislikes: string[];        // 2-3 short strings
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
};

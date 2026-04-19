/** Freunde — the 5 reunion-arc friends, one per Micropedia chapter.
 *  Pilot: only Pilzhüter has a complete arc in `src/arcs/freund-pilzhueter.ts`.
 *  The rest are metadata stubs — names, chapters, skills reserved.
 */

import type { ChapterId } from './creatures';

export interface FreundMeta {
  id: string;
  chapter: ChapterId;
  name: { de: string; en: string };
  portrait: string; // path relative to BASE_URL
  skillName: { de: string; en: string };
  /** Number of creatures discovered in this chapter that unlocks the reunion. */
  unlockThreshold: number;
  /** Whether this Freund's arc is built and shippable. Pilot = pilzhueter only. */
  implemented: boolean;
  /** ElevenLabs voice ID used for this Freund's narration. Picked via voice-casting
   *  review (voice-samples/). When undefined, arc audio gen falls back to Bella
   *  (Drachenmutter) — shared narrator mode. */
  voiceId?: string;
  /** ElevenLabs voice settings for this Freund — matters when the same voice ID
   *  is reused across Freunde with different tuning (e.g. Jessica-confident for
   *  Windreiterin vs Jessica-warm-glow for Lichtbringerin). */
  voiceSettings?: { stability: number; similarity_boost: number; style: number };
}

export const FREUNDE: FreundMeta[] = [
  {
    id: 'pilzhueter',
    chapter: 'forest',
    name: { de: 'Der Pilzhüter', en: 'The Mushroom Keeper' },
    portrait: 'art/freunde/pilzhueter.webp',
    skillName: { de: 'Baum-Pose', en: 'Tree Pose' },
    unlockThreshold: 2,
    implemented: true,
    voiceId: 'pqHfZKP75CvOlQylNhV4', // Bill — deep older
    voiceSettings: { stability: 0.72, similarity_boost: 0.70, style: 0.25 },
  },
  {
    id: 'windreiterin',
    chapter: 'sky',
    name: { de: 'Die Windreiterin', en: 'The Wind Rider' },
    portrait: 'art/freunde/windreiterin.webp',
    skillName: { de: 'Box-Atmung', en: 'Box Breathing' },
    unlockThreshold: 3,
    implemented: false,
    voiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica — confident tuning
    voiceSettings: { stability: 0.55, similarity_boost: 0.70, style: 0.45 },
  },
  {
    id: 'tiefentaucher',
    chapter: 'water',
    name: { de: 'Die Tiefentaucherin', en: 'The Deep Diver' },
    portrait: 'art/freunde/tiefentaucher.webp',
    skillName: { de: 'Gefühle benennen', en: 'Naming feelings' },
    unlockThreshold: 2,
    implemented: false,
    voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi — childlike (Marc: "could be a little more childlike but fine")
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.55 },
  },
  {
    id: 'sternenweberin',
    chapter: 'dream',
    name: { de: 'Die Sternenweberin', en: 'The Star Weaver' },
    portrait: 'art/freunde/sternenweberin.webp',
    skillName: { de: 'Kurze Meditation', en: 'Brief meditation' },
    unlockThreshold: 3,
    implemented: false,
    voiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda — dreamy tuning
    voiceSettings: { stability: 0.60, similarity_boost: 0.70, style: 0.55 },
  },
  {
    id: 'lichtbringerin',
    chapter: 'hearth',
    name: { de: 'Die Lichtbringerin', en: 'The Lightbringer' },
    portrait: 'art/freunde/lichtbringerin.webp',
    skillName: { de: 'Freundschaftsregeln', en: 'Friendship rules' },
    unlockThreshold: 4,
    implemented: false,
    voiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica — warm-glow tuning (same speaker as Windreiterin, different settings)
    voiceSettings: { stability: 0.58, similarity_boost: 0.75, style: 0.40 },
  },
  {
    id: 'flackerfuchs',
    chapter: 'hearth',
    name: { de: 'Flackerfuchs', en: 'Flicker Fox' },
    portrait: 'art/freunde/flackerfuchs.webp',
    skillName: { de: 'Funken finden', en: 'Spark finding' },
    unlockThreshold: 3,
    implemented: false,
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — expressive young
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.50 },
  },
  {
    id: 'brueckenbauer',
    chapter: 'hearth',
    name: { de: 'Der Brückenbauer', en: 'The Bridge Builder' },
    portrait: 'art/freunde/brueckenbauer.webp',
    skillName: { de: 'Streit entspannen', en: 'Easing conflicts' },
    unlockThreshold: 4,
    implemented: false,
    voiceId: 'yoZ06aMxZJJ28mfd3POQ', // Sam — calm-young
    voiceSettings: { stability: 0.72, similarity_boost: 0.72, style: 0.25 },
  },
];

export const FREUND_BY_ID: Map<string, FreundMeta> = new Map(FREUNDE.map(f => [f.id, f]));

/**
 * Sprite path for a Freund — transparent-background version for floating use
 * (reunion cards where the portrait sits over chapter ambient, callbacks, etc.).
 * Returns the parallel sprite file inside the `sprites/` subdirectory.
 * Example: art/freunde/pilzhueter.webp → art/freunde/sprites/pilzhueter.webp
 */
export function getFreundSpritePath(freund: Pick<FreundMeta, 'portrait'>): string {
  const parts = freund.portrait.split('/');
  const filename = parts.pop() as string;
  return [...parts, 'sprites', filename].join('/');
}

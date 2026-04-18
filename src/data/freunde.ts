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
  },
  {
    id: 'windreiterin',
    chapter: 'sky',
    name: { de: 'Die Windreiterin', en: 'The Wind Rider' },
    portrait: 'art/freunde/windreiterin.webp',
    skillName: { de: 'Box-Atmung', en: 'Box Breathing' },
    unlockThreshold: 3,
    implemented: false,
  },
  {
    id: 'tiefentaucher',
    chapter: 'water',
    name: { de: 'Die Tiefentaucherin', en: 'The Deep Diver' },
    portrait: 'art/freunde/tiefentaucher.webp',
    skillName: { de: 'Gefühle benennen', en: 'Naming feelings' },
    unlockThreshold: 2,
    implemented: false,
  },
  {
    id: 'sternenweberin',
    chapter: 'dream',
    name: { de: 'Die Sternenweberin', en: 'The Star Weaver' },
    portrait: 'art/freunde/sternenweberin.webp',
    skillName: { de: 'Kurze Meditation', en: 'Brief meditation' },
    unlockThreshold: 3,
    implemented: false,
  },
  {
    id: 'lichtbringerin',
    chapter: 'hearth',
    name: { de: 'Die Lichtbringerin', en: 'The Lightbringer' },
    portrait: 'art/freunde/lichtbringerin.webp',
    skillName: { de: 'Freundschaftsregeln', en: 'Friendship rules' },
    unlockThreshold: 4,
    implemented: false,
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

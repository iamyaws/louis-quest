/**
 * Garden constants — species palette, decor palette, pricing.
 *
 * Source of truth for what can be planted and what can be placed. The
 * visual tokens live in GardenScene.jsx (CSS shapes per type); the list
 * here is data only. Keep in sync with types.ts PlantSpecies / DecorType.
 *
 * See docs/discovery/2026-04-23-core-gameloop-time-stack/transcript.md
 * (Q5 Pflanzen / Q6 A+D / Q7 C+ / Q9 Hub-backdrop).
 */

import type { PlantSpecies, DecorType, DecorCategory } from '../types';

// ── Plant species ──────────────────────────────────────────────────────
// "langsam" plants take longer to hit each milestone (Q7 C+ milestone-aged
// growth is computed from plantedAt; speedClass is a scalar on the default
// month/season/journey thresholds. 'mittel' = default, 'langsam' = 1.5×.
// Planting is free (weekly ritual, not a shop transaction).
export interface SpeciesInfo {
  id: PlantSpecies;
  labelDe: string;
  labelEn: string;
  speedClass: 'mittel' | 'langsam';
}

export const SPECIES: SpeciesInfo[] = [
  { id: 'oak',    labelDe: 'Eiche',  labelEn: 'Oak',    speedClass: 'langsam' },
  { id: 'apple',  labelDe: 'Apfel',  labelEn: 'Apple',  speedClass: 'mittel' },
  { id: 'birch',  labelDe: 'Birke',  labelEn: 'Birch',  speedClass: 'mittel' },
  { id: 'pine',   labelDe: 'Kiefer', labelEn: 'Pine',   speedClass: 'mittel' },
  { id: 'linden', labelDe: 'Linde',  labelEn: 'Linden', speedClass: 'langsam' },
  { id: 'fir',    labelDe: 'Tanne',  labelEn: 'Fir',    speedClass: 'langsam' },
];

// ── Decor palette ─────────────────────────────────────────────────────
export interface DecorInfo {
  id: DecorType;
  category: DecorCategory;
  labelDe: string;
  labelEn: string;
  /** Sterne cost. 0 = starter item, granted by default in ownedDecor. */
  price: number;
}

export const DECOR: DecorInfo[] = [
  // Natur — grounded, modest, "feels like a forest kid's backyard"
  { id: 'stone',     category: 'natur', labelDe: 'Stein',      labelEn: 'Stone',      price: 0 },
  { id: 'stone-sm',  category: 'natur', labelDe: 'Kiesel',     labelEn: 'Pebble',     price: 0 },
  { id: 'mushroom',  category: 'natur', labelDe: 'Pilz',       labelEn: 'Mushroom',   price: 3 },
  { id: 'lantern',   category: 'natur', labelDe: 'Laterne',    labelEn: 'Lantern',    price: 5 },
  { id: 'bench',     category: 'natur', labelDe: 'Bank',       labelEn: 'Bench',      price: 6 },
  { id: 'fence',     category: 'natur', labelDe: 'Zaun',       labelEn: 'Fence',      price: 4 },

  // Magie — the dragon's world. Humble for v1, deeper lore in later phases.
  { id: 'crystal',      category: 'magie', labelDe: 'Kristall',     labelEn: 'Crystal',      price: 6 },
  { id: 'runestone',    category: 'magie', labelDe: 'Rune',         labelEn: 'Runestone',    price: 8 },
  { id: 'faerie-ring',  category: 'magie', labelDe: 'Feenring',     labelEn: 'Faerie ring',  price: 5 },
  { id: 'shrine',       category: 'magie', labelDe: 'Schrein',      labelEn: 'Shrine',       price: 10 },
  { id: 'orb',          category: 'magie', labelDe: 'Himmelskugel', labelEn: 'Sky orb',      price: 4 },
  { id: 'dreamcatcher', category: 'magie', labelDe: 'Traumfänger',  labelEn: 'Dreamcatcher', price: 7 },
  { id: 'idol',         category: 'magie', labelDe: 'Ronki-Idol',   labelEn: 'Ronki idol',   price: 12 },
  { id: 'totem',        category: 'magie', labelDe: 'Totem',        labelEn: 'Totem',        price: 9 },
];

export const DECOR_BY_ID: Record<DecorType, DecorInfo> = Object.fromEntries(
  DECOR.map(d => [d.id, d])
) as Record<DecorType, DecorInfo>;

// ── Default owned decor ───────────────────────────────────────────────
// Kid gets these for free on first garden visit so v1 has something to
// place without immediately running into the shop.
export const DEFAULT_OWNED_DECOR: DecorType[] = DECOR
  .filter(d => d.price === 0)
  .map(d => d.id);

// ── Category ordering (for the side-rail) ─────────────────────────────
export const DECOR_CATEGORIES: { id: DecorCategory; labelDe: string; labelEn: string; icon: string }[] = [
  { id: 'natur',     labelDe: 'Natur',     labelEn: 'Nature',  icon: 'grass' },
  { id: 'magie',     labelDe: 'Magie',     labelEn: 'Magic',   icon: 'auto_awesome' },
  { id: 'struktur',  labelDe: 'Struktur',  labelEn: 'Structure', icon: 'castle' },
  { id: 'lebewesen', labelDe: 'Lebewesen', labelEn: 'Critters',  icon: 'pets' },
];

// ── Growth thresholds (Q7 C+ milestone-aged) ──────────────────────────
// Days since plantedAt required to reach each stage. 'mittel' speedClass
// hits these directly; 'langsam' multiplies by SPEED_MULT['langsam'].
// Stage computation is a pure function of (today - plantedAt) so no
// stored transitions; see useGardenGrowth.ts in Phase 2.
export const GROWTH_THRESHOLDS = {
  sprout: 0,      // visible immediately after planting
  young: 7,       // ~1 week — first monthly crossing of the app lifecycle
  mid: 30,        // ~1 month
  mature: 90,     // ~1 season
} as const;

export const SPEED_MULT = {
  mittel: 1.0,
  langsam: 1.5,
} as const;

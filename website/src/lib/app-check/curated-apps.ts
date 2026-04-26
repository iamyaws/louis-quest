/**
 * Curated dropdown list for the app-check tool.
 *
 * IMPORTANT: This file contains ONLY app names and metadata. It contains
 * no Marc/Ronki-asserted scores or pattern claims. The presence of an
 * app in this list is not an editorial recommendation; it just means
 * "this app is common enough in DACH that parents are likely searching
 * for it". Marc himself uses the same parent-driven flow to evaluate
 * any of these apps; his evals end up in the same `app_evals` Supabase
 * table as any other parent's, attributed by the eval id only.
 *
 * Picking from this list is purely a UX convenience over free-text input.
 * Parents can also type any app name they want.
 */

export interface CuratedApp {
  /** Stable id; used as `app_id_curated` in app_evals when chosen from list. */
  id: string;
  /** Display name. */
  name: string;
  /** Coarse category for sectioning the dropdown. */
  category: 'lernen' | 'spiel' | 'sandbox' | 'video' | 'audio' | 'sozial' | 'lesen' | 'magazin';
}

export const CURATED_APPS: CuratedApp[] = [
  // Lernen
  { id: 'anton', name: 'Anton', category: 'lernen' },
  { id: 'antolin', name: 'Antolin', category: 'lernen' },
  { id: 'duolingo', name: 'Duolingo', category: 'lernen' },
  { id: 'duolingo-abc', name: 'Duolingo ABC', category: 'lernen' },
  { id: 'lingokids', name: 'Lingokids', category: 'lernen' },
  { id: 'khan-kids', name: 'Khan Academy Kids', category: 'lernen' },
  { id: 'scoyo', name: 'Scoyo', category: 'lernen' },
  { id: 'sofatutor', name: 'Sofatutor', category: 'lernen' },
  { id: 'conni', name: 'Conni Lernspaß', category: 'lernen' },

  // Spiele
  { id: 'pokemon-go', name: 'Pokémon Go', category: 'spiel' },
  { id: 'pokemon-sleep', name: 'Pokémon Sleep', category: 'spiel' },
  { id: 'mario-kart-tour', name: 'Mario Kart Tour', category: 'spiel' },
  { id: 'super-mario-run', name: 'Super Mario Run', category: 'spiel' },
  { id: 'hill-climb-2', name: 'Hill Climb Racing 2', category: 'spiel' },
  { id: 'roblox', name: 'Roblox', category: 'spiel' },
  { id: 'minecraft', name: 'Minecraft Pocket Edition', category: 'spiel' },
  { id: 'subway-surfers', name: 'Subway Surfers', category: 'spiel' },
  { id: 'crossy-road', name: 'Crossy Road', category: 'spiel' },
  { id: 'stumble-guys', name: 'Stumble Guys', category: 'spiel' },
  { id: 'brawl-stars', name: 'Brawl Stars', category: 'spiel' },
  { id: 'among-us', name: 'Among Us', category: 'spiel' },
  { id: 'bloons-td-6', name: 'Bloons TD 6', category: 'spiel' },
  { id: 'beyblade-burst', name: 'Beyblade Burst Rivals', category: 'spiel' },
  { id: 'pvz2', name: 'Plants vs Zombies 2', category: 'spiel' },
  { id: 'fortnite', name: 'Fortnite', category: 'spiel' },

  // Sandbox / Kreativ
  { id: 'toca-boca-world', name: 'Toca Boca World', category: 'sandbox' },
  { id: 'toca-hair-salon', name: 'Toca Hair Salon', category: 'sandbox' },
  { id: 'scratchjr', name: 'ScratchJr', category: 'sandbox' },
  { id: 'procreate-pocket', name: 'Procreate Pocket', category: 'sandbox' },
  { id: 'drawing-pad', name: 'Drawing Pad', category: 'sandbox' },

  // Video / Audio
  { id: 'youtube-kids', name: 'YouTube Kids', category: 'video' },
  { id: 'tiktok', name: 'TikTok', category: 'video' },
  { id: 'spotify-kids', name: 'Spotify Kids', category: 'audio' },
  { id: 'tonies', name: 'Tonies App', category: 'audio' },

  // Lesen
  { id: 'tigerbooks', name: 'Tigerbooks', category: 'lesen' },
  { id: 'onilo', name: 'Onilo', category: 'lesen' },

  // Sozial
  { id: 'whatsapp', name: 'WhatsApp', category: 'sozial' },
  { id: 'snapchat', name: 'Snapchat', category: 'sozial' },
  { id: 'discord', name: 'Discord', category: 'sozial' },

  // Magazin
  { id: 'geolino', name: 'Geolino App', category: 'magazin' },
  { id: 'wdr-maus', name: 'WDR Maus App', category: 'magazin' },
];

export const CATEGORY_LABELS: Record<CuratedApp['category'], string> = {
  lernen: 'Lernen',
  spiel: 'Spiele',
  sandbox: 'Sandbox & Kreativ',
  video: 'Video',
  audio: 'Audio',
  sozial: 'Sozial',
  lesen: 'Lesen',
  magazin: 'Magazin',
};

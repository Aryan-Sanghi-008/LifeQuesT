/**
 * Server IAP grants — keep in sync with src/data/iapCatalog.ts IAP_CLIENT_GRANTS
 */
export interface PurchaseGrants {
  isPremium?: boolean;
  hasNoAds?: boolean;
  hasSeasonPass?: boolean;
  unlockedAvatarStyles?: string[];
  coinsGrant?: number;
  gemsGrant?: number;
  luckBoostGrant?: number;
  reincarnationScroll?: boolean;
  mysterySpinsGrant?: number;
  unlockedScenarioIds?: string[];
  unlockedCosmeticIds?: string[];
}

const COIN_GRANTS: Record<string, number> = {
  coins_small: 10000,
  coins_medium: 50000,
  coins_large: 150000,
};

const GEMS_GRANTS: Record<string, number> = {
  gems_small: 25,
};

const LUCK_BOOST_GRANTS: Record<string, number> = {
  luck_boost: 3,
};

const MYSTERY_SPIN_GRANTS: Record<string, number> = {
  mystery_spins_3: 3,
};

const AVATAR_PACK_STYLES: Record<string, string[]> = {
  avatar_pack_adventurer: ['adventurer', 'adventurer-neutral'],
  avatar_pack_lorelei: ['lorelei', 'lorelei-neutral'],
  avatar_pack_bottts: ['bottts'],
  avatar_pack_notionists: ['notionists'],
  avatar_pack_big_smile: ['big-smile'],
  avatar_pack_wanderer: ['adventurer-neutral', 'lorelei-neutral'],
  avatar_bundle_all: [
    'adventurer',
    'adventurer-neutral',
    'lorelei',
    'lorelei-neutral',
    'bottts',
    'notionists',
    'big-smile',
  ],
};

const SCENARIO_UNLOCKS: Record<string, string[]> = {
  scenario_royal:     ['royal'],
  scenario_crime:     ['crime'],
  scenario_cyber:     ['cyber'],
  scenario_medieval:  ['medieval'],
  scenario_zombie:    ['zombie'],
  scenario_mars:      ['mars'],
  scenario_celebrity: ['celebrity'],
  scenario_fantasy:   ['fantasy'],
  scenario_political: ['political'],
  scenario_pack_all:  ['royal', 'crime', 'cyber', 'medieval', 'zombie', 'mars', 'celebrity', 'fantasy', 'political'],
};

/** Dummy Play SKUs — keep in sync with client cosmeticCatalog */
const COSMETIC_UNLOCKS: Record<string, string> = {
  cosmetic_theme_porcelain: 'theme_porcelain',
  cosmetic_theme_ivory_dawn: 'theme_ivory_dawn',
  cosmetic_theme_coastal_mist: 'theme_coastal_mist',
  cosmetic_theme_obsidian: 'theme_obsidian',
  cosmetic_theme_noir_harbor: 'theme_noir_harbor',
  cosmetic_theme_ember_night: 'theme_ember_night',
  cosmetic_theme_dark_slate: 'theme_obsidian',
  cosmetic_theme_midnight: 'theme_noir_harbor',
  cosmetic_theme_sunrise: 'theme_ivory_dawn',
  cosmetic_tombstone_gothic: 'tombstone_gothic',
  cosmetic_tombstone_modern: 'tombstone_modern',
  cosmetic_tombstone_angelic: 'tombstone_angelic',
  cosmetic_event_vintage: 'event_skin_vintage',
  cosmetic_event_neon: 'event_skin_neon',
  cosmetic_event_watercolor: 'event_skin_watercolor',
  cosmetic_font_serif: 'font_serif',
  cosmetic_font_script: 'font_script',
  cosmetic_font_mono: 'font_mono',
  cosmetic_sound_minimal: 'sound_pack_minimal',
  cosmetic_sound_jazz: 'sound_pack_jazz',
  cosmetic_sound_cinematic: 'sound_pack_cinematic',
  cosmetic_sound_lofi: 'sound_pack_minimal',
};

export function grantsForProduct(productId: string): PurchaseGrants {
  const grants: PurchaseGrants = {};

  if (productId === 'premium_monthly' || productId === 'premium_yearly') {
    grants.isPremium = true;
    grants.hasNoAds = true;
    grants.luckBoostGrant = 5;
    grants.hasSeasonPass = true;
  }
  if (productId === 'starter_pack') {
    grants.gemsGrant = 50;
    grants.hasNoAds = true;
    grants.unlockedScenarioIds = ['silver_spoon'];
  }
  if (productId === 'remove_ads') {
    grants.hasNoAds = true;
  }
  if (COIN_GRANTS[productId]) {
    grants.coinsGrant = COIN_GRANTS[productId];
  }
  if (GEMS_GRANTS[productId]) {
    grants.gemsGrant = GEMS_GRANTS[productId];
  }
  if (LUCK_BOOST_GRANTS[productId]) {
    grants.luckBoostGrant = LUCK_BOOST_GRANTS[productId];
  }
  if (productId === 'reincarnation_scroll') {
    grants.reincarnationScroll = true;
  }
  if (productId === 'season_pass') {
    grants.hasSeasonPass = true;
  }
  const avatarStyles = AVATAR_PACK_STYLES[productId];
  if (avatarStyles) {
    grants.unlockedAvatarStyles = avatarStyles;
  }
  if (MYSTERY_SPIN_GRANTS[productId]) {
    grants.mysterySpinsGrant = MYSTERY_SPIN_GRANTS[productId];
  }
  if (SCENARIO_UNLOCKS[productId]) {
    grants.unlockedScenarioIds = SCENARIO_UNLOCKS[productId];
  }
  if (COSMETIC_UNLOCKS[productId]) {
    grants.unlockedCosmeticIds = [COSMETIC_UNLOCKS[productId]];
  }

  return grants;
}

export function grantsToUserPatch(grants: PurchaseGrants): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (grants.isPremium !== undefined) patch.isPremium = grants.isPremium;
  if (grants.hasNoAds !== undefined) patch.hasNoAds = grants.hasNoAds;
  if (grants.hasSeasonPass !== undefined) patch.hasSeasonPass = grants.hasSeasonPass;
  if (grants.coinsGrant !== undefined) patch.coinsGrant = grants.coinsGrant;
  if (grants.gemsGrant !== undefined) patch.gemsGrant = grants.gemsGrant;
  if (grants.luckBoostGrant !== undefined) patch.luckBoostGrant = grants.luckBoostGrant;
  if (grants.reincarnationScroll !== undefined) {
    patch.reincarnationScroll = grants.reincarnationScroll;
  }
  if (grants.mysterySpinsGrant !== undefined) {
    patch.mysterySpinsGrant = grants.mysterySpinsGrant;
  }
  return patch;
}

export function avatarStylesForGrants(grants: PurchaseGrants): string[] {
  return grants.unlockedAvatarStyles ?? [];
}

export function scenarioIdsForGrants(grants: PurchaseGrants): string[] {
  return grants.unlockedScenarioIds ?? [];
}

export function cosmeticIdsForGrants(grants: PurchaseGrants): string[] {
  return grants.unlockedCosmeticIds ?? [];
}

/** Client IAP catalog — keep grant amounts in sync with functions/src/entitlements.ts */
import { IAPProductId, AvatarStyleId } from '../types';
import { COLORS } from '@theme';
import { COSMETIC_IAP_TO_ID } from './cosmeticCatalog';
export interface IAPCatalogEntry {
  productId: IAPProductId;
  title: string;
  description: string;
  fallbackPriceLabel: string;
  color: string;
  badge?: string;
}

export interface IAPClientGrant {
  coins?: number;
  gems?: number;
  luckBoost?: number;
  premium?: boolean;
  noAds?: boolean;
  seasonPass?: boolean;
  avatarStyle?: AvatarStyleId;
  avatarStyles?: AvatarStyleId[];
  unlockAllAvatarStyles?: boolean;
  unlockCosmeticId?: string;
  reincarnationScroll?: boolean;
  mysterySpins?: number;
  unlockScenario?: import('../types').ScenarioId;
  unlockAllScenarios?: boolean;
}

const ALL_AVATAR_STYLES: AvatarStyleId[] = [
  'adventurer',
  'adventurer-neutral',
  'lorelei',
  'lorelei-neutral',
  'bottts',
  'notionists',
  'big-smile',
];

const cosmeticGrants = Object.fromEntries(
  Object.entries(COSMETIC_IAP_TO_ID).map(([productId, cosmeticId]) => [
    productId,
    { unlockCosmeticId: cosmeticId },
  ]),
) as Partial<Record<IAPProductId, IAPClientGrant>>;

export const IAP_CLIENT_GRANTS: Partial<Record<IAPProductId, IAPClientGrant>> = {
  premium_monthly: { premium: true, noAds: true, luckBoost: 5, seasonPass: true },
  premium_yearly: { premium: true, noAds: true, luckBoost: 5, seasonPass: true },
  remove_ads: { noAds: true },
  coins_small: { coins: 10000 },
  coins_medium: { coins: 50000 },
  coins_large: { coins: 150000 },
  gems_small: { gems: 25 },
  luck_boost: { luckBoost: 3 },
  reincarnation_scroll: { reincarnationScroll: true },
  season_pass: { seasonPass: true },
  avatar_pack_adventurer: { avatarStyles: ['adventurer', 'adventurer-neutral'] },
  avatar_pack_lorelei: { avatarStyles: ['lorelei', 'lorelei-neutral'] },
  avatar_pack_bottts: { avatarStyles: ['bottts'] },
  avatar_pack_notionists: { avatarStyles: ['notionists'] },
  avatar_pack_big_smile: { avatarStyles: ['big-smile'] },
  avatar_pack_wanderer: { avatarStyles: ['adventurer-neutral', 'lorelei-neutral'] },
  avatar_bundle_all: { unlockAllAvatarStyles: true },
  mystery_spins_3: { mysterySpins: 3 },
  scenario_royal: { unlockScenario: 'royal' },
  scenario_crime: { unlockScenario: 'crime' },
  scenario_cyber: { unlockScenario: 'cyber' },
  scenario_medieval: { unlockScenario: 'medieval' },
  scenario_zombie: { unlockScenario: 'zombie' },
  scenario_mars: { unlockScenario: 'mars' },
  scenario_celebrity: { unlockScenario: 'celebrity' },
  scenario_fantasy: { unlockScenario: 'fantasy' },
  scenario_political: { unlockScenario: 'political' },
  scenario_pack_all: { unlockAllScenarios: true },
  starter_pack: { gems: 50, noAds: true, unlockScenario: 'silver_spoon' },
  ...cosmeticGrants,
};

export { ALL_AVATAR_STYLES };

export const IAP_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'remove_ads',
    title: 'Remove Ads',
    description: 'One-time. Clean forever.',
    fallbackPriceLabel: '$0.99',
    color: COLORS.sapphire,
    badge: 'ONE-TIME',
  },
  {
    productId: 'coins_small',
    title: '10,000 Coins',
    description: 'Boosts, potions & luck upgrades',
    fallbackPriceLabel: '$0.99',
    color: COLORS.gold,
  },
  {
    productId: 'coins_medium',
    title: '50,000 Coins',
    description: 'Stock up for the long game',
    fallbackPriceLabel: '$3.99',
    color: COLORS.gold,
    badge: 'BEST VALUE',
  },
  {
    productId: 'gems_small',
    title: '25 Gems',
    description: 'Premium currency for rare items',
    fallbackPriceLabel: '$1.49',
    color: COLORS.orchid,
  },
  {
    productId: 'luck_boost',
    title: 'Luck Boost ×3',
    description: 'Better outcomes for 3 events',
    fallbackPriceLabel: '500 Coins',
    color: COLORS.teal,
  },
  {
    productId: 'reincarnation_scroll',
    title: 'Reincarnation Scroll',
    description: 'Carry 3 stats into your next life',
    fallbackPriceLabel: '$0.49',
    color: COLORS.crimson,
  },
];

export const MYSTERY_SPIN_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'mystery_spins_3',
    title: '3 Mystery Spins',
    description: 'Get 3 extra Lucky Wheel spins this week',
    fallbackPriceLabel: '$0.99',
    color: COLORS.orchid,
    badge: 'BONUS SPINS',
  },
];

export const PREMIUM_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'premium_monthly',
    title: 'LifeQuest Plus',
    description: 'No ads, luck boost, season pass perks',
    fallbackPriceLabel: '$0.49/mo',
    color: COLORS.gold,
    badge: 'POPULAR',
  },
  {
    productId: 'premium_yearly',
    title: 'LifeQuest Plus Yearly',
    description: 'Best value — full year of Plus',
    fallbackPriceLabel: '$2.99/yr',
    color: COLORS.gold,
    badge: 'BEST VALUE',
  },
  {
    productId: 'season_pass',
    title: 'Season Pass',
    description: 'Unlock premium tier rewards this season',
    fallbackPriceLabel: '$1.49',
    color: COLORS.teal,
  },
];

export const SCENARIO_PACK_CATALOG: IAPCatalogEntry[] = [
  { productId: 'scenario_royal',     title: 'Royal Dynasty',      description: 'Born into power. Rule wisely.',            fallbackPriceLabel: '$2.99', color: '#F59E0B' },
  { productId: 'scenario_crime',     title: 'Criminal Empire',    description: 'Power. Money. Consequences.',              fallbackPriceLabel: '$2.99', color: '#EF4444' },
  { productId: 'scenario_cyber',     title: 'Cyber Future',       description: 'In 2087, humanity uploaded everything.',   fallbackPriceLabel: '$2.99', color: '#06B6D4' },
  { productId: 'scenario_medieval',  title: 'Medieval Kingdom',   description: 'Peasant or lord — your choice.',           fallbackPriceLabel: '$1.99', color: '#92400E' },
  { productId: 'scenario_zombie',    title: 'Zombie Apocalypse',  description: 'Survive. Build. Protect.',                 fallbackPriceLabel: '$1.99', color: '#4D7C0F' },
  { productId: 'scenario_mars',      title: 'Mars Colony',        description: 'Red planet, new rules.',                   fallbackPriceLabel: '$2.99', color: '#DC2626' },
  { productId: 'scenario_celebrity', title: 'Celebrity Child',    description: 'Born famous. Stay sane.',                  fallbackPriceLabel: '$1.99', color: '#EC4899' },
  { productId: 'scenario_fantasy',   title: 'Fantasy Kingdom',    description: 'Magic is real. Use it wisely.',            fallbackPriceLabel: '$2.99', color: '#7C3AED' },
  { productId: 'scenario_political', title: 'Political Dynasty',  description: 'Elections. Deals. Power.',                 fallbackPriceLabel: '$1.99', color: '#1D4ED8' },
  { productId: 'scenario_pack_all',  title: 'All Scenarios Bundle', description: 'Unlock all 9 premium scenarios.',       fallbackPriceLabel: '$4.99', color: '#8B5CF6', badge: 'BEST VALUE' },
];

export const AVATAR_PACK_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'avatar_pack_adventurer',
    title: 'Explorer Pack',
    description: 'Adventurer + Wanderer styles',
    fallbackPriceLabel: '$0.99',
    color: COLORS.emerald,
  },
  {
    productId: 'avatar_pack_lorelei',
    title: 'Lorelei Pack',
    description: 'Lorelei + Mystic styles',
    fallbackPriceLabel: '$0.99',
    color: COLORS.orchid,
  },
  {
    productId: 'avatar_pack_bottts',
    title: 'Robo Pack',
    description: 'Quirky bottts robot style',
    fallbackPriceLabel: '$0.99',
    color: COLORS.sapphire,
  },
  {
    productId: 'avatar_pack_notionists',
    title: 'Professional Pack',
    description: 'Clean professional look',
    fallbackPriceLabel: '$0.99',
    color: COLORS.teal,
  },
  {
    productId: 'avatar_pack_big_smile',
    title: 'Joyful Pack',
    description: 'Expressive cheerful style',
    fallbackPriceLabel: '$0.99',
    color: COLORS.gold,
  },
  {
    productId: 'avatar_pack_wanderer',
    title: 'Neutral Duo Pack',
    description: 'Gender-neutral explorer styles',
    fallbackPriceLabel: '$0.99',
    color: COLORS.crimson,
  },
  {
    productId: 'avatar_bundle_all',
    title: 'All Avatar Packs',
    description: 'Unlock every avatar style at once',
    fallbackPriceLabel: '$1.99',
    color: COLORS.orchid,
    badge: 'BEST VALUE',
  },
];

export function getCatalogPriceLabel(
  productId: IAPProductId,
  storeProducts: { productId: string; localizedPrice?: string }[],
  fallback: string,
): string {
  const match = storeProducts.find(p => p.productId === productId);
  return match?.localizedPrice ?? fallback;
}

/** Client IAP catalog — keep grant amounts in sync with functions/src/entitlements.ts */
import { IAPProductId } from '../types';
import { COLORS } from '../constants/theme';

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
  avatarStyle?: 'adventurer' | 'lorelei' | 'bottts';
  reincarnationScroll?: boolean;
}

export const IAP_CLIENT_GRANTS: Partial<Record<IAPProductId, IAPClientGrant>> = {
  premium_monthly: { premium: true, noAds: true, luckBoost: 5 },
  premium_yearly: { premium: true, noAds: true, luckBoost: 5 },
  remove_ads: { noAds: true },
  coins_small: { coins: 10000 },
  coins_medium: { coins: 50000 },
  coins_large: { coins: 150000 },
  gems_small: { gems: 25 },
  luck_boost: { luckBoost: 3 },
  reincarnation_scroll: { reincarnationScroll: true },
  season_pass: { seasonPass: true },
  avatar_pack_adventurer: { avatarStyle: 'adventurer' },
  avatar_pack_lorelei: { avatarStyle: 'lorelei' },
  avatar_pack_bottts: { avatarStyle: 'bottts' },
};

export const IAP_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'remove_ads',
    title: 'Remove Ads',
    description: 'One-time. Clean forever.',
    fallbackPriceLabel: '$1.99',
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

export const AVATAR_PACK_CATALOG: IAPCatalogEntry[] = [
  {
    productId: 'avatar_pack_adventurer',
    title: 'Adventurer Pack',
    description: 'Unlock adventurer avatar style',
    fallbackPriceLabel: '$0.79',
    color: COLORS.emerald,
  },
  {
    productId: 'avatar_pack_lorelei',
    title: 'Lorelei Pack',
    description: 'Unlock lorelei avatar style',
    fallbackPriceLabel: '$0.79',
    color: COLORS.orchid,
  },
  {
    productId: 'avatar_pack_bottts',
    title: 'Bottts Pack',
    description: 'Unlock bottts avatar style',
    fallbackPriceLabel: '$0.79',
    color: COLORS.sapphire,
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

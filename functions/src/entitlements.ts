export interface PurchaseGrants {
  isPremium?: boolean;
  hasNoAds?: boolean;
  coinsGrant?: number;
  gemsGrant?: number;
  luckBoostGrant?: number;
  reincarnationScroll?: boolean;
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

export function grantsForProduct(productId: string): PurchaseGrants {
  const grants: PurchaseGrants = {};

  if (productId === 'premium_monthly' || productId === 'premium_yearly') {
    grants.isPremium = true;
    grants.hasNoAds = true;
    grants.luckBoostGrant = 5;
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

  return grants;
}

export function grantsToUserPatch(grants: PurchaseGrants): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (grants.isPremium !== undefined) patch.isPremium = grants.isPremium;
  if (grants.hasNoAds !== undefined) patch.hasNoAds = grants.hasNoAds;
  if (grants.coinsGrant !== undefined) patch.coinsGrant = grants.coinsGrant;
  if (grants.gemsGrant !== undefined) patch.gemsGrant = grants.gemsGrant;
  if (grants.luckBoostGrant !== undefined) patch.luckBoostGrant = grants.luckBoostGrant;
  if (grants.reincarnationScroll !== undefined) {
    patch.reincarnationScroll = grants.reincarnationScroll;
  }
  return patch;
}

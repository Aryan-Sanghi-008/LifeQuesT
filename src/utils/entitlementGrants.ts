import { Character, AvatarStyleId } from '../types';

export interface UserEntitlements {
  isPremium?: boolean;
  hasNoAds?: boolean;
  hasSeasonPass?: boolean;
  unlockedAvatarStyles?: AvatarStyleId[];
  coinsGrant?: number;
  gemsGrant?: number;
  luckBoostGrant?: number;
  reincarnationScroll?: boolean;
}

export function applyEntitlementsToCharacter(
  character: Character,
  entitlements: UserEntitlements,
): Character {
  const next = { ...character };

  if (entitlements.isPremium) {
    next.isPremium = true;
    next.hasNoAds = true;
  }
  if (entitlements.hasNoAds) next.hasNoAds = true;
  if (entitlements.hasSeasonPass) next.hasSeasonPass = true;
  if (entitlements.unlockedAvatarStyles?.length) {
    const styles = new Set<AvatarStyleId>([
      ...(next.unlockedAvatarStyles ?? ['pixel_art']),
      ...entitlements.unlockedAvatarStyles,
    ]);
    styles.add('pixel_art');
    next.unlockedAvatarStyles = Array.from(styles);
  }
  if (entitlements.coinsGrant) next.coins += entitlements.coinsGrant;
  if (entitlements.gemsGrant) next.gems += entitlements.gemsGrant;
  if (entitlements.luckBoostGrant) {
    next.luckBoostsRemaining += entitlements.luckBoostGrant;
  }
  if (entitlements.reincarnationScroll) next.hasReincarnationScroll = true;

  return next;
}

export function hasPendingGrants(entitlements: UserEntitlements): boolean {
  return (
    (entitlements.coinsGrant ?? 0) > 0
    || (entitlements.gemsGrant ?? 0) > 0
    || (entitlements.luckBoostGrant ?? 0) > 0
    || entitlements.reincarnationScroll === true
  );
}

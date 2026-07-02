import { Character, AvatarStyleId, GlobalPrestigeState, ScenarioId } from '@/types';
import { FREE_SCENARIO_IDS } from '@/data/scenarioCatalog';

export interface UserEntitlements {
  isPremium?: boolean;
  hasNoAds?: boolean;
  hasSeasonPass?: boolean;
  unlockedAvatarStyles?: AvatarStyleId[];
  unlockedScenarioIds?: ScenarioId[];
  coinsGrant?: number;
  gemsGrant?: number;
  luckBoostGrant?: number;
  reincarnationScroll?: boolean;
}

function defaultStyleForCharacter(character: Character): AvatarStyleId {
  if (character.gender === 'female') return 'lorelei';
  if (character.gender === 'other') return 'notionists';
  return 'adventurer';
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
      ...(next.unlockedAvatarStyles ?? [defaultStyleForCharacter(character)]),
      ...entitlements.unlockedAvatarStyles,
    ]);
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

export function applyEntitlementsToGlobalPrestige(
  prestige: GlobalPrestigeState,
  entitlements: UserEntitlements,
): GlobalPrestigeState {
  const next = { ...prestige };
  if (entitlements.unlockedScenarioIds?.length) {
    const merged = new Set<ScenarioId>([
      ...(next.unlockedScenarioIds ?? []),
      ...FREE_SCENARIO_IDS,
      ...entitlements.unlockedScenarioIds,
    ]);
    next.unlockedScenarioIds = Array.from(merged);
  }
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

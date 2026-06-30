import { SEASON_PASS_TIERS } from "@data/gameData";

export function getSeasonPassLevel(xp: number = 0) {
  let activeTier = 1;
  let currentXpInTier = xp;
  let nextTierXpRequired = 100;

  // Sort tiers ascending by xpRequired
  const sortedTiers = [...SEASON_PASS_TIERS].sort((a, b) => a.xpRequired - b.xpRequired);

  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    if (xp >= tier.xpRequired) {
      activeTier = tier.tier;
    }
  }

  const currentTierDef = sortedTiers.find((t) => t.tier === activeTier);
  const nextTierDef = sortedTiers.find((t) => t.tier === activeTier + 1);

  if (currentTierDef && nextTierDef) {
    const base = currentTierDef.xpRequired;
    const target = nextTierDef.xpRequired;
    currentXpInTier = xp - base;
    nextTierXpRequired = target - base;
  } else if (currentTierDef) {
    // Max level reached
    currentXpInTier = currentTierDef.xpRequired;
    nextTierXpRequired = currentTierDef.xpRequired;
  }

  return {
    level: activeTier,
    currentXp: currentXpInTier,
    maxXp: nextTierXpRequired,
    totalXp: xp,
  };
}

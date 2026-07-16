// ─── Season Pass ─────────────────────────────────────────────────────────────

export interface SeasonPassTier {
  tier: number;
  xpRequired: number;
  rewardCoins: number;
  rewardGems?: number;
  rewardLuckBoosts?: number;
}

export interface SeasonProgress {
  seasonId: string;
  xp: number;
  claimedTiers: number[];
}

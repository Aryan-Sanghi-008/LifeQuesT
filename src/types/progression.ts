import type { ScenarioId } from './scenario';
// ─── Challenge & Prestige ───────────────────────────────────────────────────

export type ChallengeId =
  | 'rags_to_riches'
  | 'zero_crime_saint'
  | 'long_life'
  | 'no_relationships'
  | 'speedrun_millionaire';

export interface Challenge {
  id: ChallengeId;
  title: string;
  description: string;
  rules: string[];
  pointsReward: number;
}

export interface GlobalPrestigeState {
  prestigePoints: number;
  prestigeLevel: number;
  totalLivesLived: number;
  completedChallengeIds: ChallengeId[];
  unlockedTraitIds: string[];
  unlockedScenarioIds: ScenarioId[];
  unlockedDynastyPerkIds: string[];
  familyCrestId?: string;
  dynastyStatBonusTier: number;
  plusScenarioCredits?: number;
  plusScenarioCreditsMonth?: string;
  plusMonthScenarioIds?: ScenarioId[];
  plusCosmeticMonth?: string;
  unlockedCosmeticIds?: string[];
}

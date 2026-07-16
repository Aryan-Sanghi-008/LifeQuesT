import { useGameStore } from '@store/gameStore';
import type { GameStore } from '@store/types';
import type { GlobalPrestigeState } from '@/types';

export const defaultGlobalPrestige = (): GlobalPrestigeState => ({
  prestigePoints: 0,
  prestigeLevel: 0,
  totalLivesLived: 0,
  completedChallengeIds: [],
  unlockedTraitIds: [],
  unlockedScenarioIds: ['classic'],
  unlockedDynastyPerkIds: [],
  dynastyStatBonusTier: 0,
  familyCrestId: undefined,
});

/** Seed Zustand game store with partial state and sensible prestige defaults. */
export function seedGameStore(partial: Partial<GameStore> = {}): void {
  const { globalPrestige, ...rest } = partial;
  useGameStore.setState({
    globalPrestige: globalPrestige ?? defaultGlobalPrestige(),
    ...rest,
  });
}

import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import { evaluateUnlockedCollectionIds, getCompletedSets } from '@engine/collectionsEngine';
import { GlobalPrestigeState, CollectionSet } from '@/types';
import { saveGlobalPrestige } from '@services/persistence';
import { SEASON_PASS_TIERS } from '@/data/gameData';
import { evaluateAchievements, getNewAchievementIds } from '@engine/achievementEngine';
import { ACHIEVEMENT_COIN_REWARDS, ACHIEVEMENT_GEM_REWARDS } from '@/data/achievements';
import { PRESTIGE_TRAITS } from '@engine/prestigeEngine';
import { getDynastyPerkById, countDynastyPerkPurchases } from '@/data/dynastyShop';
import { getEligibleDynastyMilestones } from '@engine/dynastyMilestoneEngine';
import { DynastyMilestone } from '@/data/dynastyMilestones';
import { hapticAchievement } from '@services/haptics';
import { playSound } from '@services/audio';
import {
  grantCappedGameplayCoins,
  grantCappedGameplayTickets,
} from './progressionShared';

export interface ProgressionSlice {
  globalPrestige: GlobalPrestigeState;
  achievementUnlockQueue: string[];
  dynastyMilestoneQueue: DynastyMilestone[];
  collectionSetCompleteQueue: CollectionSet[];

  dismissAchievementUnlock: () => void;
  dismissDynastyMilestone: () => void;
  dismissCollectionSetComplete: () => void;
  addSeasonXp: (amount: number) => void;
  claimSeasonTier: (tier: number) => { ok: boolean; message: string };
  purchasePrestigeUnlock: (traitId: string) => {
    ok: boolean;
    message?: string;
  };
  purchaseDynastyPerk: (perkId: string) => {
    ok: boolean;
    message?: string;
  };
  setSeasonPass: (v: boolean) => void;
  _checkAchievements: () => void;
  checkCollectionSetRewards: () => CollectionSet[];
  checkDynastyMilestones: () => DynastyMilestone[];
}

export const createProgressionSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  ProgressionSlice
> = (set, get) => ({
  globalPrestige: {
    prestigePoints: 0,
    prestigeLevel: 1,
    totalLivesLived: 0,
    completedChallengeIds: [],
    unlockedTraitIds: [],
    unlockedScenarioIds: ['classic', 'rags_to_riches', 'silver_spoon'],
    unlockedDynastyPerkIds: [],
    dynastyStatBonusTier: 0,
  },
  achievementUnlockQueue: [],
  dynastyMilestoneQueue: [],
  collectionSetCompleteQueue: [],

  dismissAchievementUnlock: () => {
    set((s) => {
      s.achievementUnlockQueue = s.achievementUnlockQueue.slice(1);
    });
  },

  dismissDynastyMilestone: () => {
    set((s) => {
      s.dynastyMilestoneQueue = s.dynastyMilestoneQueue.slice(1);
    });
  },

  dismissCollectionSetComplete: () => {
    set((s) => {
      s.collectionSetCompleteQueue = s.collectionSetCompleteQueue.slice(1);
    });
  },

  addSeasonXp: (amount) => {
    set((s) => {
      if (!s.character) return;
      s.character.seasonXp = (s.character.seasonXp ?? 0) + amount;
    });
  },

  claimSeasonTier: (tier) => {
    const { character } = get();
    if (!character?.hasSeasonPass) {
      return { ok: false, message: 'Season pass required.' };
    }
    const tierDef = SEASON_PASS_TIERS.find((t) => t.tier === tier);
    if (!tierDef) return { ok: false, message: 'Invalid tier.' };
    if ((character.claimedSeasonTiers ?? []).includes(tier)) {
      return { ok: false, message: 'Tier already claimed.' };
    }
    if ((character.seasonXp ?? 0) < tierDef.xpRequired) {
      return { ok: false, message: 'Not enough season XP.' };
    }
    let grantedCoins = 0;
    set((s) => {
      if (!s.character) return;
      if (!s.character.claimedSeasonTiers) s.character.claimedSeasonTiers = [];
      s.character.claimedSeasonTiers.push(tier);
      grantedCoins = grantCappedGameplayCoins(s.character, tierDef.rewardCoins);
      if (tierDef.rewardGems) s.character.gems += tierDef.rewardGems;
      if (tierDef.rewardLuckBoosts) {
        s.character.luckBoostsRemaining += tierDef.rewardLuckBoosts;
      }
      if (tierDef.rewardTickets) {
        grantCappedGameplayTickets(s.character, tierDef.rewardTickets);
      }
    });
    void get()._persist();
    const coinMsg = grantedCoins > 0 ? ` + ${grantedCoins} coins` : '';
    return { ok: true, message: `Claimed tier ${tier} rewards!${coinMsg}` };
  },

  purchasePrestigeUnlock: (traitId) => {
    const prestige = get().globalPrestige;
    const trait = PRESTIGE_TRAITS.find((t) => t.id === traitId);
    if (!trait) return { ok: false, message: 'Invalid prestige trait.' };
    if (prestige.prestigePoints < trait.cost) {
      return { ok: false, message: 'Not enough prestige points.' };
    }
    if (prestige.unlockedTraitIds.includes(traitId)) {
      return { ok: false, message: 'Trait already unlocked.' };
    }

    const nextPrestige = {
      ...prestige,
      prestigePoints: prestige.prestigePoints - trait.cost,
      unlockedTraitIds: [...prestige.unlockedTraitIds, traitId],
    };

    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    return { ok: true };
  },

  purchaseDynastyPerk: (perkId) => {
    const prestige = get().globalPrestige;
    const perk = getDynastyPerkById(perkId);
    if (!perk) return { ok: false, message: 'Invalid dynasty perk.' };
    if (prestige.prestigePoints < perk.cost) {
      return { ok: false, message: 'Not enough legacy points.' };
    }

    const purchases = countDynastyPerkPurchases(prestige.unlockedDynastyPerkIds ?? [], perkId);
    if (perk.maxPurchases !== undefined && purchases >= perk.maxPurchases) {
      return { ok: false, message: 'Perk already at max tier.' };
    }

    const nextPrestige: GlobalPrestigeState = {
      ...prestige,
      prestigePoints: prestige.prestigePoints - perk.cost,
      unlockedDynastyPerkIds: [...(prestige.unlockedDynastyPerkIds ?? []), perkId],
    };

    if (perkId === 'dynasty_stat_lineage') {
      nextPrestige.dynastyStatBonusTier = Math.min(5, (prestige.dynastyStatBonusTier ?? 0) + 1);
    }
    if (perk.crestId) {
      nextPrestige.familyCrestId = perk.crestId;
    }

    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    return { ok: true };
  },

  setSeasonPass: (v) => {
    set((s) => {
      if (s.character) s.character.hasSeasonPass = v;
    });
    void get()._persist();
  },

  _checkAchievements: () => {
    const { character } = get();
    if (!character) return;
    const previous = [...character.achievements];
    const earned = evaluateAchievements(character);
    let coinReward = 0;
    let gemReward = 0;
    const newlyUnlocked: string[] = [];
    getNewAchievementIds(previous, earned).forEach((id) => {
      coinReward += ACHIEVEMENT_COIN_REWARDS[id] ?? 50;
      gemReward += ACHIEVEMENT_GEM_REWARDS[id] ?? 1;
      newlyUnlocked.push(id);
    });

    const newCount = earned.size - previous.length;
    if (earned.size !== character.achievements.length || coinReward > 0 || gemReward > 0) {
      set((s) => {
        if (!s.character) return;
        s.character.achievements = Array.from(earned);
        if (coinReward > 0) s.character.coins += coinReward;
        if (gemReward > 0) s.character.gems = (s.character.gems ?? 0) + gemReward;
        if (newCount > 0) s.showConfetti = true;
        if (newlyUnlocked.length > 0) {
          const pending = new Set(s.achievementUnlockQueue);
          for (const id of newlyUnlocked) {
            if (!pending.has(id)) s.achievementUnlockQueue.push(id);
          }
        }
      });
      if (coinReward > 0 || gemReward > 0) void get()._persist();
      if (newCount > 0) {
        hapticAchievement();
        void playSound('achievement_unlock');
      }
    }
  },

  checkCollectionSetRewards: () => {
    const { character, globalPrestige } = get();
    if (!character) return [];
    const unlockedIds = evaluateUnlockedCollectionIds(character, globalPrestige.prestigeLevel);
    const claimed = character.completedCollectionSetIds ?? [];
    const newlyComplete = getCompletedSets(unlockedIds, claimed);
    if (newlyComplete.length === 0) return [];

    set((s) => {
      if (!s.character) return;
      for (const completedSet of newlyComplete) {
        if (!s.character.completedCollectionSetIds) s.character.completedCollectionSetIds = [];
        if (!s.character.unlockedTitles) s.character.unlockedTitles = [];
        s.character.completedCollectionSetIds.push(completedSet.id);
        if (!s.character.unlockedTitles.includes(completedSet.titleReward)) {
          s.character.unlockedTitles.push(completedSet.titleReward);
        }
        s.character.coins += completedSet.coinReward;
        if (completedSet.gemReward) s.character.gems = (s.character.gems ?? 0) + completedSet.gemReward;
        s.showConfetti = true;
        s.collectionSetCompleteQueue = [...s.collectionSetCompleteQueue, completedSet];
      }
    });
    void get()._persist();
    return newlyComplete;
  },

  checkDynastyMilestones: () => {
    const { character } = get();
    if (!character) return [];
    const eligible = getEligibleDynastyMilestones(character);
    if (eligible.length === 0) return [];

    set((s) => {
      if (!s.character) return;
      for (const milestone of eligible) {
        if (!s.character.claimedDynastyMilestoneIds) s.character.claimedDynastyMilestoneIds = [];
        s.character.claimedDynastyMilestoneIds.push(milestone.id);
        if (!s.character.unlockedTitles) s.character.unlockedTitles = [];
        if (!s.character.unlockedTitles.includes(milestone.titleReward)) {
          s.character.unlockedTitles.push(milestone.titleReward);
        }
        grantCappedGameplayCoins(s.character, milestone.coinReward);
        s.character.gems = (s.character.gems ?? 0) + milestone.gemReward;
        s.showConfetti = true;
        s.dynastyMilestoneQueue = [...s.dynastyMilestoneQueue, milestone];
      }
    });
    void get()._persist();
    return eligible;
  },
});

export type { LoginReward, MysteryReward, StreakMilestone } from './progressionShared';
export {
  LOGIN_REWARD_SCHEDULE,
  STREAK_MILESTONES,
  MYSTERY_SEGMENTS,
  rollMysterySegmentIndex,
} from './progressionShared';

import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { evaluateUnlockedCollectionIds, getCompletedSets } from '../../engine/collectionsEngine';
import { DailyQuest, GlobalPrestigeState, CollectionSet, ScenarioId } from "../../types";
import { FREE_SCENARIO_IDS, PREMIUM_SCENARIO_IDS } from "../../data/scenarioCatalog";
import { LOGIN_REWARD_SCHEDULE, LoginReward } from "../../data/loginRewards";
import { getDailyRewardMultiplier } from "@services/remoteConfig";
import {
  setDailyBonusLastClaim,
  getDailyQuestsProgress,
  setDailyQuestsProgress,
  saveGlobalPrestige,
  getLoginRewardDay,
  setLoginRewardDay,
  getLoginRewardLastClaim,
  setLoginRewardLastClaim,
  getMysteryBoxLastSpin,
  setMysteryBoxLastSpin,
} from "@services/persistence";
import {
  pickDailyQuests,
  stampKarmaBaseline,
  claimQuest,
  isQuestComplete,
  updateQuestProgress,
} from "../../engine/questEngine";
import { SEASON_PASS_TIERS } from "../../data/gameData";
import {
  canStudy,
  pickStudyQuestions,
  gradeStudySession,
  advanceEducation,
  enrollInProgram,
  StudyQuestion,
  StudySessionResult,
  studyQuizRewards,
} from "../../engine/educationEngine";
import { scaleEducationCost } from "../../engine/countryScaleEngine";
import { applyCashDelta, clamp } from "../../engine/economyEngine";
import { appendFinanceLedger, createLedgerEntry } from "../../engine/financeLedgerEngine";
import { getDegreeById } from "../../data/educationDegrees";
import { getCountryEconomy, getMaxPersonalDebtForCharacter } from "../../data/countryEconomy";
import {
  checkCertificationEligibility,
  rollCertificationExam,
} from "../../engine/certificationEngine";
import { evaluateAchievements, getNewAchievementIds } from "../../engine/achievementEngine";
import { ACHIEVEMENT_COIN_REWARDS, ACHIEVEMENT_GEM_REWARDS } from "../../data/achievements";
import { PRESTIGE_TRAITS } from "../../engine/prestigeEngine";
import { getDynastyPerkById, countDynastyPerkPurchases } from "../../data/dynastyShop";
import {
  getMonthKey,
  getMonthlyCosmeticId,
  getMonthlyScenarioPool,
  PLUS_SCENARIO_CREDITS_PER_MONTH,
} from "../../data/plusRotation";
import {
  getCosmeticById,
  isFreeBaselineCosmetic,
  migrateCosmeticId,
  migrateCosmeticIdList,
} from "../../data/cosmeticCatalog";
import { useSettingsStore } from "../settingsStore";
import { themeSkinIdFromCosmetic } from "@theme/themeSkins";
import {
  applyGameplayCoinGrant,
  applyGameplayTicketGrant,
  applyPremiumCoinBonus,
  GameplayCoinState,
  GameplayTicketState,
} from "../../engine/economyCapEngine";
import { useToastStore } from "../toastStore";
import { hapticAchievement, hapticMoneyEarned } from "../../services/haptics";
import { playSound } from "../../services/audio";
import { applyAbsenceCatchUp } from "../../engine/absenceCatchUpEngine";
import { getEligibleDynastyMilestones } from "../../engine/dynastyMilestoneEngine";
import { DynastyMilestone } from "../../data/dynastyMilestones";

export type { LoginReward };
export { LOGIN_REWARD_SCHEDULE };

export interface MysteryReward {
  type: 'coins' | 'gems' | 'luck' | 'rare_event' | 'season_xp' | 'cosmetic';
  amount: number;
  label: string;
  cosmeticStyle?: import('../../types').AvatarStyleId;
}

// ─── Streak Milestones ────────────────────────────────────────────────────────

export interface StreakMilestone {
  days: number;
  label: string;
  rewardType: 'gems' | 'avatar_unlock' | 'cosmetic' | 'prestige_title';
  rewardAmount: number;
  rewardLabel: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7,   label: '1 Week Streak',    rewardType: 'gems',           rewardAmount: 10, rewardLabel: '+10 Gems' },
  { days: 30,  label: '30-Day Streak',    rewardType: 'avatar_unlock',  rewardAmount: 1,  rewardLabel: 'Rare Avatar Unlock' },
  { days: 100, label: '100-Day Streak',   rewardType: 'cosmetic',       rewardAmount: 1,  rewardLabel: 'Legendary Cosmetic Flag' },
  { days: 365, label: '1-Year Streak',    rewardType: 'prestige_title', rewardAmount: 1,  rewardLabel: 'Prestige Title: Eternal' },
];

export const MYSTERY_SEGMENTS: MysteryReward[] = [
  { type: 'coins', amount: 100, label: '100 Coins' },
  { type: 'coins', amount: 300, label: '300 Coins' },
  { type: 'gems', amount: 2, label: '2 Gems' },
  { type: 'gems', amount: 5, label: '5 Gems' },
  { type: 'luck', amount: 5, label: '+5 Luck Boost' },
  { type: 'rare_event', amount: 1, label: 'Rare Event Unlock' },
  { type: 'season_xp', amount: 75, label: '+75 Season XP' },
  { type: 'cosmetic', amount: 1, label: 'Avatar Style Unlock', cosmeticStyle: 'notionists' },
];

function getIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function grantCappedGameplayCoins(
  character: GameplayCoinState & { isPremium?: boolean },
  amount: number,
): number {
  const boosted = applyPremiumCoinBonus(amount, character.isPremium ?? false);
  const result = applyGameplayCoinGrant(character, boosted);
  if (result.hitCap) {
    useToastStore.getState().showToast(
      'Daily coin earn limit reached (5,000). Resets tomorrow.',
      'info',
    );
  }
  return result.granted;
}

function grantCappedGameplayTickets(
  character: GameplayTicketState,
  amount: number,
): number {
  const result = applyGameplayTicketGrant(character, amount);
  if (result.hitCap) {
    useToastStore.getState().showToast(
      'Weekly ticket earn limit reached (5). Resets next week.',
      'info',
    );
  }
  return result.granted;
}

/**
 * Checks if the player missed a day (last claim was 2+ days ago) and resets
 * the login reward cycle to day 1. Returns the current (possibly reset) day.
 */
function resolveMissedDay(): number {
  const last = getLoginRewardLastClaim();
  if (!last) return getLoginRewardDay();

  const today = new Date().toISOString().slice(0, 10);
  if (last === today) return getLoginRewardDay();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (last === yesterdayStr) return getLoginRewardDay();

  const lastMs = new Date(last).getTime();
  const hoursSince = (Date.now() - lastMs) / 3600000;
  if (hoursSince <= 24) return getLoginRewardDay();

  // Missed beyond grace — reset to day 1
  setLoginRewardDay(1);
  return 1;
}

export function rollMysterySegmentIndex(): number {
  const weights = [3, 3, 2, 2, 2, 1, 2, 1];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return 0;
}

export interface ProgressionSlice {
  dailyQuests: DailyQuest[];
  globalPrestige: GlobalPrestigeState;
  studyQuestions: StudyQuestion[] | null;
  achievementUnlockQueue: string[];
  dynastyMilestoneQueue: DynastyMilestone[];
  collectionSetCompleteQueue: CollectionSet[];
  pendingAbsenceBonus: { daysAway: number; coins: number; gems: number; projectedAge: number; yearsToAdvance: number; narrativeLines: string[] } | null;

  claimDailyBonus: () => { ok: boolean; message: string };
  claimLoginReward: () => { ok: boolean; message: string; day: number; reward: LoginReward };
  canClaimLoginReward: () => boolean;
  getLoginRewardState: () => { day: number; claimed: boolean };
  canSpinMysteryBox: () => boolean;
  canSpinMysteryBoxWithTicket: () => boolean;
  spinMysteryBox: (options?: { useTicket?: boolean; segmentIndex?: number }) => { ok: boolean; reward?: MysteryReward; segmentIndex?: number; message: string };
  dismissAchievementUnlock: () => void;
  checkAbsenceBonus: () => void;
  claimAbsenceBonus: () => void;
  loadDailyQuests: () => void;
  claimQuestReward: (questId: string) => { ok: boolean; message: string };
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
  startStudySession: () => StudyQuestion[];
  completeStudySession: (answers: number[]) => StudySessionResult;
  grantDegree: (degreeId: string) => { ok: boolean; message: string };
  enrollInDegree: (degreeId: string) => { ok: boolean; message: string };
  chooseCollegeMajor: (degreeIdOrSkip: string | 'skip') => { ok: boolean; message: string };
  applyStudyQuizRewards: (passed: boolean) => { ok: boolean; message: string };
  takeCertificationExam: (certId: string) => { ok: boolean; message: string };
  _checkAchievements: () => void;
  checkStreakMilestones: () => StreakMilestone | null;
  purchaseStreakShield: () => { ok: boolean; message: string };
  consumeStreakShieldIfAvailable: () => boolean;
  addMysterySpins: (n: number) => void;
  grantAdRewardCoins: (amount: number) => number;
  grantAdMysteryTicket: () => number;
  purchaseMysterySpinWithGems: () => { ok: boolean; message: string };
  checkCollectionSetRewards: () => CollectionSet[];
  checkDynastyMilestones: () => DynastyMilestone[];
  dismissDynastyMilestone: () => void;
  dismissCollectionSetComplete: () => void;
  unlockScenario: (scenarioId: ScenarioId) => void;
  unlockAllPremiumScenarios: () => void;
  isScenarioOwned: (scenarioId: ScenarioId) => boolean;
  ensurePlusMonthlyState: () => void;
  redeemPlusScenarioPick: (scenarioId: ScenarioId) => { ok: boolean; message: string };
  grantPlusMonthlyCosmetic: () => void;
  purchaseCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  grantCosmeticUnlock: (cosmeticId: string) => void;
  applyCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  getPlusScenarioPool: () => ScenarioId[];
}

export const createProgressionSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  ProgressionSlice
> = (set, get) => ({
  dailyQuests: [],
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
  studyQuestions: null,
  achievementUnlockQueue: [],
  dynastyMilestoneQueue: [],
  collectionSetCompleteQueue: [],
  pendingAbsenceBonus: null,

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

  checkAbsenceBonus: () => {
    const { character } = get();
    if (!character?.isAlive || !character.lastActiveDate) return;
    const today = new Date().toISOString().slice(0, 10);
    if (character.lastAbsenceBonusDate === today) return;

    const lastMs = new Date(character.lastActiveDate).getTime();
    const todayMs = new Date(today).getTime();
    const daysAway = Math.round((todayMs - lastMs) / 86400000);
    if (daysAway < 2) return;

    const coins = 150 + daysAway * 75;
    const gems = Math.min(5, 1 + Math.floor(daysAway / 2));
    const yearsToAdvance = Math.min(daysAway, 3);
    const projectedAge = character.age + yearsToAdvance;

    const narrativeLines: string[] = [];
    narrativeLines.push('Daily quests reset while you were away.');
    if (character.dailyStreak && character.dailyStreak > 1) {
      narrativeLines.push(`Your ${character.dailyStreak}-day streak was at risk — age up daily to keep it going.`);
    }
    if ((character.generation ?? 1) > 1) {
      narrativeLines.push(`Your dynasty (Generation ${character.generation}) continues to grow.`);
    } else if ((character.people ?? []).some((p) => p.relationType === 'child' && p.isAlive)) {
      narrativeLines.push('Your children are growing up — be there for the key moments.');
    }

    set((s) => {
      s.pendingAbsenceBonus = { daysAway, coins, gems, projectedAge, yearsToAdvance, narrativeLines };
    });
  },

  claimAbsenceBonus: () => {
    const bonus = get().pendingAbsenceBonus;
    if (!bonus) return;
    const { character } = get();
    if (!character) return;
    const today = new Date().toISOString().slice(0, 10);
    const { character: aged } = applyAbsenceCatchUp(character, bonus.yearsToAdvance);
    set((s) => {
      if (!s.character) return;
      // Apply age catch-up fields from the engine result
      s.character.age = aged.age;
      s.character.lifeStage = aged.lifeStage;
      s.character.people = aged.people;
      s.character.bankBalance = aged.bankBalance;
      s.character.debt = aged.debt;
      s.character.eventHistory = aged.eventHistory;
      // Grant return bonus (capped gameplay coins)
      grantCappedGameplayCoins(s.character, bonus.coins);
      s.character.gems = (s.character.gems ?? 0) + bonus.gems;
      s.character.lastAbsenceBonusDate = today;
      s.character.lastActiveDate = today;
      s.pendingAbsenceBonus = null;
    });
    void get()._persist();
  },

  claimDailyBonus: () => {
    const result = get().claimLoginReward();
    return { ok: result.ok, message: result.message };
  },

  canClaimLoginReward: () => {
    const today = new Date().toISOString().slice(0, 10);
    return getLoginRewardLastClaim() !== today;
  },

  getLoginRewardState: () => {
    const today = new Date().toISOString().slice(0, 10);
    const day = resolveMissedDay();
    const claimed = getLoginRewardLastClaim() === today;
    return { day, claimed };
  },

  claimLoginReward: () => {
    const { character } = get();
    if (!character) {
      const fallbackReward = LOGIN_REWARD_SCHEDULE[0];
      return { ok: false, message: "No active character.", day: 1, reward: fallbackReward };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (getLoginRewardLastClaim() === today) {
      const day = resolveMissedDay();
      const reward = LOGIN_REWARD_SCHEDULE[day - 1] ?? LOGIN_REWARD_SCHEDULE[0];
      return { ok: false, message: "Already claimed today.", day, reward };
    }

    const currentDay = resolveMissedDay();
    const reward = LOGIN_REWARD_SCHEDULE[currentDay - 1] ?? LOGIN_REWARD_SCHEDULE[0];
    const nextDay = currentDay >= 30 ? 1 : currentDay + 1;

    setLoginRewardLastClaim(today);
    setLoginRewardDay(nextDay);
    // Keep legacy key in sync so any old readers see today as claimed
    setDailyBonusLastClaim(today);

    set((s) => {
      if (!s.character) return;
      if (reward.coins) {
        const scaled = Math.round(reward.coins * getDailyRewardMultiplier());
        grantCappedGameplayCoins(s.character, scaled);
      }
      if (reward.gems) s.character.gems = (s.character.gems ?? 0) + reward.gems;
      if (reward.luckBoost) s.character.luckBoostsRemaining += reward.luckBoost;
      if (reward.seasonXp) s.character.seasonXp = (s.character.seasonXp ?? 0) + reward.seasonXp;
      if (reward.mysteryTickets) {
        s.character.mysteryTickets = (s.character.mysteryTickets ?? 0) + reward.mysteryTickets;
      }
      if (reward.avatarStyleUnlock) {
        const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
        if (!styles.includes(reward.avatarStyleUnlock)) {
          s.character.unlockedAvatarStyles = [...styles, reward.avatarStyleUnlock];
        }
      }
      if (reward.epicEventUnlock) s.character.epicEventsUnlocked = true;
      if (reward.legendaryReward) {
        s.character.legendaryCosmeticUnlocked = true;
        const titles = s.character.unlockedTitles ?? [];
        if (!titles.includes('Legendary')) {
          s.character.unlockedTitles = [...titles, 'Legendary'];
        }
      }
    });
    if (reward.mysteryBoxSpin) {
      setMysteryBoxLastSpin('');
    }
    void get()._persist();
    hapticMoneyEarned();
    void playSound(reward.gems ? 'success' : 'coins_earned');
    return { ok: true, message: `Day ${currentDay} reward claimed: ${reward.label}!`, day: currentDay, reward };
  },

  canSpinMysteryBox: () => {
    const currentWeek = getIsoWeek(new Date());
    return getMysteryBoxLastSpin() !== currentWeek;
  },

  canSpinMysteryBoxWithTicket: () => {
    const { character } = get();
    return (character?.mysteryTickets ?? 0) > 0;
  },

  spinMysteryBox: (options) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No active character." };

    const currentWeek = getIsoWeek(new Date());
    const useTicket = options?.useTicket === true;
    const freeAvailable = getMysteryBoxLastSpin() !== currentWeek;

    if (useTicket) {
      if ((character.mysteryTickets ?? 0) <= 0) {
        return { ok: false, message: "No mystery tickets available." };
      }
    } else if (!freeAvailable) {
      return { ok: false, message: "Mystery box already spun this week. Use a ticket for an extra spin!" };
    }

    const pickedIndex = options?.segmentIndex ?? rollMysterySegmentIndex();
    const reward = MYSTERY_SEGMENTS[pickedIndex];
    if (!useTicket) {
      setMysteryBoxLastSpin(currentWeek);
    }

    set((s) => {
      if (!s.character) return;
      if (useTicket) {
        s.character.mysteryTickets = Math.max(0, (s.character.mysteryTickets ?? 0) - 1);
      }
      if (reward.type === 'coins') {
        grantCappedGameplayCoins(s.character, reward.amount);
      } else if (reward.type === 'gems') s.character.gems = (s.character.gems ?? 0) + reward.amount;
      else if (reward.type === 'luck') {
        s.character.luckBoostsRemaining = (s.character.luckBoostsRemaining ?? 0) + reward.amount;
      } else if (reward.type === 'season_xp') {
        s.character.seasonXp = (s.character.seasonXp ?? 0) + reward.amount;
      } else if (reward.type === 'rare_event') {
        s.character.epicEventsUnlocked = true;
      } else if (reward.type === 'cosmetic' && reward.cosmeticStyle) {
        const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
        if (!styles.includes(reward.cosmeticStyle)) {
          s.character.unlockedAvatarStyles = [...styles, reward.cosmeticStyle];
        }
      }
    });
    void get()._persist();
    return { ok: true, reward, segmentIndex: pickedIndex, message: `You won: ${reward.label}!` };
  },

  loadDailyQuests: () => {
    const today = new Date().toISOString().slice(0, 10);
    const karma = get().character?.karma ?? 50;
    const raw = getDailyQuestsProgress(today);
    if (raw) {
      try {
        const quests = stampKarmaBaseline(
          JSON.parse(raw) as DailyQuest[],
          karma,
        );
        set((s) => {
          s.dailyQuests = quests;
        });
        return;
      } catch {
        /* fall through */
      }
    }
    const quests = pickDailyQuests(today, 3, karma);
    setDailyQuestsProgress(today, JSON.stringify(quests));
    set((s) => {
      s.dailyQuests = quests;
    });
  },

  claimQuestReward: (questId) => {
    const { dailyQuests, character } = get();
    if (!character) return { ok: false, message: "No active character." };
    const quest = dailyQuests.find((q) => q.id === questId);
    if (!quest) return { ok: false, message: "Quest not found." };
    if (quest.claimed) return { ok: false, message: "Already claimed." };
    if (!isQuestComplete(quest))
      return { ok: false, message: "Quest not complete." };

    const updated = dailyQuests.map((q) =>
      q.id === questId ? claimQuest(q) : q,
    );
    const today = new Date().toISOString().slice(0, 10);
    setDailyQuestsProgress(today, JSON.stringify(updated));
    let grantedCoins = 0;
    set((s) => {
      s.dailyQuests = updated;
      if (s.character) {
        grantedCoins = grantCappedGameplayCoins(s.character, quest.rewardCoins);
      }
    });
    get().addSeasonXp(25);
    hapticMoneyEarned();
    void playSound('coins_earned');
    void get()._persist();
    return { ok: true, message: `Claimed ${grantedCoins} coins!` };
  },

  addSeasonXp: (amount) => {
    set((s) => {
      if (!s.character) return;
      s.character.seasonXp = (s.character.seasonXp ?? 0) + amount;
    });
  },

  claimSeasonTier: (tier) => {
    const { character } = get();
    if (!character?.hasSeasonPass)
      return { ok: false, message: "Season pass required." };
    const tierDef = SEASON_PASS_TIERS.find((t) => t.tier === tier);
    if (!tierDef) return { ok: false, message: "Invalid tier." };
    if ((character.claimedSeasonTiers ?? []).includes(tier)) {
      return { ok: false, message: "Tier already claimed." };
    }
    if ((character.seasonXp ?? 0) < tierDef.xpRequired) {
      return { ok: false, message: "Not enough season XP." };
    }
    let grantedCoins = 0;
    set((s) => {
      if (!s.character) return;
      if (!s.character.claimedSeasonTiers)
        s.character.claimedSeasonTiers = [];
      s.character.claimedSeasonTiers.push(tier);
      grantedCoins = grantCappedGameplayCoins(s.character, tierDef.rewardCoins);
      if (tierDef.rewardGems) s.character.gems += tierDef.rewardGems;
      if (tierDef.rewardLuckBoosts)
        s.character.luckBoostsRemaining += tierDef.rewardLuckBoosts;
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
    if (!trait) return { ok: false, message: "Invalid prestige trait." };
    if (prestige.prestigePoints < trait.cost) {
      return { ok: false, message: "Not enough prestige points." };
    }
    if (prestige.unlockedTraitIds.includes(traitId)) {
      return { ok: false, message: "Trait already unlocked." };
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

  startStudySession: () => {
    const { character } = get();
    if (
      !character ||
      !canStudy(character.age, character.educationLevel, character.educationStage)
    )
      return [];
    const questions = pickStudyQuestions(3);
    set((s) => {
      s.studyQuestions = questions;
    });
    return questions;
  },

  completeStudySession: (answers) => {
    const { character, studyQuestions } = get();
    const empty: StudySessionResult = {
      score: 0,
      totalQuestions: 0,
      passed: false,
      intelligenceGain: 0,
      mentalHealthGain: 0,
    };
    if (!character || !studyQuestions?.length) return empty;

    const result = gradeStudySession(
      answers,
      studyQuestions,
      character.stats.intelligence,
    );

    set((s) => {
      if (!s.character) return;
      s.character.stats.intelligence = clamp(
        s.character.stats.intelligence + result.intelligenceGain,
      );
      s.character.stats.mentalHealth = clamp(
        s.character.stats.mentalHealth + result.mentalHealthGain,
      );
      s.studyQuestions = null;
    });

    const today = new Date().toISOString().slice(0, 10);
    const quests = get().dailyQuests.length
      ? get().dailyQuests
      : pickDailyQuests(today);
    const updated = updateQuestProgress(quests, "study_session", 1);
    setDailyQuestsProgress(today, JSON.stringify(updated));
    set((s) => {
      s.dailyQuests = updated;
    });
    get().addSeasonXp(result.passed ? 25 : 5);
    get()._checkAchievements();
    void get()._persist();
    return result;
  },

  grantDegree: (degreeId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    if ((character.degreeIds ?? []).includes(degreeId)) {
      return { ok: false, message: "You already have this degree." };
    }
    if (
      character.enrolledDegreeId &&
      character.enrolledDegreeId !== degreeId
    ) {
      return {
        ok: false,
        message:
          "You are enrolled in a different program. Finish or re-enroll.",
      };
    }

    const advResult = advanceEducation(character, degreeId);
    if (!advResult.ok || !advResult.degreeEarned) {
      return { ok: false, message: advResult.message };
    }

    const degree = advResult.degreeEarned;
    const alreadyEnrolled = character.enrolledDegreeId === degreeId;

    set((s) => {
      if (!s.character) return;
      if (!s.character.degreeIds) s.character.degreeIds = [];
      if (!s.character.degreeIds.includes(degreeId)) {
        s.character.degreeIds.push(degreeId);
      }
      if (advResult.newStage) s.character.educationStage = advResult.newStage;
      s.character.educationBranch = degree.branch;
      if (advResult.newEducationLevel) {
        s.character.educationLevel = advResult.newEducationLevel;
      }
      if (advResult.intelligenceGain) {
        s.character.stats.intelligence = clamp(
          s.character.stats.intelligence + advResult.intelligenceGain,
        );
      }
      if (!alreadyEnrolled) {
        const tuition = scaleEducationCost(degree.baseAnnualCost, s.character.countryCode);
        const cash = applyCashDelta(
          s.character.bankBalance,
          s.character.debt ?? 0,
          -tuition,
        );
        s.character.bankBalance = cash.bankBalance;
        s.character.debt = cash.debt;
      }
      s.character.enrolledDegreeId = undefined;
    });

    void get()._persist();
    return {
      ok: true,
      message: advResult.message,
    };
  },

  enrollInDegree: (degreeId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };

    if (character.enrolledDegreeId === degreeId) {
      return { ok: true, message: "Already enrolled in this program." };
    }

    const enrollResult = enrollInProgram(character, degreeId);
    if (!enrollResult.ok) {
      return { ok: false, message: enrollResult.message };
    }

    const eco = getCountryEconomy(character.countryCode);
    const tuition = scaleEducationCost(enrollResult.annualCost ?? 0, character.countryCode);
    const maxDebt = getMaxPersonalDebtForCharacter(character);
    const totalDebt = (character.debt ?? 0) + Math.max(0, tuition - character.bankBalance);
    if (tuition > 0 && totalDebt > maxDebt) {
      return {
        ok: false,
        message: `Insufficient funds. Tuition is ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    set((s) => {
      if (!s.character) return;
      const debtBefore = s.character.debt ?? 0;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -tuition,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      if (tuition > 0) {
        s.character.financeLedger = appendFinanceLedger(
          s.character.financeLedger,
          createLedgerEntry({
            age: s.character.age,
            category: "tuition",
            label: "Degree enrollment tuition",
            amount: -tuition,
            bankAfter: cash.bankBalance,
            debtAfter: cash.debt,
            debtBefore,
          }),
        );
      }
      s.character.enrolledDegreeId = degreeId;
      s.character.enrolledDegreeYearsRemaining = enrollResult.durationYears;
      s.character.enrolledSinceAge = s.character.age;
      const degree = getDegreeById(degreeId);
      if (degree) {
        s.character.educationBranch = degree.branch;
      }
      if (enrollResult.newStage) {
        s.character.educationStage = enrollResult.newStage;
      }
      if (enrollResult.newEducationLevel) {
        s.character.educationLevel = enrollResult.newEducationLevel;
      }
      s.character.educationMajorSkipped = false;
      s.pendingCollegeMajorPicker = false;
    });

    void get()._persist();
    return {
      ok: true,
      message: `${enrollResult.message} Tuition paid: ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
    };
  },

  chooseCollegeMajor: (degreeIdOrSkip) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };

    if (degreeIdOrSkip === "skip") {
      set((s) => {
        if (!s.character) return;
        s.character.educationMajorSkipped = true;
        s.pendingCollegeMajorPicker = false;
      });
      void get()._persist();
      return {
        ok: true,
        message: "You skipped college for now. You can enroll later from Study.",
      };
    }

    const result = get().enrollInDegree(degreeIdOrSkip);
    if (result.ok) {
      set((s) => {
        s.pendingCollegeMajorPicker = false;
        if (s.character) s.character.educationMajorSkipped = false;
      });
    }
    return result;
  },

  applyStudyQuizRewards: (passed) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const rewards = studyQuizRewards(passed);
    set((s) => {
      if (!s.character) return;
      const gpa = s.character.gpa ?? 2.5;
      s.character.gpa = Math.min(4, Math.round((gpa + rewards.gpaBump) * 100) / 100);
      if (rewards.scholarshipDiscount > 0) {
        s.character.scholarshipDiscount = Math.max(
          s.character.scholarshipDiscount ?? 0,
          rewards.scholarshipDiscount,
        );
      }
    });
    void get()._persist();
    return {
      ok: true,
      message: passed
        ? `GPA +${rewards.gpaBump.toFixed(2)}. ${Math.round(rewards.scholarshipDiscount * 100)}% scholarship on next tuition.`
        : `Small GPA bump (+${rewards.gpaBump.toFixed(2)}). Keep studying!`,
    };
  },

  takeCertificationExam: (certId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };

    const eligibility = checkCertificationEligibility(character, certId);
    if (!eligibility.eligible) {
      return {
        ok: false,
        message: eligibility.reason ?? "Not eligible for this exam.",
      };
    }

    const certProjectedDebt = (character.debt ?? 0) + Math.max(0, eligibility.cost - character.bankBalance);
    if (certProjectedDebt > getMaxPersonalDebtForCharacter(character)) {
      const eco = getCountryEconomy(character.countryCode);
      return {
        ok: false,
        message: `Insufficient funds. Exam fee is ${eco.currencySymbol}${eligibility.cost.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    const exam = rollCertificationExam(character, certId);
    set((s) => {
      if (!s.character) return;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -eligibility.cost,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      if (exam.passed) {
        if (!s.character.certificationIds) s.character.certificationIds = [];
        if (!s.character.certificationIds.includes(certId)) {
          s.character.certificationIds.push(certId);
        }
        s.character.stats.intelligence = clamp(
          s.character.stats.intelligence + 2,
        );
      }
    });

    void get()._persist();
    return { ok: exam.passed, message: exam.message };
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
        void playSound("achievement_unlock");
      }
    }
  },

  checkStreakMilestones: () => {
    const { character } = get();
    if (!character) return null;
    const streak = character.dailyStreak ?? 0;
    const claimed = character.claimedStreakMilestones ?? [];
    for (const milestone of STREAK_MILESTONES) {
      if (streak >= milestone.days && !claimed.includes(milestone.days)) {
        set((s) => {
          if (!s.character) return;
          if (!s.character.claimedStreakMilestones) s.character.claimedStreakMilestones = [];
          s.character.claimedStreakMilestones.push(milestone.days);
          if (milestone.rewardType === 'gems') {
            s.character.gems = (s.character.gems ?? 0) + milestone.rewardAmount;
          } else if (milestone.rewardType === 'avatar_unlock') {
            const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
            if (!styles.includes('lorelei')) {
              s.character.unlockedAvatarStyles = [...styles, 'lorelei'];
            }
          } else if (milestone.rewardType === 'cosmetic') {
            const titles = s.character.unlockedTitles ?? [];
            if (!titles.includes('Legendary Streak')) {
              s.character.unlockedTitles = [...titles, 'Legendary Streak'];
            }
          } else if (milestone.rewardType === 'prestige_title') {
            const titles = s.character.unlockedTitles ?? [];
            if (!titles.includes('Eternal')) {
              s.character.unlockedTitles = [...titles, 'Eternal'];
            }
          }
        });
        void get()._persist();
        return milestone;
      }
    }
    return null;
  },

  purchaseStreakShield: () => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No active character.' };
    const cost = 50;
    if ((character.gems ?? 0) < cost) return { ok: false, message: `Need ${cost} gems to buy a Streak Shield.` };
    set((s) => {
      if (!s.character) return;
      s.character.gems = (s.character.gems ?? 0) - cost;
      s.character.streakShieldCount = (s.character.streakShieldCount ?? 0) + 1;
    });
    return { ok: true, message: 'Streak Shield purchased! Your streak is protected for 1 missed day.' };
  },

  consumeStreakShieldIfAvailable: () => {
    const { character } = get();
    if (!character || (character.streakShieldCount ?? 0) <= 0) return false;
    set((s) => {
      if (!s.character) return;
      s.character.streakShieldCount = (s.character.streakShieldCount ?? 0) - 1;
    });
    return true;
  },

  addMysterySpins: (n: number) => {
    set((s) => {
      if (!s.character) return;
      grantCappedGameplayTickets(s.character, n);
    });
    void get()._persist();
  },

  grantAdRewardCoins: (amount: number) => {
    const { character } = get();
    if (!character) return 0;
    let granted = 0;
    set((s) => {
      if (!s.character) return;
      granted = grantCappedGameplayCoins(s.character, amount);
    });
    if (granted > 0) {
      void get()._persist();
      hapticMoneyEarned();
      void playSound('coins_earned');
    }
    return granted;
  },

  grantAdMysteryTicket: () => {
    const { character } = get();
    if (!character) return 0;
    let granted = 0;
    set((s) => {
      if (!s.character) return;
      granted = grantCappedGameplayTickets(s.character, 1);
    });
    if (granted > 0) void get()._persist();
    return granted;
  },

  purchaseMysterySpinWithGems: () => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No active character.' };
    const GEMS_PER_SPIN = 20;
    if ((character.gems ?? 0) < GEMS_PER_SPIN) {
      return { ok: false, message: `Need ${GEMS_PER_SPIN} gems for an extra spin.` };
    }
    set((s) => {
      if (!s.character) return;
      s.character.gems = (s.character.gems ?? 0) - GEMS_PER_SPIN;
      s.character.mysteryTickets = (s.character.mysteryTickets ?? 0) + 1;
    });
    void get()._persist();
    return { ok: true, message: 'Extra spin added!' };
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
        // Queue celebration modal
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

  unlockScenario: (scenarioId: ScenarioId) => {
    if (FREE_SCENARIO_IDS.includes(scenarioId)) return;
    set((s) => {
      const current = s.globalPrestige.unlockedScenarioIds ?? [];
      if (!current.includes(scenarioId)) {
        s.globalPrestige.unlockedScenarioIds = [...current, scenarioId];
      }
    });
    saveGlobalPrestige(get().globalPrestige);
  },

  unlockAllPremiumScenarios: () => {
    set((s) => {
      const all: ScenarioId[] = [...FREE_SCENARIO_IDS, ...PREMIUM_SCENARIO_IDS];
      s.globalPrestige.unlockedScenarioIds = all;
    });
    saveGlobalPrestige(get().globalPrestige);
  },

  isScenarioOwned: (scenarioId: ScenarioId) => {
    if (FREE_SCENARIO_IDS.includes(scenarioId)) return true;
    const prestige = get().globalPrestige;
    const unlocked = prestige.unlockedScenarioIds ?? [];
    if (unlocked.includes(scenarioId)) return true;
    const month = getMonthKey();
    if (prestige.plusScenarioCreditsMonth === month) {
      return (prestige.plusMonthScenarioIds ?? []).includes(scenarioId);
    }
    return false;
  },

  ensurePlusMonthlyState: () => {
    const { character, globalPrestige } = get();
    if (!character?.isPremium) return;
    const month = getMonthKey();
    if (globalPrestige.plusScenarioCreditsMonth === month) return;

    const nextPrestige: GlobalPrestigeState = {
      ...globalPrestige,
      plusScenarioCreditsMonth: month,
      plusScenarioCredits: PLUS_SCENARIO_CREDITS_PER_MONTH,
      plusMonthScenarioIds: [],
    };
    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    get().grantPlusMonthlyCosmetic();
  },

  redeemPlusScenarioPick: (scenarioId) => {
    const { character } = get();
    if (!character?.isPremium) {
      return { ok: false, message: 'LifeQuest Plus required.' };
    }
    get().ensurePlusMonthlyState();
    const prestige = get().globalPrestige;
    const pool = getMonthlyScenarioPool();
    if (!pool.includes(scenarioId)) {
      return { ok: false, message: 'Scenario not in this month\'s Plus pool.' };
    }
    if ((prestige.plusMonthScenarioIds ?? []).includes(scenarioId)) {
      return { ok: true, message: 'Already unlocked for this month.' };
    }
    const credits = prestige.plusScenarioCredits ?? 0;
    if (credits <= 0) {
      return { ok: false, message: 'No Plus scenario picks remaining this month.' };
    }

    const nextPrestige: GlobalPrestigeState = {
      ...prestige,
      plusScenarioCredits: credits - 1,
      plusMonthScenarioIds: [...(prestige.plusMonthScenarioIds ?? []), scenarioId],
    };
    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    return { ok: true, message: `Unlocked ${scenarioId} for this month!` };
  },

  grantPlusMonthlyCosmetic: () => {
    const { character, globalPrestige } = get();
    if (!character?.isPremium) return;
    const month = getMonthKey();
    if (globalPrestige.plusCosmeticMonth === month) return;

    const cosmeticId = getMonthlyCosmeticId(month);
    const unlocked = globalPrestige.unlockedCosmeticIds ?? [];
    const nextIds = unlocked.includes(cosmeticId) ? unlocked : [...unlocked, cosmeticId];

    const nextPrestige: GlobalPrestigeState = {
      ...globalPrestige,
      plusCosmeticMonth: month,
      unlockedCosmeticIds: nextIds,
    };
    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    get().applyCosmetic(cosmeticId);
  },

  purchaseCosmetic: (cosmeticId) => {
    const item = getCosmeticById(cosmeticId);
    const { character, globalPrestige } = get();
    if (!item) return { ok: false, message: 'Invalid cosmetic.' };
    if (isFreeBaselineCosmetic(item.id)) {
      return { ok: false, message: 'Already owned.' };
    }
    if (!character) return { ok: false, message: 'No active character.' };
    if ((globalPrestige.unlockedCosmeticIds ?? []).includes(cosmeticId)) {
      return { ok: false, message: 'Already owned.' };
    }
    if (item.gemCost && (character.gems ?? 0) < item.gemCost) {
      return { ok: false, message: `Need ${item.gemCost} gems.` };
    }

    set((s) => {
      if (!s.character) return;
      if (item.gemCost) s.character.gems = (s.character.gems ?? 0) - item.gemCost;
      const ids = s.globalPrestige.unlockedCosmeticIds ?? [];
      if (!ids.includes(cosmeticId)) {
        s.globalPrestige.unlockedCosmeticIds = [...ids, cosmeticId];
      }
    });
    saveGlobalPrestige(get().globalPrestige);
    void get()._persist();
    return { ok: true, message: `${item.label} unlocked!` };
  },

  grantCosmeticUnlock: (cosmeticId) => {
    const item = getCosmeticById(cosmeticId);
    if (!item) return;
    set((s) => {
      const ids = s.globalPrestige.unlockedCosmeticIds ?? [];
      if (!ids.includes(cosmeticId)) {
        s.globalPrestige.unlockedCosmeticIds = [...ids, cosmeticId];
      }
    });
    saveGlobalPrestige(get().globalPrestige);
  },

  applyCosmetic: (cosmeticId) => {
    const resolvedId = migrateCosmeticId(cosmeticId);
    const item = getCosmeticById(resolvedId);
    const { globalPrestige } = get();
    if (!item) return { ok: false, message: 'Invalid cosmetic.' };
    const unlocked = migrateCosmeticIdList(globalPrestige.unlockedCosmeticIds);
    if (!isFreeBaselineCosmetic(resolvedId) && !unlocked.includes(resolvedId)) {
      return { ok: false, message: 'Cosmetic not owned.' };
    }
    if (item.category === 'theme') {
      const themeId = themeSkinIdFromCosmetic(resolvedId);
      useSettingsStore.getState().setAppThemeId(themeId);
      return { ok: true, message: `${item.label} theme applied.` };
    }
    if (item.category === 'tombstone') {
      useSettingsStore.getState().setEquippedTombstoneId(resolvedId);
      set((s) => {
        if (s.character) {
          s.character.tombstoneStyleId = resolvedId.replace('tombstone_', '');
        }
      });
      void get()._persist();
      return { ok: true, message: `${item.label} tombstone equipped.` };
    }
    if (item.category === 'event_skin') {
      useSettingsStore.getState().setEquippedEventSkinId(resolvedId);
      return { ok: true, message: `${item.label} event cards equipped.` };
    }
    if (item.category === 'name_font') {
      useSettingsStore.getState().setEquippedNameFontId(resolvedId);
      return { ok: true, message: `${item.label} name font equipped.` };
    }
    if (item.category === 'sound_pack') {
      const packId = resolvedId === 'sound_pack_classic' ? null : resolvedId;
      useSettingsStore.getState().setEquippedSoundPackId(packId);
      void import('../../services/audio').then((m) => m.reloadSoundPack());
      return { ok: true, message: `${item.label} sound pack equipped.` };
    }
    if (item.category === 'plus_frame') {
      useSettingsStore.getState().setEquippedProfileFrameId(resolvedId);
      return { ok: true, message: `${item.label} profile frame equipped.` };
    }
    return { ok: true, message: `${item.label} saved.` };
  },

  getPlusScenarioPool: () => getMonthlyScenarioPool(),
});

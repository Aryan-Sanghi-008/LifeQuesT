import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { evaluateUnlockedCollectionIds, getCompletedSets } from '../../engine/collectionsEngine';
import { DailyQuest, GlobalPrestigeState, CollectionSet } from "../../types";
import { LOGIN_REWARD_SCHEDULE, LoginReward } from "../../data/loginRewards";
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
} from "../../engine/educationEngine";
import { getCountryEconomy } from "../../data/countryEconomy";
import { clamp } from "../../engine/economyEngine";
import {
  checkCertificationEligibility,
  rollCertificationExam,
} from "../../engine/certificationEngine";
import { evaluateAchievements, getNewAchievementIds } from "../../engine/achievementEngine";
import { ACHIEVEMENT_COIN_REWARDS } from "../../data/achievements";
import { PRESTIGE_TRAITS } from "../../engine/prestigeEngine";
import { hapticAchievement } from "../../services/haptics";
import { playSound } from "../../services/audio";

export type { LoginReward };
export { LOGIN_REWARD_SCHEDULE };

export interface MysteryReward {
  type: 'coins' | 'gems' | 'luck';
  amount: number;
  label: string;
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
  { type: 'coins', amount: 50, label: '50 Coins' },
  { type: 'coins', amount: 100, label: '100 Coins' },
  { type: 'coins', amount: 200, label: '200 Coins' },
  { type: 'coins', amount: 500, label: '500 Coins' },
  { type: 'gems', amount: 1, label: '1 Gem' },
  { type: 'gems', amount: 3, label: '3 Gems' },
  { type: 'gems', amount: 5, label: '5 Gems' },
  { type: 'luck', amount: 5, label: '+5 Luck Boost' },
];

function getIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
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
  if (hoursSince <= 48) return getLoginRewardDay();

  // Missed beyond grace — reset to day 1
  setLoginRewardDay(1);
  return 1;
}

export interface ProgressionSlice {
  dailyQuests: DailyQuest[];
  globalPrestige: GlobalPrestigeState;
  studyQuestions: StudyQuestion[] | null;

  claimDailyBonus: () => { ok: boolean; message: string };
  claimLoginReward: () => { ok: boolean; message: string; day: number; reward: LoginReward };
  canClaimLoginReward: () => boolean;
  getLoginRewardState: () => { day: number; claimed: boolean };
  canSpinMysteryBox: () => boolean;
  spinMysteryBox: () => { ok: boolean; reward?: MysteryReward; message: string };
  loadDailyQuests: () => void;
  claimQuestReward: (questId: string) => { ok: boolean; message: string };
  addSeasonXp: (amount: number) => void;
  claimSeasonTier: (tier: number) => { ok: boolean; message: string };
  purchasePrestigeUnlock: (traitId: string) => {
    ok: boolean;
    message?: string;
  };
  setSeasonPass: (v: boolean) => void;
  startStudySession: () => StudyQuestion[];
  completeStudySession: (answers: number[]) => StudySessionResult;
  grantDegree: (degreeId: string) => { ok: boolean; message: string };
  enrollInDegree: (degreeId: string) => { ok: boolean; message: string };
  takeCertificationExam: (certId: string) => { ok: boolean; message: string };
  _checkAchievements: () => void;
  checkStreakMilestones: () => StreakMilestone | null;
  purchaseStreakShield: () => { ok: boolean; message: string };
  consumeStreakShieldIfAvailable: () => boolean;
  checkCollectionSetRewards: () => CollectionSet[];
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
  },
  studyQuestions: null,

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
      if (reward.coins) s.character.coins += reward.coins;
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
      if (reward.legendaryReward) s.character.legendaryCosmeticUnlocked = true;
    });
    if (reward.mysteryBoxSpin) {
      setMysteryBoxLastSpin('');
    }
    void get()._persist();
    return { ok: true, message: `Day ${currentDay} reward claimed: ${reward.label}!`, day: currentDay, reward };
  },

  canSpinMysteryBox: () => {
    const currentWeek = getIsoWeek(new Date());
    return getMysteryBoxLastSpin() !== currentWeek;
  },

  spinMysteryBox: () => {
    const { character } = get();
    if (!character) return { ok: false, message: "No active character." };

    const currentWeek = getIsoWeek(new Date());
    if (getMysteryBoxLastSpin() === currentWeek) {
      return { ok: false, message: "Mystery box already spun this week. Come back next week!" };
    }

    const weights = [3, 3, 2, 1, 2, 2, 1, 1]; // aligned with MYSTERY_SEGMENTS
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let pickedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { pickedIndex = i; break; }
    }

    const reward = MYSTERY_SEGMENTS[pickedIndex];
    setMysteryBoxLastSpin(currentWeek);

    set((s) => {
      if (!s.character) return;
      if (reward.type === 'coins') s.character.coins += reward.amount;
      else if (reward.type === 'gems') s.character.gems += reward.amount;
      else if (reward.type === 'luck') s.character.luckBoostsRemaining = (s.character.luckBoostsRemaining ?? 0) + reward.amount;
    });
    void get()._persist();
    return { ok: true, reward, message: `You won: ${reward.label}!` };
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
    set((s) => {
      s.dailyQuests = updated;
      if (s.character) s.character.coins += quest.rewardCoins;
    });
    get().addSeasonXp(25);
    void get()._persist();
    return { ok: true, message: `Claimed ${quest.rewardCoins} coins!` };
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
    set((s) => {
      if (!s.character) return;
      if (!s.character.claimedSeasonTiers)
        s.character.claimedSeasonTiers = [];
      s.character.claimedSeasonTiers.push(tier);
      s.character.coins += tierDef.rewardCoins;
      if (tierDef.rewardGems) s.character.gems += tierDef.rewardGems;
      if (tierDef.rewardLuckBoosts)
        s.character.luckBoostsRemaining += tierDef.rewardLuckBoosts;
    });
    void get()._persist();
    return { ok: true, message: `Claimed tier ${tier} rewards!` };
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

  setSeasonPass: (v) => {
    set((s) => {
      if (s.character) s.character.hasSeasonPass = v;
    });
    void get()._persist();
  },

  startStudySession: () => {
    const { character } = get();
    if (!character || !canStudy(character.age, character.educationLevel))
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
        const eco = getCountryEconomy(s.character.countryCode);
        const tuition = Math.round(
          degree.baseAnnualCost * eco.salaryMultiplier,
        );
        s.character.bankBalance = Math.max(
          0,
          s.character.bankBalance - tuition,
        );
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
    const tuition = Math.round(
      (enrollResult.annualCost ?? 0) * eco.salaryMultiplier,
    );
    if (character.bankBalance < tuition) {
      return {
        ok: false,
        message: `Insufficient funds. Tuition is ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = Math.max(
        0,
        s.character.bankBalance - tuition,
      );
      s.character.enrolledDegreeId = degreeId;
    });

    void get()._persist();
    return {
      ok: true,
      message: `${enrollResult.message} Tuition paid: ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
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

    if (character.bankBalance < eligibility.cost) {
      const eco = getCountryEconomy(character.countryCode);
      return {
        ok: false,
        message: `Insufficient funds. Exam fee is ${eco.currencySymbol}${eligibility.cost.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    const exam = rollCertificationExam(character, certId);
    set((s) => {
      if (!s.character) return;
      s.character.bankBalance = Math.max(
        0,
        s.character.bankBalance - eligibility.cost,
      );
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
    getNewAchievementIds(previous, earned).forEach((id) => {
      coinReward += ACHIEVEMENT_COIN_REWARDS[id] ?? 50;
    });

    const newCount = earned.size - previous.length;
    if (earned.size !== character.achievements.length || coinReward > 0) {
      set((s) => {
        if (!s.character) return;
        s.character.achievements = Array.from(earned);
        if (coinReward > 0) s.character.coins += coinReward;
        if (newCount > 0) s.showConfetti = true;
      });
      if (coinReward > 0) void get()._persist();
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
        // Grant reward
        set((s) => {
          if (!s.character) return;
          if (!s.character.claimedStreakMilestones) s.character.claimedStreakMilestones = [];
          s.character.claimedStreakMilestones.push(milestone.days);
          if (milestone.rewardType === 'gems') {
            s.character.gems = (s.character.gems ?? 0) + milestone.rewardAmount;
          }
        });
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

  checkCollectionSetRewards: () => {
    const { character, globalPrestige } = get();
    if (!character) return [];
    const unlockedIds = evaluateUnlockedCollectionIds(character, globalPrestige.prestigeLevel);
    const claimed = character.completedCollectionSetIds ?? [];
    const newlyComplete = getCompletedSets(unlockedIds, claimed);
    if (newlyComplete.length === 0) return [];

    set((s) => {
      if (!s.character) return;
      for (const set of newlyComplete) {
        if (!s.character.completedCollectionSetIds) s.character.completedCollectionSetIds = [];
        if (!s.character.unlockedTitles) s.character.unlockedTitles = [];
        s.character.completedCollectionSetIds.push(set.id);
        if (!s.character.unlockedTitles.includes(set.titleReward)) {
          s.character.unlockedTitles.push(set.titleReward);
        }
        s.character.coins += set.coinReward;
        if (set.gemReward) s.character.gems = (s.character.gems ?? 0) + set.gemReward;
        s.showConfetti = true;
      }
    });
    void get()._persist();
    return newlyComplete;
  },
});

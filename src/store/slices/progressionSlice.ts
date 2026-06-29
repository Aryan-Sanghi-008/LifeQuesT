import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { DailyQuest, GlobalPrestigeState } from "../../types";
import {
  getDailyBonusLastClaim,
  setDailyBonusLastClaim,
  getDailyQuestsProgress,
  setDailyQuestsProgress,
  saveGlobalPrestige,
} from "../../services/persistence";
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

export interface ProgressionSlice {
  dailyQuests: DailyQuest[];
  globalPrestige: GlobalPrestigeState;
  studyQuestions: StudyQuestion[] | null;

  claimDailyBonus: () => { ok: boolean; message: string };
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
    const { character } = get();
    if (!character) return { ok: false, message: "No active character." };

    const today = new Date().toISOString().slice(0, 10);
    const lastClaim = getDailyBonusLastClaim();
    if (lastClaim === today) {
      return { ok: false, message: "Daily bonus already claimed today." };
    }

    setDailyBonusLastClaim(today);
    set((s) => {
      if (s.character) s.character.coins += 25;
    });
    void get()._persist();
    return { ok: true, message: "You received 25 coins!" };
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
});

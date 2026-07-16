import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { FocusAllocation, AspirationId, WillDetails } from "../../types";
import { ACTIVITIES } from "../../data/gameData";
import { applySuccessChance, consumeLuckBoost } from "../../engine/eventEngine";
import { getLuckRollBonusPercent } from "../../engine/traitEngine";
import { applyEffect, computeNetWorth } from "../../engine/economyEngine";
import { scaleActivityCost } from "../../engine/countryScaleEngine";
import { appendFinanceLedger, createLedgerEntry } from "../../engine/financeLedgerEngine";
import { getMaxPersonalDebtForCharacter } from "../../data/countryEconomy";
import { generatePet } from "@utils/npcGenerator";
import { recordCrime } from "../../engine/crimeEngine";
import { isFeatureEnabled, getActivityFeatureGate } from "../../engine/scenarioEngine";
import { updateQuestProgress, pickDailyQuests } from "../../engine/questEngine";
import { setDailyQuestsProgress, saveCharacterLocal } from "../../services/persistence";
import { validateFocusAllocation } from "../../engine/focusEngine";
import { continueAsHeir } from "../../engine/legacyEngine";
import { buildLocalSlotList, incrementLoadGeneration } from "../storeHelpers";

function validateAspirations(
  primary: AspirationId,
  secondary: AspirationId,
): { valid: boolean; message?: string } {
  if (primary === secondary) {
    return { valid: false, message: "Primary and secondary aspirations must be different." };
  }
  return { valid: true };
}

export interface ActivitySlice {
  performActivity: (activityId: string) => {
    success: boolean;
    message: string;
  };
  setFocusAllocation: (allocation: FocusAllocation) => {
    ok: boolean;
    message?: string;
  };
  confirmFocusAndAct: () => { ok: boolean; message?: string };
  dismissYearReview: () => void;
  setAspirations: (
    primary: AspirationId,
    secondary: AspirationId,
  ) => { ok: boolean; message?: string };
  clearPendingAspirationPicker: () => void;
  setWill: (will: WillDetails) => { ok: boolean; message?: string };
  playAsHeir: (heirId: string) => { ok: boolean; message?: string };
}

export const createActivitySlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  ActivitySlice
> = (set, get) => ({
  performActivity: (activityId) => {
    const { character } = get();
    if (!character) return { success: false, message: "No character." };

    const activity = ACTIVITIES.find((a) => a.id === activityId);
    if (!activity) return { success: false, message: "Unknown activity." };
    const featureGate = getActivityFeatureGate(activity.id, activity.category);
    if (featureGate && !isFeatureEnabled(character, featureGate)) {
      return { success: false, message: "This activity isn't available in your scenario." };
    }
    if (character.age < activity.minAge || character.age > activity.maxAge) {
      return {
        success: false,
        message: "Too young or too old for this activity.",
      };
    }
    if (activity.cost && character.coins < activity.cost) {
      return { success: false, message: "Not enough coins." };
    }
    const scaledBankEffect = activity.bankEffect
      ? scaleActivityCost(activity.bankEffect, character.countryCode, character.age)
      : 0;
    if (scaledBankEffect < 0) {
      const maxDebt = getMaxPersonalDebtForCharacter(character);
      const projected = (character.debt ?? 0) + Math.max(0, Math.abs(scaledBankEffect) - character.bankBalance);
      if (projected > maxDebt) {
        return { success: false, message: "Not enough money — you'd exceed your debt limit." };
      }
    }

    const luckBonus = getLuckRollBonusPercent(character.traits ?? []);
    const hadChance = activity.successChance !== undefined;
    let luckBoosts = character.luckBoostsRemaining;
    const success = applySuccessChance(
      activity.successChance,
      luckBonus,
      luckBoosts,
    );
    if (hadChance && luckBoosts > 0)
      luckBoosts = consumeLuckBoost(luckBonus, luckBoosts, hadChance);

    const effect = success
      ? activity.statEffect
      : (activity.failStatEffect ?? activity.statEffect);
    const bankDelta = success ? scaledBankEffect : 0;
    const debtBefore = character.debt ?? 0;
    const { stats, karma, bankBalance, debt } = applyEffect(
      character.stats,
      character.karma,
      character.bankBalance,
      effect,
      bankDelta,
      character.assets,
      character.debt ?? 0,
    );

    set((s) => {
      if (!s.character) return;
      s.character.stats = stats;
      s.character.karma = karma;
      s.character.bankBalance = bankBalance;
      s.character.debt = debt;
      s.character.luckBoostsRemaining = luckBoosts;
      if (bankDelta !== 0) {
        s.character.financeLedger = appendFinanceLedger(
          s.character.financeLedger,
          createLedgerEntry({
            age: character.age,
            category: "activity",
            label: activity.label,
            amount: bankDelta,
            bankAfter: bankBalance,
            debtAfter: debt,
            debtBefore,
          }),
        );
      }
      if (activity.cost) s.character.coins -= activity.cost;
      if (activity.addsPerson === "pet")
        s.character.people.push(generatePet("dog"));
      s.character.eventHistory.push({
        id: `activity_${activityId}_${Date.now()}`,
        age: character.age,
        title: activity.label,
        description: success
          ? activity.description
          : `${activity.description} It didn't go as planned.`,
        statEffect: effect,
        category: "activity",
        color: "#2DD4BF",
        timestamp: Date.now(),
      });
      s.character.netWorthPeak = Math.max(
        s.character.netWorthPeak,
        computeNetWorth(s.character),
      );
    });

    if (activityId === "crime_petty" && success) {
      const updated = recordCrime(get().character!, "shoplifting");
      set((s) => {
        if (s.character) s.character.criminalRecord = updated.criminalRecord;
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const quests = get().dailyQuests.length
      ? get().dailyQuests
      : pickDailyQuests(today);
    const updatedQuests = updateQuestProgress(quests, "complete_activity", 1);
    setDailyQuestsProgress(today, JSON.stringify(updatedQuests));
    set((s) => {
      s.dailyQuests = updatedQuests;
    });

    get()._checkAchievements();
    void get()._persist();
    return {
      success,
      message: success ? "Success!" : "Didn't go as planned.",
    };
  },

  setFocusAllocation: (allocation) => {
    const { character } = get();
    if (!character?.isAlive)
      return { ok: false, message: "No active character." };
    if (character.lifePhase !== "planning")
      return { ok: false, message: "Not in planning phase." };
    const result = validateFocusAllocation(character.age, allocation);
    if (!result.valid) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.focusAllocation = result.normalized ?? allocation;
    });
    void get()._persist();
    return { ok: true };
  },

  confirmFocusAndAct: () => {
    const { character } = get();
    if (!character?.isAlive)
      return { ok: false, message: "No active character." };
    if (character.age <= 12) {
      set((s) => {
        if (!s.character) return;
        s.character.focusConfirmedForAge = s.character.age;
        s.character.lifePhase = "acting";
      });
      void get()._persist();
      return { ok: true };
    }
    const allocation = character.focusAllocation ?? {};
    const result = validateFocusAllocation(character.age, allocation);
    if (!result.valid) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.focusAllocation = result.normalized ?? allocation;
      s.character.focusConfirmedForAge = s.character.age;
      s.character.lifePhase = "acting";
    });
    void get()._persist();
    return { ok: true };
  },

  dismissYearReview: () => {
    set((s) => {
      if (!s.character || s.character.lifePhase !== "review") return;
      s.character.lifePhase = "planning";
      s.character.focusAllocation = undefined;
      s.character.lastYearReview = undefined;
    });
    void get()._persist();
  },

  setAspirations: (primary, secondary) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    if (character.age < 16)
      return { ok: false, message: "Too young to set aspirations." };
    if (character.aspirations)
      return { ok: false, message: "Aspirations already set." };
    const result = validateAspirations(primary, secondary);
    if (!result.valid) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character) return;
      s.character.aspirations = { primary, secondary };
      s.pendingAspirationPicker = false;
    });
    get()._checkAchievements();
    void get()._persist();
    return { ok: true };
  },

  clearPendingAspirationPicker: () =>
    set((s) => {
      s.pendingAspirationPicker = false;
    }),

  setWill: (will) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    set((s) => {
      if (s.character) s.character.will = will;
    });
    void get()._persist();
    return { ok: true };
  },

  playAsHeir: (heirId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    try {
      const prestige = get().globalPrestige;
      const hasBloodlineBond = (prestige.unlockedDynastyPerkIds ?? []).includes('dynasty_bloodline_bond');
      const newChar = continueAsHeir(character, heirId, {
        hasBloodlineBond,
        dynastyStatBonusTier: prestige.dynastyStatBonusTier ?? 0,
        familyCrestId: prestige.familyCrestId,
      });
      set((s) => {
        s.character = newChar;
        s.pendingDecision = null;
        s.pendingReincarnation = false;
        s.sessionAges = 0;
        s.slotList = buildLocalSlotList();
      });

      incrementLoadGeneration();

      const slotId = get().activeSlotId;
      saveCharacterLocal(newChar, slotId);
      void get()._persist();
      // Check dynasty milestones after generation bump
      get().checkDynastyMilestones();
      return { ok: true };
    } catch (e: any) {
      return {
        ok: false,
        message: e.message ?? "Failed to continue as heir.",
      };
    }
  },
});

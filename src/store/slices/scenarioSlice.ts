import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import { GlobalPrestigeState, ScenarioId } from '@/types';
import { FREE_SCENARIO_IDS, PREMIUM_SCENARIO_IDS } from '@/data/scenarioCatalog';
import { saveGlobalPrestige } from '@services/persistence';
import {
  getMonthKey,
  getMonthlyScenarioPool,
  PLUS_SCENARIO_CREDITS_PER_MONTH,
} from '@/data/plusRotation';

export interface ScenarioSlice {
  unlockScenario: (scenarioId: ScenarioId) => void;
  unlockAllPremiumScenarios: () => void;
  isScenarioOwned: (scenarioId: ScenarioId) => boolean;
  ensurePlusMonthlyState: () => void;
  redeemPlusScenarioPick: (scenarioId: ScenarioId) => { ok: boolean; message: string };
  getPlusScenarioPool: () => ScenarioId[];
}

export const createScenarioSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  ScenarioSlice
> = (set, get) => ({
  unlockScenario: (scenarioId) => {
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

  isScenarioOwned: (scenarioId) => {
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
      return { ok: false, message: "Scenario not in this month's Plus pool." };
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

  getPlusScenarioPool: () => getMonthlyScenarioPool(),
});

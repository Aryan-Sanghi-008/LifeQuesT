import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";

export function useHomeHub() {
  return useGameStore(
    useShallow((s) => ({
      character: s.character,
      dailyQuests: s.dailyQuests,
      loadDailyQuests: s.loadDailyQuests,
      claimQuestReward: s.claimQuestReward,
      getLoginRewardState: s.getLoginRewardState,
      claimLoginReward: s.claimLoginReward,
      canSpinMysteryBox: s.canSpinMysteryBox,
      canSpinMysteryBoxWithTicket: s.canSpinMysteryBoxWithTicket,
      purchaseStreakShield: s.purchaseStreakShield,
    })),
  );
}

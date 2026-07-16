import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";
import { selectCharacterHomeHub } from "@store/selectors";

export function useHomeHub() {
  return useGameStore(
    useShallow((s) => ({
      character: selectCharacterHomeHub(s),
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

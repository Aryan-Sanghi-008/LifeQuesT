import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";

export function useRetentionModals() {
  return useGameStore(
    useShallow((s) => ({
      character: s.character,
      queue: s.achievementUnlockQueue,
      dismissAchievement: s.dismissAchievementUnlock,
      pendingAbsence: s.pendingAbsenceBonus,
      claimAbsence: s.claimAbsenceBonus,
      dynastyQueue: s.dynastyMilestoneQueue,
      dismissDynasty: s.dismissDynastyMilestone,
      collectionQueue: s.collectionSetCompleteQueue,
      dismissCollection: s.dismissCollectionSetComplete,
    })),
  );
}

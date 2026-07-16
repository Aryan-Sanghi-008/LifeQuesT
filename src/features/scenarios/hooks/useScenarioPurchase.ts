import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";

export function useScenarioPurchase() {
  return useGameStore(
    useShallow((s) => ({
      isScenarioOwned: s.isScenarioOwned,
    })),
  );
}

export function getScenarioPurchaseStore() {
  return useGameStore.getState();
}

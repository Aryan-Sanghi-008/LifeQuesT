import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";

export function useShopActions() {
  return useGameStore(
    useShallow((s) => ({
      character: s.character,
      accountIsPremium: s.accountIsPremium,
      globalPrestige: s.globalPrestige,
      unlockFantasyDlc: s.unlockFantasyDlc,
      purchaseStreakShield: s.purchaseStreakShield,
      purchaseMysterySpinWithGems: s.purchaseMysterySpinWithGems,
      purchaseCosmetic: s.purchaseCosmetic,
      applyCosmetic: s.applyCosmetic,
    })),
  );
}

/** Imperative store access for IAP handlers — avoids full-store subscription. */
export function getShopStoreState() {
  return useGameStore.getState();
}

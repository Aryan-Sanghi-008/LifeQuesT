import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";

export function useCharacter() {
  const {
    character,
    pendingDecision,
    isProcessing,
    lastAgeUpNotice,
    showConfetti,
    pendingAspirationPicker,
    createCharacter,
    ageUp,
    resolveDecision,
    dismissDecision,
    clearAgeUpNotice,
    setShowConfetti,
    carriedStatsForCreate,
  } = useGameStore(
    useShallow((s) => ({
      character: s.character,
      pendingDecision: s.pendingDecision,
      isProcessing: s.isProcessing,
      lastAgeUpNotice: s.lastAgeUpNotice,
      showConfetti: s.showConfetti,
      pendingAspirationPicker: s.pendingAspirationPicker,
      createCharacter: s.createCharacter,
      ageUp: s.ageUp,
      resolveDecision: s.resolveDecision,
      dismissDecision: s.dismissDecision,
      clearAgeUpNotice: s.clearAgeUpNotice,
      setShowConfetti: s.setShowConfetti,
      carriedStatsForCreate: s.carriedStatsForCreate,
    })),
  );

  return {
    character,
    pendingDecision,
    isProcessing,
    lastAgeUpNotice,
    showConfetti,
    pendingAspirationPicker,
    isAlive: Boolean(character?.isAlive),
    createCharacter,
    ageUp,
    resolveDecision,
    dismissDecision,
    clearAgeUpNotice,
    setShowConfetti,
    carriedStatsForCreate,
  };
}

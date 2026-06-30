import { useGameStore } from "@store/gameStore";

export function useCharacter() {
  const character = useGameStore((s) => s.character);
  const pendingDecision = useGameStore((s) => s.pendingDecision);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const lastAgeUpNotice = useGameStore((s) => s.lastAgeUpNotice);
  const showConfetti = useGameStore((s) => s.showConfetti);
  const pendingAspirationPicker = useGameStore((s) => s.pendingAspirationPicker);
  const createCharacter = useGameStore((s) => s.createCharacter);
  const ageUp = useGameStore((s) => s.ageUp);
  const resolveDecision = useGameStore((s) => s.resolveDecision);
  const dismissDecision = useGameStore((s) => s.dismissDecision);
  const clearAgeUpNotice = useGameStore((s) => s.clearAgeUpNotice);
  const setShowConfetti = useGameStore((s) => s.setShowConfetti);
  const carriedStatsForCreate = useGameStore((s) => s.carriedStatsForCreate);

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

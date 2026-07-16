import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@store/gameStore";
import type { Character } from "@/types";

export function useCareerScreen() {
  const {
    character,
    workHarder,
    askForRaise,
    quitJob,
    applyForPromotion,
    getClassmates,
    takeCertificationExam,
    applyForJob,
  } = useGameStore(
    useShallow((s) => ({
      character: s.character,
      workHarder: s.workHarder,
      askForRaise: s.askForRaise,
      quitJob: s.quitJob,
      applyForPromotion: s.applyForPromotion,
      getClassmates: s.getClassmates,
      takeCertificationExam: s.takeCertificationExam,
      applyForJob: s.applyForJob,
    })),
  );

  const classmates = useMemo(
    () => (character ? getClassmates() : []),
    [character, getClassmates],
  );

  return {
    character: character as Character | null,
    classmates,
    workHarder,
    askForRaise,
    quitJob,
    applyForPromotion,
    takeCertificationExam,
    applyForJob,
  };
}

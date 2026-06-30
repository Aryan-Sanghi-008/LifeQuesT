import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { isInJail } from "../../engine/crimeEngine";
import { getCareerById, careerPathToLegacy } from "../../data/careerPaths";
import {
  checkCareerEligibility,
  rollForHire,
  getCountrySalary,
  workHarder,
  askForRaise,
  applyForPromotion,
} from "../../engine/careerEngine";
import { ensureCoworkers } from "../../engine/peopleEngine";
import { clamp } from "../../engine/economyEngine";

export interface CareerSlice {
  applyForJob: (jobId: string) => { success: boolean; message: string };
  workHarder: () => void;
  askForRaise: () => { success: boolean; message: string };
  quitJob: () => void;
  applyForPromotion: () => { success: boolean; message: string };
}

export const createCareerSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  CareerSlice
> = (set, get) => ({
  applyForJob: (jobId) => {
    const { character } = get();
    if (!character) return { success: false, message: "No character." };
    if (isInJail(character))
      return {
        success: false,
        message: "You cannot work while serving time.",
      };
    if (character.age < 16)
      return { success: false, message: "Too young to work." };

    const careerPath = getCareerById(jobId);
    if (careerPath) {
      const eligibility = checkCareerEligibility(character, jobId);
      if (!eligibility.eligible) {
        return {
          success: false,
          message:
            eligibility.reason ?? "You are not eligible for this career.",
        };
      }
      if (!rollForHire(eligibility.hireProbability)) {
        return {
          success: false,
          message: `You applied for ${careerPath.label} (${eligibility.hireProbability}% chance) but didn't get it. Try again.`,
        };
      }
      const localSalary = getCountrySalary(
        careerPath.baseSalary,
        character.countryCode,
      );
      const career = careerPathToLegacy(careerPath);
      career.salary = localSalary;
      set((s) => {
        if (!s.character) return;
        s.character.career = career;
        s.character.job = careerPath.label;
        s.character.people = ensureCoworkers(
          s.character.people,
          s.character.name,
          careerPath.label,
        );
      });
      void get()._persist();
      return {
        success: true,
        message: `You're now a ${careerPath.label} at ${careerPath.company}!`,
      };
    }

    return { success: false, message: "Career not found." };
  },

  workHarder: () => {
    const { character } = get();
    if (!character?.career) return;
    if (isInJail(character)) return;
    set((s) => {
      if (!s.character?.career) return;
      s.character.career = workHarder(s.character.career);
      s.character.stats.health = clamp(s.character.stats.health - 3);
    });
    void get()._persist();
  },

  askForRaise: () => {
    const { character } = get();
    if (!character?.career)
      return { success: false, message: "You need a job first." };
    if (isInJail(character))
      return {
        success: false,
        message: "You cannot work while serving time.",
      };
    const success = Math.random() < 0.65;
    set((s) => {
      if (!s.character?.career) return;
      s.character.career = askForRaise(s.character.career, success);
    });
    void get()._persist();
    return success
      ? { success: true, message: "Your boss agreed to a raise!" }
      : { success: false, message: "Not this year — keep performing." };
  },

  quitJob: () => {
    set((s) => {
      if (!s.character) return;
      s.character.career = null;
      s.character.job = "Unemployed";
      s.character.people = s.character.people.filter(
        (p) => p.relationType !== "coworker",
      );
    });
    void get()._persist();
  },

  applyForPromotion: () => {
    const { character } = get();
    if (!character?.career)
      return { success: false, message: "You need a job first." };
    if (isInJail(character))
      return {
        success: false,
        message: "You cannot work while serving time.",
      };
    const perfOk = character.career.performance >= 55;
    const success = perfOk && Math.random() < 0.6;
    let message = "Promotion denied — improve your performance.";
    set((s) => {
      if (!s.character?.career) return;
      const result = applyForPromotion(
        s.character.career,
        success,
        s.character,
      );
      s.character.career = result.career;
      if (result.newTitle) {
        s.character.job = result.newTitle;
        message = `Promoted to ${result.newTitle}!`;
      }
    });
    void get()._persist();
    return {
      success,
      message: success
        ? message
        : "Promotion denied — improve your performance.",
    };
  },
});

import { Character, GlobalPrestigeState, ChallengeId } from "../types";
import { evaluateChallenge } from "./challengeEngine";
import { computeNetWorth } from "./economyEngine";

export interface PrestigeTraitDef {
  id: string;
  label: string;
  description: string;
  cost: number;
}

export const PRESTIGE_TRAITS: PrestigeTraitDef[] = [
  {
    id: "prestige_royal_blood",
    label: "Royal Blood",
    description:
      "Start your new life with a massive cash inheritance of $150,000.",
    cost: 800,
  },
  {
    id: "prestige_lucky_star",
    label: "Lucky Star",
    description:
      "Permanent luck boost: increases all random activity success chances by 20%.",
    cost: 600,
  },
  {
    id: "prestige_genius_dna",
    label: "Genius DNA",
    description:
      "Intelligence stat potential is guaranteed to start locked at 100.",
    cost: 1000,
  },
  {
    id: "prestige_immune_system",
    label: "Immune System",
    description:
      "Permanent +20% boost to starting Health and significantly lower disease rates.",
    cost: 600,
  },
];

export function calculatePrestigeLevel(points: number): number {
  return Math.floor(points / 1000) + 1;
}

export function processCharacterDeath(
  character: Character,
  state: GlobalPrestigeState,
): {
  nextState: GlobalPrestigeState;
  pointsAwarded: number;
  challengeCompleted: boolean;
  message: string;
  levelUp: boolean;
} {
  const nextState = { ...state };
  nextState.totalLivesLived += 1;

  let pointsAwarded = 0;
  let challengeCompleted = false;
  let message = "Your journey has ended.";

  // 1. Evaluate Active Challenge
  if (character.activeChallengeId) {
    const activeChallengeId = character.activeChallengeId as ChallengeId;
    const isAlreadyCompleted =
      state.completedChallengeIds.includes(activeChallengeId);

    // Evaluate challenge conditions
    const evalRes = evaluateChallenge(character);
    if (evalRes.success) {
      challengeCompleted = true;
      if (!isAlreadyCompleted) {
        pointsAwarded += evalRes.points;
        nextState.completedChallengeIds = [
          ...nextState.completedChallengeIds,
          activeChallengeId,
        ];
        message = `Challenge Completed! Unlocked ${evalRes.points} Prestige Points: ${evalRes.message}`;
      } else {
        message = `Challenge Completed again! ${evalRes.message} (Already earned points previously)`;
      }
    } else {
      message = `Challenge Failed: ${evalRes.message}`;
    }
  }

  // 2. Award base points for age up and net worth
  const age = character.deathAge ?? character.age;
  const netWorth = computeNetWorth(character);

  const agePoints = Math.floor(age / 2); // 1 point per 2 years lived
  const wealthPoints = Math.min(100, Math.floor(netWorth / 50000)); // 1 point per $50k, max 100 points

  const basePoints = agePoints + wealthPoints;
  pointsAwarded += basePoints;

  nextState.prestigePoints += pointsAwarded;

  // 3. Level Up detection
  const oldLevel = state.prestigeLevel;
  const newLevel = calculatePrestigeLevel(nextState.prestigePoints);
  nextState.prestigeLevel = newLevel;

  const levelUp = newLevel > oldLevel;

  return {
    nextState,
    pointsAwarded,
    challengeCompleted,
    message: `${message}\nLived to age ${age} (+${agePoints} pts). Peak Wealth $${netWorth.toLocaleString()} (+${wealthPoints} pts).`,
    levelUp,
  };
}

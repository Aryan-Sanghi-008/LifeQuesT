import { Character } from '../types';
import { computeNetWorth } from './economyEngine';

export interface SeasonalChallenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  check: (character: Character) => boolean;
}

export interface Season {
  id: string;
  title: string;
  description: string;
  activeModifiers: {
    expenseMultiplier: number;
    maintenanceMultiplier: number;
    stockReturnBonus: number;
    healthDrain: number;
  };
  challenge: SeasonalChallenge;
}

export const CURRENT_SEASON: Season = {
  id: 'season_1_inflation',
  title: 'Season 1: Inflation Surge',
  description: 'A period of global financial volatility. Real estate maintenance and living costs are up, but stock market rallies offer high returns.',
  activeModifiers: {
    expenseMultiplier: 1.10, // +10% expenses
    maintenanceMultiplier: 1.15, // +15% maintenance
    stockReturnBonus: 0.05, // +5% stocks
    healthDrain: 0,
  },
  challenge: {
    id: 'golden_age_challenge',
    title: 'The Golden Age',
    description: 'Reach age 90 or older with a peak net worth of at least $2,000,000.',
    rewardXp: 150,
    check: (char) => {
      const netWorth = computeNetWorth(char);
      return char.age >= 90 && netWorth >= 2000000;
    },
  },
};

export function getCurrentSeason(): Season {
  return CURRENT_SEASON;
}

export function applyLiveOpsModifiers(
  _character: Character,
  baseExpenses: number,
  baseMaintenance: number,
) {
  const season = getCurrentSeason();
  const mods = season.activeModifiers;

  const expenses = Math.round(baseExpenses * mods.expenseMultiplier);
  const maintenance = Math.round(baseMaintenance * mods.maintenanceMultiplier);

  return { expenses, maintenance };
}

export function evaluateSeasonalChallenge(character: Character): {
  success: boolean;
  message: string;
  rewardXp: number;
} {
  const season = getCurrentSeason();
  const challenge = season.challenge;

  const passed = challenge.check(character);

  if (passed) {
    return {
      success: true,
      message: `🎉 Seasonal Challenge Completed! You unlocked "${challenge.title}" and earned ${challenge.rewardXp} XP.`,
      rewardXp: challenge.rewardXp,
    };
  }

  return {
    success: false,
    message: `Active Season Challenge: ${challenge.description}`,
    rewardXp: 0,
  };
}

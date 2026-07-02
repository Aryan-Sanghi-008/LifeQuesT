import { Character, LifeEvent } from '../types';
import { computeNetWorth } from './economyEngine';

export interface LimitedTimeOffer {
  id: string;
  title: string;
  subtitle?: string;
  productId?: string;
  gemCost?: number;
  expiresAt?: string;
}

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

export interface LiveOpsSeasonConfig {
  id: string;
  title: string;
  description: string;
  activeModifiers: Season['activeModifiers'];
  challenge: {
    id: string;
    title: string;
    description: string;
    rewardXp: number;
  };
}

export interface LiveOpsConfig {
  season: LiveOpsSeasonConfig;
  worldEvents?: string[];
  featuredScenario?: string;
  limitedTimeOffers?: LimitedTimeOffer[];
}

const CHALLENGE_REGISTRY: Record<string, (char: Character) => boolean> = {
  golden_age_challenge: (char) => {
    const netWorth = computeNetWorth(char);
    return char.age >= 90 && netWorth >= 2000000;
  },
};

export const CURRENT_SEASON: Season = {
  id: 'season_1_inflation',
  title: 'Season 1: Inflation Surge',
  description: 'A period of global financial volatility. Real estate maintenance and living costs are up, but stock market rallies offer high returns.',
  activeModifiers: {
    expenseMultiplier: 1.10,
    maintenanceMultiplier: 1.15,
    stockReturnBonus: 0.05,
    healthDrain: 0,
  },
  challenge: {
    id: 'golden_age_challenge',
    title: 'The Golden Age',
    description: 'Reach age 90 or older with a peak net worth of at least $2,000,000.',
    rewardXp: 150,
    check: CHALLENGE_REGISTRY.golden_age_challenge,
  },
};

let hydratedSeason: Season | null = null;
let hydratedConfig: LiveOpsConfig | null = null;

function seasonFromConfig(config: LiveOpsConfig): Season {
  const challengeId = config.season.challenge.id;
  const checkFn = CHALLENGE_REGISTRY[challengeId] ?? CHALLENGE_REGISTRY.golden_age_challenge;
  return {
    id: config.season.id,
    title: config.season.title,
    description: config.season.description,
    activeModifiers: config.season.activeModifiers,
    challenge: {
      ...config.season.challenge,
      check: checkFn,
    },
  };
}

export function getFallbackLiveOpsConfig(): LiveOpsConfig {
  return {
    season: {
      id: CURRENT_SEASON.id,
      title: CURRENT_SEASON.title,
      description: CURRENT_SEASON.description,
      activeModifiers: CURRENT_SEASON.activeModifiers,
      challenge: {
        id: CURRENT_SEASON.challenge.id,
        title: CURRENT_SEASON.challenge.title,
        description: CURRENT_SEASON.challenge.description,
        rewardXp: CURRENT_SEASON.challenge.rewardXp,
      },
    },
    worldEvents: [],
    featuredScenario: 'classic',
    limitedTimeOffers: [],
  };
}

export function hydrateLiveOpsFromConfig(config: LiveOpsConfig): void {
  hydratedConfig = config;
  hydratedSeason = seasonFromConfig(config);
}

export function getHydratedLiveOpsConfig(): LiveOpsConfig | null {
  return hydratedConfig;
}

export function getCurrentSeason(): Season {
  return hydratedSeason ?? CURRENT_SEASON;
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
    message: `Seasonal Challenge: ${challenge.title} — ${challenge.description}`,
    rewardXp: 0,
  };
}

export function formatModifierPercent(multiplier: number): string {
  const delta = Math.round((multiplier - 1) * 100);
  if (delta === 0) return '0%';
  return `${delta > 0 ? '+' : ''}${delta}%`;
}

const LIVEOPS_WORLD_EVENT_WEIGHT_MULTIPLIER = 3;

/** Boost weights for event IDs listed in the active LiveOps config. */
export function applyLiveOpsWorldEventBoost(
  events: LifeEvent[],
  worldEventIds: string[] = [],
): LifeEvent[] {
  if (!worldEventIds.length) return events;
  const activeIds = new Set(worldEventIds);
  return events.map((event) =>
    activeIds.has(event.id)
      ? { ...event, weight: (event.weight ?? 10) * LIVEOPS_WORLD_EVENT_WEIGHT_MULTIPLIER }
      : event,
  );
}

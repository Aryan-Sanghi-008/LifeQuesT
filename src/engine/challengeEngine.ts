import { Character, Challenge, ChallengeId } from '../types';
import { computeNetWorth } from './economyEngine';

export const CHALLENGES: Record<ChallengeId, Challenge> = {
  rags_to_riches: {
    id: 'rags_to_riches',
    title: 'Rags to Riches',
    description: 'Born in a poor family, build a net worth of at least $1,000,000 by age 50.',
    rules: [
      'Must start with Poor family background',
      'Net worth must reach $1,000,000 by age 50',
    ],
    pointsReward: 500,
  },
  zero_crime_saint: {
    id: 'zero_crime_saint',
    title: 'Zero Crime Saint',
    description: 'Live a completely crime-free life, reaching age 80 with at least 90 Karma.',
    rules: [
      'No crimes committed',
      'Reach age 80',
      'Karma must be 90 or higher',
    ],
    pointsReward: 400,
  },
  long_life: {
    id: 'long_life',
    title: '120 Year Legend',
    description: 'Defy mortality and survive to the ripe old age of 120.',
    rules: [
      'Survive to age 120 or older',
    ],
    pointsReward: 600,
  },
  no_relationships: {
    id: 'no_relationships',
    title: 'Lone Wolf',
    description: 'Reach age 50 without ever having a partner, spouse, or friend.',
    rules: [
      'No partners, spouses, or friends in your life',
      'Survive to age 50',
    ],
    pointsReward: 350,
  },
  speedrun_millionaire: {
    id: 'speedrun_millionaire',
    title: 'Speedrun Millionaire',
    description: 'Acquire a net worth of at least $1,000,000 by the young age of 30.',
    rules: [
      'Net worth must reach $1,000,000 by age 30',
    ],
    pointsReward: 500,
  },
};

export function evaluateChallenge(character: Character): { success: boolean; message: string; points: number } {
  const activeId = character.activeChallengeId as ChallengeId | undefined;
  if (!activeId || !CHALLENGES[activeId]) {
    return { success: false, message: 'No active challenge found.', points: 0 };
  }

  const chal = CHALLENGES[activeId];
  const age = character.deathAge ?? character.age;
  const netWorth = computeNetWorth(character);
  const karma = character.karma ?? 50;

  switch (activeId) {
    case 'rags_to_riches': {
      const startPoor = character.familyBackground === 'poor';
      if (!startPoor) {
        return { success: false, message: 'Failed: You did not start with a Poor background.', points: 0 };
      }
      if (netWorth < 1000000) {
        return { success: false, message: 'Failed: You did not reach $1,000,000 in net worth.', points: 0 };
      }
      if (age > 50) {
        return { success: false, message: 'Failed: You did not achieve this by age 50.', points: 0 };
      }
      return { success: true, message: 'Success! You rose from rags to riches.', points: chal.pointsReward };
    }

    case 'zero_crime_saint': {
      const crimesCount = character.criminalRecord?.crimes?.length ?? 0;
      if (crimesCount > 0) {
        return { success: false, message: 'Failed: You committed crimes in this life.', points: 0 };
      }
      if (age < 80) {
        return { success: false, message: 'Failed: You did not reach age 80.', points: 0 };
      }
      if (karma < 90) {
        return { success: false, message: 'Failed: Your Karma was below 90.', points: 0 };
      }
      return { success: true, message: 'Success! You lived a pure and saintly life.', points: chal.pointsReward };
    }

    case 'long_life': {
      if (age < 120) {
        return { success: false, message: 'Failed: You did not survive to age 120.', points: 0 };
      }
      return { success: true, message: 'Success! You survived to age 120.', points: chal.pointsReward };
    }

    case 'no_relationships': {
      const hasBond = character.people.some(p =>
        ['partner', 'spouse', 'friend'].includes(p.relationType)
      );
      if (hasBond) {
        return { success: false, message: 'Failed: You had a friend, partner, or spouse in your life.', points: 0 };
      }
      if (age < 50) {
        return { success: false, message: 'Failed: You did not survive to age 50.', points: 0 };
      }
      return { success: true, message: 'Success! You survived as a lone wolf to age 50.', points: chal.pointsReward };
    }

    case 'speedrun_millionaire': {
      if (netWorth < 1000000) {
        return { success: false, message: 'Failed: You did not reach $1,000,000 in net worth.', points: 0 };
      }
      if (age > 30) {
        return { success: false, message: 'Failed: You did not achieve this by age 30.', points: 0 };
      }
      return { success: true, message: 'Success! You became a millionaire in record time.', points: chal.pointsReward };
    }

    default:
      return { success: false, message: 'Unknown challenge type.', points: 0 };
  }
}

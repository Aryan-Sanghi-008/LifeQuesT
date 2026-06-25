import { runResolveDecision } from '@engine/resolveDecisionEngine';
import type { Character, LifeEvent } from '../../types';

function baseCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: '1',
    name: 'Test User',
    gender: 'male',
    avatarSeed: 'seed',
    avatarId: 'male_1',
    lifeStage: 'adult',
    country: 'India',
    countryFlag: '🇮🇳',
    countryCode: 'IN',
    zodiac: 'aries',
    familyBackground: 'middle',
    traits: [],
    job: 'Engineer',
    age: 30,
    birthYear: 1996,
    stats: {
      health: 80, happiness: 70, intelligence: 60, wealth: 40,
      fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
    },
    karma: 50,
    bankBalance: 50000,
    netWorthPeak: 50000,
    relationships: 0,
    children: 0,
    educationLevel: 'university',
    people: [],
    career: null,
    assets: [],
    achievements: [],
    eventHistory: [],
    isAlive: true,
    coins: 100,
    gems: 0,
    isPremium: false,
    hasNoAds: false,
    luckBoostsRemaining: 1,
    hasReincarnationScroll: false,
    businesses: [],
    socialFollowers: 0,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

const choiceEvent: LifeEvent = {
  id: 'test_choice',
  minAge: 18,
  maxAge: 60,
  title: 'Risky Bet',
  description: 'A gamble presents itself.',
  statEffect: { happiness: -5 },
  category: 'financial',
  color: '#F59E0B',
  choices: [
    {
      id: 'take_risk',
      text: 'Take the risk',
      subtext: '',
      statEffect: { wealth: 10, happiness: 5 },
      successChance: 100,
      successText: 'It paid off!',
      failText: 'You lost everything.',
    },
    {
      id: 'walk_away',
      text: 'Walk away',
      subtext: '',
      statEffect: { happiness: 2 },
    },
  ],
};

describe('runResolveDecision', () => {
  it('applies success choice effects', () => {
    const result = runResolveDecision(baseCharacter(), choiceEvent, 'take_risk');
    expect(result).not.toBeNull();
    expect(result!.patch.stats?.happiness).toBe(75);
    expect(result!.eventRecord.choiceMade).toBe('Take the risk');
    expect(result!.eventRecord.description).toBe('It paid off!');
  });

  it('applies base effect on failed chance roll', () => {
    const risky: LifeEvent = {
      ...choiceEvent,
      choices: [{
        id: 'fail',
        text: 'Try anyway',
        subtext: '',
        statEffect: { intelligence: 20 },
        successChance: 0,
      }],
    };
    const result = runResolveDecision(baseCharacter(), risky, 'fail');
    expect(result!.patch.stats?.happiness).toBe(65);
    expect(result!.patch.stats?.intelligence).toBe(60);
  });

  it('consumes luck boost on chance choices when not lucky trait', () => {
    const risky: LifeEvent = {
      ...choiceEvent,
      choices: [{
        id: 'maybe',
        text: 'Maybe',
        subtext: '',
        statEffect: { wealth: 5 },
        successChance: 50,
      }],
    };
    const result = runResolveDecision(baseCharacter({ luckBoostsRemaining: 2 }), risky, 'maybe');
    expect(result!.patch.luckBoostsRemaining).toBe(1);
  });

  it('returns null for unknown choice', () => {
    expect(runResolveDecision(baseCharacter(), choiceEvent, 'nope')).toBeNull();
  });
});

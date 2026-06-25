import {
  hasJob, isEligible, applySuccessChance, consumeLuckBoost, getEligibleEvents,
} from '@engine/eventEngine';
import type { Character } from '../../types';

const baseCharacter: Character = {
  id: '1',
  name: 'Test',
  gender: 'male',
  avatarSeed: 'seed',
  avatarId: 'male_1',
  lifeStage: 'adult',
  country: 'India',
  countryFlag: '🇮🇳',
  countryCode: 'IN',
  zodiac: 'aries',
  familyBackground: 'middle',
  traits: ['lucky'],
  job: 'Student',
  age: 20,
  birthYear: 2000,
  stats: {
    health: 70, happiness: 70, intelligence: 80, wealth: 50,
    fitness: 60, looks: 60, social: 50, ambition: 50,
  },
  karma: 50,
  bankBalance: 1000,
  netWorthPeak: 1000,
  relationships: 0,
  children: 0,
  educationLevel: 'secondary',
  people: [],
  career: null,
  assets: [],
  achievements: [],
  eventHistory: [],
  isAlive: true,
  coins: 0,
  gems: 0,
  isPremium: false,
  hasNoAds: false,
  luckBoostsRemaining: 2,
  hasReincarnationScroll: false,
  createdAt: 1,
  updatedAt: 1,
};

describe('hasJob', () => {
  it('returns false for student', () => {
    expect(hasJob(baseCharacter)).toBe(false);
  });

  it('returns true when career exists', () => {
    expect(hasJob({
      ...baseCharacter,
      career: {
        title: 'Doctor', company: 'Hospital', salary: 100000, yearsEmployed: 1, performance: 50,
      },
    })).toBe(true);
  });
});

describe('isEligible', () => {
  it('rejects events outside age range', () => {
    const event = {
      id: 'old', minAge: 30, maxAge: 40, title: '', description: '',
      statEffect: {}, category: 'random' as const, color: '#000',
    };
    expect(isEligible(event, 20, [], baseCharacter)).toBe(false);
  });

  it('rejects one-time events already used', () => {
    const event = {
      id: 'birth', minAge: 0, maxAge: 0, title: '', description: '',
      statEffect: {}, category: 'milestone' as const, color: '#000', oneTime: true,
    };
    expect(isEligible(event, 0, ['birth'], baseCharacter)).toBe(false);
  });

  it('requires matching trait when specified', () => {
    const event = {
      id: 'trait_only', minAge: 10, maxAge: 30, title: '', description: '',
      statEffect: {}, category: 'random' as const, color: '#000', requiresTrait: 'brilliant',
    };
    expect(isEligible(event, 20, [], baseCharacter)).toBe(false);
    expect(isEligible(event, 20, [], { ...baseCharacter, traits: ['brilliant'] })).toBe(true);
  });
});

describe('applySuccessChance', () => {
  it('returns true when chance is undefined', () => {
    expect(applySuccessChance(undefined, false, 0)).toBe(true);
  });
});

describe('consumeLuckBoost', () => {
  it('consumes one boost for non-lucky characters when chance was used', () => {
    expect(consumeLuckBoost(false, 2, true)).toBe(1);
  });

  it('does not consume for lucky characters', () => {
    expect(consumeLuckBoost(true, 2, true)).toBe(2);
  });
});

describe('getEligibleEvents', () => {
  it('returns events matching age', () => {
    const events = getEligibleEvents(20, baseCharacter);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every(e => 20 >= e.minAge && 20 <= e.maxAge)).toBe(true);
  });
});

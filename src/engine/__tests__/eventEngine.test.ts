import {
  hasJob, isEligible, applySuccessChance, consumeLuckBoost, getEligibleEvents,
  getWeightedEligibleEvents,
  pickWeightedEvents, getGuaranteedMilestones, resolveEventRarity,
  preloadAllEventPacks,
} from '@engine/eventEngine';
import type { Character, LifeEvent } from '../../types';
import { createTestCharacter } from '../../test/fixtures/character';

const baseCharacter: Character = createTestCharacter({
  traits: ['lucky'],
  luckBoostsRemaining: 2,
});

beforeAll(async () => {
  await preloadAllEventPacks();
});

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

describe('getWeightedEligibleEvents', () => {
  it('applies focus weight boosts to eligible pool', () => {
    const focusCharacter = {
      ...baseCharacter,
      age: 25,
      focusAllocation: { career: 2, education: 1 },
      lifePhase: 'acting' as const,
    };
    const noFocusCharacter = {
      ...baseCharacter,
      age: 25,
      focusAllocation: {},
      lifePhase: 'acting' as const,
    };
    const weighted = getWeightedEligibleEvents(25, focusCharacter);
    const unfocused = getWeightedEligibleEvents(25, noFocusCharacter);

    expect(weighted.length).toBeGreaterThan(0);

    // Career focus (2 pts) should boost the average weight of career events
    // relative to the same events with no focus allocation.
    const focusedCareerAvg = weighted
      .filter(e => e.category === 'career')
      .reduce((s, e) => s + (e.weight ?? 1), 0) /
      Math.max(1, weighted.filter(e => e.category === 'career').length);

    const unfocusedCareerAvg = unfocused
      .filter(e => e.category === 'career')
      .reduce((s, e) => s + (e.weight ?? 1), 0) /
      Math.max(1, unfocused.filter(e => e.category === 'career').length);

    if (focusedCareerAvg > 0 && unfocusedCareerAvg > 0) {
      expect(focusedCareerAvg).toBeGreaterThan(unfocusedCareerAvg);
    }
  });

  it('excludes memory-gated events without required tags', () => {
    const chainEvent = getWeightedEligibleEvents(20, baseCharacter).find(
      e => e.requiredMemoryTags?.length,
    );
    if (!chainEvent?.requiredMemoryTags?.length) return;
    const withoutTags = getWeightedEligibleEvents(20, {
      ...baseCharacter,
      memoryTags: [],
    });
    expect(withoutTags.some(e => e.id === chainEvent.id)).toBe(false);
  });
});

describe('pickWeightedEvents', () => {
  it('returns at most count events', () => {
    const pool = [
      { id: 'a', minAge: 0, maxAge: 99, title: 'A', description: '', statEffect: {}, category: 'random' as const, color: '#000', weight: 5 },
      { id: 'b', minAge: 0, maxAge: 99, title: 'B', description: '', statEffect: {}, category: 'random' as const, color: '#000', weight: 1 },
      { id: 'c', minAge: 0, maxAge: 99, title: 'C', description: '', statEffect: {}, category: 'random' as const, color: '#000' },
    ];
    expect(pickWeightedEvents(pool, 2)).toHaveLength(2);
  });
});

describe('getGuaranteedMilestones', () => {
  it('includes school_start at age 5 when education is none', () => {
    const char = {
      ...baseCharacter,
      age: 5,
      educationLevel: 'none' as const,
      educationStage: 'none',
      eventHistory: [],
    };
    const milestones = getGuaranteedMilestones(5, char);
    expect(milestones.some(e => e.id === 'school_start')).toBe(true);
  });

  it('skips school_start when education already progressed', () => {
    const char = {
      ...baseCharacter,
      age: 5,
      educationLevel: 'elementary' as const,
      educationStage: 'primary',
      eventHistory: [],
    };
    const milestones = getGuaranteedMilestones(5, char);
    expect(milestones.some(e => e.id === 'school_start')).toBe(false);
  });
});

describe('resolveEventRarity', () => {
  const baseEvent = (overrides: Partial<LifeEvent> = {}): LifeEvent => ({
    id: 'test_event',
    minAge: 0,
    maxAge: 99,
    title: 'Test',
    description: 'Test',
    statEffect: {},
    category: 'random',
    color: '#000',
    ...overrides,
  });

  it('returns explicit rarity when set on event data', () => {
    expect(resolveEventRarity(baseEvent({ rarity: 'legendary' }))).toBe('legendary');
  });

  it('marks milestone category events as epic', () => {
    expect(resolveEventRarity(baseEvent({ category: 'milestone' }))).toBe('epic');
  });

  it('marks one-time low-weight events as legendary', () => {
    expect(resolveEventRarity(baseEvent({ oneTime: true, weight: 2 }))).toBe('legendary');
  });

  it('marks choice events as uncommon by default', () => {
    expect(resolveEventRarity(baseEvent({
      choices: [{ id: 'a', text: 'Do it', subtext: 'Go ahead', statEffect: {} }],
    }))).toBe('uncommon');
  });

  it('marks high-impact financial events as rare', () => {
    expect(resolveEventRarity(baseEvent({
      category: 'financial',
      bankEffect: 100000,
      weight: 3,
    }))).toBe('rare');
  });

  it('defaults routine events to common', () => {
    expect(resolveEventRarity(baseEvent({ weight: 10 }))).toBe('common');
  });
});

describe('scenario eligibility filtering', () => {
  const royalEvent: LifeEvent = {
    id: 'test_royal', title: 'Royal Test', description: 'Palace intrigue',
    minAge: 18, maxAge: 60, statEffect: { happiness: 5 }, category: 'random',
    weight: 5, color: '#FFD700', requiresScenario: ['royal'],
  };

  it('classic character does not receive royal-only events', () => {
    const classic = createTestCharacter({ age: 30, scenarioId: 'classic' });
    expect(isEligible(royalEvent, 30, [], classic)).toBe(false);
  });

  it('royal character receives royal-only events', () => {
    const royal = createTestCharacter({ age: 30, scenarioId: 'royal' });
    expect(isEligible(royalEvent, 30, [], royal)).toBe(true);
  });

  it('universal events (no requiresScenario) are eligible for any character', () => {
    const universalEvent: LifeEvent = {
      id: 'test_universal', title: 'Universal', description: 'For everyone',
      minAge: 18, maxAge: 60, statEffect: {}, category: 'random', weight: 5, color: '#FFF',
    };
    const classic = createTestCharacter({ age: 30, scenarioId: 'classic' });
    const royal = createTestCharacter({ age: 30, scenarioId: 'royal' });
    expect(isEligible(universalEvent, 30, [], classic)).toBe(true);
    expect(isEligible(universalEvent, 30, [], royal)).toBe(true);
  });

  it('character without explicit scenarioId defaults to classic', () => {
    const noScenario = createTestCharacter({ age: 30 });
    delete (noScenario as Partial<typeof noScenario>).scenarioId;
    expect(isEligible(royalEvent, 30, [], noScenario)).toBe(false);
  });

  it('rags_to_riches events are only eligible for rags_to_riches characters', () => {
    const ragsEvent: LifeEvent = {
      id: 'rtr_test', title: 'Rags Test', description: '',
      minAge: 18, maxAge: 60, statEffect: {}, category: 'random', weight: 5, color: '#F97316',
      requiresScenario: ['rags_to_riches'],
    };
    const ragsChar = createTestCharacter({ age: 30, scenarioId: 'rags_to_riches' });
    const classicChar = createTestCharacter({ age: 30, scenarioId: 'classic' });
    const silverChar = createTestCharacter({ age: 30, scenarioId: 'silver_spoon' });
    expect(isEligible(ragsEvent, 30, [], ragsChar)).toBe(true);
    expect(isEligible(ragsEvent, 30, [], classicChar)).toBe(false);
    expect(isEligible(ragsEvent, 30, [], silverChar)).toBe(false);
  });

  it('zombie events are only eligible for zombie characters', () => {
    const zombieEvent: LifeEvent = {
      id: 'zom_test', title: 'Zombie Test', description: '',
      minAge: 16, maxAge: 70, statEffect: {}, category: 'random', weight: 5, color: '#4D7C0F',
      requiresScenario: ['zombie'],
    };
    const zombieChar = createTestCharacter({ age: 30, scenarioId: 'zombie' });
    const classicChar = createTestCharacter({ age: 30, scenarioId: 'classic' });
    expect(isEligible(zombieEvent, 30, [], zombieChar)).toBe(true);
    expect(isEligible(zombieEvent, 30, [], classicChar)).toBe(false);
  });

  it('political events are only eligible for political characters', () => {
    const politicalEvent: LifeEvent = {
      id: 'pol_test', title: 'Political Test', description: '',
      minAge: 22, maxAge: 70, statEffect: {}, category: 'career', weight: 5, color: '#1D4ED8',
      requiresScenario: ['political'],
    };
    const politicalChar = createTestCharacter({ age: 30, scenarioId: 'political' });
    const royalChar = createTestCharacter({ age: 30, scenarioId: 'royal' });
    expect(isEligible(politicalEvent, 30, [], politicalChar)).toBe(true);
    expect(isEligible(politicalEvent, 30, [], royalChar)).toBe(false);
  });
});

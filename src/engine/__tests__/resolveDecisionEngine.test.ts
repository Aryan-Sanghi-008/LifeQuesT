import { runResolveDecision } from '@engine/resolveDecisionEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import type { LifeEvent } from '../../types';

function baseCharacter(overrides: Parameters<typeof createTestCharacter>[0] = {}) {
  return createTestCharacter({
    job: 'Engineer',
    age: 30,
    birthYear: 1996,
    educationLevel: 'university',
    bankBalance: 50000,
    netWorthPeak: 50000,
    coins: 100,
    luckBoostsRemaining: 1,
    ...overrides,
  });
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
    const result = runResolveDecision(baseCharacter({ luckBoostsRemaining: 0 }), risky, 'fail');
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

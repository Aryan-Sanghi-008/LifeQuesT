import { checkCareerEligibility, getScenarioCareerBoard } from '../careerEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('scenario careers', () => {
  const eligibleBase = createTestCharacter({
    age: 22,
    educationStage: 'university',
    educationLevel: 'university',
    stats: {
      health: 70,
      happiness: 70,
      intelligence: 70,
      wealth: 40,
      fitness: 60,
      looks: 60,
      social: 55,
      ambition: 50,
      mentalHealth: 70,
    },
  });

  it('blocks royal_heir in classic scenario', () => {
    const result = checkCareerEligibility(
      { ...eligibleBase, scenarioId: 'classic' },
      'royal_heir',
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Not available in this scenario.');
  });

  it('allows royal_heir in royal scenario when other requirements met', () => {
    const result = checkCareerEligibility(
      { ...eligibleBase, scenarioId: 'royal' },
      'royal_heir',
    );
    expect(result.eligible).toBe(true);
  });

  it('blocks netrunner outside cyber scenario', () => {
    const result = checkCareerEligibility(
      { ...eligibleBase, scenarioId: 'royal' },
      'netrunner',
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Not available in this scenario.');
  });

  it('allows fantasy alchemist only in fantasy scenario', () => {
    const fantasyChar = {
      ...eligibleBase,
      scenarioId: 'fantasy' as const,
      intelligence: 70,
    };
    const allowed = checkCareerEligibility(fantasyChar, 'career_alchemist');
    const blocked = checkCareerEligibility(
      { ...fantasyChar, scenarioId: 'classic' },
      'career_alchemist',
    );
    expect(allowed.eligible).toBe(true);
    expect(blocked.eligible).toBe(false);
  });

  it('lists royal_heir on scenario career board for royal scenario', () => {
    const board = getScenarioCareerBoard({
      ...eligibleBase,
      scenarioId: 'royal',
    });
    expect(board.some((e) => e.career.id === 'royal_heir')).toBe(true);
  });
});

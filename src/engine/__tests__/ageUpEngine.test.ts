import { runAgeUp } from '@engine/ageUpEngine';
import { tickAnnualEconomy } from '@engine/economyEngine';
import { createTestCharacter } from '../../test/fixtures/character';

function baseCharacter(overrides: Parameters<typeof createTestCharacter>[0] = {}) {
  return createTestCharacter({
    job: 'Engineer',
    age: 30,
    birthYear: 1996,
    educationLevel: 'university',
    educationStage: 'undergraduate',
    bankBalance: 50000,
    netWorthPeak: 50000,
    coins: 100,
    ...overrides,
  });
}

describe('runAgeUp', () => {
  it('returns jail_tick when character is in jail', () => {
    const character = baseCharacter({
      criminalRecord: { crimes: ['theft'], jailYearsRemaining: 2, onProbation: false },
    });
    const outcome = runAgeUp(character);
    expect(outcome.type).toBe('jail_tick');
    if (outcome.type === 'jail_tick') {
      expect(outcome.criminalRecord.jailYearsRemaining).toBe(1);
      expect(outcome.yearsRemaining).toBe(1);
      expect(outcome.message).toContain('Serving time');
    }
  });

  it('returns death when health is zero', () => {
    const character = baseCharacter({
      stats: {
        health: 0, happiness: 50, intelligence: 50, wealth: 50,
        fitness: 50, looks: 50, social: 50, ambition: 50, mentalHealth: 50,
      },
    });
    const outcome = runAgeUp(character, { forceDeath: false });
    expect(outcome.type).toBe('death');
    if (outcome.type === 'death') {
      expect(outcome.patch.isAlive).toBe(false);
      expect(outcome.patch.age).toBe(31);
    }
  });

  it('returns complete or pending_decision for healthy character', () => {
    const outcome = runAgeUp(baseCharacter());
    expect(['complete', 'pending_decision']).toContain(outcome.type);
    if (outcome.type === 'complete' || outcome.type === 'pending_decision') {
      expect(outcome.patch.age).toBe(31);
    }
  });

  it('does not double-count salary on age-up', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const character = baseCharacter({
      age: 29,
      bankBalance: 200_000,
      countryCode: 'US',
      career: {
        title: 'Engineer',
        company: 'Tech Co',
        salary: 50_000,
        yearsEmployed: 2,
        performance: 70,
      },
    });
    const economyOnly = tickAnnualEconomy(
      30,
      200_000,
      0,
      50_000,
      [],
      'US',
    );
    const outcome = runAgeUp(character);
    randomSpy.mockRestore();
    expect(['complete', 'pending_decision']).toContain(outcome.type);
    if (outcome.type !== 'complete' && outcome.type !== 'pending_decision') return;

    const bankAfter = outcome.patch.bankBalance ?? 0;
    // Double-credit would add another full net salary on top of the economy-only result
    expect(bankAfter).toBeLessThan(economyOnly.bankBalance + economyOnly.salaryNet);
    expect(bankAfter).toBeGreaterThanOrEqual(0);

    const salaryRecords = outcome.newEventRecords.filter(r => r.id === 'annual_salary');
    expect(salaryRecords).toHaveLength(1);
  });

  it('includes living expense ledger for adults', () => {
    const character = baseCharacter({ age: 29, bankBalance: 50_000 });
    const outcome = runAgeUp(character);
    if (outcome.type !== 'complete' && outcome.type !== 'pending_decision') return;
    const expenseRecord = outcome.newEventRecords.find(r => r.id === 'annual_expenses');
    expect(expenseRecord).toBeDefined();
    expect(expenseRecord?.category).toBe('financial');
  });

  it('skips living expenses for young children', () => {
    const character = baseCharacter({ age: 5, bankBalance: 50_000 });
    const outcome = runAgeUp(character);
    if (outcome.type !== 'complete' && outcome.type !== 'pending_decision') return;
    const expenseRecord = outcome.newEventRecords.find(r => r.id === 'annual_expenses');
    expect(expenseRecord).toBeUndefined();
  });

  it('advances education at age 5 with milestone record', () => {
    const character = baseCharacter({
      age: 4,
      educationLevel: 'none',
      educationStage: 'none',
    });
    const outcome = runAgeUp(character);
    if (outcome.type !== 'complete' && outcome.type !== 'pending_decision') return;
    expect(outcome.patch.educationStage).toBe('primary');
    expect(outcome.patch.educationLevel).toBe('elementary');
    const milestone = outcome.newEventRecords.find(r => r.id === 'edu_milestone_primary');
    expect(milestone).toBeDefined();
  });

  it('applies focus phase patch after age-up for teens', () => {
    const character = baseCharacter({
      age: 24,
      lifePhase: 'acting',
      focusConfirmedForAge: 24,
      focusAllocation: { career: 2, education: 1 },
      focusPointsSpent: { career: 5 },
    });
    const outcome = runAgeUp(character);
    if (outcome.type !== 'complete' && outcome.type !== 'pending_decision') return;
    expect(outcome.patch.lifePhase).toBe('review');
    expect(outcome.patch.focusConfirmedForAge).toBe(-1);
    expect(outcome.patch.focusPointsSpent?.career).toBe(7);
    expect(outcome.patch.focusDomainsUsed).toContain('career');
  });
});

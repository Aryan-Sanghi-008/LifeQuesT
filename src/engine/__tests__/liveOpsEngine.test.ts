import { createTestCharacter } from '../../test/fixtures/character';
import { getCurrentSeason, applyLiveOpsModifiers, evaluateSeasonalChallenge } from '../liveOpsEngine';

describe('liveOpsEngine', () => {
  it('retrieves the active season config', () => {
    const season = getCurrentSeason();
    expect(season.id).toBe('season_1_inflation');
    expect(season.activeModifiers.expenseMultiplier).toBe(1.10);
  });

  it('correctly applies live ops expense and maintenance multipliers', () => {
    const char = createTestCharacter({ bankBalance: 100000 });
    const baseExpenses = 1000;
    const baseMaintenance = 500;
    const result = applyLiveOpsModifiers(char, baseExpenses, baseMaintenance);

    expect(result.expenses).toBe(1100); // 1000 * 1.10
    expect(result.maintenance).toBe(575); // 500 * 1.15
  });

  it('evaluates active seasonal challenges correctly', () => {
    const freshChar = createTestCharacter({ age: 30, bankBalance: 100000 });
    const freshEval = evaluateSeasonalChallenge(freshChar);
    expect(freshEval.success).toBe(false);

    // Meets criteria: age >= 90 and netWorth >= 2,000,000
    const legendaryChar = createTestCharacter({ age: 95, bankBalance: 2500000 });
    const legendEval = evaluateSeasonalChallenge(legendaryChar);
    expect(legendEval.success).toBe(true);
    expect(legendEval.rewardXp).toBe(150);
  });
});

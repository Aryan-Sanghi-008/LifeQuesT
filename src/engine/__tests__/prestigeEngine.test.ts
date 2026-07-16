import { processCharacterDeath, calculatePrestigeLevel } from '../prestigeEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import { GlobalPrestigeState } from '../../types';
import { getChallengeWealthTarget } from '../../data/countryEconomy';

describe('prestigeEngine', () => {
  const defaultState: GlobalPrestigeState = {
    prestigePoints: 0,
    prestigeLevel: 1,
    totalLivesLived: 0,
    completedChallengeIds: [],
    unlockedTraitIds: [],
    unlockedScenarioIds: ['classic'],
    unlockedDynastyPerkIds: [],
    dynastyStatBonusTier: 0,
  };

  it('calculates prestige level correctly', () => {
    expect(calculatePrestigeLevel(500)).toBe(1);
    expect(calculatePrestigeLevel(1200)).toBe(2);
    expect(calculatePrestigeLevel(2500)).toBe(3);
  });

  it('awards base points on character death', () => {
    const char = createTestCharacter({
      age: 80,
      bankBalance: 200000,
    });

    const res = processCharacterDeath(char, defaultState);

    expect(res.pointsAwarded).toBe(40 + 4); // age/2 = 40, bank/50k = 4
    expect(res.nextState.totalLivesLived).toBe(1);
    expect(res.nextState.prestigePoints).toBe(44);
    expect(res.levelUp).toBe(false);
  });

  it('evaluates active challenge and levels up if points exceed threshold', () => {
    const target = getChallengeWealthTarget('IN');
    const char = createTestCharacter({
      activeChallengeId: 'speedrun_millionaire',
      age: 28,
      countryCode: 'IN',
      bankBalance: target + 10_000,
    });

    const res = processCharacterDeath(char, defaultState);

    expect(res.challengeCompleted).toBe(true);
    expect(res.pointsAwarded).toBeGreaterThanOrEqual(514);

    // Let's test level up with high points
    const highState = { ...defaultState, prestigePoints: 800 };
    const res2 = processCharacterDeath(char, highState);
    expect(res2.levelUp).toBe(true);
    expect(res2.nextState.prestigeLevel).toBe(2);
  });
});

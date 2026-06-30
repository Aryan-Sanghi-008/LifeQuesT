import { evaluateAchievements } from '@engine/achievementEngine';
import { FOCUS_DOMAINS } from '@data/focusDomains';
import { createTestCharacter } from '../../test/fixtures/character';

describe('achievementEngine', () => {
  it('awards legacy stat achievements', () => {
    const character = createTestCharacter({
      stats: { ...createTestCharacter().stats, wealth: 95 },
    });
    const earned = evaluateAchievements(character);
    expect(earned.has('millionaire')).toBe(true);
  });

  it('awards focused life when all domains used', () => {
    const character = createTestCharacter({
      focusDomainsUsed: FOCUS_DOMAINS.map(d => d.id),
    });
    const earned = evaluateAchievements(character);
    expect(earned.has('focused_life')).toBe(true);
  });

  it('awards chain completion milestones', () => {
    const character = createTestCharacter({
      completedMemoryChains: ['betrayal_arc', 'startup_dream', 'redemption_path'],
    });
    const earned = evaluateAchievements(character);
    expect(earned.has('chain_complete_1')).toBe(true);
    expect(earned.has('chain_complete_3')).toBe(true);
    expect(earned.has('chain_betrayal')).toBe(true);
  });

  it('awards aspiration achievements when set', () => {
    const character = createTestCharacter({
      aspirations: { primary: 'fortune', secondary: 'knowledge' },
    });
    const earned = evaluateAchievements(character);
    expect(earned.has('aspiration_set')).toBe(true);
    expect(earned.has('aspiration_fortune')).toBe(true);
  });
});

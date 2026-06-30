import { calculateDynastyScore, distributeInheritance, continueAsHeir } from '../legacyEngine';
import { WillDetails } from '../../types';
import { createTestCharacter } from '../../test/fixtures/character';

describe('legacyEngine', () => {
  it('calculates dynasty score correctly', () => {
    const char = createTestCharacter({
      generation: 2,
      bankBalance: 250000,
      achievements: ['millionaire', 'genius'],
    });
    // gen * 1000 + bankBalance/1000 + achievements * 50
    // 2 * 1000 + 250 + 2 * 50 = 2350
    const score = calculateDynastyScore(char);
    expect(score).toBe(2350);
  });

  it('distributes inheritance for equal split', () => {
    const spouse = { id: 's1', name: 'Spouse', age: 30, gender: 'female' as const, relationType: 'spouse' as const, isAlive: true, relationshipScore: 80, avatarSeed: 'sp' };
    const child1 = { id: 'c1', name: 'Child 1', age: 5, gender: 'female' as const, relationType: 'child' as const, isAlive: true, relationshipScore: 85, avatarSeed: 'c1' };
    const child2 = { id: 'c2', name: 'Child 2', age: 2, gender: 'male' as const, relationType: 'child' as const, isAlive: true, relationshipScore: 85, avatarSeed: 'c2' };

    const char = createTestCharacter({
      bankBalance: 90000,
      people: [spouse, child1, child2],
    });

    const will: WillDetails = { type: 'equal' };
    const dist = distributeInheritance(char, will);

    // heirs = spouse + 2 children = 3 heirs. 90000 / 3 = 30000 each.
    expect(dist.spouseShare).toBe(30000);
    expect(dist.childrenShares['c1']).toBe(30000);
    expect(dist.childrenShares['c2']).toBe(30000);
  });

  it('distributes inheritance for charity', () => {
    const char = createTestCharacter({ bankBalance: 50000 });
    const will: WillDetails = { type: 'charity' };
    const dist = distributeInheritance(char, will);
    expect(dist.charityShare).toBe(50000);
  });

  it('continues play as chosen heir', () => {
    const child = {
      id: 'heir_child',
      name: 'Bob Jr',
      age: 20,
      gender: 'male',
      relationType: 'child' as const,
      isAlive: true,
      relationshipScore: 85,
      avatarSeed: 'heir',
      occupation: 'Student',
    };

    const char = createTestCharacter({
      bankBalance: 100000,
      generation: 1,
      dynastyScore: 100,
      people: [child],
      will: { type: 'heir', targetHeirId: 'heir_child' },
    });

    const nextChar = continueAsHeir(char, 'heir_child');

    expect(nextChar.name).toBe('Bob Jr');
    expect(nextChar.age).toBe(20);
    expect(nextChar.generation).toBe(2);
    // dynastyScore should accumulate parent dynastyScore + parent current score
    // parent current score = 1*1000 + 100/1000 + 0 = 1100
    // nextChar dynastyScore = 100 + 1100 = 1200
    expect(nextChar.dynastyScore).toBe(1200);
    expect(nextChar.bankBalance).toBe(100000);
    expect(nextChar.familyLineage).toHaveLength(1);
    expect(nextChar.familyLineage![0].name).toBe(char.name);
  });
});

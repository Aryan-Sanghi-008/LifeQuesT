import { evaluateChallenge } from '../challengeEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import { getChallengeWealthTarget } from '../../data/countryEconomy';

describe('challengeEngine', () => {
  it('evaluates rags_to_riches correctly', () => {
    const target = getChallengeWealthTarget('US');
    const poorChar = createTestCharacter({
      activeChallengeId: 'rags_to_riches',
      familyBackground: 'poor',
      countryCode: 'US',
      bankBalance: target + 50_000,
      age: 45,
    });
    const res = evaluateChallenge(poorChar);
    expect(res.success).toBe(true);
    expect(res.points).toBe(500);

    const wealthyChar = createTestCharacter({
      activeChallengeId: 'rags_to_riches',
      familyBackground: 'wealthy',
      bankBalance: 1500000,
      age: 45,
    });
    const res2 = evaluateChallenge(wealthyChar);
    expect(res2.success).toBe(false);
  });

  it('evaluates zero_crime_saint correctly', () => {
    const saintChar = createTestCharacter({
      activeChallengeId: 'zero_crime_saint',
      age: 82,
      karma: 95,
      criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
    });
    const res = evaluateChallenge(saintChar);
    expect(res.success).toBe(true);

    const criminalChar = createTestCharacter({
      activeChallengeId: 'zero_crime_saint',
      age: 82,
      karma: 95,
      criminalRecord: { crimes: ['theft'], jailYearsRemaining: 0, onProbation: false },
    });
    const res2 = evaluateChallenge(criminalChar);
    expect(res2.success).toBe(false);
  });

  it('evaluates no_relationships correctly', () => {
    const loneWolf = createTestCharacter({
      activeChallengeId: 'no_relationships',
      age: 55,
      people: [
        { id: '1', name: 'Father', age: 70, gender: 'male', relationType: 'father', isAlive: true, relationshipScore: 80, avatarSeed: 'f' },
      ],
    });
    const res = evaluateChallenge(loneWolf);
    expect(res.success).toBe(true);

    const socialWolf = createTestCharacter({
      activeChallengeId: 'no_relationships',
      age: 55,
      people: [
        { id: '1', name: 'Friend', age: 25, gender: 'female', relationType: 'friend', isAlive: true, relationshipScore: 80, avatarSeed: 'fr' },
      ],
    });
    const res2 = evaluateChallenge(socialWolf);
    expect(res2.success).toBe(false);
  });
});

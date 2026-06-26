import { advanceRelationship, processDivorce, getRelationshipStageLabel, applyRelationshipDecay } from '@engine/relationshipEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import type { Person } from '../../types';

const partner: Person = {
  id: 'p1', name: 'Sam', age: 25, gender: 'female', relationType: 'partner',
  relationshipScore: 60, avatarSeed: 'sam', isAlive: true, relationshipStage: 'dating',
};

describe('relationshipEngine', () => {
  it('advances dating to married', () => {
    const engaged = advanceRelationship(partner, 'propose');
    expect(engaged.relationshipStage).toBe('engaged');
    const married = advanceRelationship(engaged, 'marry');
    expect(married.relationshipStage).toBe('married');
    expect(married.relationType).toBe('spouse');
  });

  it('labels stages', () => {
    expect(getRelationshipStageLabel('married')).toBe('Married');
  });

  it('processes divorce', () => {
    const spouse = { ...partner, relationType: 'spouse' as const, relationshipStage: 'married' as const };
    const char = createTestCharacter({
      age: 30,
      job: 'Engineer',
      relationships: 1,
      educationLevel: 'graduate',
      people: [spouse],
    });
    const result = processDivorce(char, spouse.id);
    expect(result.people[0].relationshipStage).toBe('divorced');
    expect(result.stats.happiness).toBeLessThan(70);
  });

  it('applyRelationshipDecay creates record when crossing threshold', () => {
    const friend: Person = {
      id: 'f1', name: 'Alex', age: 20, gender: 'male', relationType: 'friend',
      relationshipScore: 40.5, avatarSeed: 'a', isAlive: true,
    };
    const result = applyRelationshipDecay([friend], 25);
    expect(result.people[0].relationshipScore).toBeLessThan(40);
    expect(result.records.some(r => r.id.includes('rel_decay'))).toBe(true);
  });
});

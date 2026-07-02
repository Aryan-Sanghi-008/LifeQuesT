import { applyAbsenceCatchUp } from '@engine/absenceCatchUpEngine';
import { createTestCharacter } from '../../test/fixtures/character';

function baseCharacter(age = 30) {
  return createTestCharacter({ age, bankBalance: 50000, people: [] });
}

describe('applyAbsenceCatchUp', () => {
  it('returns unchanged character for 0 years', () => {
    const char = baseCharacter();
    const result = applyAbsenceCatchUp(char, 0);
    expect(result.character.age).toBe(30);
    expect(result.summaryLines).toHaveLength(0);
  });

  it('advances age by the given years', () => {
    const char = baseCharacter(30);
    const result = applyAbsenceCatchUp(char, 2);
    expect(result.character.age).toBe(32);
    expect(result.summaryLines).toHaveLength(2);
  });

  it('caps advancement at 3 years regardless of input', () => {
    const char = baseCharacter(25);
    const result = applyAbsenceCatchUp(char, 10);
    expect(result.character.age).toBe(28);
    expect(result.summaryLines).toHaveLength(3);
  });

  it('appends a life event record per year', () => {
    const char = baseCharacter(40);
    const result = applyAbsenceCatchUp(char, 2);
    const absenceRecords = (result.character.eventHistory ?? []).filter(
      (r) => r.id.startsWith('absence_catchup'),
    );
    expect(absenceRecords).toHaveLength(2);
    expect(absenceRecords[0].title).toBe('Life Went On');
  });

  it('ages NPCs each year', () => {
    const char = createTestCharacter({
      age: 30,
      people: [{ id: 'p1', name: 'Parent', age: 60, isAlive: true, relationType: 'mother' } as any],
    });
    const result = applyAbsenceCatchUp(char, 1);
    const aged = result.character.people.find((p) => p.id === 'p1');
    expect(aged?.age).toBe(61);
  });
});

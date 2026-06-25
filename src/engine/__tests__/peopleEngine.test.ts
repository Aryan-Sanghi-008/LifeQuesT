import { spawnClassmates, ensureClassmates, agePeople, getClassmates } from '@engine/peopleEngine';
import type { Person } from '../../types';

describe('peopleEngine', () => {
  it('spawnClassmates creates classmates with relationType classmate', () => {
    const classmates = spawnClassmates('Alex', 3);
    expect(classmates).toHaveLength(3);
    expect(classmates.every(c => c.relationType === 'classmate')).toBe(true);
  });

  it('ensureClassmates adds classmates when none exist', () => {
    const people: Person[] = [];
    const updated = ensureClassmates(people, 'Jordan');
    expect(updated.some(p => p.relationType === 'classmate')).toBe(true);
    expect(updated.length).toBeGreaterThan(people.length);
  });

  it('ensureClassmates is idempotent when classmates exist', () => {
    const existing = spawnClassmates('Sam', 2);
    const updated = ensureClassmates(existing, 'Sam');
    expect(updated).toBe(existing);
  });

  it('getClassmates filters alive classmates', () => {
    const people: Person[] = [
      { id: '1', name: 'A', age: 10, gender: 'male', relationType: 'classmate', relationshipScore: 50, avatarSeed: 'a', isAlive: true },
      { id: '2', name: 'B', age: 10, gender: 'female', relationType: 'classmate', relationshipScore: 50, avatarSeed: 'b', isAlive: false },
      { id: '3', name: 'C', age: 40, gender: 'male', relationType: 'father', relationshipScore: 80, avatarSeed: 'c', isAlive: true },
    ];
    expect(getClassmates(people)).toHaveLength(1);
  });

  it('agePeople increments age for living non-pets', () => {
    const people: Person[] = [
      { id: '1', name: 'Kid', age: 5, gender: 'male', relationType: 'child', relationshipScore: 80, avatarSeed: 'k', isAlive: true },
      { id: '2', name: 'Dog', age: 2, gender: 'male', relationType: 'pet', relationshipScore: 90, avatarSeed: 'd', isAlive: true },
    ];
    const aged = agePeople(people);
    expect(aged[0].age).toBe(6);
    expect(aged[1].age).toBe(2);
  });
});

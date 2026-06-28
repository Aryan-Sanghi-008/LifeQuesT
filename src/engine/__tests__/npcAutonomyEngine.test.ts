import { tickNpcAutonomy } from '../npcAutonomyEngine';
import { Person } from '../../types';

describe('npcAutonomyEngine', () => {
  it('handles parent natural death and inheritance', () => {
    // Parent over 75 years old
    const father: Person = {
      id: 'f1',
      name: 'Father John',
      age: 80,
      gender: 'male',
      relationType: 'father',
      relationshipScore: 80,
      avatarSeed: 'dad',
      isAlive: true,
    };

    // Force death roll to always fail (meaning parent dies)
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const res = tickNpcAutonomy([father], 30, 50, 'wealthy');

    expect(res.people[0].isAlive).toBe(false);
    expect(res.logs[0]).toContain('passed away of old age');
    // Inheritance should be added
    expect(res.bankDelta).toBeGreaterThanOrEqual(100000);
    expect(res.logs[1]).toContain('Inheritance');

    mockRandom.mockRestore();
  });

  it('triggers child/sibling graduation milestone', () => {
    const child: Person = {
      id: 'c1',
      name: 'Lisa',
      age: 17, // will age to 18
      gender: 'female',
      relationType: 'child',
      relationshipScore: 90,
      avatarSeed: 'lisa',
      isAlive: true,
    };

    // Age the child to 18 first
    const agedChild = { ...child, age: 18 };

    const res = tickNpcAutonomy([agedChild], 40, 50, 'middle');
    expect(res.logs[0]).toContain('graduated from high school');
  });

  it('triggers child/sibling career start', () => {
    const sibling: Person = {
      id: 's1',
      name: 'Sam',
      age: 20,
      gender: 'male',
      relationType: 'sibling',
      relationshipScore: 70,
      avatarSeed: 'sam',
      isAlive: true,
    };

    // Force job trigger
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.05);

    const res = tickNpcAutonomy([sibling], 25, 40, 'middle');
    expect(res.people[0].occupation).toBeDefined();
    expect(res.logs[0]).toContain('started a career as a');

    mockRandom.mockRestore();
  });
});

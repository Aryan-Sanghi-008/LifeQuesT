import { spawnScenarioNPCsForCreation, ensureScenarioAgeNPCs } from '../scenarioNpcEngine';
import { generateParents } from '@utils/npcGenerator';
import { createTestCharacter } from '../../test/fixtures/character';

describe('scenarioNpcEngine', () => {
  it('spawns creation NPCs with archetype occupation for royal', () => {
    const character = createTestCharacter({ scenarioId: 'royal', name: 'Aria' });
    const npcs = spawnScenarioNPCsForCreation(character);
    expect(npcs.length).toBeGreaterThanOrEqual(1);
    expect(npcs[0].occupation).toBe('Courtier');
    expect(npcs[0].archetypeId).toBe('royal_courtier');
  });

  it('returns no NPCs for classic scenario', () => {
    const character = createTestCharacter({ scenarioId: 'classic' });
    expect(spawnScenarioNPCsForCreation(character)).toEqual([]);
  });

  it('spawns age-gated NPC when age threshold reached', () => {
    const character = createTestCharacter({ scenarioId: 'royal', age: 12, name: 'Aria' });
    const people = ensureScenarioAgeNPCs([], character, 12);
    expect(people.some((p) => p.archetypeId === 'royal_guard')).toBe(true);
    expect(people.find((p) => p.archetypeId === 'royal_guard')?.occupation).toBe('Royal Guard');
  });

  it('does not duplicate age-gated NPCs', () => {
    const character = createTestCharacter({ scenarioId: 'royal', age: 14, name: 'Aria' });
    const first = ensureScenarioAgeNPCs([], character, 14);
    const second = ensureScenarioAgeNPCs(first, character, 15);
    const guards = second.filter((p) => p.archetypeId === 'royal_guard');
    expect(guards).toHaveLength(1);
  });
});

describe('generateParents scenario occupations', () => {
  it('uses royal parent occupation pool', () => {
    const parents = generateParents('Test', 'US', 'middle', 'royal');
    const occupations = parents.map((p) => p.occupation);
    expect(occupations.every((o) => ['Courtier', 'Lady-in-Waiting', 'Chamberlain', 'Royal Steward'].includes(o!))).toBe(true);
  });

  it('uses zombie parent occupation pool', () => {
    const parents = generateParents('Test', 'US', 'middle', 'zombie');
    const occupations = parents.map((p) => p.occupation);
    expect(occupations.every((o) => ['Survivor', 'Camp Medic', 'Scavenger', 'Lookout'].includes(o!))).toBe(true);
  });
});

import { Character, Person, ScenarioId } from '../types';
import { generateName } from '@utils/npcGenerator';
import { generateRandomDNA, generateRandomPersonality } from '@utils/genetics';
import { enrichPersonProfile } from './peopleEngine';
import { NPCArchetype, SCENARIO_NPC_ARCHETYPES } from '../data/scenarioNPCs';
import { makeId } from './ids';

function archetypesForScenario(scenarioId: ScenarioId): NPCArchetype[] {
  return SCENARIO_NPC_ARCHETYPES.filter((a) => a.scenarioIds.includes(scenarioId));
}

function spawnFromArchetype(
  archetype: NPCArchetype,
  character: Pick<Character, 'name' | 'age' | 'countryCode'>,
  index: number,
): Person {
  const seed = `${character.name}_${archetype.id}_${index}`;
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const name = generateName(gender as 'male' | 'female', character.countryCode ?? 'US', seed, index);
  const npcAge = archetype.spawn === 'creation'
    ? Math.max(18, (character.age ?? 0) + 5 + index * 3)
    : (archetype.spawnAge ?? 18) + index;

  return enrichPersonProfile({
    id: makeId(),
    name,
    age: npcAge,
    gender,
    relationType: archetype.relationType,
    relationshipScore: archetype.id.includes('rival') || archetype.id.includes('paparazzi')
      ? 15
      : 40 + Math.floor(Math.random() * 35),
    avatarSeed: name,
    isAlive: true,
    occupation: archetype.occupation,
    goals: archetype.goals,
    archetypeId: archetype.id,
    dna: generateRandomDNA(),
    personality: generateRandomPersonality(),
  });
}

export function spawnScenarioNPCsForCreation(character: Character): Person[] {
  const scenarioId = character.scenarioId ?? 'classic';
  if (scenarioId === 'classic') return [];

  const spawned: Person[] = [];
  for (const archetype of archetypesForScenario(scenarioId)) {
    if (archetype.spawn !== 'creation') continue;
    const count = archetype.count ?? 1;
    for (let i = 0; i < count; i++) {
      spawned.push(spawnFromArchetype(archetype, character, i));
    }
  }
  return spawned;
}

export function ensureScenarioAgeNPCs(
  people: Person[],
  character: Character,
  newAge: number,
): Person[] {
  const scenarioId = character.scenarioId ?? 'classic';
  if (scenarioId === 'classic') return people;

  const existing = new Set(people.map((p) => p.archetypeId).filter(Boolean));
  const toAdd: Person[] = [];

  for (const archetype of archetypesForScenario(scenarioId)) {
    if (archetype.spawn !== 'age') continue;
    if ((archetype.spawnAge ?? 0) > newAge) continue;
    if (existing.has(archetype.id)) continue;

    const count = archetype.count ?? 1;
    for (let i = 0; i < count; i++) {
      toAdd.push(spawnFromArchetype(archetype, { ...character, age: newAge }, i));
    }
    existing.add(archetype.id);
  }

  return toAdd.length ? [...people, ...toAdd] : people;
}

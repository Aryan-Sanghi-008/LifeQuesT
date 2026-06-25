import { Character, Person, RelationshipStage } from '../types';
import { clamp } from './economyEngine';

const STAGE_ORDER: RelationshipStage[] = [
  'single', 'dating', 'engaged', 'married', 'separated', 'divorced',
];

export function advanceRelationship(
  person: Person,
  action: 'date' | 'propose' | 'marry' | 'separate',
): Person {
  const current = person.relationshipStage ?? 'single';
  let next: RelationshipStage = current;

  if (action === 'date' && current === 'single') next = 'dating';
  if (action === 'propose' && current === 'dating') next = 'engaged';
  if (action === 'marry' && (current === 'engaged' || current === 'dating')) next = 'married';
  if (action === 'separate' && current === 'married') next = 'separated';

  const relationType = next === 'married' ? 'spouse' as const
    : next === 'divorced' || next === 'separated' ? 'partner' as const
      : person.relationType;

  return {
    ...person,
    relationshipStage: next,
    relationType,
    relationshipScore: clamp(person.relationshipScore + (action === 'marry' ? 20 : 10)),
  };
}

export function processDivorce(character: Character, spouseId: string): Character {
  const people = character.people.map(p => {
    if (p.id !== spouseId) return p;
    return {
      ...p,
      relationType: 'partner' as const,
      relationshipStage: 'divorced' as RelationshipStage,
      relationshipScore: clamp(p.relationshipScore - 30),
    };
  });

  return {
    ...character,
    people,
    stats: {
      ...character.stats,
      happiness: clamp(character.stats.happiness - 15),
      mentalHealth: clamp(character.stats.mentalHealth - 12),
    },
  };
}

export function getRelationshipStageLabel(stage?: RelationshipStage): string {
  if (!stage || stage === 'single') return 'Single';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function stageIndex(stage?: RelationshipStage): number {
  return STAGE_ORDER.indexOf(stage ?? 'single');
}

import { Character, LifeEventRecord, Person, RelationType, RelationshipStage } from '../types';
import { clamp } from './economyEngine';
import { getRelationshipStageLabel as formatRelationshipStage } from '../utils/relationshipLabels';

const FAMILY_TYPES: RelationType[] = ['mother', 'father', 'child'];
const DECAY_THRESHOLDS = [40, 25] as const;

function isDecayEligible(person: Person): boolean {
  return (
    person.isAlive &&
    !FAMILY_TYPES.includes(person.relationType) &&
    person.relationshipScore > 10
  );
}

function decayRateFor(relationType: RelationType): number {
  if (relationType === 'spouse') return 0.2;
  if (relationType === 'friend') return 1;
  return 2;
}

export interface RelationshipDecayResult {
  people: Person[];
  records: LifeEventRecord[];
}

export function applyRelationshipDecay(people: Person[], age: number): RelationshipDecayResult {
  const records: LifeEventRecord[] = [];

  const updated = people.map(person => {
    if (!isDecayEligible(person)) return person;

    const prevScore = person.relationshipScore;
    const decayRate = decayRateFor(person.relationType);
    const nextScore = Math.max(0, prevScore - decayRate);

    for (const threshold of DECAY_THRESHOLDS) {
      if (prevScore >= threshold && nextScore < threshold) {
        records.push({
          id: `rel_decay_${person.id}_${threshold}`,
          age,
          title: threshold === 40 ? `Growing distant from ${person.name}` : `Falling out with ${person.name}`,
          description:
            threshold === 40
              ? `You haven't spent much time with ${person.name}. The connection is fading.`
              : `Your relationship with ${person.name} is in trouble. Reach out before it's too late.`,
          statEffect: { happiness: -2 },
          category: 'relationship',
          color: '#EC4899',
          timestamp: Date.now(),
        });
        break;
      }
    }

    return { ...person, relationshipScore: nextScore };
  });

  return { people: updated, records };
}

export function isRelationshipDrifting(person: Person): boolean {
  return isDecayEligible(person) && person.relationshipScore < 40;
}

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
  return formatRelationshipStage(stage);
}

export function stageIndex(stage?: RelationshipStage): number {
  return STAGE_ORDER.indexOf(stage ?? 'single');
}

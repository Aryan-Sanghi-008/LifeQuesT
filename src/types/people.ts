import type { CharacterDNA, BigFivePersonality } from './genetics';
import type { PlayerMemoryNote } from './focus';
// ─── NPC / People ─────────────────────────────────────────────────────────────

export type RelationType =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'friend'
  | 'partner'
  | 'spouse'
  | 'child'
  | 'classmate'
  | 'teacher'
  | 'coworker'
  | 'pet';

export interface Person {
  id: string;
  name: string;
  age: number;
  gender: string;
  relationType: RelationType;
  relationshipScore: number; // 0-100
  relationshipStage?: RelationshipStage;
  avatarSeed: string;
  isAlive: boolean;
  occupation?: string;
  /** interactionId → last character age this interaction was performed (cooldown gate) */
  interactionCooldowns?: Record<string, number>;
  /** Last character age any interaction was performed (one action per person per year) */
  lastInteractionAge?: number;
  dna?: CharacterDNA;
  personality?: BigFivePersonality;
  goals?: string[];
  mood?: string;
  memoriesOfPlayer?: PlayerMemoryNote[];
  secrets?: string[];
  discoveredSecrets?: string[];
  petStats?: PetStats;
  subject?: string;
  favorScore?: number;
  archetypeId?: string;
}

export type RelationshipStage =
  | 'single'
  | 'dating'
  | 'engaged'
  | 'married'
  | 'separated'
  | 'divorced';

export interface PetStats {
  happiness: number;
  health: number;
  training: number;
  speciesId: string;
}

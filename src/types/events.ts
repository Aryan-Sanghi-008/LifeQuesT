import type { StatEffect, EducationLevel, StatKey } from './stats';
import type { Person } from './people';
import type { FocusDomain } from './focus';
import type { ScenarioId } from './scenario';
// ─── Life Events ─────────────────────────────────────────────────────────────

export type EventCategory =
  | 'education'
  | 'career'
  | 'relationship'
  | 'health'
  | 'financial'
  | 'family'
  | 'random'
  | 'milestone'
  | 'crime'
  | 'travel'
  | 'activity';

export interface EventChoice {
  id: string;
  text: string;
  subtext: string;
  statEffect: StatEffect;
  bankEffect?: number;
  successChance?: number; // 0-100; undefined = guaranteed
  successText?: string;
  failText?: string;
  updatesJob?: string;
  updatesEducation?: EducationLevel;
  addsPerson?: Partial<Person>;
  incrementsRelationships?: boolean;
  incrementsChildren?: boolean;
  grantsMemoryTags?: string[];
  npcReaction?: { relationType: string; sentiment: 'positive' | 'negative' | 'overjoyed' | 'relieved' | 'grateful' | 'proud' | 'moved' | 'shocked' | 'hurt' | 'sad' | 'uncertain' | 'frustrated' | 'disappointed' | 'betrayed' | 'accepting' };
}

export type EventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface LifeEvent {
  id: string;
  minAge: number;
  maxAge: number;
  title: string;
  description: string;
  statEffect: StatEffect;
  bankEffect?: number;
  category: EventCategory;
  color: string;
  rarity?: EventRarity;
  choices?: EventChoice[];
  requiresTrait?: string;
  requiresStat?: Partial<Record<StatKey, number>>;
  requiresEducation?: EducationLevel;
  requiresJob?: boolean; // true = must have a job
  requiresCountry?: string[];
  requiresKarmaMin?: number;
  requiresMentalHealthBelow?: number;
  oneTime?: boolean;
  weight?: number;
  updatesJob?: string;
  updatesEducation?: EducationLevel;
  addsPerson?: Partial<Person>;
  incrementsRelationships?: boolean;
  incrementsChildren?: boolean;
  requiredMemoryTags?: string[];
  excludedMemoryTags?: string[];
  chainId?: string;
  chainStep?: number;
  focusDomain?: FocusDomain;
  grantsMemoryTags?: string[];
  choiceMemoryTags?: Record<string, string[]>;
  timerSeconds?: number;
  defaultChoiceId?: string;
  requiresScenario?: ScenarioId[];
  requiresFollowers?: number;
}

export interface LifeEventRecord {
  id: string;
  age: number;
  title: string;
  description: string;
  statEffect: StatEffect;
  choiceMade?: string;
  category: EventCategory;
  color: string;
  rarity?: EventRarity;
  timestamp: number;
}

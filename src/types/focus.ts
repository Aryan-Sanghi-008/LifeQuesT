import type { CharacterStats } from './stats';
// ─── Phase A: Focus, Memory, Aspirations ─────────────────────────────────────

export type FocusDomain =
  | 'career'
  | 'education'
  | 'health'
  | 'social'
  | 'finance'
  | 'hobby'
  | 'crime'
  | 'family';

export type FocusAllocation = Partial<Record<FocusDomain, number>>;

export type AspirationId =
  | 'career_peak'
  | 'family_dynasty'
  | 'fortune'
  | 'fame'
  | 'redemption'
  | 'knowledge'
  | 'adventure'
  | 'criminal_empire'
  | 'creative_legacy'
  | 'spiritual'
  | 'political_power'
  | 'quiet_life';

export interface CharacterAspirations {
  primary: AspirationId;
  secondary: AspirationId;
}

export type LifePhase = 'planning' | 'acting' | 'review';

export interface MemoryTag {
  id: string;
  category: string;
  age: number;
  intensity: 1 | 2 | 3;
  expiresAtAge?: number;
  npcId?: string;
}

export interface PlayerMemoryNote {
  age: number;
  text: string;
}

export interface YearReviewSnapshot {
  age: number;
  newMemoryTagIds: string[];
  focusAllocation?: FocusAllocation;
  statDeltas?: Partial<CharacterStats>;
}


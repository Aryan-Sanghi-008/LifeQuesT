import type { CharacterStats } from './stats';
export interface HobbyProgress {
  xp: number;
  level: number;
  lastPracticedAge?: number;
  lastCompetedAge?: number;
  unlockedTags?: string[];
}

export type HobbyCategory =
  | 'sports'
  | 'arts'
  | 'games'
  | 'outdoors'
  | 'collecting'
  | 'cooking'
  | 'writing'
  | 'crafts'
  | 'music'
  | 'other';

export interface HobbyUnlock {
  level: number;
  tag: string;
  label: string;
  description: string;
}

export interface HobbyDef {
  id: string;
  label: string;
  category: HobbyCategory;
  description: string;
  xpPerSession: number;
  minAge: number;
  maxLevel: number;
  statEffect: Partial<CharacterStats>;
  /** Annual cash / salary-style perk while leveled */
  financePerkUsd?: number;
  careerPerk?: string;
  unlocks?: HobbyUnlock[];
}

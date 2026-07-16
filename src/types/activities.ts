import type { StatEffect } from './stats';
import type { RelationType } from './people';
// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'mind'
  | 'body'
  | 'social'
  | 'financial'
  | 'illegal'
  | 'health'
  | 'misc';

export interface Activity {
  id: string;
  label: string;
  description: string;
  category: ActivityCategory;
  minAge: number;
  maxAge: number;
  cost?: number; // bankBalance cost
  coinCost?: number;
  statEffect: StatEffect;
  bankEffect?: number; // direct bank balance change
  successChance?: number;
  failStatEffect?: StatEffect;
  addsPerson?: RelationType; // e.g. 'pet'
}

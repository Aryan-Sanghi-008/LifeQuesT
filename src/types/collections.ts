import type { EventRarity } from './events';
// ─── Collections ─────────────────────────────────────────────────────────────

export type CollectionCategory = 'achievement' | 'cosmetic' | 'scenario' | 'badge' | 'life_moment';

export interface CollectionSet {
  id: string;
  name: string;
  description: string;
  titleReward: string;
  coinReward: number;
  gemReward?: number;
  accentColor: string;
}

export interface CollectionItem {
  id: string;
  category: CollectionCategory;
  name: string;
  description: string;
  rarity?: EventRarity;
  iconKey: string;
  accentColor?: string;
  setId?: string;
  /** Machine-readable unlock rule evaluated by collectionsEngine */
  unlockKey?: string;
}

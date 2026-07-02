import type { ScenarioId } from '../types';
import { SCENARIO_CATALOG, getScenarioDef } from './scenarioCatalog';
export type { ScenarioId };
export { getScenarioDef };

export type ScenarioBannerType =
  | 'classic' | 'royal' | 'cyber' | 'crime' | 'fantasy'
  | 'rags_to_riches' | 'silver_spoon' | 'medieval' | 'zombie'
  | 'mars' | 'celebrity' | 'political';

export interface StatModifier {
  label: string;
  value: string;
  positive: boolean;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  bannerType: ScenarioBannerType;
  locked: boolean;
  accentColor: string;
  statModifiers: StatModifier[];
  ctaLabel: string;
  iconEmoji?: string;
  isPremium?: boolean;
  iapProductId?: string;
  priceLabel?: string;
}

function buildStatModifiers(id: ScenarioId): StatModifier[] {
  const def = SCENARIO_CATALOG.find((s) => s.id === id);
  if (!def) return [];
  const mods: StatModifier[] = [];
  const mult = def.wealthMultiplier;
  if (mult !== 1.0) {
    mods.push({ label: 'Starting Balance', value: mult > 1 ? `×${mult} Wealth` : `${Math.round(mult * 100)}% Wealth`, positive: mult > 1 });
  } else {
    mods.push({ label: 'Starting Balance', value: 'Standard', positive: true });
  }
  const bonuses = def.statBonuses;
  Object.entries(bonuses).forEach(([key, val]) => {
    if (val && val !== 0) {
      mods.push({ label: key.charAt(0).toUpperCase() + key.slice(1), value: val > 0 ? `+${val}` : `${val}`, positive: val > 0 });
    }
  });
  mods.push({ label: 'Difficulty', value: def.difficulty.charAt(0).toUpperCase() + def.difficulty.slice(1), positive: def.difficulty === 'easy' });
  return mods;
}

export const SCENARIOS: Scenario[] = SCENARIO_CATALOG.map((def) => ({
  id: def.id,
  name: def.name,
  tagline: def.tagline,
  description: def.description,
  bannerType: def.id as ScenarioBannerType,
  locked: def.isPremium,
  accentColor: def.accentColor,
  statModifiers: buildStatModifiers(def.id),
  ctaLabel: def.isPremium ? 'Unlock' : `Play ${def.name}`,
  iconEmoji: def.iconEmoji,
  isPremium: def.isPremium,
  iapProductId: def.iapProductId,
  priceLabel: def.priceLabel,
}));

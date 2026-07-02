import { ScenarioId } from '../types';
import { PREMIUM_SCENARIO_IDS } from './scenarioCatalog';

export const PLUS_SCENARIO_CREDITS_PER_MONTH = 2;

export function getMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

/** Deterministic pool of 4 premium scenarios for the calendar month. */
export function getMonthlyScenarioPool(monthKey = getMonthKey()): ScenarioId[] {
  let hash = 0;
  for (let i = 0; i < monthKey.length; i++) {
    hash = (hash * 31 + monthKey.charCodeAt(i)) | 0;
  }
  const pool = [...PREMIUM_SCENARIO_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) | 0;
    const j = Math.abs(hash) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 4);
}

export function getMonthlyCosmeticId(monthKey = getMonthKey()): string {
  const monthIndex = parseInt(monthKey.slice(5, 7), 10) - 1;
  const ids = ['plus_cosmetic_frame_gold', 'plus_cosmetic_frame_teal', 'plus_cosmetic_frame_orchid'];
  return ids[monthIndex % ids.length];
}

import { CharacterStats } from '../types';

export const DAILY_GAMEPLAY_COIN_CAP = 5000;
export const WEEKLY_GAMEPLAY_TICKET_CAP = 5;

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getIsoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function driftKarmaTowardNeutral(karma: number): number {
  if (karma > 50) return Math.max(50, karma - 2);
  if (karma < 50) return Math.min(50, karma + 2);
  return karma;
}

export interface GameplayCoinState {
  coins: number;
  coinsEarnedToday?: number;
  coinsEarnDate?: string;
}

export interface GameplayCoinGrantResult {
  granted: number;
  hitCap: boolean;
}

export const PREMIUM_GAMEPLAY_COIN_MULTIPLIER = 1.5;

export function applyPremiumCoinBonus(amount: number, isPremium: boolean): number {
  if (!isPremium || amount <= 0) return amount;
  return Math.floor(amount * PREMIUM_GAMEPLAY_COIN_MULTIPLIER);
}

export function getGameplayCoinsEarnedToday(
  state: GameplayCoinState,
  today = getTodayKey(),
): number {
  return state.coinsEarnDate === today ? (state.coinsEarnedToday ?? 0) : 0;
}

export function getGameplayCoinsRemainingToday(
  state: GameplayCoinState,
  today = getTodayKey(),
): number {
  return Math.max(0, DAILY_GAMEPLAY_COIN_CAP - getGameplayCoinsEarnedToday(state, today));
}

export function applyGameplayCoinGrant(
  state: GameplayCoinState,
  amount: number,
  today = getTodayKey(),
): GameplayCoinGrantResult {
  if (amount <= 0) return { granted: 0, hitCap: false };

  const earnedToday = state.coinsEarnDate === today ? (state.coinsEarnedToday ?? 0) : 0;
  const remaining = Math.max(0, DAILY_GAMEPLAY_COIN_CAP - earnedToday);
  const granted = Math.min(amount, remaining);
  state.coins += granted;
  state.coinsEarnedToday = earnedToday + granted;
  state.coinsEarnDate = today;
  return { granted, hitCap: granted < amount };
}

export interface GameplayTicketState {
  mysteryTickets?: number;
  ticketsEarnedThisWeek?: number;
  ticketsEarnWeek?: string;
}

export function applyGameplayTicketGrant(
  state: GameplayTicketState,
  amount: number,
  weekKey = getIsoWeekKey(),
): { granted: number; hitCap: boolean } {
  if (amount <= 0) return { granted: 0, hitCap: false };

  const earnedWeek = state.ticketsEarnWeek === weekKey ? (state.ticketsEarnedThisWeek ?? 0) : 0;
  const remaining = Math.max(0, WEEKLY_GAMEPLAY_TICKET_CAP - earnedWeek);
  const granted = Math.min(amount, remaining);
  state.mysteryTickets = (state.mysteryTickets ?? 0) + granted;
  state.ticketsEarnedThisWeek = earnedWeek + granted;
  state.ticketsEarnWeek = weekKey;
  return { granted, hitCap: granted < amount };
}

/** Apply dynasty lineage stat multiplier at character creation. */
export function applyDynastyStatMultiplier(
  stats: CharacterStats,
  dynastyStatBonusTier: number,
  generation = 1,
): CharacterStats {
  if (dynastyStatBonusTier <= 0) return stats;
  const mult = 1 + 0.05 * dynastyStatBonusTier * Math.max(1, generation);
  const keys: (keyof CharacterStats)[] = [
    'health', 'happiness', 'intelligence', 'fitness', 'looks',
    'social', 'ambition', 'mentalHealth',
  ];
  const next = { ...stats };
  for (const key of keys) {
    if (key === 'wealth') continue;
    next[key] = Math.min(100, Math.max(0, Math.round((next[key] ?? 50) * mult)));
  }
  return next;
}

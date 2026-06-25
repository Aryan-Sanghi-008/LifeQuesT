import { Character, CharacterStats, StatEffect } from '../types';
import { getAnnualCostOfLiving } from '../data/countryEconomy';

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function computeNetWorth(character: Pick<Character, 'bankBalance' | 'assets'>): number {
  const assetValue = character.assets.reduce((s, a) => s + a.value, 0);
  const totalDebt = character.assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  return character.bankBalance + assetValue - totalDebt;
}

export function wealthStatFromNetWorth(netWorth: number): number {
  return clamp(netWorth / 10000);
}

export function applyEffect(
  stats: CharacterStats,
  karma: number,
  bankBalance: number,
  effect: StatEffect,
  bankDelta = 0,
  assets: Character['assets'] = [],
) {
  const next = { ...stats };
  (Object.keys(effect) as Array<keyof StatEffect>).forEach(k => {
    if (k === 'karma') return;
    const val = effect[k] as number | undefined;
    const rec = next as unknown as Record<string, number>;
    if (val !== undefined && k in rec) rec[k] = clamp(rec[k] + val);
  });
  const nextKarma = Math.max(-100, Math.min(300, karma + (effect.karma ?? 0)));
  const nextBank = Math.max(0, bankBalance + bankDelta);
  const netWorth = computeNetWorth({ bankBalance: nextBank, assets });
  next.wealth = wealthStatFromNetWorth(netWorth);
  return { stats: next, karma: nextKarma, bankBalance: nextBank, netWorth };
}

export function tickAnnualEconomy(
  age: number,
  bankBalance: number,
  salary: number,
  assets: Character['assets'],
  countryCode = 'US',
): { bankBalance: number; netWorth: number } {
  // Country-scaled cost of living, adjusted by age (adults pay full cost)
  const baseCoL = getAnnualCostOfLiving(countryCode);
  const ageFactor = age >= 20 ? 1.0 : age >= 13 ? 0.4 : 0.1;
  const annualExpenses = Math.round(baseCoL * ageFactor);
  const nextBank = Math.max(0, bankBalance + salary - annualExpenses);
  return { bankBalance: nextBank, netWorth: computeNetWorth({ bankBalance: nextBank, assets }) };
}

const MIN_INVESTMENT = 10000;

export interface InvestResult {
  ok: boolean;
  message: string;
  bankBalance: number;
  asset?: Character['assets'][number];
}

export function investInMarket(
  character: Pick<Character, 'bankBalance' | 'assets' | 'age'>,
  amount: number,
): InvestResult {
  if (amount < MIN_INVESTMENT) {
    return { ok: false, message: `Minimum investment is ${MIN_INVESTMENT.toLocaleString()}.`, bankBalance: character.bankBalance };
  }
  if (character.bankBalance < amount) {
    return { ok: false, message: 'Not enough funds in your bank account.', bankBalance: character.bankBalance };
  }

  // Volatility model: normal-ish distribution centred at 1.0, std dev ~0.18
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const variance = Math.max(0.5, Math.min(1.8, 1.0 + normal * 0.18));
  const value = Math.round(amount * variance);
  const asset: Character['assets'][number] = {
    id: `invest_${Date.now()}`,
    type: 'investment',
    name: 'Stock Portfolio',
    value,
    purchasedAge: character.age,
  };

  const gain = value - amount;
  const gainLabel = gain >= 0 ? `+${gain.toLocaleString()}` : `${gain.toLocaleString()}`;
  return {
    ok: true,
    message: `Invested ${amount.toLocaleString()}. Market returned ${value.toLocaleString()} (${gainLabel}).`,
    bankBalance: character.bankBalance - amount,
    asset,
  };
}

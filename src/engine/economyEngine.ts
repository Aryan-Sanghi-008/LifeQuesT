import { Character, CharacterStats, StatEffect } from '../types';

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
): { bankBalance: number; netWorth: number } {
  const annualExpenses = age >= 20 ? 12000 : age >= 13 ? 3000 : 0;
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
    return { ok: false, message: `Minimum investment is ₹${MIN_INVESTMENT.toLocaleString()}.`, bankBalance: character.bankBalance };
  }
  if (character.bankBalance < amount) {
    return { ok: false, message: 'Not enough funds in your bank account.', bankBalance: character.bankBalance };
  }

  const variance = 0.9 + Math.random() * 0.2;
  const value = Math.round(amount * variance);
  const asset: Character['assets'][number] = {
    id: `invest_${Date.now()}`,
    type: 'investment',
    name: 'Stock Portfolio',
    value,
    purchasedAge: character.age,
  };

  return {
    ok: true,
    message: `Invested ₹${amount.toLocaleString()} in the market.`,
    bankBalance: character.bankBalance - amount,
    asset,
  };
}

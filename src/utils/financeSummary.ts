import { computeNetWorth } from '../engine/economyEngine';
import type { Character } from '../types';

export interface FinanceSummary {
  bank: number;
  assetValue: number;
  totalDebt: number;
  netWorth: number;
  annualIncome: number;
}

export function getFinanceSummary(
  character: Pick<Character, 'bankBalance' | 'assets' | 'career'>,
): FinanceSummary {
  const bank = character.bankBalance;
  const assetValue = character.assets.reduce((s, a) => s + a.value, 0);
  const totalDebt = character.assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  const netWorth = computeNetWorth({ bankBalance: bank, assets: character.assets });
  const annualIncome = character.career?.salary ?? 0;

  return { bank, assetValue, totalDebt, netWorth, annualIncome };
}

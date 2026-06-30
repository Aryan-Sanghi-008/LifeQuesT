import { computeNetWorth } from '@engine/economyEngine';
import { getAnnualMortgagePayments, getPropertyMaintenanceCost } from '@engine/housingEngine';
import type { Character } from '@/types';

export interface FinanceSummary {
  bank: number;
  debt: number;
  assetValue: number;
  totalDebt: number;
  netWorth: number;
  annualIncome: number;
  monthlyHousingBurn: number;
}

export function getFinanceSummary(
  character: Pick<Character, 'bankBalance' | 'assets' | 'career'> & { debt?: number },
): FinanceSummary {
  const bank = character.bankBalance;
  const debt = character.debt ?? 0;
  const assetValue = character.assets.reduce((s, a) => s + a.value, 0);
  const assetDebt = character.assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  const totalDebt = debt + assetDebt;
  const netWorth = computeNetWorth({ bankBalance: bank, assets: character.assets, debt });
  const annualIncome = character.career?.salary ?? 0;
  const housingAnnual = getAnnualMortgagePayments(character.assets) + getPropertyMaintenanceCost(character.assets);
  const monthlyHousingBurn = Math.round(housingAnnual / 12);

  return { bank, debt, assetValue, totalDebt, netWorth, annualIncome, monthlyHousingBurn };
}

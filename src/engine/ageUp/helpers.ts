import type { LifeEventRecord } from '@/types';
import type { AnnualEconomyResult } from '@engine/economyEngine';
import { getCountryEconomy } from '@/data/countryEconomy';
import { runAnnualSimulation } from '@engine/simulationEngine';

export const VIRAL_EVENT_IDS = ['viral_moment', 'follower_1k', 'follower_10k'];
export const FINANCIAL_EVENT_COLOR = '#10B981';

export const EVENT_COOLDOWNS: Record<string, number> = {
  doctor_visit: 1,
  hospital_stay: 2,
  job_market_crash: 3,
  market_boom: 3,
  marriage_proposal: 3,
  divorce: 5,
  business_fail: 3,
  car_accident: 5,
  house_fire: 10,
};

export function formatMoney(amount: number, countryCode: string): string {
  const eco = getCountryEconomy(countryCode);
  return `${eco.currencySymbol}${Math.abs(amount).toLocaleString(eco.currencyLocale)}`;
}

export function buildEconomyLedgerRecords(
  newAge: number,
  economy: AnnualEconomyResult,
  countryCode: string,
): LifeEventRecord[] {
  const records: LifeEventRecord[] = [];
  const ts = Date.now();

  if (economy.livingExpenses > 0) {
    records.push({
      id: 'annual_expenses',
      age: newAge,
      title: 'Living Expenses',
      description: `Annual cost of living: ${formatMoney(economy.livingExpenses, countryCode)} deducted from your account.`,
      statEffect: {},
      category: 'financial',
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts,
    });
  }

  if (economy.salaryNet > 0) {
    const taxNote =
      economy.taxPaid > 0
        ? ` (${formatMoney(economy.taxPaid, countryCode)} tax withheld)`
        : '';
    records.push({
      id: 'annual_salary',
      age: newAge,
      title: 'Salary Deposited',
      description: `Net salary: ${formatMoney(economy.salaryNet, countryCode)} deposited${taxNote}.`,
      statEffect: {},
      category: 'financial',
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts + 1,
    });
  }

  return records;
}

export function buildStressRecords(
  newAge: number,
  narrativeEffects: ReturnType<typeof runAnnualSimulation>['narrativeEffects'],
): LifeEventRecord[] {
  return narrativeEffects
    .filter((e) => e.type === 'financial_stress')
    .map((e, i) => ({
      id: `financial_stress_${e.severity}`,
      age: newAge,
      title: e.severity === 'major' ? 'Financial Crisis' : 'Money Trouble',
      description: e.description,
      statEffect: {},
      category: 'financial' as const,
      color: e.severity === 'major' ? '#EF4444' : '#F97316',
      timestamp: Date.now() + 2 + i,
    }));
}

export function isOnCooldown(
  eventId: string,
  currentAge: number,
  cooldowns: Record<string, number>,
): boolean {
  const lastAge = cooldowns[eventId];
  if (lastAge === undefined) return false;
  const minGap = EVENT_COOLDOWNS[eventId] ?? 0;
  return currentAge - lastAge < minGap;
}

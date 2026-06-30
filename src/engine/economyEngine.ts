import { Character, CharacterStats, StatEffect } from "../types";
import {
  getAnnualCostOfLiving,
  getCountryEconomy,
  applyTax,
  getMaxPersonalDebt,
} from "../data/countryEconomy";

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function applyCashDelta(
  bankBalance: number,
  debt: number,
  delta: number,
): { bankBalance: number; debt: number } {
  let bank = bankBalance + delta;
  let nextDebt = debt;
  if (bank < 0) {
    nextDebt += -bank;
    bank = 0;
  }
  return { bankBalance: bank, debt: nextDebt };
}

export function computeNetWorth(
  character: Pick<Character, "bankBalance" | "assets" | "debt">,
): number {
  const assetValue = character.assets.reduce((s, a) => s + a.value, 0);
  const assetDebt = character.assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  const cashDebt = character.debt ?? 0;
  return character.bankBalance + assetValue - assetDebt - cashDebt;
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
  assets: Character["assets"] = [],
  debt = 0,
) {
  const next = { ...stats };
  (Object.keys(effect) as Array<keyof StatEffect>).forEach((k) => {
    if (k === "karma") return;
    const val = effect[k] as number | undefined;
    const rec = next as unknown as Record<string, number>;
    if (val !== undefined && k in rec) rec[k] = clamp(rec[k] + val);
  });
  const nextKarma = Math.max(-100, Math.min(300, karma + (effect.karma ?? 0)));
  const cash = applyCashDelta(bankBalance, debt, bankDelta);
  const netWorth = computeNetWorth({
    bankBalance: cash.bankBalance,
    assets,
    debt: cash.debt,
  });
  next.wealth = wealthStatFromNetWorth(netWorth);
  return {
    stats: next,
    karma: nextKarma,
    bankBalance: cash.bankBalance,
    debt: cash.debt,
    netWorth,
  };
}

export interface AnnualEconomyResult {
  bankBalance: number;
  debt: number;
  netWorth: number;
  salaryGross: number;
  salaryNet: number;
  taxPaid: number;
  livingExpenses: number;
}

function livingExpenseAgeFactor(age: number): number {
  if (age >= 22) return 0.3;
  if (age >= 18) return 0.1;
  return 0;
}

export function tickAnnualEconomy(
  age: number,
  bankBalance: number,
  debt: number,
  salaryGross: number,
  assets: Character["assets"],
  countryCode = "US",
): AnnualEconomyResult {
  const eco = getCountryEconomy(countryCode);
  const baseCoL = getAnnualCostOfLiving(countryCode);
  const inflationAdjusted = Math.round(
    baseCoL * eco.costOfLivingIndex * (1 + eco.inflationRate * 0.5),
  );
  const livingExpenses = Math.round(
    inflationAdjusted * livingExpenseAgeFactor(age),
  );

  const salaryNet = salaryGross > 0 ? applyTax(salaryGross, countryCode) : 0;
  const taxPaid = salaryGross - salaryNet;

  const netCashFlow = salaryNet - livingExpenses;
  const cash = applyCashDelta(bankBalance, debt, netCashFlow);
  const netWorth = computeNetWorth({
    bankBalance: cash.bankBalance,
    assets,
    debt: cash.debt,
  });

  return {
    bankBalance: cash.bankBalance,
    debt: cash.debt,
    netWorth,
    salaryGross,
    salaryNet,
    taxPaid,
    livingExpenses,
  };
}

export interface DebtCrisisResult {
  crisis: boolean;
  limit: number;
  totalDebt: number;
}

export function getTotalDebt(
  character: Pick<Character, "bankBalance" | "assets" | "debt">,
): number {
  const cashDebt = character.debt ?? 0;
  const assetDebt = character.assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  return cashDebt + assetDebt;
}

export function checkDebtCrisis(
  character: Pick<Character, "bankBalance" | "assets" | "debt" | "countryCode">,
): DebtCrisisResult {
  const totalDebt = getTotalDebt(character);
  const limit = getMaxPersonalDebt(character.countryCode ?? "IN");
  return { crisis: totalDebt >= limit, limit, totalDebt };
}

const MIN_INVESTMENT = 10000;

export interface InvestResult {
  ok: boolean;
  message: string;
  bankBalance: number;
  asset?: Character["assets"][number];
}

export function investInMarket(
  character: Pick<Character, "bankBalance" | "assets" | "age">,
  amount: number,
): InvestResult {
  if (amount < MIN_INVESTMENT) {
    return {
      ok: false,
      message: `Minimum investment is ${MIN_INVESTMENT.toLocaleString()}.`,
      bankBalance: character.bankBalance,
    };
  }
  if (character.bankBalance < amount) {
    return {
      ok: false,
      message: "Not enough funds in your bank account.",
      bankBalance: character.bankBalance,
    };
  }

  // Volatility model: normal-ish distribution centred at 1.0, std dev ~0.18
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const variance = Math.max(0.5, Math.min(1.8, 1.0 + normal * 0.18));
  const value = Math.round(amount * variance);
  const asset: Character["assets"][number] = {
    id: `invest_${Date.now()}`,
    type: "investment",
    name: "Stock Portfolio",
    value,
    purchasedAge: character.age,
  };

  const gain = value - amount;
  const gainLabel =
    gain >= 0 ? `+${gain.toLocaleString()}` : `${gain.toLocaleString()}`;
  return {
    ok: true,
    message: `Invested ${amount.toLocaleString()}. Market returned ${value.toLocaleString()} (${gainLabel}).`,
    bankBalance: character.bankBalance - amount,
    asset,
  };
}

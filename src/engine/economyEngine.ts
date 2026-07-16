import { makeId } from './ids';
import { Character, CharacterStats, StatEffect } from "../types";
import {
  getAnnualCostOfLiving,
  getCountryEconomy,
  applyTax,
  getMaxPersonalDebtForCharacter,
} from "../data/countryEconomy";
import { scaleCountryAmount } from "./countryScaleEngine";
import {
  canAffordCashInvestment,
  getMaxInvestableAmountStrict,
} from "./financingEngine";

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/** Clamp a numeric value into [min, max] (inclusive). */
export function clampRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
    baseCoL * (1 + eco.inflationRate * 0.5),
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

type DebtCharacter = Pick<Character, "bankBalance" | "assets" | "debt" | "countryCode"> & {
  familyBackground?: Character["familyBackground"];
};

export function checkDebtCrisis(
  character: DebtCharacter,
): DebtCrisisResult {
  const totalDebt = getTotalDebt(character);
  const limit = getMaxPersonalDebtForCharacter(character);
  return { crisis: totalDebt >= limit, limit, totalDebt };
}

const MIN_INVESTMENT_USD = 1;
export const STOCK_SUGGESTED_USD = 10_000;

/** Smallest allowed investment in local currency (~$1 USD anchor). */
export function getMinInvestment(countryCode = "US"): number {
  return Math.max(1, scaleCountryAmount(MIN_INVESTMENT_USD, countryCode, "cost"));
}

/** Typical stock buy used for UI defaults and playability benchmarks. */
export function getSuggestedStockInvestment(countryCode = "US"): number {
  return scaleCountryAmount(STOCK_SUGGESTED_USD, countryCode, "cost");
}

/** Cash-only by default; pass useMargin when credit ≥ 750 and player opts in. */
export function getMaxInvestableAmount(
  character: DebtCharacter & { creditScore?: number },
  options?: { useMargin?: boolean; orderAmount?: number },
): number {
  return getMaxInvestableAmountStrict(character, options);
}

export function validateInvestmentAmount(
  amount: number,
  countryCode = "US",
): { ok: boolean; message: string } {
  const minInvestment = getMinInvestment(countryCode);
  if (!Number.isFinite(amount) || amount < minInvestment) {
    return {
      ok: false,
      message: `Minimum investment is ${minInvestment.toLocaleString()}.`,
    };
  }
  return { ok: true, message: "" };
}

export interface InvestResult {
  ok: boolean;
  message: string;
  bankBalance: number;
  debt?: number;
  asset?: Character["assets"][number];
}

export function investInMarket(
  character: DebtCharacter & Pick<Character, "age" | "assets" | "creditScore">,
  amount: number,
  options?: { useMargin?: boolean; catalogId?: string; name?: string },
): InvestResult {
  const cc = character.countryCode ?? "US";
  const validation = validateInvestmentAmount(amount, cc);
  if (!validation.ok) {
    return {
      ok: false,
      message: validation.message,
      bankBalance: character.bankBalance,
    };
  }
  const afford = canAffordCashInvestment(
    character,
    amount,
    options?.useMargin ?? false,
  );
  if (!afford.ok) {
    return {
      ok: false,
      message: afford.message,
      bankBalance: character.bankBalance,
    };
  }

  const debt = character.debt ?? 0;
  // Cost basis equals amount; mark-to-market happens on age-up via marketEngine
  const value = Math.round(amount);
  const asset: Character["assets"][number] = {
    id: makeId('invest'),
    type: "investment",
    name: options?.name ?? "Stock Portfolio",
    value,
    purchasedAge: character.age,
    catalogId: options?.catalogId ?? "stock_index",
    costBasis: amount,
    priceHistory: [{ age: character.age, value }],
  };

  const cash = applyCashDelta(character.bankBalance, debt, -amount);
  return {
    ok: true,
    message:
      afford.marginUsed > 0
        ? `Invested ${amount.toLocaleString()} (${afford.marginUsed.toLocaleString()} on margin).`
        : `Invested ${amount.toLocaleString()} from cash.`,
    bankBalance: cash.bankBalance,
    debt: cash.debt,
    asset,
  };
}

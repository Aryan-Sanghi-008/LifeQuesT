import type { Character, CreditFactors } from '../types';
import { getMaxPersonalDebtForCharacter } from '../data/countryEconomy';
import { getTotalDebt } from './economyEngine';
import { clamp } from './economyEngine';

const WEIGHTS = {
  paymentHistory: 0.35,
  utilization: 0.3,
  historyLength: 0.15,
  creditMix: 0.1,
  recentInquiries: 0.1,
} as const;

export function computeCreditFactors(
  character: Pick<
    Character,
    | 'age'
    | 'assets'
    | 'debt'
    | 'bankBalance'
    | 'countryCode'
    | 'familyBackground'
    | 'creditHistoryStartAge'
    | 'creditInquiries'
    | 'insurancePolicies'
    | 'businesses'
  >,
  opts?: { missedPayment?: boolean; onTimePayment?: boolean },
): CreditFactors {
  const maxDebt = getMaxPersonalDebtForCharacter(character);
  const totalDebt = getTotalDebt(character);
  const utilRaw = maxDebt > 0 ? totalDebt / maxDebt : 0;
  const utilization = clamp(100 - utilRaw * 120);

  let paymentHistory = 72;
  if (opts?.missedPayment) paymentHistory = 35;
  else if (opts?.onTimePayment) paymentHistory = 88;
  else if ((character.debt ?? 0) === 0 && totalDebt < maxDebt * 0.3) paymentHistory = 82;

  const start = character.creditHistoryStartAge ?? character.age;
  const years = Math.max(0, character.age - start);
  const historyLength = clamp(30 + years * 8);

  const hasMortgage = character.assets.some((a) => a.type === 'property' && (a.debt ?? 0) > 0);
  const hasAuto = character.assets.some((a) => a.type === 'vehicle' && (a.debt ?? 0) > 0);
  const hasBiz = (character.businesses?.length ?? 0) > 0;
  const hasInsurance = (character.insurancePolicies?.length ?? 0) > 0;
  const mixCount = [hasMortgage, hasAuto, hasBiz, hasInsurance].filter(Boolean).length;
  const creditMix = clamp(40 + mixCount * 15);

  const inquiries = character.creditInquiries ?? 0;
  const recentInquiries = clamp(100 - inquiries * 18);

  return {
    paymentHistory,
    utilization,
    historyLength,
    creditMix,
    recentInquiries,
  };
}

export function scoreFromFactors(factors: CreditFactors): number {
  const raw =
    factors.paymentHistory * WEIGHTS.paymentHistory +
    factors.utilization * WEIGHTS.utilization +
    factors.historyLength * WEIGHTS.historyLength +
    factors.creditMix * WEIGHTS.creditMix +
    factors.recentInquiries * WEIGHTS.recentInquiries;
  // Map 0–100 weighted → 300–850
  return Math.round(300 + (raw / 100) * 550);
}

export function tickCreditScore(
  character: Character,
  opts?: { missedPayment?: boolean; onTimePayment?: boolean; newLoan?: boolean },
): { creditScore: number; creditFactors: CreditFactors; creditInquiries: number } {
  let inquiries = character.creditInquiries ?? 0;
  if (opts?.newLoan) inquiries += 1;
  else inquiries = Math.max(0, inquiries - 1);

  const factors = computeCreditFactors(
    { ...character, creditInquiries: inquiries },
    opts,
  );
  const creditScore = Math.max(300, Math.min(850, scoreFromFactors(factors)));
  return { creditScore, creditFactors: factors, creditInquiries: inquiries };
}

export function marginUnlocked(creditScore: number | undefined): boolean {
  return (creditScore ?? 650) >= 750;
}

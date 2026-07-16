/**
 * Anti-leverage financing: cash-first investments, capped loans on tangibles.
 * Loan ≤ min(50% price, 50% bankBalance); investments cash-only unless margin (credit ≥ 750).
 */
import type { Character } from '../types';
import { getMaxPersonalDebtForCharacter } from '../data/countryEconomy';

export const MARGIN_CREDIT_MIN = 750;
export const MAX_LTV = 0.5;
export const MAX_LOAN_VS_CASH = 0.5;
export const MARGIN_VS_CASH = 0.5;
export const MARGIN_VS_ORDER = 0.3;

type MoneyChar = Pick<
  Character,
  'bankBalance' | 'debt' | 'assets' | 'countryCode' | 'creditScore'
> & {
  familyBackground?: Character['familyBackground'];
};

export function getCashInvestableAmount(character: Pick<Character, 'bankBalance'>): number {
  return Math.max(0, Math.floor(character.bankBalance));
}

/** Extra margin borrow if credit ≥ 750: min(50% cash, 30% order). */
export function getMarginBorrowCapacity(
  creditScore: number | undefined,
  bankBalance: number,
  orderAmount: number,
  useMargin: boolean,
): number {
  if (!useMargin || (creditScore ?? 650) < MARGIN_CREDIT_MIN) return 0;
  if (orderAmount <= 0 || bankBalance <= 0) return 0;
  return Math.floor(
    Math.min(bankBalance * MARGIN_VS_CASH, orderAmount * MARGIN_VS_ORDER),
  );
}

/** Max investable: cash + optional margin; never country debt-headroom spam. */
export function getMaxInvestableAmountStrict(
  character: MoneyChar,
  options?: { useMargin?: boolean; orderAmount?: number },
): number {
  const cash = getCashInvestableAmount(character);
  const margin = getMarginBorrowCapacity(
    character.creditScore,
    character.bankBalance,
    options?.orderAmount ?? cash,
    options?.useMargin ?? false,
  );
  const maxDebt = getMaxPersonalDebtForCharacter(character);
  const debtRoom = Math.max(0, maxDebt - (character.debt ?? 0));
  return cash + Math.min(margin, debtRoom);
}

export interface FinancedPurchaseTerms {
  price: number;
  downPayment: number;
  maxLoan: number;
  loan: number;
  apr: number;
  approved: boolean;
  message: string;
}

function aprFromCredit(creditScore: number): number {
  if (creditScore >= 780) return 0.045;
  if (creditScore >= 720) return 0.055;
  if (creditScore >= 680) return 0.065;
  if (creditScore >= 620) return 0.08;
  return 0.11;
}

/**
 * Financed tangible buy: down ≥ 50% of price; loan ≤ min(50% price, 50% cash);
 * country debt ceiling still applies.
 */
export function getFinancedPurchaseTerms(
  price: number,
  character: MoneyChar,
  requestedLoan?: number,
): FinancedPurchaseTerms {
  const credit = character.creditScore ?? 650;
  const apr = aprFromCredit(credit);
  if (price <= 0) {
    return {
      price: 0,
      downPayment: 0,
      maxLoan: 0,
      loan: 0,
      apr,
      approved: false,
      message: 'Invalid price.',
    };
  }

  const minDown = Math.ceil(price * MAX_LTV);
  const maxLoanByLtv = Math.floor(price * MAX_LTV);
  const maxLoanByCash = Math.floor(character.bankBalance * MAX_LOAN_VS_CASH);
  const maxDebt = getMaxPersonalDebtForCharacter(character);
  const debtRoom = Math.max(0, maxDebt - (character.debt ?? 0));
  const maxLoan = Math.max(0, Math.min(maxLoanByLtv, maxLoanByCash, debtRoom));

  let loan = requestedLoan !== undefined ? Math.floor(requestedLoan) : maxLoan;
  loan = Math.max(0, Math.min(loan, maxLoan));
  const downPayment = price - loan;

  if (character.bankBalance < downPayment) {
    return {
      price,
      downPayment,
      maxLoan,
      loan,
      apr,
      approved: false,
      message: `Need ${downPayment.toLocaleString()} cash down (at least 50% of price).`,
    };
  }

  if (downPayment < minDown - 1) {
    return {
      price,
      downPayment,
      maxLoan,
      loan,
      apr,
      approved: false,
      message: 'Down payment must be at least 50% of the price.',
    };
  }

  return {
    price,
    downPayment,
    maxLoan,
    loan,
    apr,
    approved: true,
    message: loan > 0
      ? `Cash ${downPayment.toLocaleString()} + loan ${loan.toLocaleString()} @ ${(apr * 100).toFixed(1)}% APR`
      : `Pay ${downPayment.toLocaleString()} in cash`,
  };
}

export function canAffordCashInvestment(
  character: MoneyChar,
  amount: number,
  useMargin = false,
): { ok: boolean; message: string; marginUsed: number } {
  const max = getMaxInvestableAmountStrict(character, { useMargin, orderAmount: amount });
  if (amount > max) {
    return {
      ok: false,
      message: useMargin
        ? `Max with margin is ${max.toLocaleString()} (cash + capped borrow).`
        : `Cash only — max ${max.toLocaleString()}.`,
      marginUsed: 0,
    };
  }
  const cash = getCashInvestableAmount(character);
  const marginUsed = Math.max(0, amount - cash);
  const maxDebt = getMaxPersonalDebtForCharacter(character);
  if ((character.debt ?? 0) + marginUsed > maxDebt) {
    return { ok: false, message: 'Would exceed country debt limit.', marginUsed: 0 };
  }
  return { ok: true, message: '', marginUsed };
}

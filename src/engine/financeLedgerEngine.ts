import type { Character, FinanceLedgerCategory, FinanceLedgerEntry } from '../types';
import { applyCashDelta, clamp, computeNetWorth } from './economyEngine';
import { makeId } from './ids';

export type { FinanceLedgerCategory, FinanceLedgerEntry };

export interface YearFinanceSummary {
  age: number;
  income: number;
  expense: number;
  net: number;
  debtChange: number;
  entries: FinanceLedgerEntry[];
}

export const MAX_FINANCE_LEDGER = 300;


export function trimFinanceLedger(
  entries: FinanceLedgerEntry[],
  max = MAX_FINANCE_LEDGER,
): FinanceLedgerEntry[] {
  if (entries.length <= max) return entries;
  return entries.slice(entries.length - max);
}

export function appendFinanceLedger(
  existing: FinanceLedgerEntry[] | undefined,
  next: FinanceLedgerEntry | FinanceLedgerEntry[],
): FinanceLedgerEntry[] {
  const added = Array.isArray(next) ? next : [next];
  if (added.length === 0) return existing ?? [];
  return trimFinanceLedger([...(existing ?? []), ...added]);
}

export function createLedgerEntry(params: {
  age: number;
  category: FinanceLedgerCategory;
  label: string;
  amount: number;
  bankAfter: number;
  debtAfter: number;
  debtBefore: number;
  id?: string;
  timestamp?: number;
}): FinanceLedgerEntry {
  return {
    id: params.id ?? makeId('fin'),
    age: params.age,
    timestamp: params.timestamp ?? Date.now(),
    category: params.category,
    label: params.label,
    amount: params.amount,
    bankAfter: params.bankAfter,
    debtAfter: params.debtAfter,
    debtDelta: params.debtAfter - params.debtBefore,
  };
}

/** Apply a cash delta and optionally emit a ledger line when amount ≠ 0. */
export function applyTrackedCashDelta(
  bankBalance: number,
  debt: number,
  delta: number,
  meta: {
    age: number;
    category: FinanceLedgerCategory;
    label: string;
  },
): { bankBalance: number; debt: number; entry: FinanceLedgerEntry | null } {
  if (delta === 0) {
    return { bankBalance, debt, entry: null };
  }
  const cash = applyCashDelta(bankBalance, debt, delta);
  return {
    bankBalance: cash.bankBalance,
    debt: cash.debt,
    entry: createLedgerEntry({
      age: meta.age,
      category: meta.category,
      label: meta.label,
      amount: delta,
      bankAfter: cash.bankBalance,
      debtAfter: cash.debt,
      debtBefore: debt,
    }),
  };
}

export function groupLedgerByAge(
  entries: FinanceLedgerEntry[],
): YearFinanceSummary[] {
  const byAge = new Map<number, FinanceLedgerEntry[]>();
  for (const e of entries) {
    const list = byAge.get(e.age) ?? [];
    list.push(e);
    byAge.set(e.age, list);
  }
  return [...byAge.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([age, yearEntries]) => {
      let income = 0;
      let expense = 0;
      let debtChange = 0;
      for (const e of yearEntries) {
        if (e.amount > 0) income += e.amount;
        else expense += e.amount;
        debtChange += e.debtDelta;
      }
      return {
        age,
        income,
        expense,
        net: income + expense,
        debtChange,
        entries: [...yearEntries].sort((a, b) => b.timestamp - a.timestamp),
      };
    });
}

export function repayPersonalDebt(
  character: Pick<Character, 'bankBalance' | 'debt' | 'assets' | 'age' | 'stats'>,
  requestedAmount: number,
): {
  ok: boolean;
  message: string;
  bankBalance: number;
  debt: number;
  repaid: number;
  entry: FinanceLedgerEntry | null;
  wealth: number;
} {
  const debt = character.debt ?? 0;
  const bank = character.bankBalance;
  if (debt <= 0) {
    return {
      ok: false,
      message: 'You have no personal debt to repay.',
      bankBalance: bank,
      debt,
      repaid: 0,
      entry: null,
      wealth: character.stats.wealth,
    };
  }
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return {
      ok: false,
      message: 'Enter a positive amount to repay.',
      bankBalance: bank,
      debt,
      repaid: 0,
      entry: null,
      wealth: character.stats.wealth,
    };
  }
  if (bank <= 0) {
    return {
      ok: false,
      message: 'No bank balance available to repay debt.',
      bankBalance: bank,
      debt,
      repaid: 0,
      entry: null,
      wealth: character.stats.wealth,
    };
  }

  const repaid = Math.min(requestedAmount, debt, bank);
  const nextBank = bank - repaid;
  const nextDebt = debt - repaid;
  const netWorth = computeNetWorth({
    bankBalance: nextBank,
    assets: character.assets,
    debt: nextDebt,
  });
  const entry = createLedgerEntry({
    age: character.age,
    category: 'repayment',
    label: 'Debt repayment',
    amount: -repaid,
    bankAfter: nextBank,
    debtAfter: nextDebt,
    debtBefore: debt,
  });
  return {
    ok: true,
    message: `Repaid ${repaid.toLocaleString()} toward personal debt.`,
    bankBalance: nextBank,
    debt: nextDebt,
    repaid,
    entry,
    wealth: clamp(netWorth / 10000),
  };
}

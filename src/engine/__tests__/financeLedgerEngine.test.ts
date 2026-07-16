import {
  appendFinanceLedger,
  applyTrackedCashDelta,
  groupLedgerByAge,
  repayPersonalDebt,
  trimFinanceLedger,
} from '@engine/financeLedgerEngine';
import {
  getEventBankAgeFactor,
  scaleEventBankEffect,
} from '@engine/countryScaleEngine';

describe('financeLedgerEngine', () => {
  it('tracks cash deltas and debt overflow', () => {
    const r = applyTrackedCashDelta(1000, 0, -2500, {
      age: 15,
      category: 'event',
      label: 'Family crisis',
    });
    expect(r.bankBalance).toBe(0);
    expect(r.debt).toBe(1500);
    expect(r.entry?.debtDelta).toBe(1500);
    expect(r.entry?.amount).toBe(-2500);
  });

  it('groups ledger by age with income/expense totals', () => {
    const a = applyTrackedCashDelta(5000, 0, 2000, {
      age: 20,
      category: 'salary',
      label: 'Salary',
    }).entry!;
    const b = applyTrackedCashDelta(7000, 0, -500, {
      age: 20,
      category: 'living',
      label: 'Living',
    }).entry!;
    const years = groupLedgerByAge([a, b]);
    expect(years[0].age).toBe(20);
    expect(years[0].income).toBe(2000);
    expect(years[0].expense).toBe(-500);
    expect(years[0].net).toBe(1500);
  });

  it('repays personal debt from bank only up to available funds', () => {
    const result = repayPersonalDebt(
      {
        age: 22,
        bankBalance: 3000,
        debt: 5000,
        assets: [],
        stats: {
          health: 70, happiness: 70, intelligence: 70, wealth: 40,
          fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
        },
      },
      10000,
    );
    expect(result.ok).toBe(true);
    expect(result.repaid).toBe(3000);
    expect(result.bankBalance).toBe(0);
    expect(result.debt).toBe(2000);
    expect(result.entry?.category).toBe('repayment');
  });

  it('trims and appends ledger', () => {
    const many = Array.from({ length: 5 }, (_, i) =>
      applyTrackedCashDelta(100, 0, -1, {
        age: i,
        category: 'other' as const,
        label: `e${i}`,
      }).entry!,
    );
    const trimmed = trimFinanceLedger(many, 3);
    expect(trimmed).toHaveLength(3);
    expect(trimFinanceLedger(appendFinanceLedger(trimmed, many[0]!), 3)).toHaveLength(3);
  });
});

describe('event bank scaling / teen India', () => {
  it('softens event costs under 18', () => {
    expect(getEventBankAgeFactor(10)).toBeLessThan(getEventBankAgeFactor(18));
    expect(getEventBankAgeFactor(15)).toBeLessThan(1);
  });

  it('does not produce million-scale personal hits for India teens on Age Up-scale events', () => {
    const hit = scaleEventBankEffect(-50000, 'IN', 'cost', 'financial', 15);
    expect(Math.abs(hit)).toBeLessThanOrEqual(10_000);
    expect(hit).toBeLessThan(0);
  });

  it('India adult event costs use CoL ratio rather than raw ₹83 FX blowup', () => {
    const us = Math.abs(scaleEventBankEffect(-5000, 'US', 'cost'));
    const inAdult = Math.abs(scaleEventBankEffect(-5000, 'IN', 'cost', undefined, 25));
    // Should be higher than US but far below old FX path (~145k for -$5k).
    expect(inAdult).toBeGreaterThan(us);
    expect(inAdult).toBeLessThan(100_000);
  });
});

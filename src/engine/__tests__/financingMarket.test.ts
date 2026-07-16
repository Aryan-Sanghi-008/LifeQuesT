import {
  getCashInvestableAmount,
  getMaxInvestableAmountStrict,
  getFinancedPurchaseTerms,
  getMarginBorrowCapacity,
  canAffordCashInvestment,
  MARGIN_CREDIT_MIN,
} from '@engine/financingEngine';
import { tickCreditScore, scoreFromFactors, computeCreditFactors } from '@engine/creditScoreEngine';
import { MARKET_INSTRUMENTS, getInstrumentsByKind } from '@data/marketInstruments';
import { FRANCHISES } from '@data/franchises';
import { COLLECTIBLES } from '@data/collectibles';
import { INSURANCE_PRODUCTS, applyInsuranceCoverage, createPolicy } from '@data/insurancePolicies';
import { canFoundFranchise, foundFranchise } from '@engine/businessEngine';
import { tickInstrumentValue, portfolioAllocation } from '@engine/marketEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('financingEngine', () => {
  it('invest max is cash-only without margin', () => {
    const char = createTestCharacter({ bankBalance: 100_000, debt: 0, creditScore: 650 });
    expect(getCashInvestableAmount(char)).toBe(100_000);
    expect(getMaxInvestableAmountStrict(char)).toBe(100_000);
  });

  it('margin only when credit ≥ 750 and opted in', () => {
    const poor = createTestCharacter({ bankBalance: 100_000, creditScore: 700 });
    expect(getMarginBorrowCapacity(700, 100_000, 50_000, true)).toBe(0);
    const richCredit = getMarginBorrowCapacity(MARGIN_CREDIT_MIN, 100_000, 80_000, true);
    expect(richCredit).toBe(Math.floor(Math.min(50_000, 24_000)));
    expect(getMaxInvestableAmountStrict(poor, { useMargin: true, orderAmount: 50_000 })).toBe(100_000);
  });

  it('financed purchase requires ≥50% down and loan ≤50% cash', () => {
    const char = createTestCharacter({ bankBalance: 200_000, debt: 0, creditScore: 700 });
    const terms = getFinancedPurchaseTerms(300_000, char);
    expect(terms.approved).toBe(true);
    expect(terms.downPayment).toBeGreaterThanOrEqual(150_000);
    expect(terms.loan).toBeLessThanOrEqual(100_000); // 50% of cash
    expect(terms.loan).toBeLessThanOrEqual(150_000); // 50% LTV
  });

  it('blocks invest above cash without margin', () => {
    const char = createTestCharacter({ bankBalance: 10_000, debt: 0, creditScore: 800 });
    const r = canAffordCashInvestment(char, 50_000, false);
    expect(r.ok).toBe(false);
  });
});

describe('creditScoreEngine', () => {
  it('computes score in 300–850 band', () => {
    const char = createTestCharacter({ bankBalance: 50_000, debt: 0, creditScore: 650 });
    const factors = computeCreditFactors(char);
    const score = scoreFromFactors(factors);
    expect(score).toBeGreaterThanOrEqual(300);
    expect(score).toBeLessThanOrEqual(850);
    const tick = tickCreditScore(char, { onTimePayment: true });
    expect(tick.creditScore).toBeGreaterThanOrEqual(300);
  });
});

describe('market catalogs', () => {
  it('has curated diversified catalogs with unique roles', () => {
    expect(MARKET_INSTRUMENTS.length).toBeGreaterThanOrEqual(40);
    expect(MARKET_INSTRUMENTS.length).toBeLessThanOrEqual(80);
    expect(getInstrumentsByKind('crypto').length).toBeGreaterThanOrEqual(5);
    expect(getInstrumentsByKind('stock').length).toBeGreaterThanOrEqual(6);
    expect(FRANCHISES.length).toBeGreaterThanOrEqual(10);
    expect(FRANCHISES.length).toBeLessThanOrEqual(16);
    expect(COLLECTIBLES.length).toBeGreaterThanOrEqual(12);
    expect(COLLECTIBLES.every((c) => c.perks.length > 0 && c.roleTag)).toBe(true);
    expect(INSURANCE_PRODUCTS.length).toBeGreaterThanOrEqual(4);
  });

  it('ticks instrument value with dividend', () => {
    const inst = MARKET_INSTRUMENTS.find((i) => i.kind === 'bond')!;
    const { value, dividend } = tickInstrumentValue(10_000, inst);
    expect(value).toBeGreaterThan(0);
    expect(dividend).toBeGreaterThanOrEqual(0);
  });

  it('portfolioAllocation sums kinds', () => {
    const alloc = portfolioAllocation([
      { id: '1', type: 'investment', name: 'A', value: 100, purchasedAge: 20, instrumentKind: 'stock' },
      { id: '2', type: 'property', name: 'B', value: 300, purchasedAge: 22 },
    ]);
    expect(alloc.some((a) => a.kind === 'stock')).toBe(true);
    expect(alloc.some((a) => a.kind === 'property')).toBe(true);
  });
});

describe('franchises + insurance', () => {
  it('allows franchise without entrepreneur when capital+credit ok', () => {
    const char = createTestCharacter({
      age: 30,
      bankBalance: 5_000_000,
      debt: 0,
      creditScore: 720,
      job: 'Teacher',
      eventHistory: [],
    });
    const laundry = FRANCHISES.find((f) => f.id === 'fran_laundry')!;
    const check = canFoundFranchise(char, laundry.id);
    expect(check.ok).toBe(true);
    const founded = foundFranchise(char, laundry.id);
    expect(founded?.business.franchiseId).toBe(laundry.id);
  });

  it('applies insurance coverage to losses', () => {
    const char = createTestCharacter({ age: 30, countryCode: 'US' });
    const product = INSURANCE_PRODUCTS.find((p) => p.line === 'home')!;
    const policy = createPolicy(product, 30, 'US');
    const { coveredLoss, payout } = applyInsuranceCoverage([policy], 'home', 10_000);
    expect(payout).toBeGreaterThan(0);
    expect(coveredLoss).toBeLessThan(10_000);
    void char;
  });
});

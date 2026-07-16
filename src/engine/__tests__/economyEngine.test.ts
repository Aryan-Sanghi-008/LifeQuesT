import { clamp, applyEffect, computeNetWorth, tickAnnualEconomy, investInMarket, checkDebtCrisis } from '@engine/economyEngine';
import type { CharacterStats } from '../../types';

const baseStats: CharacterStats = {
  health: 50,
  happiness: 50,
  intelligence: 50,
  wealth: 50,
  fitness: 50,
  looks: 50,
  social: 50,
  ambition: 50,
  mentalHealth: 70,
};

describe('clamp', () => {
  it('bounds values between 0 and 100', () => {
    expect(clamp(150)).toBe(100);
    expect(clamp(-10)).toBe(0);
    expect(clamp(42.7)).toBe(43);
  });
});

describe('computeNetWorth', () => {
  it('sums bank balance and assets minus debt', () => {
    const net = computeNetWorth({
      bankBalance: 10000,
      debt: 5000,
      assets: [
        { id: '1', type: 'property', name: 'House', value: 200000, debt: 50000, purchasedAge: 30 },
      ],
    });
    expect(net).toBe(155000);
  });
});

describe('applyEffect', () => {
  it('applies stat deltas and clamps', () => {
    const result = applyEffect(baseStats, 0, 1000, { health: 10, happiness: -5 });
    expect(result.stats.health).toBe(60);
    expect(result.stats.happiness).toBe(45);
    expect(result.bankBalance).toBe(1000);
  });

  it('clamps stats that exceed 100', () => {
    const high = { ...baseStats, health: 95 };
    const result = applyEffect(high, 0, 0, { health: 20 });
    expect(result.stats.health).toBe(100);
  });

  it('accrues debt instead of flooring bank at 0', () => {
    const result = applyEffect(baseStats, 0, 100, { health: 0 }, -500);
    expect(result.bankBalance).toBe(0);
    expect(result.debt).toBe(400);
  });
});

describe('tickAnnualEconomy', () => {
  it('adds net salary and subtracts expenses once for adults', () => {
    const result = tickAnnualEconomy(25, 5000, 0, 40000, [], 'US');
    expect(result.salaryGross).toBe(40000);
    expect(result.salaryNet).toBe(Math.round(40000 * (1 - 0.28)));
    expect(result.livingExpenses).toBeGreaterThan(0);
    expect(result.bankBalance).toBe(5000 + result.salaryNet - result.livingExpenses);
  });

  it('accrues debt when cash is exhausted', () => {
    const result = tickAnnualEconomy(25, 0, 0, 0, [], 'US');
    expect(result.livingExpenses).toBeGreaterThan(0);
    expect(result.bankBalance).toBe(0);
    expect(result.debt).toBe(result.livingExpenses);
  });

  it('has no expenses for children under 13', () => {
    const result = tickAnnualEconomy(10, 1000, 0, 0, [], 'US');
    expect(result.livingExpenses).toBe(0);
    expect(result.bankBalance).toBe(1000);
  });

  it('applies partial expenses for young adults', () => {
    const child = tickAnnualEconomy(10, 1000, 0, 0, [], 'US');
    const youngAdult = tickAnnualEconomy(18, 1000, 0, 0, [], 'US');
    expect(youngAdult.livingExpenses).toBeGreaterThan(child.livingExpenses);
  });
});

describe('checkDebtCrisis', () => {
  it('flags crisis when total debt exceeds regional limit', () => {
    const crisis = checkDebtCrisis({
      bankBalance: 0,
      debt: 500_000,
      assets: [],
      countryCode: 'US',
    });
    expect(crisis.limit).toBeGreaterThan(0);
    expect(crisis.crisis).toBe(crisis.totalDebt >= crisis.limit);
  });
});

describe('investInMarket', () => {
  it('rejects when amount exceeds cash (no debt leverage)', () => {
    const result = investInMarket(
      { bankBalance: 100, assets: [], age: 25, countryCode: 'US', debt: 0 },
      50_000_000,
    );
    expect(result.ok).toBe(false);
  });

  it('creates investment asset when funded', () => {
    const result = investInMarket(
      { bankBalance: 50000, assets: [], age: 25, countryCode: 'US', debt: 0 },
      10000,
    );
    expect(result.ok).toBe(true);
    expect(result.bankBalance).toBe(40000);
    expect(result.asset?.type).toBe('investment');
  });

  it('allows small investments above the floor', () => {
    const result = investInMarket(
      { bankBalance: 500, assets: [], age: 25, countryCode: 'US', debt: 0 },
      10,
    );
    expect(result.ok).toBe(true);
    expect(result.bankBalance).toBe(490);
  });
});

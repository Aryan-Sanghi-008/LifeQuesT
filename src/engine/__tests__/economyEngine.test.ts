import {
  clamp,
  applyEffect,
  computeNetWorth,
  tickAnnualEconomy,
} from '@engine/economyEngine';
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
      assets: [
        { id: '1', type: 'property', name: 'House', value: 200000, debt: 50000, purchasedAge: 30 },
      ],
    });
    expect(net).toBe(160000);
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
});

describe('tickAnnualEconomy', () => {
  it('adds salary and subtracts expenses for adults', () => {
    const result = tickAnnualEconomy(25, 5000, 40000, []);
    expect(result.bankBalance).toBe(5000 + 40000 - 12000);
    expect(result.netWorth).toBe(result.bankBalance);
  });

  it('has no expenses for children', () => {
    const result = tickAnnualEconomy(10, 1000, 0, []);
    expect(result.bankBalance).toBe(1000);
  });
});

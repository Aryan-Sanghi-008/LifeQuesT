import { createTestCharacter } from '../../test/fixtures/character';
import {
  resolveEquippedPerks,
  stackWeight,
  applyEquippedStatPerks,
  getPerksForAsset,
} from '@engine/equippedPerksEngine';
import { getVehicleById } from '@data/vehicles';
import { clamp } from '@engine/economyEngine';
import type { Asset } from '@/types';

function vehicleAsset(catalogId: string, equippedOrder: number): Asset {
  const def = getVehicleById(catalogId)!;
  return {
    id: `a_${catalogId}`,
    type: 'vehicle',
    name: def.name,
    value: def.baseValueUsd,
    purchasedAge: 20,
    catalogId,
    equipped: true,
    equippedOrder,
  };
}

describe('equippedPerksEngine', () => {
  it('stackWeight is 100/90/80… with 10% floor', () => {
    expect(stackWeight(1)).toBe(1);
    expect(stackWeight(2)).toBeCloseTo(0.9);
    expect(stackWeight(3)).toBeCloseTo(0.8);
    expect(stackWeight(10)).toBe(0.1);
    expect(stackWeight(20)).toBe(0.1);
  });

  it('supercar status perks beat hatchback at runtime', () => {
    const hatch = getPerksForAsset(vehicleAsset('hatchback', 1));
    const superCar = getPerksForAsset(vehicleAsset('supercar', 1));
    const hatchLooks = hatch.reduce((s, p) => s + (p.annualStatEffect?.looks ?? 0), 0);
    const superLooks = superCar.reduce((s, p) => s + (p.annualStatEffect?.looks ?? 0), 0);
    const hatchFame = hatch.reduce((s, p) => s + (p.fameBonus ?? 0), 0);
    const superFame = superCar.reduce((s, p) => s + (p.fameBonus ?? 0), 0);
    expect(superLooks).toBeGreaterThan(hatchLooks);
    expect(superFame).toBeGreaterThan(hatchFame);
  });

  it('same-tier items differ by role (cargo van income vs coupe looks)', () => {
    const van = getPerksForAsset(vehicleAsset('van_cargo', 1));
    const coupe = getPerksForAsset(vehicleAsset('coupe', 1));
    const vanIncome = van.reduce((s, p) => s + (p.incomeBonusPct ?? 0), 0);
    const coupeLooks = coupe.reduce((s, p) => s + (p.annualStatEffect?.looks ?? 0), 0);
    const vanLooks = van.reduce((s, p) => s + (p.annualStatEffect?.looks ?? 0), 0);
    expect(vanIncome).toBeGreaterThan(0);
    expect(coupeLooks).toBeGreaterThan(vanLooks);
  });

  it('second equipped vehicle contributes at 90%', () => {
    const char = createTestCharacter({
      age: 25,
      assets: [vehicleAsset('hatchback', 1), vehicleAsset('supercar', 2)],
    });
    const effects = resolveEquippedPerks(char);
    expect(effects.slots).toHaveLength(2);
    expect(effects.slots[0].weight).toBe(1);
    expect(effects.slots[1].weight).toBeCloseTo(0.9);
  });

  it('applyEquippedStatPerks changes looks/social not only happiness', () => {
    const char = createTestCharacter({
      age: 30,
      assets: [vehicleAsset('supercar', 1)],
      stats: {
        health: 70,
        happiness: 50,
        intelligence: 50,
        wealth: 40,
        fitness: 50,
        looks: 40,
        social: 40,
        ambition: 40,
        mentalHealth: 60,
      },
    });
    const next = applyEquippedStatPerks(char.stats, char, clamp);
    expect(next.looks).toBeGreaterThan(char.stats.looks);
    expect(next.social).toBeGreaterThan(char.stats.social);
    expect(next.happiness).toBeGreaterThan(char.stats.happiness);
  });

  it('featured franchise applies industry perk', () => {
    const char = createTestCharacter({
      age: 30,
      assets: [],
      businesses: [
        {
          id: 'b1',
          name: 'FitZone Gym',
          revenue: 100000,
          expenses: 60000,
          valuation: 200000,
          employees: [],
          payrollMonthly: 0,
          foundedAge: 25,
          franchiseId: 'fran_gym',
          industry: 'Fitness',
          equipped: true,
          equippedOrder: 1,
        },
      ],
    });
    const effects = resolveEquippedPerks(char);
    expect(effects.statPatch.fitness ?? 0).toBeGreaterThan(0);
    expect(effects.slots.some((s) => s.kind === 'business')).toBe(true);
  });
});

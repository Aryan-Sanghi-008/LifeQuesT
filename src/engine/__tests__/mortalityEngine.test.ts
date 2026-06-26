import { computeDeathChance } from '@engine/mortalityEngine';

const healthyStats = { health: 80, fitness: 70, mentalHealth: 70 };
const poorStats = { health: 30, fitness: 25, mentalHealth: 50 };

describe('mortalityEngine', () => {
  it('returns negligible chance for young adults', () => {
    expect(computeDeathChance(25, healthyStats)).toBeCloseTo(0.1, 1);
  });

  it('increases death chance with age', () => {
    expect(computeDeathChance(70, healthyStats)).toBeGreaterThan(computeDeathChance(45, healthyStats));
  });

  it('low health increases death chance at same age', () => {
    expect(computeDeathChance(70, poorStats)).toBeGreaterThan(computeDeathChance(70, healthyStats));
  });

  it('applies elderly floor at age 95+', () => {
    expect(computeDeathChance(100, healthyStats)).toBeGreaterThanOrEqual(8);
  });
});

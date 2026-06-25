import { tickMentalHealth, applyMentalHealthRecovery } from '@engine/mentalHealthEngine';

describe('mentalHealthEngine', () => {
  const base = {
    health: 50, happiness: 50, intelligence: 50, wealth: 50,
    fitness: 50, looks: 50, social: 50, ambition: 50, mentalHealth: 70,
  };

  it('decays when happiness is low', () => {
    const result = tickMentalHealth({ ...base, happiness: 20 });
    expect(result.mentalHealth).toBeLessThan(70);
  });

  it('recovers with positive amount', () => {
    const result = applyMentalHealthRecovery(base, 10);
    expect(result.mentalHealth).toBe(80);
  });
});

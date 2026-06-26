import { foundBusiness as createBusiness, tickBusinessYear, canFoundBusiness } from '@engine/businessEngine';
import { createTestCharacter } from '../../test/fixtures/character';

const entrepreneur = () => createTestCharacter({
  job: 'Entrepreneur',
  age: 30,
  birthYear: 1995,
  educationLevel: 'graduate',
  bankBalance: 1000,
  eventHistory: [{ id: 'startup', age: 28, title: 'Startup', description: '', statEffect: {}, category: 'career', color: '#fff', timestamp: 1 }],
});

describe('businessEngine', () => {
  it('allows entrepreneur to found business', () => {
    expect(canFoundBusiness(entrepreneur())).toBe(true);
    const biz = createBusiness(entrepreneur(), 'Acme Co');
    expect(biz?.name).toBe('Acme Co');
  });

  it('allows entrepreneur career object without legacy job string', () => {
    const path = { title: 'Entrepreneur', company: 'Self-Employed', salary: 0, yearsEmployed: 2, performance: 60 };
    const char = createTestCharacter({
      job: 'Unemployed',
      career: path,
      age: 30,
      stats: { health: 70, happiness: 70, intelligence: 60, wealth: 40, fitness: 60, looks: 60, social: 50, ambition: 85, mentalHealth: 70 },
    });
    expect(canFoundBusiness(char)).toBe(true);
  });

  it('ticks business year', () => {
    const biz = createBusiness(entrepreneur(), 'Acme Co')!;
    const { business } = tickBusinessYear(biz);
    expect(business.valuation).toBeGreaterThan(0);
  });
});
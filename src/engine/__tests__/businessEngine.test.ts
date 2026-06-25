import { foundBusiness as createBusiness, tickBusinessYear, canFoundBusiness } from '@engine/businessEngine';
import type { Character } from '../../types';

const entrepreneur = (): Character => ({
  id: '1', name: 'Test', gender: 'male', avatarSeed: 's', avatarId: 'male_1',
  lifeStage: 'adult', country: 'India', countryFlag: '🇮🇳', countryCode: 'IN',
  zodiac: 'Aries', familyBackground: 'middle', traits: [], job: 'Entrepreneur', age: 30,
  birthYear: 1995,
  stats: { health: 50, happiness: 50, intelligence: 50, wealth: 50, fitness: 50, looks: 50, social: 50, ambition: 50, mentalHealth: 70 },
  karma: 50, bankBalance: 1000, netWorthPeak: 1000, relationships: 0, children: 0,
  educationLevel: 'graduate', people: [], career: null, assets: [], achievements: [],
  eventHistory: [{ id: 'startup', age: 28, title: 'Startup', description: '', statEffect: {}, category: 'career', color: '#fff', timestamp: 1 }],
  isAlive: true, coins: 0, gems: 0, isPremium: false, hasNoAds: false,
  luckBoostsRemaining: 0, hasReincarnationScroll: false, businesses: [], socialFollowers: 0,
  createdAt: 1, updatedAt: 1,
});

describe('businessEngine', () => {
  it('allows entrepreneur to found business', () => {
    expect(canFoundBusiness(entrepreneur())).toBe(true);
    const biz = createBusiness(entrepreneur(), 'Acme Co');
    expect(biz?.name).toBe('Acme Co');
  });

  it('ticks business year', () => {
    const biz = createBusiness(entrepreneur(), 'Acme Co')!;
    const { business } = tickBusinessYear(biz);
    expect(business.valuation).toBeGreaterThan(0);
  });
});

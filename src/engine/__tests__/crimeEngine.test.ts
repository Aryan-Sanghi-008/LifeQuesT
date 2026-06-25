import { recordCrime, isInJail, tickJail } from '@engine/crimeEngine';
import type { Character } from '../../types';

const baseChar = (): Character => ({
  id: '1', name: 'Test', gender: 'male', avatarSeed: 's', avatarId: 'male_1',
  lifeStage: 'adult', country: 'India', countryFlag: '🇮🇳', countryCode: 'IN',
  zodiac: 'Aries', familyBackground: 'middle', traits: [], job: 'Engineer', age: 25,
  birthYear: 2000,
  stats: { health: 50, happiness: 50, intelligence: 50, wealth: 50, fitness: 50, looks: 50, social: 50, ambition: 50, mentalHealth: 70 },
  karma: 50, bankBalance: 1000, netWorthPeak: 1000, relationships: 0, children: 0,
  educationLevel: 'graduate', people: [], career: null, assets: [], achievements: [],
  eventHistory: [], isAlive: true, coins: 0, gems: 0, isPremium: false, hasNoAds: false,
  luckBoostsRemaining: 0, hasReincarnationScroll: false, businesses: [], socialFollowers: 0,
  criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
  createdAt: 1, updatedAt: 1,
});

describe('crimeEngine', () => {
  it('records crime and applies karma penalty', () => {
    const updated = recordCrime(baseChar(), 'arrest');
    expect(updated.criminalRecord?.crimes).toContain('arrest');
    expect(updated.karma).toBeLessThan(50);
    expect(isInJail(updated)).toBe(true);
  });

  it('ticks jail years down', () => {
    let char = recordCrime(baseChar(), 'arrest');
    char = tickJail(char);
    expect(char.criminalRecord?.jailYearsRemaining).toBe(1);
  });
});

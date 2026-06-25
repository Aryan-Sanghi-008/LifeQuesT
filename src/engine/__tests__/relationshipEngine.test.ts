import { advanceRelationship, processDivorce, getRelationshipStageLabel } from '@engine/relationshipEngine';
import type { Person } from '../../types';

const partner: Person = {
  id: 'p1', name: 'Sam', age: 25, gender: 'female', relationType: 'partner',
  relationshipScore: 60, avatarSeed: 'sam', isAlive: true, relationshipStage: 'dating',
};

describe('relationshipEngine', () => {
  it('advances dating to married', () => {
    const engaged = advanceRelationship(partner, 'propose');
    expect(engaged.relationshipStage).toBe('engaged');
    const married = advanceRelationship(engaged, 'marry');
    expect(married.relationshipStage).toBe('married');
    expect(married.relationType).toBe('spouse');
  });

  it('labels stages', () => {
    expect(getRelationshipStageLabel('married')).toBe('Married');
  });

  it('processes divorce', () => {
    const spouse = { ...partner, relationType: 'spouse' as const, relationshipStage: 'married' as const };
    const char = {
      id: '1', name: 'Test', gender: 'male' as const, avatarSeed: 's', avatarId: 'male_1' as const,
      lifeStage: 'adult' as const, country: 'IN', countryFlag: '🇮🇳', countryCode: 'IN',
      zodiac: 'Aries', familyBackground: 'middle' as const, traits: [], job: 'Engineer', age: 30,
      birthYear: 1995,
      stats: { health: 50, happiness: 50, intelligence: 50, wealth: 50, fitness: 50, looks: 50, social: 50, ambition: 50, mentalHealth: 70 },
      karma: 50, bankBalance: 0, netWorthPeak: 0, relationships: 1, children: 0,
      educationLevel: 'graduate' as const, people: [spouse], career: null, assets: [], achievements: [],
      eventHistory: [], isAlive: true, coins: 0, gems: 0, isPremium: false, hasNoAds: false,
      luckBoostsRemaining: 0, hasReincarnationScroll: false, businesses: [], socialFollowers: 0,
      createdAt: 1, updatedAt: 1,
    };
    const result = processDivorce(char, spouse.id);
    expect(result.people[0].relationshipStage).toBe('divorced');
    expect(result.stats.happiness).toBeLessThan(50);
  });
});

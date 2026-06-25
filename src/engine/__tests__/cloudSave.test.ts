import { resolveSaveConflict } from '@utils/saveSync';
import type { Character } from '../../types';

const makeChar = (id: string, updatedAt: number): Character => ({
  id,
  name: id,
  gender: 'male',
  avatarSeed: id,
  avatarId: 'male_1',
  lifeStage: 'adult',
  country: 'India',
  countryFlag: '🇮🇳',
  countryCode: 'IN',
  zodiac: 'aries',
  familyBackground: 'middle',
  traits: [],
  job: 'Student',
  age: 20,
  birthYear: 2000,
  stats: {
    health: 50, happiness: 50, intelligence: 50, wealth: 50,
    fitness: 50, looks: 50, social: 50, ambition: 50,
  },
  karma: 50,
  bankBalance: 0,
  netWorthPeak: 0,
  relationships: 0,
  children: 0,
  educationLevel: 'none',
  people: [],
  career: null,
  assets: [],
  achievements: [],
  eventHistory: [],
  isAlive: true,
  coins: 0,
  gems: 0,
  isPremium: false,
  hasNoAds: false,
  luckBoostsRemaining: 0,
  hasReincarnationScroll: false,
  createdAt: updatedAt,
  updatedAt,
});

describe('resolveSaveConflict', () => {
  it('returns null when both saves are missing', () => {
    expect(resolveSaveConflict(null, null, 0, 0)).toBeNull();
  });

  it('returns cloud when only cloud exists', () => {
    const cloud = makeChar('cloud', 100);
    expect(resolveSaveConflict(null, cloud, 0, 100)?.id).toBe('cloud');
  });

  it('returns local when only local exists', () => {
    const local = makeChar('local', 100);
    expect(resolveSaveConflict(local, null, 100, 0)?.id).toBe('local');
  });

  it('picks newer updatedAt', () => {
    const local = makeChar('local', 100);
    const cloud = makeChar('cloud', 200);
    expect(resolveSaveConflict(local, cloud, 100, 200)?.id).toBe('cloud');
    expect(resolveSaveConflict(local, cloud, 300, 200)?.id).toBe('local');
  });
});

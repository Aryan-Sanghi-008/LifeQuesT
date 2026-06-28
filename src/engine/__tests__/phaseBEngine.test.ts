import { createPropertyAsset, calculateMortgagePayment, tickPropertyYear } from '@engine/housingEngine';
import { PROPERTY_CATALOG } from '@data/properties';
import { startLegalCase, resolveTrial, hireLawyer } from '@engine/legalEngine';
import { practiceHobby, canPracticeHobby } from '@engine/hobbyEngine';
import { createPost } from '@engine/socialMediaEngine';
import { careForPet, initPetStats } from '@engine/petEngine';
import { hireEmployee, normalizeBusinessEmployees } from '@engine/businessEngine';
import { getAllCareerPaths } from '@data/careerPaths';
import { createTestCharacter } from '../../test/fixtures/character';

describe('Phase B housingEngine', () => {
  it('creates property asset with mortgage', () => {
    const def = PROPERTY_CATALOG[0];
    const { asset, downPayment } = createPropertyAsset(def, 25);
    expect(asset.type).toBe('property');
    expect(asset.debt).toBeGreaterThan(0);
    expect(downPayment).toBe(Math.round(def.value * def.downPaymentPct));
  });

  it('calculates mortgage payment', () => {
    const monthly = calculateMortgagePayment(100000, 0.06, 25);
    expect(monthly).toBeGreaterThan(0);
  });

  it('ticks property year', () => {
    const def = PROPERTY_CATALOG[5];
    const { asset } = createPropertyAsset(def, 30);
    const next = tickPropertyYear(asset);
    expect(next.value).toBeGreaterThan(0);
  });
});

describe('Phase B legalEngine', () => {
  it('starts and resolves trial', () => {
    const char = createTestCharacter({ age: 25 });
    const legalCase = startLegalCase(char, 'shoplifting');
    const withLawyer = hireLawyer(legalCase, 2);
    const verdict = resolveTrial(char, withLawyer);
    expect(typeof verdict.guilty).toBe('boolean');
    expect(verdict.message.length).toBeGreaterThan(0);
  });
});

describe('Phase B hobbyEngine', () => {
  it('practices hobby once per age', () => {
    const char = createTestCharacter({ age: 16, hobbyProgress: {} });
    expect(canPracticeHobby(char, 'sports_basketball')).toBe(true);
    const result = practiceHobby(char, 'sports_basketball');
    expect(result?.progress.xp).toBeGreaterThan(0);
    const again = practiceHobby({ ...char, hobbyProgress: { sports_basketball: result!.progress } }, 'sports_basketball');
    expect(again).toBeNull();
  });
});

describe('Phase B socialMediaEngine', () => {
  it('creates post with follower delta', () => {
    const char = createTestCharacter({ age: 20, socialFollowers: 100 });
    const { post, followerDelta } = createPost(char, 'Hello world');
    expect(post.content).toBe('Hello world');
    expect(followerDelta).toBeGreaterThanOrEqual(0);
  });
});

describe('Phase B petEngine', () => {
  it('cares for pet', () => {
    const pet = {
      id: 'pet1',
      name: 'Buddy',
      age: 3,
      gender: 'animal' as const,
      relationType: 'pet' as const,
      relationshipScore: 80,
      isAlive: true,
      avatarSeed: 'buddy',
      occupation: 'dog',
      interactionCooldowns: {},
      dna: createTestCharacter().dna,
      personality: createTestCharacter().personality,
      goals: [],
      mood: 'Happy',
      memoriesOfPlayer: [],
      secrets: [],
      discoveredSecrets: [],
      petStats: initPetStats(),
    };
    const updated = careForPet(pet, 'feed');
    expect(updated.petStats!.health).toBeGreaterThanOrEqual(pet.petStats!.health);
  });
});

describe('Phase B businessEngine', () => {
  it('migrates numeric employees', () => {
    const migrated = normalizeBusinessEmployees(3);
    expect(migrated).toHaveLength(3);
    expect(migrated[0].role).toBe('CEO');
  });

  it('hires employee', () => {
    const biz = {
      id: 'b1',
      name: 'Co',
      revenue: 50000,
      expenses: 30000,
      valuation: 150000,
      employees: normalizeBusinessEmployees(1),
      payrollMonthly: 0,
      foundedAge: 25,
    };
    const next = hireEmployee(biz, 'Sales');
    expect(next.employees.length).toBe(2);
  });
});

describe('Phase B careers', () => {
  it('has at least 120 career paths', () => {
    expect(getAllCareerPaths().length).toBeGreaterThanOrEqual(120);
  });
});

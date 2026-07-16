jest.mock('@services/persistence', () =>
  require('@test/mockSliceServices').persistenceMock,
);

jest.mock('@services/cloudSave', () =>
  require('@test/mockSliceServices').cloudSaveMock,
);

jest.mock('@services/entitlements', () =>
  require('@test/mockSliceServices').entitlementsMock,
);

import { useGameStore } from '@store/gameStore';
import { createTestCharacter } from '@test/fixtures/character';
import { seedGameStore } from '@test/seedGameStore';

describe('careerSlice', () => {
  beforeEach(() => {
    seedGameStore({
      character: createTestCharacter({
        age: 22,
        job: 'Unemployed',
        career: null,
        educationStage: 'diploma',
        degreeIds: ['diploma_cs'],
        stats: {
          health: 70,
          happiness: 70,
          intelligence: 85,
          wealth: 40,
          fitness: 60,
          looks: 60,
          social: 50,
          ambition: 50,
          mentalHealth: 70,
        },
      }),
    });
  });

  it('rejects job application when too young', () => {
    seedGameStore({
      character: createTestCharacter({ age: 14 }),
    });
    const result = useGameStore.getState().applyForJob('junior_dev');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/too young/i);
  });

  it('applyForJob succeeds when eligible and hire roll passes', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.01);
    const result = useGameStore.getState().applyForJob('junior_dev');
    expect(result.success).toBe(true);
    expect(useGameStore.getState().character?.job).toBe('Junior Developer');
    expect(useGameStore.getState().character?.career?.title).toBeTruthy();
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('quitJob clears current job', () => {
    seedGameStore({
      character: createTestCharacter({
        job: 'Developer',
        career: {
          title: 'Developer',
          salary: 50000,
          performance: 50,
          yearsEmployed: 1,
          company: 'Co',
        },
      }),
    });
    useGameStore.getState().quitJob();
    expect(useGameStore.getState().character?.job).toBe('Unemployed');
    expect(useGameStore.getState().character?.career).toBeNull();
  });

  it('applyForPromotion succeeds with high performance and lucky roll', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.01);
    seedGameStore({
      character: createTestCharacter({
        age: 26,
        job: 'Junior Developer',
        educationStage: 'undergraduate',
        educationLevel: 'university',
        degreeIds: ['bsc_cs'],
        totalCareerYears: 3,
        career: {
          title: 'Junior Developer',
          salary: 50000,
          performance: 70,
          yearsEmployed: 3,
          company: 'Tech Corp',
        },
        stats: {
          health: 70,
          happiness: 70,
          intelligence: 85,
          wealth: 40,
          fitness: 60,
          looks: 60,
          social: 50,
          ambition: 50,
          mentalHealth: 70,
        },
      }),
    });

    const result = useGameStore.getState().applyForPromotion();
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/promot/i);
    jest.spyOn(Math, 'random').mockRestore();
  });
});

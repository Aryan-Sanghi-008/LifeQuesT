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

describe('activitySlice', () => {
  beforeEach(() => {
    seedGameStore({
      character: createTestCharacter({ age: 20, coins: 5000 }),
    });
  });

  it('setAspirations rejects identical primary and secondary', () => {
    const result = useGameStore.getState().setAspirations('fortune', 'fortune');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/different/i);
  });

  it('setAspirations stores valid pair', () => {
    const result = useGameStore.getState().setAspirations('fortune', 'fame');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character?.aspirations?.primary).toBe('fortune');
    expect(useGameStore.getState().character?.aspirations?.secondary).toBe('fame');
  });

  it('performActivity applies library visit stats', () => {
    const beforeIntel = useGameStore.getState().character?.stats.intelligence ?? 0;
    const result = useGameStore.getState().performActivity('library');
    expect(result.success).toBe(true);
    expect(useGameStore.getState().character?.stats.intelligence).toBeGreaterThan(beforeIntel);
  });

  it('confirmFocusAndAct for child auto-confirms focus', () => {
    seedGameStore({
      character: createTestCharacter({
        age: 10,
        lifePhase: 'planning',
        focusConfirmedForAge: -1,
      }),
    });

    const result = useGameStore.getState().confirmFocusAndAct();
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character?.lifePhase).toBe('acting');
    expect(useGameStore.getState().character?.focusConfirmedForAge).toBe(10);
  });

  it('playAsHeir continues legacy as chosen child', () => {
    seedGameStore({
      character: createTestCharacter({
        isAlive: false,
        age: 72,
        people: [
          {
            id: 'heir-1',
            name: 'Jamie',
            relationType: 'child',
            isAlive: true,
            age: 30,
            gender: 'female',
            relationshipScore: 80,
            avatarSeed: 'heir-1',
          },
        ],
      }),
    });

    const result = useGameStore.getState().playAsHeir('heir-1');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character?.name).toBe('Jamie');
    expect(useGameStore.getState().character?.isAlive).toBe(true);
  });
});

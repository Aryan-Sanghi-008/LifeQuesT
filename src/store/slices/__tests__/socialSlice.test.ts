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

describe('socialSlice', () => {
  beforeEach(() => {
    seedGameStore({
      character: createTestCharacter({ socialFollowers: 10 }),
    });
  });

  it('createSocialPost updates followers', () => {
    const result = useGameStore.getState().createSocialPost('Hello world!');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character?.socialFollowers).toBeGreaterThanOrEqual(10);
  });

  it('returns error when no character for social post', () => {
    useGameStore.setState({ character: null });
    const result = useGameStore.getState().createSocialPost('Hello');
    expect(result.ok).toBe(false);
  });

  it('interactWithPerson updates relationship score on success', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    seedGameStore({
      character: createTestCharacter({
        people: [
          {
            id: 'friend-1',
            name: 'Alex',
            age: 25,
            gender: 'male',
            relationType: 'friend',
            relationshipScore: 50,
            avatarSeed: 'friend-1',
            isAlive: true,
          },
        ],
      }),
    });

    const result = useGameStore.getState().interactWithPerson('friend-1', 'compliment');
    expect(result.message).toMatch(/touched/i);
    expect(useGameStore.getState().character?.people[0]?.relationshipScore).toBeGreaterThan(50);

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('practiceHobby levels up hobby progress', () => {
    seedGameStore({
      character: createTestCharacter({
        age: 20,
        hobbyProgress: {},
      }),
    });

    const result = useGameStore.getState().practiceHobby('sports_basketball');
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/level/i);
    expect(useGameStore.getState().character?.hobbyProgress?.sports_basketball?.level).toBeGreaterThanOrEqual(1);
  });
});

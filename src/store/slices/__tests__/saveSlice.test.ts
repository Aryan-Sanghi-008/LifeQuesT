jest.mock('@services/persistence', () =>
  require('@test/mockSliceServices').persistenceMock,
);

jest.mock('@services/widgetSnapshot', () => ({
  writeWidgetSnapshot: jest.fn(),
}));

jest.mock('@services/cloudSave', () =>
  require('@test/mockSliceServices').cloudSaveMock,
);

jest.mock('@services/notificationSync', () =>
  require('@test/mockSliceServices').notificationSyncMock,
);

jest.mock('@services/entitlements', () =>
  require('@test/mockSliceServices').entitlementsMock,
);

import { useGameStore } from '@store/gameStore';
import { createTestCharacter } from '@test/fixtures/character';
import { seedGameStore } from '@test/seedGameStore';
import {
  persistenceMock,
  cloudSaveMock,
} from '@test/mockSliceServices';

describe('saveSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    seedGameStore({
      character: createTestCharacter(),
      activeSlotId: '0',
      syncConflict: null,
      slotList: [],
    });
  });

  it('resetGame clears active character state', async () => {
    await useGameStore.getState().resetGame();
    const state = useGameStore.getState();
    expect(state.character).toBeNull();
    expect(state.pendingDecision).toBeNull();
    expect(state.isProcessing).toBe(false);
  });

  it('resolveConflictChoice applies selected save', () => {
    const local = createTestCharacter({ name: 'Local Save' });
    const cloud = createTestCharacter({ name: 'Cloud Save' });
    useGameStore.setState({
      syncConflict: {
        local,
        cloud,
        resolve: jest.fn(),
      },
    });

    useGameStore.getState().resolveConflictChoice('cloud');
    expect(useGameStore.getState().character?.name).toBe('Cloud Save');
    expect(useGameStore.getState().syncConflict).toBeNull();
  });

  it('loadSlot loads character from persistence', async () => {
    const saved = createTestCharacter({ name: 'Slot Two Hero' });
    (persistenceMock.loadCharacterLocal as jest.Mock).mockReturnValueOnce(saved);

    await useGameStore.getState().loadSlot('1');

    expect(persistenceMock.setActiveSlotId).toHaveBeenCalledWith('1');
    expect(useGameStore.getState().activeSlotId).toBe('1');
    expect(useGameStore.getState().character?.name).toBe('Slot Two Hero');
  });

  it('deleteSlot clears character when deleting active slot', async () => {
    seedGameStore({
      character: createTestCharacter({ name: 'To Delete' }),
      activeSlotId: '1',
    });

    await useGameStore.getState().deleteSlot('1');

    expect(persistenceMock.deleteCharacterLocal).toHaveBeenCalledWith('1');
    expect(useGameStore.getState().character).toBeNull();
    expect(cloudSaveMock.deleteCloudSave).not.toHaveBeenCalled();
  });
});

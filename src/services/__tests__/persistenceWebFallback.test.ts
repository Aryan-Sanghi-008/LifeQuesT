jest.mock('@utils/nativeAvailability', () => ({
  isMmkvAvailable: () => false,
}));

jest.mock('react-native-mmkv', () => {
  throw new Error('MMKV unavailable in test');
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveCharacterLocal,
  loadCharacterLocal,
  hydratePersistence,
} from '../persistence';
import { createTestCharacter } from '../../test/fixtures/character';

describe('persistence web fallback', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('reads and writes via AsyncStorage-backed fallback when MMKV is unavailable', async () => {
    const character = createTestCharacter({ name: 'Web Fallback Hero' });
    saveCharacterLocal(character, '0');

    const stored = await AsyncStorage.getItem('save_slot_0');
    expect(stored).toBeTruthy();

    await hydratePersistence();
    const loaded = loadCharacterLocal('0');
    expect(loaded?.name).toBe('Web Fallback Hero');
  });
});

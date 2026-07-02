import {
  readCachedLiveOpsConfig,
  fetchLiveOpsConfig,
} from '@services/liveOpsConfig';
import { getFallbackLiveOpsConfig, getCurrentSeason } from '@engine/liveOpsEngine';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));

jest.mock('@services/firebaseClient', () => ({
  getFirestoreDb: jest.fn(() => null),
}));

describe('liveOpsConfig', () => {
  it('falls back to hardcoded season when Firestore is unavailable', async () => {
    const config = await fetchLiveOpsConfig();
    expect(config.season.id).toBe(getFallbackLiveOpsConfig().season.id);
    expect(getCurrentSeason().id).toBe(config.season.id);
  });

  it('returns null for invalid cache parse', () => {
    expect(readCachedLiveOpsConfig()).toBeNull();
  });
});

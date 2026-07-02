import { resolveSaveConflict, reconcileLocalAndCloudSave } from '@utils/saveSync';
import { createTestCharacter } from '../../test/fixtures/character';

const makeChar = (id: string, updatedAt: number) => createTestCharacter({
  id,
  name: id,
  avatarSeed: id,
  age: 20,
  birthYear: 2000,
  educationLevel: 'none',
  bankBalance: 0,
  netWorthPeak: 0,
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

  it('prefers higher version when checksums differ', () => {
    const local = makeChar('local', 100);
    const cloud = makeChar('cloud', 100);
    expect(
      resolveSaveConflict(local, cloud, 100, 100, {
        localVersion: 1,
        cloudVersion: 2,
        localChecksum: 'a',
        cloudChecksum: 'b',
      })?.id,
    ).toBe('cloud');
  });
});

describe('reconcileLocalAndCloudSave', () => {
  it('returns conflict when checksums differ within 60s', () => {
    const local = makeChar('local', 1000);
    const cloud = makeChar('cloud', 1050);
    const result = reconcileLocalAndCloudSave(local, cloud, {
      updatedAt: 1050,
      checksum: 'cloud-checksum',
    });
    expect(result.action).toBe('conflict');
  });

  it('auto-picks winner when timestamps differ beyond 60s', () => {
    const local = makeChar('local', 1000);
    const cloud = makeChar('cloud', 200000);
    const result = reconcileLocalAndCloudSave(local, cloud, {
      updatedAt: 200000,
      version: 2,
      checksum: 'cloud-checksum',
    });
    expect(result.action).toBe('use');
    if (result.action === 'use') {
      expect(result.character.id).toBe('cloud');
    }
  });
});
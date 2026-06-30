import { resolveSaveConflict } from '@utils/saveSync';
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
});
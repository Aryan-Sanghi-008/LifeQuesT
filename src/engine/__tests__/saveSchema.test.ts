import { simpleHash } from '@utils/checksum';
import { SAVE_SCHEMA_VERSION } from '@constants/saveSchema';
import { createTestCharacter } from '../../test/fixtures/character';

describe('save schema helpers', () => {
  it('simpleHash is stable for the same character payload', () => {
    const char = createTestCharacter({ name: 'Hash Test' });
    expect(simpleHash(char)).toBe(simpleHash(char));
  });

  it('simpleHash changes when character data changes', () => {
    const a = createTestCharacter({ name: 'A' });
    const b = createTestCharacter({ name: 'B' });
    expect(simpleHash(a)).not.toBe(simpleHash(b));
  });

  it('SAVE_SCHEMA_VERSION is a positive integer', () => {
    expect(SAVE_SCHEMA_VERSION).toBeGreaterThan(0);
  });
});

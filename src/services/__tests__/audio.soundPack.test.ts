import { resolveSoundPackId, migrateEquippedSoundPackId } from '@data/soundPacks';

describe('audio sound pack resolution', () => {
  it('maps equipped jazz cosmetic to jazz pack', () => {
    expect(resolveSoundPackId('sound_pack_jazz')).toBe('jazz');
  });

  it('maps classic / null to default', () => {
    expect(resolveSoundPackId(migrateEquippedSoundPackId(null))).toBe('default');
    expect(resolveSoundPackId(migrateEquippedSoundPackId('sound_pack_classic'))).toBe('default');
  });

  it('maps legacy lofi equip id to minimal assets', () => {
    const migrated = migrateEquippedSoundPackId('sound_pack_lofi');
    expect(migrated).toBe('sound_pack_minimal');
    expect(resolveSoundPackId(migrated)).toBe('minimal');
  });
});

import { resolveSoundPackId, SOUND_PACK_PROFILES } from '../soundPacks';

describe('soundPacks', () => {
  it('resolves cosmetic ids to pack ids', () => {
    expect(resolveSoundPackId(null)).toBe('default');
    expect(resolveSoundPackId(undefined)).toBe('default');
    expect(resolveSoundPackId('sound_pack_classic')).toBe('default');
    expect(resolveSoundPackId('sound_pack_minimal')).toBe('minimal');
    expect(resolveSoundPackId('sound_pack_jazz')).toBe('jazz');
    expect(resolveSoundPackId('sound_pack_cinematic')).toBe('cinematic');
  });

  it('has profiles for every resolved pack', () => {
    for (const id of ['default', 'minimal', 'jazz', 'cinematic'] as const) {
      expect(SOUND_PACK_PROFILES[id]).toBeDefined();
      expect(SOUND_PACK_PROFILES[id].label.length).toBeGreaterThan(0);
    }
  });
});

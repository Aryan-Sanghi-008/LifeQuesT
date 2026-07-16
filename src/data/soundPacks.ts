export type SoundPackId = 'default' | 'minimal' | 'jazz' | 'cinematic' | 'lofi';

export interface SoundPackProfile {
  id: SoundPackId;
  label: string;
  volumeScale: number;
  /** Subfolder under assets/sounds/packs — default uses root SOUND_FILES */
  assetFolder?: SoundPackId;
}

export const SOUND_PACK_PROFILES: Record<SoundPackId, SoundPackProfile> = {
  default: { id: 'default', label: 'Classic', volumeScale: 1 },
  minimal: { id: 'minimal', label: 'Minimal', volumeScale: 0.55, assetFolder: 'minimal' },
  jazz: { id: 'jazz', label: 'Jazz', volumeScale: 0.72, assetFolder: 'jazz' },
  cinematic: { id: 'cinematic', label: 'Cinematic', volumeScale: 0.88, assetFolder: 'cinematic' },
  /** @deprecated Legacy pack — resolveSoundPackId maps lofi cosmetic → minimal */
  lofi: { id: 'lofi', label: 'Lo-Fi', volumeScale: 0.62, assetFolder: 'lofi' },
};

/**
 * Normalize persisted equipped sound pack cosmetic IDs.
 * Returns null for Classic / empty (default pack).
 */
export function migrateEquippedSoundPackId(id?: string | null): string | null {
  if (id == null || id === '' || id === 'null' || id === 'sound_pack_classic') {
    return null;
  }
  if (id === 'sound_pack_lofi') return 'sound_pack_minimal';
  return id;
}

export function resolveSoundPackId(cosmeticId?: string | null): SoundPackId {
  const migrated = migrateEquippedSoundPackId(cosmeticId ?? null);
  if (!migrated) return 'default';
  if (migrated === 'sound_pack_minimal') return 'minimal';
  if (migrated === 'sound_pack_jazz') return 'jazz';
  if (migrated === 'sound_pack_cinematic') return 'cinematic';
  // Legacy: treat remaining lofi as minimal (catalog migrated)
  if (migrated === 'sound_pack_lofi') return 'minimal';
  return 'default';
}

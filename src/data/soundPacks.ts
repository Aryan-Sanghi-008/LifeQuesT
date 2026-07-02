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
  lofi: { id: 'lofi', label: 'Lo-Fi', volumeScale: 0.62, assetFolder: 'lofi' },
};

export function resolveSoundPackId(cosmeticId?: string | null): SoundPackId {
  if (!cosmeticId) return 'default';
  if (cosmeticId === 'sound_pack_minimal') return 'minimal';
  if (cosmeticId === 'sound_pack_jazz') return 'jazz';
  if (cosmeticId === 'sound_pack_cinematic') return 'cinematic';
  if (cosmeticId === 'sound_pack_lofi') return 'lofi';
  return 'default';
}

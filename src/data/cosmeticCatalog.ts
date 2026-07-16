import { IAPProductId } from '../types';
import { THEME_SKINS, type ThemeSkinMode, migrateThemeSkinId } from '@theme/themeSkins';

export type CosmeticCategory =
  | 'theme'
  | 'tombstone'
  | 'event_skin'
  | 'name_font'
  | 'sound_pack'
  | 'avatar'
  | 'plus_frame';

export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  label: string;
  description: string;
  gemCost?: number;
  iapProductId?: IAPProductId;
  fallbackPriceLabel?: string;
  previewColor?: string;
  /** Themes only — light vs dark catalog */
  mode?: ThemeSkinMode;
}

/** Map legacy cosmetic unlock IDs → current catalog IDs */
export const LEGACY_COSMETIC_ID_MAP: Record<string, string> = {
  theme_dark_slate: 'theme_obsidian',
  theme_midnight: 'theme_noir_harbor',
  theme_sunrise: 'theme_ivory_dawn',
  sound_pack_lofi: 'sound_pack_minimal',
};

export function migrateCosmeticId(id: string): string {
  return LEGACY_COSMETIC_ID_MAP[id] ?? id;
}

export function migrateCosmeticIdList(ids: string[] | undefined): string[] {
  if (!ids?.length) return [];
  return [...new Set(ids.map(migrateCosmeticId))];
}

const THEME_ITEMS: CosmeticItem[] = (Object.values(THEME_SKINS) as Array<(typeof THEME_SKINS)[keyof typeof THEME_SKINS]>).map((skin) => ({
  id: `theme_${skin.id}`,
  category: 'theme' as const,
  label: skin.label,
  description: skin.description,
  gemCost: 25,
  iapProductId: `cosmetic_theme_${skin.id}` as IAPProductId,
  fallbackPriceLabel: '$0.49',
  previewColor: skin.previewColor,
  mode: skin.mode,
}));

/** Free baseline cosmetics — always owned; equip clears paid selection */
export const FREE_BASELINE_COSMETICS: CosmeticItem[] = [
  {
    id: 'theme_system_default',
    category: 'theme',
    label: 'System Default',
    description: 'Built-in light and dark palette — no skin overlay',
    previewColor: '#94A3B8',
  },
  {
    id: 'sound_pack_classic',
    category: 'sound_pack',
    label: 'Classic',
    description: 'Original LifeQuest UI sounds',
    previewColor: '#64748B',
  },
  {
    id: 'font_default',
    category: 'name_font',
    label: 'Default',
    description: 'Standard LifeQuest typography across the app',
    previewColor: '#64748B',
  },
];

export function isFreeBaselineCosmetic(id: string): boolean {
  return FREE_BASELINE_COSMETICS.some((c) => c.id === id);
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  ...FREE_BASELINE_COSMETICS,
  ...THEME_ITEMS,
  {
    id: 'tombstone_gothic',
    category: 'tombstone',
    label: 'Gothic Spire',
    description: 'Ornate dark stone with pointed silhouette',
    gemCost: 20,
    iapProductId: 'cosmetic_tombstone_gothic',
    fallbackPriceLabel: '$0.49',
    previewColor: '#374151',
  },
  {
    id: 'tombstone_modern',
    category: 'tombstone',
    label: 'Modern Obelisk',
    description: 'Clean geometric memorial stone',
    gemCost: 20,
    iapProductId: 'cosmetic_tombstone_modern',
    fallbackPriceLabel: '$0.49',
    previewColor: '#94A3B8',
  },
  {
    id: 'tombstone_angelic',
    category: 'tombstone',
    label: 'Angelic Marble',
    description: 'Soft luminous marble with wing motif',
    gemCost: 20,
    iapProductId: 'cosmetic_tombstone_angelic',
    fallbackPriceLabel: '$0.49',
    previewColor: '#E2E8F0',
  },
  {
    id: 'event_skin_vintage',
    category: 'event_skin',
    label: 'Parchment',
    description: 'Refined journal parchment event cards',
    gemCost: 20,
    iapProductId: 'cosmetic_event_vintage',
    fallbackPriceLabel: '$0.49',
    previewColor: '#D97706',
  },
  {
    id: 'event_skin_neon',
    category: 'event_skin',
    label: 'Signal HUD',
    description: 'Subtle neon HUD event cards',
    gemCost: 20,
    iapProductId: 'cosmetic_event_neon',
    fallbackPriceLabel: '$0.49',
    previewColor: '#06B6D4',
  },
  {
    id: 'event_skin_watercolor',
    category: 'event_skin',
    label: 'Ink Wash',
    description: 'Soft ink-wash event cards',
    gemCost: 20,
    iapProductId: 'cosmetic_event_watercolor',
    fallbackPriceLabel: '$0.49',
    previewColor: '#8B5CF6',
  },
  {
    id: 'font_serif',
    category: 'name_font',
    label: 'Serif',
    description: 'Elegant serif typography across the app',
    gemCost: 10,
    iapProductId: 'cosmetic_font_serif',
    fallbackPriceLabel: '$0.49',
    previewColor: '#78350F',
  },
  {
    id: 'font_script',
    category: 'name_font',
    label: 'Script',
    description: 'Italic script typography across the app',
    gemCost: 10,
    iapProductId: 'cosmetic_font_script',
    fallbackPriceLabel: '$0.49',
    previewColor: '#BE185D',
  },
  {
    id: 'font_mono',
    category: 'name_font',
    label: 'Mono',
    description: 'Monospace typography across the app',
    gemCost: 10,
    iapProductId: 'cosmetic_font_mono',
    fallbackPriceLabel: '$0.49',
    previewColor: '#1E40AF',
  },
  {
    id: 'sound_pack_minimal',
    category: 'sound_pack',
    label: 'Minimal',
    description: 'Soft, subtle UI sounds',
    gemCost: 20,
    iapProductId: 'cosmetic_sound_minimal',
    fallbackPriceLabel: '$0.49',
    previewColor: '#64748B',
  },
  {
    id: 'sound_pack_jazz',
    category: 'sound_pack',
    label: 'Jazz',
    description: 'Warm, mellow feedback tones',
    gemCost: 20,
    iapProductId: 'cosmetic_sound_jazz',
    fallbackPriceLabel: '$0.49',
    previewColor: '#B45309',
  },
  {
    id: 'sound_pack_cinematic',
    category: 'sound_pack',
    label: 'Cinematic',
    description: 'Punchy dramatic UI sounds',
    gemCost: 20,
    iapProductId: 'cosmetic_sound_cinematic',
    fallbackPriceLabel: '$0.49',
    previewColor: '#7C3AED',
  },
  {
    id: 'plus_cosmetic_frame_gold',
    category: 'plus_frame',
    label: 'Gold Frame',
    description: 'LifeQuest Plus monthly frame',
    previewColor: '#F59E0B',
  },
  {
    id: 'plus_cosmetic_frame_teal',
    category: 'plus_frame',
    label: 'Teal Frame',
    description: 'LifeQuest Plus monthly frame',
    previewColor: '#0EA5E9',
  },
  {
    id: 'plus_cosmetic_frame_orchid',
    category: 'plus_frame',
    label: 'Orchid Frame',
    description: 'LifeQuest Plus monthly frame',
    previewColor: '#8B5CF6',
  },
];

export const COSMETIC_IAP_TO_ID: Partial<Record<IAPProductId, string>> = {
  ...Object.fromEntries(
    COSMETIC_ITEMS
      .filter((c) => c.iapProductId)
      .map((c) => [c.iapProductId!, c.id]),
  ),
  // Legacy Play SKUs → migrated cosmetic ids
  cosmetic_theme_dark_slate: 'theme_obsidian',
  cosmetic_theme_midnight: 'theme_noir_harbor',
  cosmetic_theme_sunrise: 'theme_ivory_dawn',
  cosmetic_sound_lofi: 'sound_pack_minimal',
};

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETIC_ITEMS.find((c) => c.id === migrateCosmeticId(id));
}

export function getCosmeticByIapProduct(productId: IAPProductId): CosmeticItem | undefined {
  const id = COSMETIC_IAP_TO_ID[productId];
  return id ? getCosmeticById(id) : undefined;
}

export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItem[] {
  return COSMETIC_ITEMS.filter((c) => c.category === category);
}

export function getThemeCosmeticsByMode(mode: ThemeSkinMode): CosmeticItem[] {
  const paid = COSMETIC_ITEMS.filter((c) => c.category === 'theme' && c.mode === mode);
  const baseline = FREE_BASELINE_COSMETICS.find((c) => c.id === 'theme_system_default');
  // Show System Default once at the start of the Light themes grid only
  if (mode === 'light' && baseline) return [baseline, ...paid];
  return paid;
}

/** High-contrast text colors for shop cards tinted with a swatch */
export function contrastTextForSwatch(previewColor: string): {
  titleColor: string;
  descColor: string;
  ctaTextColor: string;
} {
  const hex = previewColor.replace('#', '');
  if (hex.length < 6) {
    return { titleColor: '#0F172A', descColor: '#334155', ctaTextColor: '#0F172A' };
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  if (L > 0.45) {
    return { titleColor: '#0F172A', descColor: '#334155', ctaTextColor: '#0F172A' };
  }
  return { titleColor: '#F8FAFC', descColor: '#CBD5E1', ctaTextColor: '#F8FAFC' };
}

export function getPlusFrameColor(frameCosmeticId?: string | null): string | null {
  const item = frameCosmeticId ? getCosmeticById(frameCosmeticId) : undefined;
  return item?.previewColor ?? null;
}

export function resolveEquippedThemeMode(appThemeId: string): ThemeSkinMode | null {
  const skinId = migrateThemeSkinId(appThemeId);
  if (skinId === 'default') return null;
  return THEME_SKINS[skinId as keyof typeof THEME_SKINS]?.mode ?? null;
}

import { IAPProductId } from '../types';

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
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  {
    id: 'theme_dark_slate',
    category: 'theme',
    label: 'Dark Slate',
    description: 'Cool slate dark palette',
    gemCost: 40,
    iapProductId: 'cosmetic_theme_dark_slate',
    fallbackPriceLabel: '$0.99',
    previewColor: '#1E293B',
  },
  {
    id: 'theme_midnight',
    category: 'theme',
    label: 'Midnight',
    description: 'Deep midnight blues',
    gemCost: 40,
    iapProductId: 'cosmetic_theme_midnight',
    fallbackPriceLabel: '$0.99',
    previewColor: '#0F172A',
  },
  {
    id: 'theme_sunrise',
    category: 'theme',
    label: 'Sunrise',
    description: 'Warm sunrise accents',
    gemCost: 40,
    iapProductId: 'cosmetic_theme_sunrise',
    fallbackPriceLabel: '$0.99',
    previewColor: '#F97316',
  },
  {
    id: 'tombstone_gothic',
    category: 'tombstone',
    label: 'Gothic',
    description: 'Dark gothic tombstone',
    gemCost: 30,
    iapProductId: 'cosmetic_tombstone_gothic',
    fallbackPriceLabel: '$0.99',
    previewColor: '#374151',
  },
  {
    id: 'tombstone_modern',
    category: 'tombstone',
    label: 'Modern',
    description: 'Clean modern stone',
    gemCost: 30,
    iapProductId: 'cosmetic_tombstone_modern',
    fallbackPriceLabel: '$0.99',
    previewColor: '#94A3B8',
  },
  {
    id: 'tombstone_angelic',
    category: 'tombstone',
    label: 'Angelic',
    description: 'Soft angelic marble',
    gemCost: 30,
    iapProductId: 'cosmetic_tombstone_angelic',
    fallbackPriceLabel: '$0.99',
    previewColor: '#E2E8F0',
  },
  {
    id: 'event_skin_vintage',
    category: 'event_skin',
    label: 'Vintage Cards',
    description: 'Classic parchment event cards',
    gemCost: 35,
    iapProductId: 'cosmetic_event_vintage',
    fallbackPriceLabel: '$1.49',
    previewColor: '#D97706',
  },
  {
    id: 'event_skin_neon',
    category: 'event_skin',
    label: 'Neon Cards',
    description: 'Neon-lit event cards',
    gemCost: 35,
    iapProductId: 'cosmetic_event_neon',
    fallbackPriceLabel: '$1.49',
    previewColor: '#06B6D4',
  },
  {
    id: 'event_skin_watercolor',
    category: 'event_skin',
    label: 'Watercolor',
    description: 'Soft watercolor cards',
    gemCost: 35,
    iapProductId: 'cosmetic_event_watercolor',
    fallbackPriceLabel: '$1.49',
    previewColor: '#8B5CF6',
  },
  {
    id: 'font_serif',
    category: 'name_font',
    label: 'Serif',
    description: 'Elegant serif name style',
    gemCost: 15,
    iapProductId: 'cosmetic_font_serif',
    fallbackPriceLabel: '$0.49',
    previewColor: '#78350F',
  },
  {
    id: 'font_script',
    category: 'name_font',
    label: 'Script',
    description: 'Italic script name style',
    gemCost: 15,
    iapProductId: 'cosmetic_font_script',
    fallbackPriceLabel: '$0.49',
    previewColor: '#BE185D',
  },
  {
    id: 'font_mono',
    category: 'name_font',
    label: 'Mono',
    description: 'Monospace name style',
    gemCost: 15,
    iapProductId: 'cosmetic_font_mono',
    fallbackPriceLabel: '$0.49',
    previewColor: '#1E40AF',
  },
  {
    id: 'sound_pack_minimal',
    category: 'sound_pack',
    label: 'Minimal',
    description: 'Soft, subtle UI sounds',
    gemCost: 30,
    iapProductId: 'cosmetic_sound_minimal',
    fallbackPriceLabel: '$0.99',
    previewColor: '#64748B',
  },
  {
    id: 'sound_pack_jazz',
    category: 'sound_pack',
    label: 'Jazz',
    description: 'Warm, mellow feedback tones',
    gemCost: 30,
    iapProductId: 'cosmetic_sound_jazz',
    fallbackPriceLabel: '$0.99',
    previewColor: '#B45309',
  },
  {
    id: 'sound_pack_cinematic',
    category: 'sound_pack',
    label: 'Cinematic',
    description: 'Punchy dramatic UI sounds',
    gemCost: 30,
    iapProductId: 'cosmetic_sound_cinematic',
    fallbackPriceLabel: '$0.99',
    previewColor: '#7C3AED',
  },
  {
    id: 'sound_pack_lofi',
    category: 'sound_pack',
    label: 'Lo-Fi',
    description: 'Relaxed low-key sound pack',
    gemCost: 30,
    iapProductId: 'cosmetic_sound_lofi',
    fallbackPriceLabel: '$0.99',
    previewColor: '#0D9488',
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

export const COSMETIC_IAP_TO_ID: Partial<Record<IAPProductId, string>> = Object.fromEntries(
  COSMETIC_ITEMS
    .filter((c) => c.iapProductId)
    .map((c) => [c.iapProductId!, c.id]),
);

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETIC_ITEMS.find((c) => c.id === id);
}

export function getCosmeticByIapProduct(productId: IAPProductId): CosmeticItem | undefined {
  const id = COSMETIC_IAP_TO_ID[productId];
  return id ? getCosmeticById(id) : undefined;
}

export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItem[] {
  return COSMETIC_ITEMS.filter((c) => c.category === category);
}

export function getPlusFrameColor(frameCosmeticId?: string | null): string | null {
  const item = frameCosmeticId ? getCosmeticById(frameCosmeticId) : undefined;
  return item?.previewColor ?? null;
}

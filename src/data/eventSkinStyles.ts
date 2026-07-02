export type EventSkinId = 'default' | 'vintage' | 'neon' | 'watercolor';

export interface EventSkinStyle {
  id: EventSkinId;
  cardBg: string;
  cardBorder: string;
  titleColor?: string;
  bodyColor?: string;
  accentOverlay?: string;
}

export const EVENT_SKIN_STYLES: Record<EventSkinId, EventSkinStyle> = {
  default: {
    id: 'default',
    cardBg: 'transparent',
    cardBorder: 'transparent',
  },
  vintage: {
    id: 'vintage',
    cardBg: '#FEF3C7',
    cardBorder: '#D97706',
    accentOverlay: 'rgba(217,119,6,0.08)',
  },
  neon: {
    id: 'neon',
    cardBg: '#0F172A',
    cardBorder: '#06B6D4',
    titleColor: '#E0F2FE',
    bodyColor: '#94A3B8',
    accentOverlay: 'rgba(6,182,212,0.12)',
  },
  watercolor: {
    id: 'watercolor',
    cardBg: '#FAF5FF',
    cardBorder: '#8B5CF6',
    accentOverlay: 'rgba(139,92,246,0.10)',
  },
};

export function resolveEventSkinId(cosmeticId?: string | null): EventSkinId {
  if (!cosmeticId) return 'default';
  if (cosmeticId === 'event_skin_vintage') return 'vintage';
  if (cosmeticId === 'event_skin_neon') return 'neon';
  if (cosmeticId === 'event_skin_watercolor') return 'watercolor';
  return 'default';
}

export function getEquippedEventSkinId(equippedCosmeticId?: string | null): EventSkinId {
  return resolveEventSkinId(equippedCosmeticId);
}

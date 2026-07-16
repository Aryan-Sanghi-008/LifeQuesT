export type EventSkinId = 'default' | 'vintage' | 'neon' | 'watercolor';

export interface EventSkinStyle {
  id: EventSkinId;
  cardBg: string;
  cardBorder: string;
  titleColor?: string;
  bodyColor?: string;
  accentOverlay?: string;
  accentBar?: string;
  rarityFrame?: string;
  iconBg?: string;
  shadowColor?: string;
}

export const EVENT_SKIN_STYLES: Record<EventSkinId, EventSkinStyle> = {
  default: {
    id: 'default',
    cardBg: 'transparent',
    cardBorder: 'transparent',
  },
  vintage: {
    id: 'vintage',
    cardBg: '#FFF8E7',
    cardBorder: '#C4A574',
    titleColor: '#5C3D1E',
    bodyColor: '#7A5C3A',
    accentOverlay: 'rgba(196,165,116,0.12)',
    accentBar: '#B45309',
    rarityFrame: 'rgba(180,83,9,0.35)',
    iconBg: 'rgba(180,83,9,0.12)',
    shadowColor: 'rgba(92,61,30,0.12)',
  },
  neon: {
    id: 'neon',
    cardBg: '#0B1220',
    cardBorder: '#22D3EE',
    titleColor: '#E0F2FE',
    bodyColor: '#94A3B8',
    accentOverlay: 'rgba(34,211,238,0.10)',
    accentBar: '#22D3EE',
    rarityFrame: 'rgba(34,211,238,0.45)',
    iconBg: 'rgba(34,211,238,0.14)',
    shadowColor: 'rgba(34,211,238,0.18)',
  },
  watercolor: {
    id: 'watercolor',
    cardBg: '#F8F5FF',
    cardBorder: '#A78BFA',
    titleColor: '#4C1D95',
    bodyColor: '#6D28D9',
    accentOverlay: 'rgba(167,139,250,0.12)',
    accentBar: '#8B5CF6',
    rarityFrame: 'rgba(139,92,246,0.35)',
    iconBg: 'rgba(139,92,246,0.12)',
    shadowColor: 'rgba(76,29,149,0.10)',
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

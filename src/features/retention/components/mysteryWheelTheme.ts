import type { MysteryReward } from '@store/slices/progressionSlice';

export type SegmentVisual = {
  fill: string;
  fillAccent: string;
  emoji: string;
  shortLabel: string;
};

export function getSegmentVisual(seg: MysteryReward): SegmentVisual {
  switch (seg.type) {
    case 'coins':
      return {
        fill: '#F59E0B',
        fillAccent: '#FCD34D',
        emoji: '🪙',
        shortLabel: String(seg.amount),
      };
    case 'gems':
      return {
        fill: '#3B82F6',
        fillAccent: '#60A5FA',
        emoji: '💎',
        shortLabel: String(seg.amount),
      };
    case 'luck':
      return {
        fill: '#10B981',
        fillAccent: '#34D399',
        emoji: '🍀',
        shortLabel: `+${seg.amount}`,
      };
    case 'rare_event':
      return {
        fill: '#8B5CF6',
        fillAccent: '#C4B5FD',
        emoji: '✨',
        shortLabel: 'RARE',
      };
    case 'season_xp':
      return {
        fill: '#EC4899',
        fillAccent: '#F9A8D4',
        emoji: '🏆',
        shortLabel: `+${seg.amount}`,
      };
    case 'cosmetic':
      return {
        fill: '#F97316',
        fillAccent: '#FDBA74',
        emoji: '🎨',
        shortLabel: 'STYLE',
      };
    default:
      return {
        fill: '#6B7280',
        fillAccent: '#9CA3AF',
        emoji: '🎁',
        shortLabel: '?',
      };
  }
}

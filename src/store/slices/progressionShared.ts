import { GameplayCoinState, GameplayTicketState } from '@engine/economyCapEngine';
import {
  applyGameplayCoinGrant,
  applyGameplayTicketGrant,
  applyPremiumCoinBonus,
} from '@engine/economyCapEngine';
import { useToastStore } from '@store/toastStore';
import {
  getLoginRewardDay,
  setLoginRewardDay,
  getLoginRewardLastClaim,
} from '@services/persistence';
import type { LoginReward } from '@/data/loginRewards';

export type { LoginReward };
export { LOGIN_REWARD_SCHEDULE } from '@/data/loginRewards';

export interface StreakMilestone {
  days: number;
  label: string;
  rewardType: 'gems' | 'avatar_unlock' | 'cosmetic' | 'prestige_title';
  rewardAmount: number;
  rewardLabel: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, label: '1 Week Streak', rewardType: 'gems', rewardAmount: 10, rewardLabel: '+10 Gems' },
  { days: 30, label: '30-Day Streak', rewardType: 'avatar_unlock', rewardAmount: 1, rewardLabel: 'Rare Avatar Unlock' },
  { days: 100, label: '100-Day Streak', rewardType: 'cosmetic', rewardAmount: 1, rewardLabel: 'Legendary Cosmetic Flag' },
  { days: 365, label: '1-Year Streak', rewardType: 'prestige_title', rewardAmount: 1, rewardLabel: 'Prestige Title: Eternal' },
];

export interface MysteryReward {
  type: 'coins' | 'gems' | 'luck' | 'rare_event' | 'season_xp' | 'cosmetic';
  amount: number;
  label: string;
  cosmeticStyle?: import('@/types').AvatarStyleId;
}

export const MYSTERY_SEGMENTS: MysteryReward[] = [
  { type: 'coins', amount: 100, label: '100 Coins' },
  { type: 'coins', amount: 300, label: '300 Coins' },
  { type: 'gems', amount: 2, label: '2 Gems' },
  { type: 'gems', amount: 5, label: '5 Gems' },
  { type: 'luck', amount: 5, label: '+5 Luck Boost' },
  { type: 'rare_event', amount: 1, label: 'Rare Event Unlock' },
  { type: 'season_xp', amount: 75, label: '+75 Season XP' },
  { type: 'cosmetic', amount: 1, label: 'Avatar Style Unlock', cosmeticStyle: 'notionists' },
];

export function getIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function grantCappedGameplayCoins(
  character: GameplayCoinState & { isPremium?: boolean },
  amount: number,
): number {
  const boosted = applyPremiumCoinBonus(amount, character.isPremium ?? false);
  const result = applyGameplayCoinGrant(character, boosted);
  if (result.hitCap) {
    useToastStore.getState().showToast(
      'Daily coin earn limit reached (5,000). Resets tomorrow.',
      'info',
    );
  }
  return result.granted;
}

export function grantCappedGameplayTickets(
  character: GameplayTicketState,
  amount: number,
): number {
  const result = applyGameplayTicketGrant(character, amount);
  if (result.hitCap) {
    useToastStore.getState().showToast(
      'Weekly ticket earn limit reached (5). Resets next week.',
      'info',
    );
  }
  return result.granted;
}

export function resolveMissedDay(): number {
  const last = getLoginRewardLastClaim();
  if (!last) return getLoginRewardDay();

  const today = new Date().toISOString().slice(0, 10);
  if (last === today) return getLoginRewardDay();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (last === yesterdayStr) return getLoginRewardDay();

  const lastMs = new Date(last).getTime();
  const hoursSince = (Date.now() - lastMs) / 3600000;
  if (hoursSince <= 24) return getLoginRewardDay();

  setLoginRewardDay(1);
  return 1;
}

export function rollMysterySegmentIndex(): number {
  const weights = [3, 3, 2, 2, 2, 1, 2, 1];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return 0;
}

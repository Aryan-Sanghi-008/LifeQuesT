import { AvatarStyleId } from '@/types';

export interface LoginReward {
  day: number;
  coins?: number;
  gems?: number;
  luckBoost?: number;
  seasonXp?: number;
  mysteryTickets?: number;
  mysteryBoxSpin?: boolean;
  avatarStyleUnlock?: AvatarStyleId;
  epicEventUnlock?: boolean;
  legendaryReward?: boolean;
  label: string;
}

function buildLoginRewardSchedule(): LoginReward[] {
  const schedule: LoginReward[] = [];
  for (let d = 1; d <= 30; d++) {
    if (d <= 6) {
      const coins = 400 + d * 100;
      schedule.push({ day: d, coins, label: `${coins} Coins` });
    } else if (d === 7) {
      schedule.push({ day: d, gems: 5, label: '5 Gems' });
    } else if (d <= 13) {
      const coins = 800 + (d - 7) * 200;
      schedule.push({ day: d, coins, luckBoost: 3, label: `${coins} Coins + Luck Boost` });
    } else if (d === 14) {
      schedule.push({ day: d, avatarStyleUnlock: 'lorelei', label: 'Rare Avatar: Lorelei' });
    } else if (d <= 20) {
      const coins = 1000 + (d - 14) * 250;
      schedule.push({ day: d, coins, seasonXp: 100, label: `${coins} Coins + 100 XP` });
    } else if (d === 21) {
      schedule.push({ day: d, mysteryBoxSpin: true, label: 'Bonus Mystery Box Spin' });
    } else if (d <= 27) {
      const coins = 1200 + (d - 21) * 200;
      schedule.push({ day: d, coins, mysteryTickets: 1, label: `${coins} Coins + Mystery Ticket` });
    } else if (d === 28) {
      schedule.push({ day: d, epicEventUnlock: true, label: 'Epic Event Unlock' });
    } else if (d === 29) {
      schedule.push({ day: d, gems: 15, label: '15 Gems' });
    } else {
      schedule.push({ day: d, gems: 10, legendaryReward: true, label: 'Legendary Cosmetic + 10 Gems' });
    }
  }
  return schedule;
}

export const LOGIN_REWARD_SCHEDULE: LoginReward[] = buildLoginRewardSchedule();

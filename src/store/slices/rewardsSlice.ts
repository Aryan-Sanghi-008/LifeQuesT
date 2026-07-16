import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import { LOGIN_REWARD_SCHEDULE } from '@/data/loginRewards';
import { getDailyRewardMultiplier } from '@services/remoteConfig';
import {
  setDailyBonusLastClaim,
  setLoginRewardDay,
  setLoginRewardLastClaim,
  getLoginRewardLastClaim,
  getMysteryBoxLastSpin,
  setMysteryBoxLastSpin,
} from '@services/persistence';
import { applyAbsenceCatchUp } from '@engine/absenceCatchUpEngine';
import { hapticMoneyEarned } from '@services/haptics';
import { playSound } from '@services/audio';
import {
  grantCappedGameplayCoins,
  grantCappedGameplayTickets,
  getIsoWeek,
  resolveMissedDay,
  rollMysterySegmentIndex,
  STREAK_MILESTONES,
  MYSTERY_SEGMENTS,
  type LoginReward,
  type MysteryReward,
  type StreakMilestone,
} from './progressionShared';

export type { LoginReward, MysteryReward, StreakMilestone };

export interface RewardsSlice {
  pendingAbsenceBonus: {
    daysAway: number;
    coins: number;
    gems: number;
    projectedAge: number;
    yearsToAdvance: number;
    narrativeLines: string[];
  } | null;
  claimDailyBonus: () => { ok: boolean; message: string };
  claimLoginReward: () => { ok: boolean; message: string; day: number; reward: LoginReward };
  canClaimLoginReward: () => boolean;
  getLoginRewardState: () => { day: number; claimed: boolean };
  canSpinMysteryBox: () => boolean;
  canSpinMysteryBoxWithTicket: () => boolean;
  spinMysteryBox: (options?: { useTicket?: boolean; segmentIndex?: number }) => {
    ok: boolean;
    reward?: MysteryReward;
    segmentIndex?: number;
    message: string;
  };
  checkAbsenceBonus: () => void;
  claimAbsenceBonus: () => void;
  checkStreakMilestones: () => StreakMilestone | null;
  purchaseStreakShield: () => { ok: boolean; message: string };
  consumeStreakShieldIfAvailable: () => boolean;
  addMysterySpins: (n: number) => void;
  grantAdRewardCoins: (amount: number) => number;
  grantAdMysteryTicket: () => number;
  purchaseMysterySpinWithGems: () => { ok: boolean; message: string };
}

export const createRewardsSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  RewardsSlice
> = (set, get) => ({
  pendingAbsenceBonus: null,

  checkAbsenceBonus: () => {
    const { character } = get();
    if (!character?.isAlive || !character.lastActiveDate) return;
    const today = new Date().toISOString().slice(0, 10);
    if (character.lastAbsenceBonusDate === today) return;

    const lastMs = new Date(character.lastActiveDate).getTime();
    const todayMs = new Date(today).getTime();
    const daysAway = Math.round((todayMs - lastMs) / 86400000);
    if (daysAway < 2) return;

    const coins = 150 + daysAway * 75;
    const gems = Math.min(5, 1 + Math.floor(daysAway / 2));
    const yearsToAdvance = Math.min(daysAway, 3);
    const projectedAge = character.age + yearsToAdvance;

    const narrativeLines: string[] = [];
    narrativeLines.push('Daily quests reset while you were away.');
    if (character.dailyStreak && character.dailyStreak > 1) {
      narrativeLines.push(`Your ${character.dailyStreak}-day streak was at risk — age up daily to keep it going.`);
    }
    if ((character.generation ?? 1) > 1) {
      narrativeLines.push(`Your dynasty (Generation ${character.generation}) continues to grow.`);
    } else if ((character.people ?? []).some((p) => p.relationType === 'child' && p.isAlive)) {
      narrativeLines.push('Your children are growing up — be there for the key moments.');
    }

    set((s) => {
      s.pendingAbsenceBonus = { daysAway, coins, gems, projectedAge, yearsToAdvance, narrativeLines };
    });
  },

  claimAbsenceBonus: () => {
    const bonus = get().pendingAbsenceBonus;
    if (!bonus) return;
    const { character } = get();
    if (!character) return;
    const today = new Date().toISOString().slice(0, 10);
    const { character: aged } = applyAbsenceCatchUp(character, bonus.yearsToAdvance);
    set((s) => {
      if (!s.character) return;
      s.character.age = aged.age;
      s.character.lifeStage = aged.lifeStage;
      s.character.people = aged.people;
      s.character.bankBalance = aged.bankBalance;
      s.character.debt = aged.debt;
      s.character.eventHistory = aged.eventHistory;
      grantCappedGameplayCoins(s.character, bonus.coins);
      s.character.gems = (s.character.gems ?? 0) + bonus.gems;
      s.character.lastAbsenceBonusDate = today;
      s.character.lastActiveDate = today;
      s.pendingAbsenceBonus = null;
    });
    void get()._persist();
  },

  claimDailyBonus: () => {
    const result = get().claimLoginReward();
    return { ok: result.ok, message: result.message };
  },

  canClaimLoginReward: () => {
    const today = new Date().toISOString().slice(0, 10);
    return getLoginRewardLastClaim() !== today;
  },

  getLoginRewardState: () => {
    const today = new Date().toISOString().slice(0, 10);
    const day = resolveMissedDay();
    const claimed = getLoginRewardLastClaim() === today;
    return { day, claimed };
  },

  claimLoginReward: () => {
    const { character } = get();
    if (!character) {
      const fallbackReward = LOGIN_REWARD_SCHEDULE[0];
      return { ok: false, message: 'No active character.', day: 1, reward: fallbackReward };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (getLoginRewardLastClaim() === today) {
      const day = resolveMissedDay();
      const reward = LOGIN_REWARD_SCHEDULE[day - 1] ?? LOGIN_REWARD_SCHEDULE[0];
      return { ok: false, message: 'Already claimed today.', day, reward };
    }

    const currentDay = resolveMissedDay();
    const reward = LOGIN_REWARD_SCHEDULE[currentDay - 1] ?? LOGIN_REWARD_SCHEDULE[0];
    const nextDay = currentDay >= 30 ? 1 : currentDay + 1;

    setLoginRewardLastClaim(today);
    setLoginRewardDay(nextDay);
    setDailyBonusLastClaim(today);

    set((s) => {
      if (!s.character) return;
      if (reward.coins) {
        const scaled = Math.round(reward.coins * getDailyRewardMultiplier());
        grantCappedGameplayCoins(s.character, scaled);
      }
      if (reward.gems) s.character.gems = (s.character.gems ?? 0) + reward.gems;
      if (reward.luckBoost) s.character.luckBoostsRemaining += reward.luckBoost;
      if (reward.seasonXp) s.character.seasonXp = (s.character.seasonXp ?? 0) + reward.seasonXp;
      if (reward.mysteryTickets) {
        s.character.mysteryTickets = (s.character.mysteryTickets ?? 0) + reward.mysteryTickets;
      }
      if (reward.avatarStyleUnlock) {
        const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
        if (!styles.includes(reward.avatarStyleUnlock)) {
          s.character.unlockedAvatarStyles = [...styles, reward.avatarStyleUnlock];
        }
      }
      if (reward.epicEventUnlock) s.character.epicEventsUnlocked = true;
      if (reward.legendaryReward) {
        s.character.legendaryCosmeticUnlocked = true;
        const titles = s.character.unlockedTitles ?? [];
        if (!titles.includes('Legendary')) {
          s.character.unlockedTitles = [...titles, 'Legendary'];
        }
      }
    });
    if (reward.mysteryBoxSpin) {
      setMysteryBoxLastSpin('');
    }
    void get()._persist();
    hapticMoneyEarned();
    void playSound(reward.gems ? 'success' : 'coins_earned');
    return { ok: true, message: `Day ${currentDay} reward claimed: ${reward.label}!`, day: currentDay, reward };
  },

  canSpinMysteryBox: () => {
    const currentWeek = getIsoWeek(new Date());
    return getMysteryBoxLastSpin() !== currentWeek;
  },

  canSpinMysteryBoxWithTicket: () => {
    const { character } = get();
    return (character?.mysteryTickets ?? 0) > 0;
  },

  spinMysteryBox: (options) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No active character.' };

    const currentWeek = getIsoWeek(new Date());
    const useTicket = options?.useTicket === true;
    const freeAvailable = getMysteryBoxLastSpin() !== currentWeek;

    if (useTicket) {
      if ((character.mysteryTickets ?? 0) <= 0) {
        return { ok: false, message: 'No mystery tickets available.' };
      }
    } else if (!freeAvailable) {
      return { ok: false, message: 'Mystery box already spun this week. Use a ticket for an extra spin!' };
    }

    const pickedIndex = options?.segmentIndex ?? rollMysterySegmentIndex();
    const reward = MYSTERY_SEGMENTS[pickedIndex];
    if (!useTicket) {
      setMysteryBoxLastSpin(currentWeek);
    }

    set((s) => {
      if (!s.character) return;
      if (useTicket) {
        s.character.mysteryTickets = Math.max(0, (s.character.mysteryTickets ?? 0) - 1);
      }
      if (reward.type === 'coins') {
        grantCappedGameplayCoins(s.character, reward.amount);
      } else if (reward.type === 'gems') s.character.gems = (s.character.gems ?? 0) + reward.amount;
      else if (reward.type === 'luck') {
        s.character.luckBoostsRemaining = (s.character.luckBoostsRemaining ?? 0) + reward.amount;
      } else if (reward.type === 'season_xp') {
        s.character.seasonXp = (s.character.seasonXp ?? 0) + reward.amount;
      } else if (reward.type === 'rare_event') {
        s.character.epicEventsUnlocked = true;
      } else if (reward.type === 'cosmetic' && reward.cosmeticStyle) {
        const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
        if (!styles.includes(reward.cosmeticStyle)) {
          s.character.unlockedAvatarStyles = [...styles, reward.cosmeticStyle];
        }
      }
    });
    void get()._persist();
    return { ok: true, reward, segmentIndex: pickedIndex, message: `You won: ${reward.label}!` };
  },

  checkStreakMilestones: () => {
    const { character } = get();
    if (!character) return null;
    const streak = character.dailyStreak ?? 0;
    const claimed = character.claimedStreakMilestones ?? [];
    for (const milestone of STREAK_MILESTONES) {
      if (streak >= milestone.days && !claimed.includes(milestone.days)) {
        set((s) => {
          if (!s.character) return;
          if (!s.character.claimedStreakMilestones) s.character.claimedStreakMilestones = [];
          s.character.claimedStreakMilestones.push(milestone.days);
          if (milestone.rewardType === 'gems') {
            s.character.gems = (s.character.gems ?? 0) + milestone.rewardAmount;
          } else if (milestone.rewardType === 'avatar_unlock') {
            const styles = s.character.unlockedAvatarStyles ?? ['adventurer'];
            if (!styles.includes('lorelei')) {
              s.character.unlockedAvatarStyles = [...styles, 'lorelei'];
            }
          } else if (milestone.rewardType === 'cosmetic') {
            const titles = s.character.unlockedTitles ?? [];
            if (!titles.includes('Legendary Streak')) {
              s.character.unlockedTitles = [...titles, 'Legendary Streak'];
            }
          } else if (milestone.rewardType === 'prestige_title') {
            const titles = s.character.unlockedTitles ?? [];
            if (!titles.includes('Eternal')) {
              s.character.unlockedTitles = [...titles, 'Eternal'];
            }
          }
        });
        void get()._persist();
        return milestone;
      }
    }
    return null;
  },

  purchaseStreakShield: () => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No active character.' };
    const cost = 50;
    if ((character.gems ?? 0) < cost) return { ok: false, message: `Need ${cost} gems to buy a Streak Shield.` };
    set((s) => {
      if (!s.character) return;
      s.character.gems = (s.character.gems ?? 0) - cost;
      s.character.streakShieldCount = (s.character.streakShieldCount ?? 0) + 1;
    });
    return { ok: true, message: 'Streak Shield purchased! Your streak is protected for 1 missed day.' };
  },

  consumeStreakShieldIfAvailable: () => {
    const { character } = get();
    if (!character || (character.streakShieldCount ?? 0) <= 0) return false;
    set((s) => {
      if (!s.character) return;
      s.character.streakShieldCount = (s.character.streakShieldCount ?? 0) - 1;
    });
    return true;
  },

  addMysterySpins: (n: number) => {
    set((s) => {
      if (!s.character) return;
      grantCappedGameplayTickets(s.character, n);
    });
    void get()._persist();
  },

  grantAdRewardCoins: (amount: number) => {
    const { character } = get();
    if (!character) return 0;
    let granted = 0;
    set((s) => {
      if (!s.character) return;
      granted = grantCappedGameplayCoins(s.character, amount);
    });
    if (granted > 0) {
      void get()._persist();
      hapticMoneyEarned();
      void playSound('coins_earned');
    }
    return granted;
  },

  grantAdMysteryTicket: () => {
    const { character } = get();
    if (!character) return 0;
    let granted = 0;
    set((s) => {
      if (!s.character) return;
      granted = grantCappedGameplayTickets(s.character, 1);
    });
    if (granted > 0) void get()._persist();
    return granted;
  },

  purchaseMysterySpinWithGems: () => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No active character.' };
    const GEMS_PER_SPIN = 20;
    if ((character.gems ?? 0) < GEMS_PER_SPIN) {
      return { ok: false, message: `Need ${GEMS_PER_SPIN} gems for an extra spin.` };
    }
    set((s) => {
      if (!s.character) return;
      s.character.gems = (s.character.gems ?? 0) - GEMS_PER_SPIN;
      s.character.mysteryTickets = (s.character.mysteryTickets ?? 0) + 1;
    });
    void get()._persist();
    return { ok: true, message: 'Extra spin added!' };
  },
});

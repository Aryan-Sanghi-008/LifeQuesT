import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import { DailyQuest } from '@/types';
import {
  getDailyQuestsProgress,
  setDailyQuestsProgress,
} from '@services/persistence';
import {
  pickDailyQuests,
  stampKarmaBaseline,
  claimQuest,
  isQuestComplete,
} from '@engine/questEngine';
import { grantCappedGameplayCoins } from './progressionShared';
import { hapticMoneyEarned } from '@services/haptics';
import { playSound } from '@services/audio';

export interface QuestSlice {
  dailyQuests: DailyQuest[];
  loadDailyQuests: () => void;
  claimQuestReward: (questId: string) => { ok: boolean; message: string };
}

export const createQuestSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  QuestSlice
> = (set, get) => ({
  dailyQuests: [],

  loadDailyQuests: () => {
    const today = new Date().toISOString().slice(0, 10);
    const karma = get().character?.karma ?? 50;
    const raw = getDailyQuestsProgress(today);
    if (raw) {
      try {
        const quests = stampKarmaBaseline(
          JSON.parse(raw) as DailyQuest[],
          karma,
        );
        set((s) => {
          s.dailyQuests = quests;
        });
        return;
      } catch {
        /* fall through */
      }
    }
    const quests = pickDailyQuests(today, 3, karma);
    setDailyQuestsProgress(today, JSON.stringify(quests));
    set((s) => {
      s.dailyQuests = quests;
    });
  },

  claimQuestReward: (questId) => {
    const { dailyQuests, character } = get();
    if (!character) return { ok: false, message: 'No active character.' };
    const quest = dailyQuests.find((q) => q.id === questId);
    if (!quest) return { ok: false, message: 'Quest not found.' };
    if (quest.claimed) return { ok: false, message: 'Already claimed.' };
    if (!isQuestComplete(quest)) {
      return { ok: false, message: 'Quest not complete.' };
    }

    const updated = dailyQuests.map((q) =>
      q.id === questId ? claimQuest(q) : q,
    );
    const today = new Date().toISOString().slice(0, 10);
    setDailyQuestsProgress(today, JSON.stringify(updated));
    let grantedCoins = 0;
    set((s) => {
      s.dailyQuests = updated;
      if (s.character) {
        grantedCoins = grantCappedGameplayCoins(s.character, quest.rewardCoins);
      }
    });
    get().addSeasonXp(25);
    hapticMoneyEarned();
    void playSound('coins_earned');
    void get()._persist();
    return { ok: true, message: `Claimed ${grantedCoins} coins!` };
  },
});

import { pickDailyQuests, updateQuestProgress, isQuestComplete } from '@engine/questEngine';

describe('questEngine', () => {
  it('picks 3 daily quests', () => {
    const quests = pickDailyQuests('2026-06-25');
    expect(quests).toHaveLength(3);
  });

  it('updates age_up progress', () => {
    const quests = pickDailyQuests('2026-06-25');
    const updated = updateQuestProgress(quests, 'age_up', 1);
    const ageQuest = updated.find(q => q.objectiveType === 'age_up');
    expect(ageQuest?.progress).toBe(1);
  });

  it('updates gain_karma from baseline', () => {
    const quests = pickDailyQuests('2026-06-25', 3, 50);
    const gainQuest = quests.find(q => q.objectiveType === 'gain_karma');
    expect(gainQuest?.karmaBaseline).toBe(50);
    const updated = updateQuestProgress(quests, 'gain_karma', 0, 65);
    const quest = updated.find(q => q.objectiveType === 'gain_karma');
    expect(quest?.progress).toBe(15);
  });

  it('updates reach_karma with absolute karma capped at target', () => {
    const quests = [{
      id: 'test_reach',
      title: 'Good Deeds',
      description: 'Reach 50 karma',
      objectiveType: 'reach_karma' as const,
      target: 50,
      progress: 0,
      rewardCoins: 40,
      claimed: false,
    }];
    const updated = updateQuestProgress(quests, 'reach_karma', 0, 55);
    expect(updated[0].progress).toBe(50);
  });

  it('detects quest complete', () => {
    const quests = pickDailyQuests('2026-06-25');
    const q = quests[0];
    const done = { ...q, progress: q.target };
    expect(isQuestComplete(done)).toBe(true);
  });
});

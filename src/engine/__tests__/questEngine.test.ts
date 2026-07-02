import { pickDailyQuests, updateQuestProgress, isQuestComplete, QUEST_TEMPLATES } from '@engine/questEngine';

describe('questEngine', () => {
  it('picks 3 daily quests', () => {
    const quests = pickDailyQuests('2026-06-25');
    expect(quests).toHaveLength(3);
  });

  it('always includes exactly one dynasty quest in the daily set', () => {
    const dynastyObjectives = new Set(['reach_dynasty_score', 'living_heirs']);
    // Test multiple date keys to ensure the rule is stable
    for (const dateKey of ['2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28']) {
      const quests = pickDailyQuests(dateKey);
      const dynastyCount = quests.filter((q) => dynastyObjectives.has(q.objectiveType)).length;
      expect(dynastyCount).toBe(1);
    }
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

  it('updates reach_dynasty_score with snapshot value', () => {
    const quests = [{
      id: 'test_dynasty',
      title: 'Dynasty Rising',
      description: 'Build dynasty score to 5000',
      objectiveType: 'reach_dynasty_score' as const,
      target: 5000,
      progress: 0,
      rewardCoins: 60,
      claimed: false,
    }];
    const updated = updateQuestProgress(quests, 'reach_dynasty_score', 3200);
    expect(updated[0].progress).toBe(3200);

    // Progress beyond target is capped at target
    const capped = updateQuestProgress(quests, 'reach_dynasty_score', 8000);
    expect(capped[0].progress).toBe(5000);
  });

  it('updates living_heirs with snapshot count', () => {
    const quests = [{
      id: 'test_heirs',
      title: 'Start a Family',
      description: 'Have 1 living heir',
      objectiveType: 'living_heirs' as const,
      target: 1,
      progress: 0,
      rewardCoins: 45,
      claimed: false,
    }];
    const updated = updateQuestProgress(quests, 'living_heirs', 2);
    expect(updated[0].progress).toBe(1); // capped at target
  });

  it('does not update claimed dynasty quests', () => {
    const quests = [{
      id: 'test_dynasty',
      title: 'Dynasty Rising',
      description: 'Build dynasty score to 5000',
      objectiveType: 'reach_dynasty_score' as const,
      target: 5000,
      progress: 5000,
      rewardCoins: 60,
      claimed: true,
    }];
    const updated = updateQuestProgress(quests, 'reach_dynasty_score', 8000);
    expect(updated[0].progress).toBe(5000); // unchanged
  });

  it('detects quest complete', () => {
    const quests = pickDailyQuests('2026-06-25');
    const q = quests[0];
    const done = { ...q, progress: q.target };
    expect(isQuestComplete(done)).toBe(true);
  });

  it('QUEST_TEMPLATES contains dynasty templates', () => {
    const dynastyTemplates = QUEST_TEMPLATES.filter(
      (t) => t.objectiveType === 'reach_dynasty_score' || t.objectiveType === 'living_heirs',
    );
    expect(dynastyTemplates.length).toBeGreaterThanOrEqual(2);
  });
});

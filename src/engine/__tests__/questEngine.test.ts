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

  it('detects quest complete', () => {
    const quests = pickDailyQuests('2026-06-25');
    const q = quests[0];
    const done = { ...q, progress: q.target };
    expect(isQuestComplete(done)).toBe(true);
  });
});

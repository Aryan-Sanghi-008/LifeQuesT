import { DailyQuest, QuestObjectiveType } from '../types';

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  objectiveType: QuestObjectiveType;
  target: number;
  rewardCoins: number;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  { id: 'age_up_2', title: 'Keep Living', description: 'Age up 2 times', objectiveType: 'age_up', target: 2, rewardCoins: 30 },
  { id: 'karma_50', title: 'Good Deeds', description: 'Reach 50 karma this life', objectiveType: 'reach_karma', target: 50, rewardCoins: 40 },
  { id: 'activity_1', title: 'Stay Active', description: 'Complete 1 activity', objectiveType: 'complete_activity', target: 1, rewardCoins: 25 },
  { id: 'study_1', title: 'Hit the Books', description: 'Complete 1 study session', objectiveType: 'study_session', target: 1, rewardCoins: 35 },
  { id: 'age_up_3', title: 'Another Year', description: 'Age up 3 times', objectiveType: 'age_up', target: 3, rewardCoins: 50 },
  { id: 'karma_30', title: 'Karma Boost', description: 'Gain 30 karma', objectiveType: 'gain_karma', target: 30, rewardCoins: 30 },
];

function hashDate(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickDailyQuests(dateKey: string, count = 3, karmaBaseline = 50): DailyQuest[] {
  const start = hashDate(dateKey) % QUEST_TEMPLATES.length;
  const picked: DailyQuest[] = [];

  for (let i = 0; i < count; i++) {
    const tpl = QUEST_TEMPLATES[(start + i) % QUEST_TEMPLATES.length];
    picked.push({
      id: `${dateKey}_${tpl.id}`,
      title: tpl.title,
      description: tpl.description,
      objectiveType: tpl.objectiveType,
      target: tpl.target,
      progress: 0,
      rewardCoins: tpl.rewardCoins,
      claimed: false,
      karmaBaseline: tpl.objectiveType === 'gain_karma' ? karmaBaseline : undefined,
    });
  }
  return picked;
}

export function stampKarmaBaseline(quests: DailyQuest[], karma: number): DailyQuest[] {
  return quests.map(q => (
    q.objectiveType === 'gain_karma' && q.karmaBaseline === undefined
      ? { ...q, karmaBaseline: karma }
      : q
  ));
}

export function updateQuestProgress(
  quests: DailyQuest[],
  objectiveType: QuestObjectiveType,
  amount: number,
  currentKarma?: number,
): DailyQuest[] {
  return quests.map(q => {
    if (q.objectiveType !== objectiveType || q.claimed) return q;

    let progress = q.progress;
    if (objectiveType === 'reach_karma' && currentKarma !== undefined) {
      progress = currentKarma;
    } else if (objectiveType === 'gain_karma' && currentKarma !== undefined) {
      const baseline = q.karmaBaseline ?? currentKarma;
      progress = Math.max(0, currentKarma - baseline);
    } else {
      progress = q.progress + amount;
    }

    return { ...q, progress: Math.min(progress, q.target) };
  });
}

export function isQuestComplete(quest: DailyQuest): boolean {
  return quest.progress >= quest.target;
}

export function claimQuest(quest: DailyQuest): DailyQuest {
  return { ...quest, claimed: true };
}

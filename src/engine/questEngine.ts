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
  { id: 'age_up_2', title: 'Keep Living', description: 'Age up 2 times', objectiveType: 'age_up', target: 2, rewardCoins: 36 },
  { id: 'karma_50', title: 'Good Deeds', description: 'Reach 50 karma this life', objectiveType: 'reach_karma', target: 50, rewardCoins: 48 },
  { id: 'activity_1', title: 'Stay Active', description: 'Complete 1 activity', objectiveType: 'complete_activity', target: 1, rewardCoins: 30 },
  { id: 'study_1', title: 'Hit the Books', description: 'Complete 1 study session', objectiveType: 'study_session', target: 1, rewardCoins: 42 },
  { id: 'age_up_3', title: 'Another Year', description: 'Age up 3 times', objectiveType: 'age_up', target: 3, rewardCoins: 60 },
  { id: 'karma_30', title: 'Karma Boost', description: 'Gain 30 karma', objectiveType: 'gain_karma', target: 30, rewardCoins: 36 },
  { id: 'dynasty_score_5k', title: 'Dynasty Rising', description: 'Build your dynasty score to 5,000', objectiveType: 'reach_dynasty_score', target: 5000, rewardCoins: 72 },
  { id: 'living_heirs_1', title: 'Start a Family', description: 'Have 1 living heir (child or sibling)', objectiveType: 'living_heirs', target: 1, rewardCoins: 54 },
  { id: 'dynasty_score_10k', title: 'Legacy Builder', description: 'Build your dynasty score to 10,000', objectiveType: 'reach_dynasty_score', target: 10000, rewardCoins: 96 },
];

// Dynasty quest IDs — always include one in the daily rotation when eligible
const DYNASTY_QUEST_IDS = new Set(['dynasty_score_5k', 'living_heirs_1', 'dynasty_score_10k']);

function hashDate(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickDailyQuests(dateKey: string, count = 3, karmaBaseline = 50): DailyQuest[] {
  const nonDynasty = QUEST_TEMPLATES.filter((t) => !DYNASTY_QUEST_IDS.has(t.id));
  const dynastyPool = QUEST_TEMPLATES.filter((t) => DYNASTY_QUEST_IDS.has(t.id));

  const hash = hashDate(dateKey);

  // Pick one dynasty quest deterministically per day
  const dynastyTpl = dynastyPool[hash % dynastyPool.length];
  const start = hash % nonDynasty.length;

  // Fill remaining slots from non-dynasty templates (avoid duplicates)
  const picked: QuestTemplate[] = [dynastyTpl];
  for (let i = 0; picked.length < count; i++) {
    const tpl = nonDynasty[(start + i) % nonDynasty.length];
    if (!picked.find((p) => p.id === tpl.id)) {
      picked.push(tpl);
    }
    if (i > nonDynasty.length * 2) break; // safety
  }

  return picked.map((tpl) => ({
    id: `${dateKey}_${tpl.id}`,
    title: tpl.title,
    description: tpl.description,
    objectiveType: tpl.objectiveType,
    target: tpl.target,
    progress: 0,
    rewardCoins: tpl.rewardCoins,
    claimed: false,
    karmaBaseline: tpl.objectiveType === 'gain_karma' ? karmaBaseline : undefined,
  }));
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
    } else if (objectiveType === 'reach_dynasty_score' || objectiveType === 'living_heirs') {
      // Snapshot objectives: `amount` is the current value, not a delta
      progress = amount;
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

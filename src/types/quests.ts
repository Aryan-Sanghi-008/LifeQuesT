// ─── Quests ──────────────────────────────────────────────────────────────────

export type QuestObjectiveType =
  | 'age_up'
  | 'reach_karma'
  | 'gain_karma'
  | 'complete_activity'
  | 'study_session'
  | 'reach_dynasty_score'
  | 'living_heirs';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  objectiveType: QuestObjectiveType;
  target: number;
  progress: number;
  rewardCoins: number;
  claimed: boolean;
  karmaBaseline?: number;
}

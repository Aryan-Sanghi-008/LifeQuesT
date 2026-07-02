import { Character, DailyQuest, Person } from '@/types';
import { WORLD_EVENTS_POOL, WorldEvent } from '@engine/worldEngine';
import { LOGIN_REWARD_SCHEDULE } from '@data/loginRewards';
import { getLoginRewardDay } from './persistence';

export const RETENTION_NOTIFICATION_IDS = {
  questReset: 'retention-quest-reset',
  streakRisk: 'retention-streak-risk',
  absence: 'retention-absence-warning',
  worldEvent: 'retention-world-event',
  npcEvent: 'retention-npc-event',
} as const;

export const MILESTONE_NPC_AGES = [18, 30, 40, 50, 60, 70, 80];

export interface RetentionNotificationSnapshot {
  characterName: string;
  characterAge: number;
  dailyStreak: number;
  lastActiveDate?: string;
  dailyQuests: DailyQuest[];
  activeWorldEventIds: string[];
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildQuestResetBody(
  quests: DailyQuest[],
  loginDay = getLoginRewardDay(),
): string {
  const topCoins = quests.reduce((max, q) => Math.max(max, q.rewardCoins), 0);
  if (topCoins > 0) {
    return `Your daily quests just reset. Today's top reward: 🪙 ${topCoins} Coins`;
  }
  const loginReward = LOGIN_REWARD_SCHEDULE[(loginDay - 1) % LOGIN_REWARD_SCHEDULE.length];
  if (loginReward?.gems && loginReward.gems > 0) {
    return `Your daily quests just reset. Today's top reward: 💎 ${loginReward.gems} Gems`;
  }
  return 'Your daily quests just reset. Log in to claim rewards and keep your streak!';
}

export function buildStreakRiskBody(streak: number): string {
  return `Don't break your 🔥 ${streak}-day streak! Age up once to keep it.`;
}

export function buildAbsenceBody(age: number): string {
  const projected = age + 2;
  return `You were away — time caught up. Your character aged from ${age} to ${projected}. Come back to keep living!`;
}

export function buildWorldEventBody(event: WorldEvent): string {
  return `⚠️ ${event.title} — your investments and career may be affected`;
}

export function relationLabel(type: Person['relationType']): string {
  switch (type) {
    case 'mother': return 'mother';
    case 'father': return 'father';
    case 'spouse': return 'spouse';
    case 'child': return 'child';
    case 'sibling': return 'sibling';
    case 'friend': return 'friend';
    case 'pet': return 'pet';
    default: return 'loved one';
  }
}

export function buildNpcMilestoneBody(person: Person): string {
  const relation = relationLabel(person.relationType);
  const name = person.name;
  if (person.relationType === 'pet') {
    return `Your ${relation} ${name} just turned ${person.age}. Check in on them!`;
  }
  return `Your ${relation} ${name} just turned ${person.age}. Wish them a happy birthday?`;
}

export function getAbsenceTriggerDate(lastActiveDate: string): Date | null {
  const base = new Date(`${lastActiveDate}T12:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  const trigger = new Date(base);
  trigger.setDate(trigger.getDate() + 2);
  trigger.setHours(10, 0, 0, 0);
  return trigger.getTime() > Date.now() ? trigger : null;
}

export function getDaysSinceActive(lastActiveDate: string, today = getTodayKey()): number {
  const lastMs = new Date(`${lastActiveDate}T12:00:00`).getTime();
  const todayMs = new Date(`${today}T12:00:00`).getTime();
  if (Number.isNaN(lastMs) || Number.isNaN(todayMs)) return 0;
  return Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));
}

/** True when the player has already been away 2+ days (missed scheduled absence ping). */
export function shouldCatchUpAbsenceNotification(lastActiveDate: string): boolean {
  return getDaysSinceActive(lastActiveDate) >= 2;
}

export function shouldScheduleStreakRisk(
  streak: number,
  lastActiveDate: string | undefined,
  today = getTodayKey(),
): boolean {
  if (streak <= 0) return false;
  return lastActiveDate !== today;
}

export function findNewWorldEventIds(previous: string[], next: string[]): string[] {
  const prev = new Set(previous);
  return next.filter((id) => !prev.has(id));
}

export function findNpcAgeMilestones(
  previousPeople: Person[],
  nextPeople: Person[],
): Person[] {
  const prevAges = new Map(previousPeople.map((p) => [p.id, p.age]));
  return nextPeople.filter((p) => {
    if (!p.isAlive) return false;
    const prev = prevAges.get(p.id);
    return (
      prev !== undefined &&
      p.age > prev &&
      MILESTONE_NPC_AGES.includes(p.age)
    );
  });
}

export function buildRetentionSnapshot(
  character: Character,
  dailyQuests: DailyQuest[],
): RetentionNotificationSnapshot {
  return {
    characterName: character.name,
    characterAge: character.age,
    dailyStreak: character.dailyStreak ?? 0,
    lastActiveDate: character.lastActiveDate,
    dailyQuests,
    activeWorldEventIds: character.activeWorldEvents ?? [],
  };
}

export function resolveWorldEvent(id: string): WorldEvent | undefined {
  return WORLD_EVENTS_POOL.find((e) => e.id === id);
}

import { Character, DailyQuest, Person } from '@/types';
import {
  buildRetentionSnapshot,
  findNewWorldEventIds,
  findNpcAgeMilestones,
} from './retentionNotifications';
import {
  refreshRetentionNotifications,
  notifyWorldEventStarted,
  notifyNpcMilestone,
} from './notifications';

export interface NotificationSyncState {
  character: Character | null;
  dailyQuests: DailyQuest[];
}

/** Re-schedule daily retention notifications from store snapshot. */
export async function syncGameRetentionNotifications(
  state: NotificationSyncState,
): Promise<void> {
  const { character, dailyQuests } = state;
  if (!character || !character.isAlive) {
    await refreshRetentionNotifications(null);
    return;
  }
  await refreshRetentionNotifications(buildRetentionSnapshot(character, dailyQuests));
}

/** Call after age-up to fire one-shot world/NPC notifications and refresh schedules. */
export async function handlePostAgeUpNotifications(
  state: NotificationSyncState,
  previousWorldEvents: string[],
  previousPeople: Person[],
): Promise<void> {
  const { character, dailyQuests } = state;
  if (!character) return;

  const newWorldIds = findNewWorldEventIds(
    previousWorldEvents,
    character.activeWorldEvents ?? [],
  );
  for (const id of newWorldIds) {
    await notifyWorldEventStarted(id);
  }

  const milestones = findNpcAgeMilestones(previousPeople, character.people);
  for (const person of milestones) {
    await notifyNpcMilestone(person);
  }

  await refreshRetentionNotifications(buildRetentionSnapshot(character, dailyQuests));
}

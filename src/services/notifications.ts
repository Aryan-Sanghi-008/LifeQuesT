import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from './persistence';
import {
  RETENTION_NOTIFICATION_IDS,
  RetentionNotificationSnapshot,
  buildQuestResetBody,
  buildStreakRiskBody,
  buildAbsenceBody,
  buildWorldEventBody,
  buildNpcMilestoneBody,
  getAbsenceTriggerDate,
  shouldScheduleStreakRisk,
  shouldCatchUpAbsenceNotification,
  resolveWorldEvent,
} from './retentionNotifications';
import { WorldEvent } from '@engine/worldEngine';
import { Person } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ALL_RETENTION_IDS = Object.values(RETENTION_NOTIFICATION_IDS);

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('retention', {
    name: 'Life reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync('retention-urgent', {
    name: 'Streak & events',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelRetentionSchedules(): Promise<void> {
  await Promise.all(
    ALL_RETENTION_IDS.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}

async function scheduleDaily(
  id: string,
  title: string,
  body: string,
  hour: number,
  minute: number,
  channelId = 'retention',
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

async function scheduleDate(
  id: string,
  title: string,
  body: string,
  date: Date,
  channelId = 'retention',
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  // Guard: past-date triggers crash on some devices — fire immediately instead
  if (date <= new Date()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${id}-catchup-${Date.now()}`,
      content: {
        title,
        body,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

/** Returns 'granted' | 'denied' | 'undetermined' for display in Settings UI. */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function scheduleImmediate(
  id: string,
  title: string,
  body: string,
  channelId = 'retention-urgent',
): Promise<void> {
  if (!getNotificationsEnabled()) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `${id}-${Date.now()}`,
    content: {
      title,
      body,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

export async function syncRetentionNotifications(
  snapshot: RetentionNotificationSnapshot | null,
): Promise<void> {
  if (!getNotificationsEnabled()) {
    await cancelRetentionSchedules();
    return;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await ensureAndroidChannels();
  await cancelRetentionSchedules();

  if (!snapshot) return;

  await scheduleDaily(
    RETENTION_NOTIFICATION_IDS.questReset,
    'LifeQuest',
    buildQuestResetBody(snapshot.dailyQuests),
    8,
    0,
  );

  if (shouldScheduleStreakRisk(snapshot.dailyStreak, snapshot.lastActiveDate)) {
    await scheduleDaily(
      RETENTION_NOTIFICATION_IDS.streakRisk,
      'LifeQuest',
      buildStreakRiskBody(snapshot.dailyStreak),
      23,
      0,
      'retention-urgent',
    );
  }

  if (snapshot.lastActiveDate) {
    if (shouldCatchUpAbsenceNotification(snapshot.lastActiveDate)) {
      await scheduleImmediate(
        RETENTION_NOTIFICATION_IDS.absence,
        'LifeQuest',
        buildAbsenceBody(snapshot.characterAge),
      );
    } else {
      const absenceDate = getAbsenceTriggerDate(snapshot.lastActiveDate);
      if (absenceDate) {
        await scheduleDate(
          RETENTION_NOTIFICATION_IDS.absence,
          'LifeQuest',
          buildAbsenceBody(snapshot.characterAge),
          absenceDate,
        );
      }
    }
  }
}

export async function notifyWorldEventStarted(eventId: string): Promise<void> {
  const event = resolveWorldEvent(eventId);
  if (!event || !getNotificationsEnabled()) return;
  await scheduleImmediate('world-event', 'LifeQuest', buildWorldEventBody(event));
}

export async function notifyNpcMilestone(person: Person): Promise<void> {
  if (!getNotificationsEnabled()) return;
  await scheduleImmediate(
    'npc-milestone',
    'LifeQuest',
    buildNpcMilestoneBody(person),
  );
}

/** @deprecated Use syncRetentionNotifications — kept for settings toggle */
export async function scheduleDailyReminder(): Promise<void> {
  await syncRetentionNotifications(null);
}

export async function initNotifications(): Promise<void> {
  if (!getNotificationsEnabled()) return;
  await requestNotificationPermission();
}

export async function setNotificationsPreference(enabled: boolean): Promise<void> {
  setNotificationsEnabled(enabled);
  if (enabled) {
    const { useGameStore } = await import('@store/gameStore');
    const { syncGameRetentionNotifications } = await import('./notificationSync');
    const state = useGameStore.getState();
    await syncGameRetentionNotifications({
      character: state.character,
      dailyQuests: state.dailyQuests,
    });
  } else {
    await cancelRetentionSchedules();
  }
}

export async function refreshRetentionNotifications(
  snapshot: RetentionNotificationSnapshot | null,
): Promise<void> {
  await syncRetentionNotifications(snapshot);
}

export type { WorldEvent };

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  getNotificationsEnabled, setNotificationsEnabled,
} from './persistence';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_ID = 'daily-life-reminder';

export async function initNotifications(): Promise<void> {
  if (!getNotificationsEnabled()) return;
  await requestNotificationPermission();
  await scheduleDailyReminder();
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});

  if (!getNotificationsEnabled()) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'LifeQuesT',
      body: 'Your life awaits — age up today!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Life reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function setNotificationsPreference(enabled: boolean): Promise<void> {
  setNotificationsEnabled(enabled);
  if (enabled) {
    await scheduleDailyReminder();
  } else {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  }
}

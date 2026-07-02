// ─── LifeQuest Haptics Service ────────────────────────────────────────────────

import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';
import { useSettingsStore } from '../store/settingsStore';

function hapticsEnabled(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

async function runAndroidHaptic(type: ExpoHaptics.AndroidHaptics): Promise<void> {
  try {
    await ExpoHaptics.performAndroidHapticsAsync(type);
  } catch {
    // Fallback for older Android builds without performAndroidHapticsAsync.
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
  }
}

async function runImpact(style: ExpoHaptics.ImpactFeedbackStyle): Promise<void> {
  if (Platform.OS === 'android') {
    const androidMap: Partial<Record<ExpoHaptics.ImpactFeedbackStyle, ExpoHaptics.AndroidHaptics>> = {
      [ExpoHaptics.ImpactFeedbackStyle.Light]: ExpoHaptics.AndroidHaptics.Keyboard_Tap,
      [ExpoHaptics.ImpactFeedbackStyle.Medium]: ExpoHaptics.AndroidHaptics.Context_Click,
      [ExpoHaptics.ImpactFeedbackStyle.Heavy]: ExpoHaptics.AndroidHaptics.Long_Press,
      [ExpoHaptics.ImpactFeedbackStyle.Rigid]: ExpoHaptics.AndroidHaptics.Virtual_Key,
      [ExpoHaptics.ImpactFeedbackStyle.Soft]: ExpoHaptics.AndroidHaptics.Segment_Tick,
    };
    await runAndroidHaptic(androidMap[style] ?? ExpoHaptics.AndroidHaptics.Context_Click);
    return;
  }
  await ExpoHaptics.impactAsync(style);
}

async function runNotification(type: ExpoHaptics.NotificationFeedbackType): Promise<void> {
  if (Platform.OS === 'android') {
    const androidType =
      type === ExpoHaptics.NotificationFeedbackType.Error
        ? ExpoHaptics.AndroidHaptics.Reject
        : ExpoHaptics.AndroidHaptics.Confirm;
    await runAndroidHaptic(androidType);
    return;
  }
  await ExpoHaptics.notificationAsync(type);
}

/** Trigger a light tap (button press, selection) */
export function triggerLightImpact(): void {
  if (!hapticsEnabled()) return;
  void runImpact(ExpoHaptics.ImpactFeedbackStyle.Light);
}

/** Trigger a medium impact (major action, confirmation) */
export function triggerMediumImpact(): void {
  if (!hapticsEnabled()) return;
  void runImpact(ExpoHaptics.ImpactFeedbackStyle.Medium);
}

/** Trigger a heavy impact (age-up, life milestone) */
export function triggerHeavyImpact(): void {
  if (!hapticsEnabled()) return;
  void runImpact(ExpoHaptics.ImpactFeedbackStyle.Heavy);
}

/** Trigger success notification (achievement, quest complete) */
export function triggerSuccess(): void {
  if (!hapticsEnabled()) return;
  void runNotification(ExpoHaptics.NotificationFeedbackType.Success);
}

/** Trigger error notification (failed action, insufficient funds) */
export function triggerError(): void {
  if (!hapticsEnabled()) return;
  void runNotification(ExpoHaptics.NotificationFeedbackType.Error);
}

/** Trigger warning notification (risky decision, health warning) */
export function triggerWarning(): void {
  if (!hapticsEnabled()) return;
  void runNotification(ExpoHaptics.NotificationFeedbackType.Warning);
}

export function hapticButtonPress(): void {
  // Use medium on Android — Keyboard_Tap (Light) is imperceptible; Context_Click is standard UX.
  if (Platform.OS === 'android') {
    triggerMediumImpact();
  } else {
    triggerLightImpact();
  }
}

export function hapticAgeUp(): void {
  triggerHeavyImpact();
}

export function hapticAchievement(): void {
  triggerSuccess();
}

export function hapticMoneyEarned(): void {
  triggerMediumImpact();
}

export function hapticNegativeEvent(): void {
  triggerError();
}

export function hapticDecision(): void {
  triggerMediumImpact();
}

export function hapticMilestone(): void {
  if (!hapticsEnabled()) return;
  void runNotification(ExpoHaptics.NotificationFeedbackType.Success);
}

export function hapticDeath(): void {
  if (!hapticsEnabled()) return;
  void runImpact(ExpoHaptics.ImpactFeedbackStyle.Medium);
  setTimeout(() => {
    void runImpact(ExpoHaptics.ImpactFeedbackStyle.Heavy);
  }, 150);
  setTimeout(() => {
    void runImpact(ExpoHaptics.ImpactFeedbackStyle.Medium);
  }, 350);
}

/** Settings preview — always fires when explicitly requested. */
export function previewHapticTap(): void {
  void runImpact(ExpoHaptics.ImpactFeedbackStyle.Light);
}

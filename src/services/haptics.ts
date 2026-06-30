// ─── LifeQuest Haptics Service ────────────────────────────────────────────────
// Comprehensive haptic feedback patterns for all game interactions.

import * as ExpoHaptics from "expo-haptics";
import { useSettingsStore } from "../store/settingsStore";

// ─── Haptic pattern types ─────────────────────────────────────────────────────

/** Trigger a light tap (button press, selection) */
export function triggerLightImpact(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
}

/** Trigger a medium impact (major action, confirmation) */
export function triggerMediumImpact(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
}

/** Trigger a heavy impact (age-up, life milestone) */
export function triggerHeavyImpact(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
}

/** Trigger success notification (achievement, quest complete) */
export function triggerSuccess(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.notificationAsync(
    ExpoHaptics.NotificationFeedbackType.Success,
  );
}

/** Trigger error notification (failed action, insufficient funds) */
export function triggerError(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.notificationAsync(
    ExpoHaptics.NotificationFeedbackType.Error,
  );
}

/** Trigger warning notification (risky decision, health warning) */
export function triggerWarning(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.notificationAsync(
    ExpoHaptics.NotificationFeedbackType.Warning,
  );
}

// ─── Semantic haptic triggers ─────────────────────────────────────────────────

/** Used for any button tap/press */
export function hapticButtonPress(): void {
  triggerLightImpact();
}

/** Used when aging up */
export function hapticAgeUp(): void {
  triggerHeavyImpact();
}

/** Used when an achievement is unlocked */
export function hapticAchievement(): void {
  triggerSuccess();
}

/** Used when earning coins or money */
export function hapticMoneyEarned(): void {
  triggerMediumImpact();
}

/** Used when something bad happens (health drop, negative event) */
export function hapticNegativeEvent(): void {
  triggerError();
}

/** Used when a decision is made */
export function hapticDecision(): void {
  triggerMediumImpact();
}

/** Used for life milestones (marriage, graduation, etc.) */
export function hapticMilestone(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  void ExpoHaptics.notificationAsync(
    ExpoHaptics.NotificationFeedbackType.Success,
  );
}

/** Used on character death */
export function hapticDeath(): void {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  // Sequence: medium → heavy → medium for dramatic effect
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
  setTimeout(
    () => void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy),
    150,
  );
  setTimeout(
    () => void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium),
    350,
  );
}

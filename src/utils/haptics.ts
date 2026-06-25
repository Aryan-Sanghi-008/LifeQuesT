import * as Haptics from 'expo-haptics';
import { getHapticsEnabled } from '@services/persistence';

export async function triggerLightImpact(): Promise<void> {
  if (!getHapticsEnabled()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable in simulator or web
  }
}

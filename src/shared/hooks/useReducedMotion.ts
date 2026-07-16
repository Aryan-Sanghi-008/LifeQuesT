import { useSettingsStore } from "@store/settingsStore";
import { useAccessibilityPreferences } from "@hooks/useAccessibilityPreferences";

/** OR merge for system + manual reduced motion preferences. */
export function mergeReducedMotion(system: boolean, manual: boolean): boolean {
  return system || manual;
}

/** True when OS reduce-motion is on OR user enabled reduced motion in Settings. */
export function useReducedMotion(): boolean {
  const manual = useSettingsStore((s) => s.reducedMotion);
  const { systemReduceMotion } = useAccessibilityPreferences();
  return mergeReducedMotion(systemReduceMotion, manual);
}

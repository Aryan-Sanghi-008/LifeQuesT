import { useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";

export interface AccessibilityPreferences {
  systemReduceMotion: boolean;
  highTextContrast: boolean;
}

async function readPreferences(): Promise<AccessibilityPreferences> {
  const [systemReduceMotion, highTextContrast] = await Promise.all([
    AccessibilityInfo.isReduceMotionEnabled(),
    AccessibilityInfo.isHighTextContrastEnabled(),
  ]);
  return { systemReduceMotion, highTextContrast };
}

export function useAccessibilityPreferences(): AccessibilityPreferences {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    systemReduceMotion: false,
    highTextContrast: false,
  });

  useEffect(() => {
    let mounted = true;
    void readPreferences().then((p) => {
      if (mounted) setPrefs(p);
    });

    const onReduceMotionChanged = (enabled: boolean) => {
      setPrefs((prev) => ({ ...prev, systemReduceMotion: enabled }));
    };

    const reduceSub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      onReduceMotionChanged,
    );

    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void readPreferences().then((p) => {
          if (mounted) setPrefs(p);
        });
      }
    });

    return () => {
      mounted = false;
      reduceSub.remove();
      appSub.remove();
    };
  }, []);

  return prefs;
}

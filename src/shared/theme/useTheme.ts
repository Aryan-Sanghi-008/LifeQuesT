import { useColorScheme as useNativeColorScheme } from "react-native";
import { useSettingsStore } from "@store/settingsStore";
import {
  COLORS,
  DARK_COLORS,
  FONTS,
  SPACING,
  RADII,
  SHADOWS,
  ANIM,
  applyThemeVariant,
  applyHighContrast,
} from "./themes";
import { scaleFontSizes } from "./a11y";
import { applyColorBlindMode } from "./colorBlind";
import { useFontScale } from "@hooks/useFontScale";
import { useAccessibilityPreferences } from "@hooks/useAccessibilityPreferences";

export function useTheme() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const appThemeId = useSettingsStore((s) => s.appThemeId);
  const colorBlindMode = useSettingsStore((s) => s.colorBlindMode);
  const manualReducedMotion = useSettingsStore((s) => s.reducedMotion);
  const systemScheme = useNativeColorScheme();
  const fontScale = useFontScale();
  const { systemReduceMotion, highTextContrast } = useAccessibilityPreferences();

  const activeScheme =
    colorScheme === "system" ? (systemScheme ?? "light") : colorScheme;
  const isDark = activeScheme === "dark";

  const baseColors = isDark ? DARK_COLORS : COLORS;
  let colors = applyThemeVariant(baseColors, appThemeId, isDark);
  if (highTextContrast) {
    colors = applyHighContrast(colors, isDark);
  }
  colors = applyColorBlindMode(colors, colorBlindMode);

  const reducedMotion = systemReduceMotion || manualReducedMotion;

  return {
    isDark,
    colors,
    fonts: FONTS,
    fontScale,
    scaledFonts: scaleFontSizes(fontScale),
    highContrast: highTextContrast,
    colorBlindMode,
    reducedMotion,
    systemReduceMotion,
    spacing: SPACING,
    radii: RADII,
    shadows: SHADOWS,
    anim: ANIM,
  };
}

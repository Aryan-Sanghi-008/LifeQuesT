import { useColorScheme as useNativeColorScheme } from "react-native";
import { useSettingsStore } from "@store/settingsStore";
import { COLORS, DARK_COLORS, FONTS, SPACING, RADII, SHADOWS, ANIM, applyThemeVariant } from "./themes";

export function useTheme() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const appThemeId = useSettingsStore((s) => s.appThemeId);
  const systemScheme = useNativeColorScheme();

  const activeScheme =
    colorScheme === "system" ? (systemScheme ?? "light") : colorScheme;
  const isDark = activeScheme === "dark";

  const baseColors = isDark ? DARK_COLORS : COLORS;
  const colors = applyThemeVariant(baseColors, appThemeId, isDark);

  return {
    isDark,
    colors,
    fonts: FONTS,
    spacing: SPACING,
    radii: RADII,
    shadows: SHADOWS,
    anim: ANIM,
  };
}

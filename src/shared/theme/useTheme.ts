import { useColorScheme as useNativeColorScheme } from "react-native";
import { useSettingsStore } from "@store/settingsStore";
import { COLORS, DARK_COLORS, FONTS, SPACING, RADII, SHADOWS, ANIM } from "./themes";

export function useTheme() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useNativeColorScheme();

  const activeScheme =
    colorScheme === "system" ? (systemScheme ?? "light") : colorScheme;
  const isDark = activeScheme === "dark";

  return {
    isDark,
    colors: isDark ? DARK_COLORS : COLORS,
    fonts: FONTS,
    spacing: SPACING,
    radii: RADII,
    shadows: SHADOWS,
    anim: ANIM,
  };
}

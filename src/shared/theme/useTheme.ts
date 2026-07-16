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
  getThemeSkin,
  migrateThemeSkinId,
} from "./themes";
import { scaleFontSizes } from "./a11y";
import { applyColorBlindMode } from "./colorBlind";
import { useFontScale } from "@hooks/useFontScale";
import { useAccessibilityPreferences } from "@hooks/useAccessibilityPreferences";
import { applyFontPack, resolveFontPackId } from "@data/fontPacks";

export function useTheme() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const appThemeIdRaw = useSettingsStore((s) => s.appThemeId);
  const appThemeId = migrateThemeSkinId(appThemeIdRaw);
  const colorBlindMode = useSettingsStore((s) => s.colorBlindMode);
  const manualReducedMotion = useSettingsStore((s) => s.reducedMotion);
  const equippedNameFontId = useSettingsStore((s) => s.equippedNameFontId);
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
  const skin = getThemeSkin(appThemeId);
  const skinActive = !!skin && ((skin.mode === "dark") === isDark);
  const fonts = applyFontPack(FONTS, resolveFontPackId(equippedNameFontId));

  return {
    isDark,
    colors,
    fonts,
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
    appThemeId,
    themeSkin: skinActive ? skin : null,
    gradientHero: skinActive && skin
      ? skin.gradientHero
      : (isDark
          ? (["#0D1117", "#161B22"] as [string, string])
          : (["#F4F6F9", "#ECEEF2"] as [string, string])),
    cardChrome: skinActive && skin ? skin.cardChrome : "transparent",
  };
}

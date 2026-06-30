import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useTheme } from "./useTheme";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: ReturnType<typeof useTheme>) => T,
): T {
  const theme = useTheme();
  return useMemo(
    () => StyleSheet.create(factory(theme)),
    [theme.isDark, factory],
  );
}

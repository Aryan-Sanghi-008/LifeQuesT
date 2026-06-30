import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";

interface ScreenShellProps {
  children: ReactNode;
  footer?: ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  style?: ViewStyle;
}

/** Shared screen wrapper — premium gradient backdrop + consistent safe area. */
export function ScreenShell({
  children,
  footer,
  edges = ["top"],
  style,
}: ScreenShellProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }, style]}>
      {isDark ? (
        <LinearGradient
          colors={[colors.bg2, colors.bg, colors.bg]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={styles.body}>{children}</View>
      </SafeAreaView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  body: { flex: 1 },
});

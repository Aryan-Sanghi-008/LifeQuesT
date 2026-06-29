import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@theme";

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
}

/** Premium glass-style surface used across tabs. */
export function GlassCard({ children, style, accent }: GlassCardProps) {
  const { colors, radii, shadows, isDark } = useTheme();
  const borderColor = accent ? `${accent}35` : colors.border;

  return (
    <View
      style={[
        styles.card,
        shadows.subtle,
        {
          backgroundColor: isDark ? `${colors.bgCard}EE` : colors.bgCard,
          borderColor,
          borderRadius: radii.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
});

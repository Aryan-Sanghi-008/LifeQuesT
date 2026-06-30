import { ReactNode } from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { RADII, useTheme } from "@theme";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  glow?: boolean;
}

export function Card({ children, style, onPress, accentColor, glow }: CardProps) {
  const { colors, radii, shadows, spacing } = useTheme();
  const cardStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  };

  const content = (
    <View
      style={[
        cardStyle,
        accentColor ? { borderColor: accentColor + "30", borderWidth: 1.5 } : undefined,
        glow && accentColor
          ? { shadowColor: accentColor, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 }
          : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.04)" }}
      style={{ borderRadius: RADII.lg, overflow: "hidden" }}
    >
      {content}
    </Pressable>
  );
}

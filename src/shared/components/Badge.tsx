import { View, Text, ViewStyle, TextStyle, StyleSheet } from "react-native";
import { RADII, useTheme } from "@theme";

interface BadgeProps {
  label: string;
  color: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, color, style, textStyle }: BadgeProps) {
  const { fonts } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "15", borderColor: color + "35" },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color, fontFamily: fonts.bodySemiBold }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

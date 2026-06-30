import { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { RADII, SPACING, useTheme } from "@theme";

interface ChipProps {
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
  icon?: ReactNode;
}

export function Chip({ label, selected, color, onPress, icon }: ChipProps) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${color}18` }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.bgCard, borderColor: colors.border },
      ]}
    >
      {icon && <View>{icon}</View>}
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : color, fontFamily: fonts.bodySemiBold },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADII.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 12,
  },
});

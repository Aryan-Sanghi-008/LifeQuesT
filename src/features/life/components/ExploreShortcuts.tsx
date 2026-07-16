import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@theme";

export function ExploreShortcuts({
  onActivities,
  onSocial,
}: {
  onActivities: () => void;
  onSocial: () => void;
}) {
  const { colors, fonts, spacing, radii } = useTheme();

  const chips = [
    { label: "Activities", onPress: onActivities, color: colors.emerald },
    { label: "Social", onPress: onSocial, color: colors.orchid },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.sm,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.label}
          onPress={chip.onPress}
          style={[
            styles.chip,
            {
              borderColor: `${chip.color}40`,
              backgroundColor: `${chip.color}10`,
              borderRadius: radii.full,
            },
          ]}
        >
          <Text style={[styles.text, { color: chip.color, fontFamily: fonts.bodySemiBold }]}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  text: { fontSize: 12 },
});

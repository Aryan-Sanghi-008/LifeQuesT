import { Text, ViewStyle } from "react-native";
import { useTheme } from "@theme";

export function SectionLabel({ label, style }: { label: string; style?: ViewStyle }) {
  const { colors, fonts, spacing } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.bodySemiBold,
          fontSize: 11,
          color: colors.t4,
          letterSpacing: 1.5,
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

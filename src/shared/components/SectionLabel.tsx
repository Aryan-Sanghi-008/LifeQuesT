import { Text, ViewStyle } from "react-native";
import { useTheme } from "@theme";

export function SectionLabel({ label, style }: { label: string; style?: ViewStyle }) {
  const { colors, fonts, spacing, scaledFonts } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.bodySemiBold,
          fontSize: scaledFonts.sm,
          color: colors.t3,
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

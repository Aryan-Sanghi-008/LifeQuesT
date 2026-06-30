import { Pressable, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import type { YearReviewSnapshot } from "@/types";

interface YearReviewBannerProps {
  review: YearReviewSnapshot;
  onPress: () => void;
}

/** Compact call-to-action — full review opens in a modal. */
export function YearReviewBanner({ review, onPress }: YearReviewBannerProps) {
  const { colors, fonts, radii, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open year in review for age ${review.age}`}
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}
    >
      <LinearGradient
        colors={[`${colors.gold}22`, `${colors.gold3 ?? colors.gold}12`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.wrap,
          {
            borderColor: `${colors.gold}45`,
            borderRadius: radii.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.kicker, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
          YEAR IN REVIEW
        </Text>
        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
          Age {review.age} summary ready
        </Text>
        <Text style={[styles.hint, { color: colors.t3, fontFamily: fonts.body }]}>
          Tap to view focus, memories & stat changes
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, gap: 2 },
  kicker: { fontSize: 9, letterSpacing: 1.4 },
  title: { fontSize: 14 },
  hint: { fontSize: 11, marginTop: 2 },
});

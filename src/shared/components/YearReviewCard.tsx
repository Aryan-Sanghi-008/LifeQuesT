import { useEffect, useRef } from "react";
import { Animated, Text, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@theme";
import type { YearReviewSnapshot } from "@/types";
import { FOCUS_DOMAIN_MAP } from "@data/focusDomains";

interface YearReviewCardProps {
  review: YearReviewSnapshot;
  onDismiss: () => void;
}

export function YearReviewCard({ review, onDismiss }: YearReviewCardProps) {
  const { colors, fonts, radii, spacing } = useTheme();

  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const focusEntries = Object.entries(review.focusAllocation ?? {}).filter(
    ([, v]) => (v ?? 0) > 0,
  );
  const statEntries = Object.entries(review.statDeltas ?? {}).filter(
    ([, v]) => v !== 0,
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.gold,
          borderWidth: 1.2,
          borderRadius: radii.lg,
          padding: spacing.lg,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          opacity,
          transform: [{ scale }],
          // Gold glow styling for milestone ceremony feel
          shadowColor: colors.gold,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 4,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.t1, fontFamily: fonts.bodyBold, marginBottom: spacing.sm },
        ]}
      >
        Age {review.age} &mdash; Year in Review
      </Text>

      {focusEntries.length > 0 && (
        <View style={[styles.section, { marginTop: spacing.sm }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.t3, fontFamily: fonts.bodyBold },
            ]}
          >
            Focus
          </Text>
          {focusEntries.map(([domain, pts]) => (
            <Text
              key={domain}
              style={[styles.line, { color: colors.t2, fontFamily: fonts.body }]}
            >
              {FOCUS_DOMAIN_MAP[domain as keyof typeof FOCUS_DOMAIN_MAP]?.label ??
                domain}
              : {pts} pt
            </Text>
          ))}
        </View>
      )}

      {review.newMemoryTagIds.length > 0 && (
        <View style={[styles.section, { marginTop: spacing.sm }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.t3, fontFamily: fonts.bodyBold },
            ]}
          >
            New Memories
          </Text>
          {review.newMemoryTagIds.slice(0, 4).map((tag) => (
            <Text
              key={tag}
              style={[styles.line, { color: colors.t2, fontFamily: fonts.body }]}
            >
              {tag.replace(/_/g, " ")}
            </Text>
          ))}
        </View>
      )}

      {statEntries.length > 0 && (
        <View style={[styles.section, { marginTop: spacing.sm }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.t3, fontFamily: fonts.bodyBold },
            ]}
          >
            Stat Changes
          </Text>
          {statEntries.map(([key, delta]) => {
            const isPos = (delta ?? 0) >= 0;
            return (
              <Text
                key={key}
                style={[
                  styles.line,
                  {
                    color: isPos ? colors.emerald : colors.crimson,
                    fontFamily: fonts.body,
                  },
                ]}
              >
                {key}: {isPos ? "+" : ""}
                {delta}
              </Text>
            );
          })}
        </View>
      )}

      <Pressable
        accessibilityLabel="Dismiss year review"
        onPress={onDismiss}
        style={[
          styles.btn,
          {
            backgroundColor: colors.sapphire,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            marginTop: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.btnText,
            { color: colors.t1, fontFamily: fonts.bodyBold },
          ]}
        >
          Continue
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  title: { fontSize: 16 },
  section: {},
  sectionTitle: { fontSize: 12, marginBottom: 4 },
  line: { fontSize: 13, marginBottom: 2 },
  btn: {
    alignSelf: "flex-end",
  },
  btnText: { fontSize: 13 },
});

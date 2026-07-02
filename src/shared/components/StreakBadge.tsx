import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, AccessibilityInfo } from "react-native";
import { useTheme } from "@theme";
import Svg, { Path } from "react-native-svg";
import { STREAK_MILESTONES } from "@store/slices/progressionSlice";

interface Props {
  count: number;
  shieldCount?: number;
  showMilestoneProgress?: boolean;
  onPress?: () => void;
}

function FlameIcon({ accent }: { accent: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.85)).current;
  const reduceRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      reduceRef.current = reduced;
      if (reduced) return;

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.18, duration: 600, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.9, duration: 500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.85, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    });
  }, [scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2c1 3 2.5 3.5 3.5 5.5.5 1 .5 2.5-.5 3.5-1 1-2.5 1-3.5 0S9 10 8.5 9C7.5 7 9 6 10 3c.5-1 1.5-1 2-1z"
          stroke={accent} strokeWidth={1.8} strokeLinejoin="round" fill={`${accent}25`}
        />
        <Path
          d="M12 22c-2-2-4-4.5-4-7.5 0-2 1.5-3.5 4-5.5 2.5 2 4 3.5 4 5.5 0 3-2 5.5-4 7.5z"
          stroke={accent} strokeWidth={1.8} strokeLinejoin="round" fill={`${accent}15`}
        />
      </Svg>
    </Animated.View>
  );
}

export function StreakBadge({ count, shieldCount = 0, showMilestoneProgress = false, onPress }: Props) {
  const { colors, fonts } = useTheme();
  const accent = colors.gold;

  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > count);
  const prevMilestone = [...STREAK_MILESTONES].reverse().find((m) => m.days <= count);
  const progressStart = prevMilestone?.days ?? 0;
  const progressEnd = nextMilestone?.days ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1].days;
  const pct = nextMilestone
    ? Math.min(100, ((count - progressStart) / (progressEnd - progressStart)) * 100)
    : 100;

  const content = (
    <View style={{ gap: 4 }}>
      <View style={[styles.badge, { backgroundColor: `${accent}12`, borderColor: `${accent}30` }]}>
        <FlameIcon accent={accent} />
        <Text style={[styles.countText, { color: accent, fontFamily: fonts.monoSemiBold }]}>
          {count}
        </Text>
        {shieldCount > 0 && (
          <View style={[styles.shieldBadge, { backgroundColor: `${colors.sapphire}20` }]}>
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
              <Path stroke={colors.sapphire} strokeWidth={2.5} strokeLinecap="round"
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </Svg>
            <Text style={{ color: colors.sapphire, fontFamily: fonts.monoSemiBold, fontSize: 9 }}>
              {shieldCount}
            </Text>
          </View>
        )}
      </View>

      {showMilestoneProgress && nextMilestone && (
        <View style={{ gap: 2 }}>
          <View style={[styles.progressTrack, { backgroundColor: colors.bg2 }]}>
            <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: accent }]} />
          </View>
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 9 }}>
            {count}/{nextMilestone.days}d → {nextMilestone.rewardLabel}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${count} day streak`}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    alignSelf: "flex-start",
  },
  countText: { fontSize: 11, fontWeight: "700" },
  shieldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4,
  },
  progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden', width: 80 },
  progressFill: { height: 3, borderRadius: 2 },
});

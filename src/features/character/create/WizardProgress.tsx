import { useRef, Fragment } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";

export const STEP_COUNT = 5;

export const STEP_LABELS = [
  "Identity",
  "Origins",
  "Traits",
  "Personality",
  "Scenario",
] as const;

export const STEP_COLORS = ["#8B5CF6", "#F59E0B"] as const;

export function getStepColors(colors: {
  sapphire: string;
  catCareer: string;
  orchid: string;
}): string[] {
  return [
    colors.sapphire,
    colors.catCareer,
    colors.orchid,
    STEP_COLORS[0],
    STEP_COLORS[1],
  ];
}

type StepProgressBarProps = {
  current: number;
};

export function StepProgressBar({ current }: StepProgressBarProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getProgressStyles(radii, spacing, shadows);

  const pct = ((current + 1) / STEP_COUNT) * 100;
  const anim = useRef(new Animated.Value((current / STEP_COUNT) * 100)).current;

  Animated.spring(anim, {
    toValue: pct,
    useNativeDriver: false,
    damping: 20,
    stiffness: 180,
  }).start();

  const widthPct = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.spbWrap}>
      <View style={[styles.spbTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.spbFill,
            { width: widthPct, backgroundColor: colors.sapphire },
          ]}
        />
      </View>
      <View style={styles.spbDots}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Fragment key={i}>
              <View
                style={[
                  styles.spbDot,
                  {
                    backgroundColor: colors.bg2,
                    borderColor: colors.border,
                  },
                  done && {
                    backgroundColor: colors.sapphire,
                    borderColor: colors.sapphire,
                  },
                  active && {
                    borderColor: colors.sapphire,
                    backgroundColor: `${colors.sapphire}12`,
                  },
                ]}
              >
                {done ? (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                ) : (
                  <Text
                    style={[
                      styles.spbDotNum,
                      { color: colors.t4, fontFamily: fonts.body },
                      active && { color: colors.sapphire },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < STEP_COUNT - 1 && (
                <View
                  style={[
                    styles.spbConnector,
                    { backgroundColor: colors.border },
                    i < current && { backgroundColor: colors.sapphire },
                  ]}
                />
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const getProgressStyles = (
  _radii: { sm: number },
  spacing: Record<string, number>,
  _shadows: object,
) =>
  StyleSheet.create({
    spbWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    spbTrack: {
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    spbFill: { height: "100%", borderRadius: 2 },
    spbDots: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    spbDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    spbDotNum: { fontSize: 11 },
    spbConnector: {
      flex: 1,
      height: 2,
      marginHorizontal: 4,
      maxWidth: 40,
    },
  });

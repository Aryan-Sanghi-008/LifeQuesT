import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "@theme";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  level: number;
  currentXp: number;
  maxXp: number;
}

export function XPBar({ level, currentXp, maxXp }: Props) {
  const { colors, fonts, radii } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const percentage = Math.max(0, Math.min(1, currentXp / maxXp));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percentage, progressAnim]);

  useEffect(() => {
    let isMounted = true;
    const runShimmer = () => {
      if (!isMounted) return;
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (isMounted) {
            runShimmer();
          }
        }, 2200);
      });
    };
    runShimmer();
    return () => {
      isMounted = false;
    };
  }, [shimmerAnim]);

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <View style={styles.container}>
      <View style={styles.levelsInfo}>
        <Text
          style={[
            styles.levelLabel,
            { color: colors.t2, fontFamily: fonts.bodyBold },
          ]}
        >
          LEVEL {level}
        </Text>
        <Text
          style={[
            styles.xpText,
            { color: colors.t3, fontFamily: fonts.mono },
          ]}
        >
          {currentXp} / {maxXp} XP
        </Text>
      </View>
      <View
        style={[
          styles.barOutline,
          { backgroundColor: colors.bg2, borderRadius: radii.full },
        ]}
      >
        <Animated.View
          style={[styles.barFillContainer, { width: widthInterpolation }]}
        >
          <LinearGradient
            colors={[colors.teal, colors.teal2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius: radii.full }]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [{ translateX: shimmerTranslate }, { skewX: "-25deg" }],
                  width: "30%",
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.35)",
                  "rgba(255, 255, 255, 0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  levelsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  xpText: {
    fontSize: 11,
  },
  barOutline: {
    height: 10,
    width: "100%",
    overflow: "hidden",
  },
  barFillContainer: {
    height: "100%",
  },
  gradient: {
    flex: 1,
    overflow: "hidden",
  },
});

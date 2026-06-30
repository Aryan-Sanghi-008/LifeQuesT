import { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { useTheme } from "@theme";

export interface StatBarProps {
  value: number;
  color: string;
  height?: number;
  animated?: boolean;
  delay?: number;
  rounded?: boolean;
}

export function StatBar({
  value,
  color,
  height = 6,
  animated = true,
  delay = 0,
  rounded = true,
}: StatBarProps) {
  const { colors } = useTheme();
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(value);
      return;
    }
    const timer = setTimeout(() => {
      Animated.timing(width, {
        toValue: value,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, delay + 50);
    return () => clearTimeout(timer);
  }, [value, animated, delay, width]);

  const widthPct = width.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const r = rounded ? height / 2 : 2;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: r,
          backgroundColor: colors.border,
        },
      ]}
    >
      <Animated.View
        style={{
          width: widthPct,
          backgroundColor: color,
          height: "100%",
          borderRadius: r,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});

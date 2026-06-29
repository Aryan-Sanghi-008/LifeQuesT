import { useEffect, useRef } from "react";
import { Animated, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@theme";

interface Props {
  height?: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ height = 100, width = "100%", style }: Props) {
  const { colors, radii } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.8,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          height,
          width,
          backgroundColor: colors.border,
          borderRadius: radii.md,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
});

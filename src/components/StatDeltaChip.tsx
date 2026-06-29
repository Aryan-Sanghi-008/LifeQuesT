import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";

interface Props {
  value: number;
  statName: string;
  onAnimationComplete?: () => void;
}

export function StatDeltaChip({ value, statName, onAnimationComplete }: Props) {
  const { colors, fonts, radii } = useTheme();

  const slideAnim = useRef(new Animated.Value(15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;

  // Diagonal horizontal drift target: random value between -15 and +15
  const driftTarget = useRef((Math.random() - 0.5) * 30).current;

  const isPositive = value >= 0;
  const formattedVal = isPositive ? `+${value}` : `${value}`;

  const deltaColor = isPositive ? colors.emerald : colors.crimson;
  const bg = isPositive ? `${colors.emerald}12` : `${colors.crimson}12`;
  const border = isPositive ? `${colors.emerald}25` : `${colors.crimson}25`;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -15,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(driftAnim, {
        toValue: driftTarget,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 10,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [slideAnim, driftAnim, scaleAnim, opacityAnim, driftTarget, onAnimationComplete]);

  return (
    <Animated.View
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radii.sm,
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: driftAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: deltaColor, fontFamily: fonts.bodySemiBold },
        ]}
      >
        {formattedVal} {statName.charAt(0).toUpperCase() + statName.slice(1)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: "center",
    position: "absolute",
    zIndex: 100,
  },
  text: {
    fontSize: 12,
  },
});

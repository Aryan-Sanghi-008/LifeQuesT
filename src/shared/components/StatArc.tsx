import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StatArcProps {
  value: number;      // 0–100
  color: string;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function StatArc({ value, color, label, size = 60, strokeWidth = 5 }: StatArcProps) {
  const { fonts, colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.max(0, Math.min(100, value)),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke={`${color}25`}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Numeric value centered in arc */}
      <View style={[StyleSheet.absoluteFill, styles.valueWrap]}>
        <Text style={[styles.value, { color, fontFamily: fonts.monoSemiBold, fontSize: size * 0.22 }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.body }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 3 },
  valueWrap: { alignItems: 'center', justifyContent: 'center' },
  value: { lineHeight: undefined },
  label: { fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase' },
});

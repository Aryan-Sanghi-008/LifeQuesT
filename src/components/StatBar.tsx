import { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

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
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(value);
      return;
    }
    const timer = setTimeout(() => {
      Animated.spring(width, {
        toValue: value,
        useNativeDriver: false,
        damping: 22,
        stiffness: 160,
      }).start();
    }, delay + 50);
    return () => clearTimeout(timer);
  }, [value, animated, delay, width]);

  const widthPct = width.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const r = rounded ? height / 2 : 2;

  return (
    <View
      className="w-full overflow-hidden bg-border-2"
      style={{ height, borderRadius: r }}
    >
      <Animated.View
        style={{
          width: widthPct,
          backgroundColor: color,
          height: '100%',
          borderRadius: r,
        }}
      />
    </View>
  );
}

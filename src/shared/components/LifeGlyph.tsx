import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useThemedStyles, useTheme } from '@theme';

interface LifeGlyphProps {
  size?: number;
}

export default function LifeGlyph({ size = 100 }: LifeGlyphProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const ring1Rotate = useRef(new Animated.Value(0)).current;
  const ring2Rotate = useRef(new Animated.Value(0)).current;
  const coreScale   = useRef(new Animated.Value(1)).current;
  const coreOpacity = useRef(new Animated.Value(0.85)).current;
  const glowScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ring 1 — slow clockwise
    Animated.loop(
      Animated.timing(ring1Rotate, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Ring 2 — faster counter-clockwise
    Animated.loop(
      Animated.timing(ring2Rotate, {
        toValue: -1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Core pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(coreScale,   { toValue: 1.18, duration: 1200, useNativeDriver: true }),
          Animated.timing(coreOpacity, { toValue: 1,    duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(coreScale,   { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(coreOpacity, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Outer glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 0.97, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const s = size;
  const ring1Spin = ring1Rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ring2Spin = ring2Rotate.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: s / 2,
            backgroundColor: colors.gold,
            opacity: 0.04,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Ring 1 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: s,
            height: s,
            borderRadius: s / 2,
            borderColor: colors.goldBorder,
            transform: [{ rotate: ring1Spin }],
          },
        ]}
      />

      {/* Ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: s * 0.76,
            height: s * 0.76,
            borderRadius: (s * 0.76) / 2,
            borderColor: colors.tealBorder,
            position: 'absolute',
            transform: [{ rotate: ring2Spin }],
          },
        ]}
      />

      {/* Core dot */}
      <Animated.View
        style={{
          width: s * 0.28,
          height: s * 0.28,
          borderRadius: (s * 0.28) / 2,
          backgroundColor: colors.gold,
          opacity: coreOpacity,
          transform: [{ scale: coreScale }],
          shadowColor: colors.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 16,
          elevation: 10,
        }}
      />
    </View>
  );
}

const createStyles = (_theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
});
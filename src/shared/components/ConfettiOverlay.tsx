import { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import { useTheme } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";

const { width: W, height: H } = Dimensions.get("window");

interface Props {
  active: boolean;
  onAnimationEnd?: () => void;
}

export function ConfettiOverlay({ active, onAnimationEnd }: Props) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const particlesCount = 50;
  const confettiColors = [
    colors.gold,
    colors.teal,
    colors.health,
    colors.intelligence,
    colors.social,
    colors.wealth,
  ];

  // We will create the particles once.
  const particles = useRef(
    Array.from({ length: particlesCount }).map((_, index) => {
      const startX = Math.random() * W;
      const size = Math.random() * 8 + 6;
      const color = confettiColors[index % confettiColors.length];
      const shapeType = index % 3; // 0 = square, 1 = circle, 2 = triangle/bar

      return {
        id: index,
        size,
        color,
        startX,
        shapeType,
        yAnim: new Animated.Value(-50),
        xOffset: new Animated.Value(0),
        rotateAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      };
    }),
  ).current;

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      onAnimationEnd?.();
      return;
    }

    const animations = particles.map((p) => {
      const delay = Math.random() * 600;
      const duration = Math.random() * 2000 + 1500;

      const fall = Animated.timing(p.yAnim, {
        toValue: H + 20,
        duration,
        delay,
        useNativeDriver: true,
      });

      // Randomized multi-step organic wind wiggle
      const wiggle = Animated.sequence([
        Animated.timing(p.xOffset, {
          toValue: Math.random() * 50 - 25,
          duration: duration * 0.35,
          useNativeDriver: true,
        }),
        Animated.timing(p.xOffset, {
          toValue: Math.random() * 50 - 25,
          duration: duration * 0.35,
          useNativeDriver: true,
        }),
        Animated.timing(p.xOffset, {
          toValue: Math.random() * 30 - 15,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
      ]);

      const spin = Animated.timing(p.rotateAnim, {
        toValue: Math.random() * 1080 + 360,
        duration,
        delay,
        useNativeDriver: true,
      });

      const fade = Animated.timing(p.opacityAnim, {
        toValue: 0,
        duration: 350,
        delay: delay + duration - 350,
        useNativeDriver: true,
      });

      return Animated.parallel([fall, wiggle, spin, fade]);
    });

    animationRef.current = Animated.parallel(animations);
    animationRef.current.start(() => {
      onAnimationEnd?.();
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [active, onAnimationEnd, particles, reducedMotion]);

  if (!active || reducedMotion) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => {
        const rotation = p.rotateAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ["0deg", "360deg"],
        });

        // Resolve shape properties
        const height = p.shapeType === 2 ? p.size * 0.4 : p.size;
        const borderRadius =
          p.shapeType === 1 ? p.size / 2 : p.shapeType === 0 ? 2 : 0;

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height,
                borderRadius,
                backgroundColor: p.color,
                left: p.startX,
                opacity: p.opacityAnim,
                transform: [
                  { translateY: p.yAnim },
                  { translateX: p.xOffset },
                  { rotate: rotation },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
  },
});

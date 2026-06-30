import { useRef, useEffect, ReactNode } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";
import { useReducedMotion } from "@hooks/useReducedMotion";

export function ScaleInView({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(reducedMotion ? 1 : 0.88)).current;
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        damping: 16,
        stiffness: 200,
      }),
      Animated.timing(opacity, { toValue: 1, delay, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, reducedMotion, scale]);

  if (reducedMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

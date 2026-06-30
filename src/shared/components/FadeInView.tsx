import { useRef, useEffect, ReactNode } from "react";
import { Animated, ViewStyle } from "react-native";
import { useReducedMotion } from "@hooks/useReducedMotion";

export function FadeInView({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 16)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, delay, duration: 320, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, delay, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, reducedMotion, translateY]);

  if (reducedMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

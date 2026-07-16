import { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import type { LifeEventRecord } from "@/types";
import { useTheme } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";

export function EpicRevealOverlay({
  event,
  onDismiss,
}: {
  event: LifeEventRecord;
  onDismiss: () => void;
}) {
  const { colors, fonts, radii, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();
  const slideY = useRef(new Animated.Value(reducedMotion ? 0 : 60)).current;
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(onDismiss, 2500);
      return () => clearTimeout(timer);
    }
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(onDismiss);
    }, 2500);
    return () => clearTimeout(timer);
  }, [reducedMotion, onDismiss, slideY, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY: slideY }], opacity }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: `${event.color ?? colors.orchid}EE`,
            borderRadius: radii.lg,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: "#FFFFFF", fontFamily: fonts.bodyBold, fontSize: scaledFonts.sm },
          ]}
        >
          ✨ EPIC MOMENT
        </Text>
        <Text
          style={[
            styles.title,
            { color: "#FFFFFF", fontFamily: fonts.displayBlack, fontSize: scaledFonts.lg },
          ]}
          numberOfLines={2}
        >
          {event.title}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    zIndex: 900,
    alignItems: "center",
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    width: "100%",
  },
  label: { fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 18, textAlign: "center" },
});

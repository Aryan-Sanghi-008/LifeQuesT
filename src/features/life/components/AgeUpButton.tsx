import { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";

export function AgeUpButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  const { colors, fonts, radii, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
          delay: 1000,
        }),
        Animated.timing(shimmer, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.18,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOp, {
            toValue: 0.5,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOp, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [shimmer, pulseScale, pulseOp, reducedMotion]);

  useEffect(() => {
    if (loading && !reducedMotion) {
      const runFlip = () => {
        flipAnim.setValue(0);
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            if (loading) {
              runFlip();
            }
          }, 300);
        });
      };
      runFlip();
    } else {
      flipAnim.setValue(0);
    }
  }, [loading, flipAnim, reducedMotion]);

  const shimX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-220, 220],
  });

  const rotateInterpolation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOp,
            borderColor: colors.emerald,
            shadowColor: colors.emerald,
            borderRadius: radii.xl || 24,
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
        <Pressable
          onPress={onPress}
          disabled={loading || disabled}
          accessibilityRole="button"
          accessibilityLabel={
            loading
              ? "Age up, loading"
              : disabled
                ? "Confirm focus first"
                : "Age up one year"
          }
          onPressIn={() => {
            if (reducedMotion) return;
            Animated.spring(scale, {
              toValue: 0.94,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start();
          }}
          onPressOut={() => {
            if (reducedMotion) return;
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start();
          }}
          android_ripple={{ color: "rgba(255,255,255,0.30)" }}
          style={{ borderRadius: radii.lg || 14, overflow: "hidden" }}
        >
          <LinearGradient
            colors={[colors.emerald, colors.emerald2 || "#16A34A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: shimX }] },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.28)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={styles.inner}>
              {loading ? (
                <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      fill="#FFFFFF"
                      d="M6 2h12v6l-4 4 4 4v6H6v-6l4-4-4-4V2zm10 2H8v3.5l4 4 4-4V4zm-4 7.5l-4-4V18h8v-6.5l-4-4z"
                    />
                  </Svg>
                </Animated.View>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path fill="#FFFFFF" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </Svg>
              )}
              <Text
                style={[
                  styles.label,
                  { color: "#FFFFFF", fontFamily: fonts.bodyBold, fontSize: scaledFonts.lg },
                ]}
              >
                {loading ? "LIVING..." : "AGE UP"}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center", paddingVertical: 8 },
  ring: {
    position: "absolute",
    left: -10,
    right: -10,
    top: 0,
    bottom: 0,
    borderWidth: 2.5,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 0,
  },
  btn: {
    paddingVertical: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 18, letterSpacing: 2 },
});

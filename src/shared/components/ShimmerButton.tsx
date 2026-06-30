import { useRef, useEffect } from "react";
import {
  Text,
  Pressable,
  Animated,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RADII, ANIM, useTheme } from "@theme";

interface ShimmerButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export function ShimmerButton({ label, onPress, loading, style }: ShimmerButtonProps) {
  const { colors, fonts } = useTheme();
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true, delay: 900 }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmer]);

  const translateX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-300, 300] });

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, ...ANIM.spring }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={loading}
        android_ripple={{ color: "rgba(255,255,255,0.25)" }}
        style={{ borderRadius: RADII.lg, overflow: "hidden" }}
      >
        <LinearGradient
          colors={[colors.gold2, colors.gold, colors.gold3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerBtn}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.25)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.shimmerBtnText, { fontFamily: fonts.bodyBold }]}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shimmerBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shimmerBtnText: {
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});

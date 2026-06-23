import { useRef, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, ANIM } from "../theme/colors";

export { BottomSheet } from "./BottomSheet";
export { AvatarById } from "./Avatars";

// ─── GradientButton ──────────────────────────────────────────────────────────

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  colors?: string[];
  textColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function GradientButton({
  label,
  onPress,
  colors = [COLORS.gold, COLORS.gold3],
  textColor = "#160D00",
  loading = false,
  disabled = false,
  style,
  icon,
  size = "lg",
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 14 },
    lg: { paddingVertical: 17, paddingHorizontal: 24, fontSize: 16 },
  };
  const sz = sizeMap[size];

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      ...ANIM.spring,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIM.spring,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
        style={{ borderRadius: RADII.lg, overflow: "hidden" }}
      >
        <LinearGradient
          colors={(disabled ? ["#3A3A3A", "#2A2A2A"] : colors) as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradBtn,
            {
              paddingVertical: sz.paddingVertical,
              paddingHorizontal: sz.paddingHorizontal,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text
                style={[
                  styles.gradBtnText,
                  { color: textColor, fontSize: sz.fontSize },
                ]}
              >
                {label}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── OutlineButton ────────────────────────────────────────────────────────────

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function OutlineButton({
  label,
  onPress,
  color = COLORS.t2,
  style,
  size = "lg",
  icon,
}: OutlineButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const sz = { sm: 12, md: 14, lg: 16 }[size];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            ...ANIM.spring,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            ...ANIM.spring,
          }).start()
        }
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        style={[styles.outlineBtn, { borderRadius: RADII.lg }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={[styles.outlineBtnText, { color, fontSize: sz }]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  glow?: boolean;
}

export function Card({
  children,
  style,
  onPress,
  accentColor,
  glow,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        accentColor ? { borderColor: accentColor + "40" } : undefined,
        (glow && accentColor)
          ? {
              shadowColor: accentColor,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }
          : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.05)" }}
      style={{ borderRadius: RADII.lg, overflow: "hidden" }}
    >
      {content}
    </Pressable>
  );
}

// ─── AnimatedStatBar ──────────────────────────────────────────────────────────

interface StatBarProps {
  value: number; // 0–100
  color: string;
  height?: number;
  animated?: boolean;
  delay?: number;
}

export function StatBar({
  value,
  color,
  height = 4,
  animated = true,
  delay = 0,
}: StatBarProps) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(value);
      return;
    }
    const timer = setTimeout(() => {
      Animated.timing(width, {
        toValue: value,
        duration: ANIM.slow,
        delay,
        useNativeDriver: false,
      }).start();
    }, 50);
    return () => clearTimeout(timer);
  }, [value, animated, delay]);

  const widthPct = width.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.barTrack, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.barFill,
          { width: widthPct, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

// ─── PulsingDot ───────────────────────────────────────────────────────────────

export function PulsingDot({
  color = COLORS.teal,
  size = 10,
}: {
  color?: string;
  size?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View
      style={{
        width: size + 8,
        height: size + 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// ─── Badge / Tag ─────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  color: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, color, style, textStyle }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "18", borderColor: color + "40" },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────────

export function SectionLabel({
  label,
  style,
}: {
  label: string;
  style?: ViewStyle;
}) {
  return (
    <Text style={[styles.sectionLabel, style]}>{label.toUpperCase()}</Text>
  );
}

// ─── FadeInView ──────────────────────────────────────────────────────────────

export function FadeInView({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        delay,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── ShimmerButton (Age Up) ───────────────────────────────────────────────────

interface ShimmerButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export function ShimmerButton({
  label,
  onPress,
  loading,
  style,
}: ShimmerButtonProps) {
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      ...ANIM.spring,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIM.spring,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={loading}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        style={{ borderRadius: RADII.lg, overflow: "hidden" }}
      >
        <LinearGradient
          colors={[COLORS.gold, COLORS.gold3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerBtn}
        >
          {/* Shimmer overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [{ translateX }],
                backgroundColor: "rgba(255,255,255,0)",
              },
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.18)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {loading ? (
            <ActivityIndicator color="#160D00" />
          ) : (
            <Text style={styles.shimmerBtnText}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({
  color = COLORS.border,
  style,
}: {
  color?: string;
  style?: ViewStyle;
}) {
  return <View style={[{ height: 1, backgroundColor: color }, style]} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  gradBtnText: {
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.2,
  },
  outlineBtn: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    fontFamily: FONTS.bodySemiBold,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  barTrack: {
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  shimmerBtn: {
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shimmerBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: "#160D00",
    letterSpacing: 0.3,
  },
});

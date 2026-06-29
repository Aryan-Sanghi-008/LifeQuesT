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
import { COLORS, FONTS, RADII, SPACING, SHADOWS, ANIM } from '@theme';
import { hapticButtonPress } from "@services/haptics";
import { playSound } from "@services/audio";

export { BottomSheet } from "./BottomSheet";
export { ScreenHeader } from "./ScreenHeader";
export { AvatarById } from "./Avatars";
export { FocusPhaseSheet } from "./FocusPhaseSheet";
export { YearReviewCard } from "./YearReviewCard";
export { NPCProfileSheet } from "./NPCProfileSheet";

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
  accessibilityLabel?: string;
}

export function GradientButton({
  label,
  onPress,
  colors = [COLORS.gold, COLORS.gold3],
  textColor = "#FFFFFF",
  loading = false,
  disabled = false,
  style,
  icon,
  size = "lg",
  accessibilityLabel,
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 14 },
    lg: { paddingVertical: 17, paddingHorizontal: 24, fontSize: 16 },
  };
  const sz = sizeMap[size];

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, ...ANIM.spring }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start();

  const handlePress = () => {
    if (disabled || loading) return;
    hapticButtonPress();
    void playSound('button_tap');
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        android_ripple={{ color: "rgba(255,255,255,0.20)", borderless: false }}
        style={{ borderRadius: RADII.lg, overflow: "hidden" }}
      >
        <LinearGradient
          colors={(disabled ? ["#D1D5DB", "#9CA3AF"] : colors) as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradBtn,
            { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text style={[styles.gradBtnText, { color: textColor, fontSize: sz.fontSize }]}>
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
  const sz = { sm: 12, md: 14, lg: 15 }[size];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, ...ANIM.spring }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start()
        }
        android_ripple={{ color: `${color}18` }}
        style={[styles.outlineBtn, { borderRadius: RADII.lg, borderColor: color }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={[styles.outlineBtnText, { color, fontSize: sz }]}>{label}</Text>
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

export function Card({ children, style, onPress, accentColor, glow }: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        accentColor ? { borderColor: accentColor + "30", borderWidth: 1.5 } : undefined,
        glow && accentColor
          ? { shadowColor: accentColor, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 }
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
      android_ripple={{ color: "rgba(0,0,0,0.04)" }}
      style={{ borderRadius: RADII.lg, overflow: "hidden" }}
    >
      {content}
    </Pressable>
  );
}

// ─── AnimatedStatBar — see StatBar.tsx ───────────────────────────────────────
export { StatBar } from './StatBar';

// ─── PulsingDot ───────────────────────────────────────────────────────────────

export function PulsingDot({ color = COLORS.emerald, size = 10 }: { color?: string; size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View style={{ width: size + 8, height: size + 8, alignItems: "center", justifyContent: "center" }}>
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
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
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
        { backgroundColor: color + "15", borderColor: color + "35" },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────────

export function SectionLabel({ label, style }: { label: string; style?: ViewStyle }) {
  return <Text style={[styles.sectionLabel, style]}>{label.toUpperCase()}</Text>;
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
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, delay, duration: 320, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, delay, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── ScaleInView ─────────────────────────────────────────────────────────────

export function ScaleInView({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1, delay, useNativeDriver: true,
        damping: 16, stiffness: 200,
      } as any),
      Animated.timing(opacity, { toValue: 1, delay, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
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

export function ShimmerButton({ label, onPress, loading, style }: ShimmerButtonProps) {
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true, delay: 900 }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

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
          colors={[COLORS.gold2, COLORS.gold, COLORS.gold3]}
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
            <Text style={styles.shimmerBtnText}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Chip (pressable category filter) ────────────────────────────────────────

interface ChipProps {
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
  icon?: ReactNode;
}

export function Chip({ label, selected, color, onPress, icon }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${color}18` }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: COLORS.bgCard, borderColor: COLORS.border },
      ]}
    >
      {icon && <View>{icon}</View>}
      <Text style={[
        styles.chipText,
        { color: selected ? '#FFFFFF' : color },
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ color = COLORS.border, style }: { color?: string; style?: ViewStyle }) {
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
    letterSpacing: 0.3,
  },
  outlineBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: "transparent",
    borderWidth: 1.5,
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
    ...SHADOWS.card,
  },
  barTrack: {
    backgroundColor: COLORS.bg2,
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
    fontSize: 11,
    letterSpacing: 0.2,
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.t4,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  shimmerBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shimmerBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADII.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
  },
});

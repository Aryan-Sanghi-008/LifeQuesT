import { useRef, ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RADII, ANIM, useTheme, MIN_TAP_TARGET } from "@theme";
import { triggerTapFeedback } from "@services/gameFeedback";
import { useReducedMotion } from "@hooks/useReducedMotion";

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
  colors,
  textColor = "#FFFFFF",
  loading = false,
  disabled = false,
  style,
  icon,
  size = "lg",
  accessibilityLabel,
}: GradientButtonProps) {
  const { colors: themeColors, fonts, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();
  const gradientColors = colors ?? [themeColors.gold, themeColors.gold3];
  const scale = useRef(new Animated.Value(1)).current;

  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: scaledFonts.md },
    md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: scaledFonts.base },
    lg: { paddingVertical: 17, paddingHorizontal: 24, fontSize: scaledFonts.lg },
  };
  const sz = sizeMap[size];

  const onPressIn = () => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, ...ANIM.spring }).start();
  };
  const onPressOut = () => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    triggerTapFeedback();
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
          colors={(disabled ? ["#D1D5DB", "#9CA3AF"] : gradientColors) as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradBtn,
            {
              paddingVertical: sz.paddingVertical,
              paddingHorizontal: sz.paddingHorizontal,
              minHeight: MIN_TAP_TARGET,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text style={[styles.gradBtnText, { color: textColor, fontSize: sz.fontSize, fontFamily: fonts.bodyBold }]}>
                {label}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  gradBtnText: {
    letterSpacing: 0.3,
  },
});

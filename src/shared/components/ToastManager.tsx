import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore, ToastMessage } from "@store/toastStore";
import { useTheme } from "@theme";

function ToastItem({ toast }: { toast: ToastMessage }) {
  const { colors, fonts, radii, shadows, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const hideToast = useToastStore((s) => s.hideToast);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 14,
        stiffness: 110,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast(toast.id);
    });
  };

  const bgColors = {
    success: colors.emerald,
    error: colors.crimson,
    info: colors.sapphire,
  };

  const accentColor = bgColors[toast.type] ?? colors.sapphire;

  // Glassmorphic background and border styling
  const glassBg = isDark
    ? "rgba(22, 27, 34, 0.88)"
    : "rgba(255, 255, 255, 0.9)";
  const glassBorder = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          backgroundColor: glassBg,
          borderColor: glassBorder,
          borderRadius: radii.md,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
          ...shadows.card,
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          { backgroundColor: accentColor, borderRadius: radii.full },
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: colors.t1, fontFamily: fonts.bodyMedium },
        ]}
      >
        {toast.message}
      </Text>
      <Pressable onPress={handleDismiss} style={styles.closeBtn}>
        <Text style={{ color: colors.t3, fontFamily: fonts.mono, fontSize: 18 }}>
          &times;
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastManager() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { top: insets.top > 0 ? insets.top : 20 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    width: "100%",
    maxWidth: 420,
    gap: 12,
  },
  indicator: {
    width: 6,
    height: 18,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  closeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});

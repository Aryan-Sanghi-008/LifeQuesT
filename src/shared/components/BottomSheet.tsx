import { useRef, useEffect, useState, ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  BackHandler,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { BottomSheetHandle } from "./BottomSheetHandle";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({
  visible,
  onClose,
  onDismissed,
  children,
  title,
}: BottomSheetProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();

  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 16,
          stiffness: 180,
          mass: 0.7,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          onDismissed?.();
        }
      });
    }
  }, [visible, mounted, translateY, backdropOpacity, onDismissed]);

  // Android hardware back button closes the sheet
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(15, 23, 42, 0.50)",
            opacity: backdropOpacity,
          },
        ]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.bgSheet,
            borderColor: colors.border,
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + 20,
            borderTopLeftRadius: radii.xl || 28,
            borderTopRightRadius: radii.xl || 28,
            transform: [{ translateY }],
            ...shadows.card,
          },
        ]}
        pointerEvents="auto"
      >
        {/* Unified Handle bar */}
        <BottomSheetHandle />

        {title && (
          <Text
            style={[
              styles.sheetTitle,
              {
                color: colors.t1,
                fontFamily: fonts.displayBold,
                marginBottom: spacing.md,
              },
            ]}
          >
            {title}
          </Text>
        )}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 4,
  },
  sheetTitle: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 28,
  },
});

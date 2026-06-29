import { useRef, useEffect, useState, ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SHADOWS } from '@theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
          damping: 22,
          stiffness: 200,
          mass: 0.9,
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
  }, [visible, mounted]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(15,23,42,0.50)', opacity: backdropOpacity },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 20, transform: [{ translateY }] },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handle} />
        {title && <Text style={styles.sheetTitle}>{title}</Text>}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgSheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.xl,
    paddingTop: 10,
    ...SHADOWS.card,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: COLORS.t1,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
});

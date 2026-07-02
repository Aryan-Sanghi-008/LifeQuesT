import { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemedStyles, useTheme, RADII } from '@theme';

interface ProductCardProps {
  title: string;
  desc: string;
  price: string;
  color: string;
  icon?: React.ReactNode;
  badge?: string;
  owned?: boolean;
  onPress: () => void;
  onOwnedPress?: () => void;
  accessibilityLabel?: string;
}

export function ProductCard({
  title,
  desc,
  price,
  color,
  icon,
  badge,
  owned = false,
  onPress,
  onOwnedPress,
  accessibilityLabel,
}: ProductCardProps) {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = owned ? (onOwnedPress ?? undefined) : onPress;
  const isInteractive = owned ? !!onOwnedPress : true;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityLabel={owned
          ? (onOwnedPress ? `View ${title}` : `${title} — already owned`)
          : (accessibilityLabel ?? `Buy ${title} for ${price}`)}
        onPressIn={() => {
          if (!isInteractive) return;
          Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 18, stiffness: 200 }).start();
        }}
        onPressOut={() => {
          if (!isInteractive) return;
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }).start();
        }}
        android_ripple={isInteractive ? { color: `${color}15` } : undefined}
        style={{ borderRadius: RADII.md, overflow: "hidden", opacity: owned && !onOwnedPress ? 0.85 : 1 }}
      >
        <View style={[styles.productCard, { borderColor: owned ? `${colors.emerald}60` : `${color}35` }]}>
          {/* Owned badge takes priority over regular badge */}
          {owned ? (
            <View style={[styles.productBadge, { backgroundColor: `${colors.emerald}20`, borderColor: `${colors.emerald}50` }]}>
              <Text style={[styles.productBadgeText, { color: colors.emerald }]}>OWNED</Text>
            </View>
          ) : badge ? (
            <View style={[styles.productBadge, { backgroundColor: `${color}25`, borderColor: `${color}50` }]}>
              <Text style={[styles.productBadgeText, { color }]}>{badge}</Text>
            </View>
          ) : null}
          <View style={[styles.productIcon, { backgroundColor: owned ? `${colors.emerald}12` : `${color}18` }]}>
            {icon ?? (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle stroke={owned ? colors.emerald : color} strokeWidth={2} cx="12" cy="12" r="8" />
              </Svg>
            )}
          </View>
          <Text style={styles.productTitle}>{title}</Text>
          <Text style={styles.productDesc}>{desc}</Text>
          <View style={[
            styles.priceBtn,
            owned
              ? { backgroundColor: `${colors.emerald}12`, borderColor: `${colors.emerald}35` }
              : { backgroundColor: `${color}18`, borderColor: `${color}40` },
          ]}>
            <Text style={[styles.priceText, { color: owned ? colors.emerald : color, fontFamily: fonts.bodySemiBold }]}>
              {owned ? (onOwnedPress ? 'View' : 'Owned') : price}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  productCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.sm,
    position: "relative",
    overflow: "hidden",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  productBadgeText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  productTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.t1,
  },
  productDesc: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.t3,
    lineHeight: 15,
  },
  priceBtn: {
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  priceText: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
});

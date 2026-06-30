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
  onPress: () => void;
  accessibilityLabel?: string;
}

export function ProductCard({
  title,
  desc,
  price,
  color,
  icon,
  badge,
  onPress,
  accessibilityLabel,
}: ProductCardProps) {
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Buy ${title} for ${price}`}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            damping: 18,
            stiffness: 200,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 18,
            stiffness: 200,
          }).start()
        }
        android_ripple={{ color: `${color}15` }}
        style={{ borderRadius: RADII.md, overflow: "hidden" }}
      >
        <View style={[styles.productCard, { borderColor: `${color}35` }]}>
          {badge && (
            <View
              style={[
                styles.productBadge,
                { backgroundColor: `${color}25`, borderColor: `${color}50` },
              ]}
            >
              <Text style={[styles.productBadgeText, { color }]}>{badge}</Text>
            </View>
          )}
          <View style={[styles.productIcon, { backgroundColor: `${color}18` }]}>
            {icon ?? (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle stroke={color} strokeWidth={2} cx="12" cy="12" r="8" />
              </Svg>
            )}
          </View>
          <Text style={styles.productTitle}>{title}</Text>
          <Text style={styles.productDesc}>{desc}</Text>
          <View
            style={[
              styles.priceBtn,
              { backgroundColor: `${color}18`, borderColor: `${color}40` },
            ]}
          >
            <Text style={[styles.priceText, { color }]}>{price}</Text>
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

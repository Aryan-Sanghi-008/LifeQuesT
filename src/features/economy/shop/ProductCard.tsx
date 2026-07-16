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
  /** Currently equipped cosmetic / pack */
  equipped?: boolean;
  onPress: () => void;
  onOwnedPress?: () => void;
  accessibilityLabel?: string;
  /** Optional contrast overrides (e.g. light theme swatches) */
  titleColor?: string;
  descColor?: string;
  ctaTextColor?: string;
}

export function ProductCard({
  title,
  desc,
  price,
  color,
  icon,
  badge,
  owned = false,
  equipped = false,
  onPress,
  onOwnedPress,
  accessibilityLabel,
  titleColor,
  descColor,
  ctaTextColor,
}: ProductCardProps) {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = owned ? (onOwnedPress ?? undefined) : onPress;
  const isInteractive = owned ? !!onOwnedPress : true;
  const ctaLabel = equipped ? 'Equipped' : owned ? (onOwnedPress ? 'View' : 'Owned') : price;
  const accent = equipped ? colors.gold : owned ? colors.emerald : color;
  const autoContrastCta = (() => {
    if (ctaTextColor) return ctaTextColor;
    if (owned || equipped) return undefined;
    const hex = color.replace('#', '');
    if (hex.length < 6) return undefined;
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
    if (L > 0.65) return '#0F172A';
    if (L < 0.2) return '#F8FAFC';
    return undefined;
  })();
  const resolvedCtaColor = autoContrastCta ?? (equipped ? colors.gold : owned ? colors.emerald : color);
  const resolvedTitleColor = titleColor ?? colors.t1;
  const resolvedDescColor = descColor ?? colors.t3;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityLabel={equipped
          ? `${title} — equipped`
          : owned
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
        android_ripple={isInteractive ? { color: `${accent}15` } : undefined}
        style={{ borderRadius: RADII.md, overflow: "hidden", opacity: owned && !onOwnedPress ? 0.85 : 1 }}
      >
        <View style={[styles.productCard, { borderColor: equipped ? `${colors.gold}70` : owned ? `${colors.emerald}60` : `${color}35` }]}>
          {equipped ? (
            <View style={[styles.productBadge, { backgroundColor: `${colors.gold}20`, borderColor: `${colors.gold}50` }]}>
              <Text style={[styles.productBadgeText, { color: colors.gold }]}>EQUIPPED</Text>
            </View>
          ) : owned ? (
            <View style={[styles.productBadge, { backgroundColor: `${colors.emerald}20`, borderColor: `${colors.emerald}50` }]}>
              <Text style={[styles.productBadgeText, { color: colors.emerald }]}>OWNED</Text>
            </View>
          ) : badge ? (
            <View style={[styles.productBadge, { backgroundColor: `${color}25`, borderColor: `${color}50` }]}>
              <Text style={[styles.productBadgeText, { color }]}>{badge}</Text>
            </View>
          ) : null}
          <View style={[styles.productIcon, { backgroundColor: equipped ? `${colors.gold}12` : owned ? `${colors.emerald}12` : `${color}18` }]}>
            {icon ?? (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle stroke={accent} strokeWidth={2} cx="12" cy="12" r="8" />
              </Svg>
            )}
          </View>
          <Text style={[styles.productTitle, { color: resolvedTitleColor }]}>{title}</Text>
          <Text style={[styles.productDesc, { color: resolvedDescColor }]}>{desc}</Text>
          <View style={[
            styles.priceBtn,
            equipped
              ? { backgroundColor: `${colors.gold}12`, borderColor: `${colors.gold}35` }
              : owned
                ? { backgroundColor: `${colors.emerald}12`, borderColor: `${colors.emerald}35` }
                : { backgroundColor: `${color}18`, borderColor: `${color}40` },
          ]}>
            <Text style={[
              styles.priceText,
              {
                color: resolvedCtaColor,
                fontFamily: fonts.bodySemiBold,
              },
            ]}>
              {ctaLabel}
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

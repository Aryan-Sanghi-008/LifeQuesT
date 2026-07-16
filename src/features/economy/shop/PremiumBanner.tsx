import { useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useThemedStyles, useTheme, RADII } from "@theme";

function GoldShimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
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

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }, style]}
      pointerEvents="none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,215,100,0.18)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

const PLUS_PERKS = [
  "Remove all ads",
  "+50% daily gameplay coins",
  "Season pass included",
  "2 scenario picks per month",
  "Monthly exclusive cosmetic",
  "Priority cloud save",
];

export function PremiumBanner({
  isPremium,
  onPressMonthly,
  onPressYearly,
  monthlyPriceLabel,
  yearlyPriceLabel,
  loadingMonthly = false,
  loadingYearly = false,
}: {
  isPremium: boolean;
  onPressMonthly: () => void;
  onPressYearly: () => void;
  monthlyPriceLabel?: string;
  yearlyPriceLabel?: string;
  loadingMonthly?: boolean;
  loadingYearly?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.premiumWrap}>
      <LinearGradient
        colors={[colors.sapphire2, colors.sapphire, colors.sapphire2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumCard}
      >
        <GoldShimmer style={{ borderRadius: RADII.xl }} />
        <View style={styles.premiumBorder} />

        <View style={styles.premiumContent}>
          <View style={styles.premiumLeft}>
            <View style={styles.crownWrap}>
              <LinearGradient
                colors={["#FCD34D", "#F59E0B"]}
                style={styles.crownBg}
              >
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path
                    fill="#FFFFFF"
                    d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z"
                  />
                  <Path fill="#FFFFFF" d="M4 18h16v2H4z" />
                </Svg>
              </LinearGradient>
            </View>
            <View style={styles.premiumInfo}>
              <View style={styles.premiumTitleRow}>
                <Text style={styles.premiumTitle}>LifeQuest Plus</Text>
                {isPremium && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.premiumSub}>
                Premium perks for dedicated life simmers.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.perks}>
          {PLUS_PERKS.map((p) => (
            <View key={p} style={styles.perkRow}>
              <View style={styles.perkDot} />
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        {!isPremium && (
          <View style={styles.ctaRow}>
            <Pressable
              onPress={onPressMonthly}
              disabled={loadingMonthly || loadingYearly}
              style={({ pressed }) => [styles.ctaBtn, styles.ctaMonthly, pressed && { opacity: 0.9 }]}
            >
              {loadingMonthly ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaPrice}>{monthlyPriceLabel ?? "$0.49"}</Text>
                  <Text style={styles.ctaPeriod}>/month</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={onPressYearly}
              disabled={loadingMonthly || loadingYearly}
              style={({ pressed }) => [styles.ctaBtn, styles.ctaYearly, pressed && { opacity: 0.9 }]}
            >
              {loadingYearly ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaPrice}>{yearlyPriceLabel ?? "$2.99"}</Text>
                  <Text style={styles.ctaPeriod}>/year</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  premiumWrap: { marginBottom: spacing.xl },
  premiumCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.5,
    borderColor: `${colors.gold}30`,
  },
  premiumBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: `${colors.gold}20`,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  premiumLeft: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  crownWrap: { flexShrink: 0 },
  crownBg: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumInfo: { flex: 1 },
  premiumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  premiumTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: "#FFFFFF",
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.20)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
  },
  activeBadgeText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 8,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  premiumSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  perks: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    paddingTop: spacing.md,
  },
  perkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  perkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FCD34D" },
  perkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.90)",
  },
  ctaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ctaBtn: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  ctaMonthly: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaYearly: {
    backgroundColor: colors.gold,
  },
  ctaPrice: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  ctaPeriod: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
  },
});

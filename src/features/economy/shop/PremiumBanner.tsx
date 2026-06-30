import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useThemedStyles, useTheme, RADII } from '@theme';

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

export function PremiumBanner({
  isPremium,
  onPress,
  priceLabel,
}: {
  isPremium: boolean;
  onPress: () => void;
  priceLabel?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.premiumWrap]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start()
        }
        android_ripple={{ color: "rgba(255,215,100,0.1)" }}
        style={{ borderRadius: RADII.xl, overflow: "hidden" }}
      >
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
                  <Text style={styles.premiumTitle}>LifeQuest Premium</Text>
                  {isPremium && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.premiumSub}>
                  No ads, bonus luck boosts, and cloud save priority.
                </Text>
              </View>
            </View>
            {!isPremium && (
              <View style={styles.premiumCTA}>
                <Text style={styles.premiumPrice}>{priceLabel ?? "$2.99"}</Text>
                <Text style={styles.premiumPeriod}>/mo</Text>
              </View>
            )}
          </View>

          <View style={styles.perks}>
            {[
              "Remove all ads",
              "5 bonus luck boosts",
              "Priority cloud save",
              "Support ongoing development",
            ].map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <View style={styles.perkDot} />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
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
  premiumCTA: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    flexShrink: 0,
  },
  premiumPrice: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  premiumPeriod: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
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
});

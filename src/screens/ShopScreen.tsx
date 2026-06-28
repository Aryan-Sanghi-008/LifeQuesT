import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, RADII, SPACING } from "../constants/theme";
import { useGameStore } from "../store/gameStore";
import { FadeInView } from "../components/index";
import {
  purchaseProduct,
  restorePurchases,
  getIAPProducts,
  processVerifiedPurchase,
  applyPurchaseToStore,
} from "../services/iap";
import { showRewardedAd } from "../services/ads";
import { getPrivacyPolicyUrl, openLegalUrlSafe } from "../config/legal";
import { IAPProductId } from "../types";
import { SEASON_PASS_TIERS } from "../data/gameData";
import {
  IAP_CATALOG,
  AVATAR_PACK_CATALOG,
  getCatalogPriceLabel,
} from "../data/iapCatalog";
import { ScreenHeader } from "../components/index";
import { isDlcUnlocked } from "../data/dlcData";
import Svg, { Path, Circle } from "react-native-svg";

// ─── Shimmer View ─────────────────────────────────────────────────────────────
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

// ─── Premium Banner ───────────────────────────────────────────────────────────
function PremiumBanner({
  isPremium,
  onPress,
  priceLabel,
}: {
  isPremium: boolean;
  onPress: () => void;
  priceLabel?: string;
}) {
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
          colors={[COLORS.sapphire2, COLORS.sapphire, COLORS.sapphire2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <GoldShimmer style={{ borderRadius: RADII.xl }} />

          {/* Border glow */}
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

          {/* Perk list */}
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

// ─── IAP Product Card ─────────────────────────────────────────────────────────
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

function ProductCard({
  title,
  desc,
  price,
  color,
  icon,
  badge,
  onPress,
  accessibilityLabel,
}: ProductCardProps) {
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ShopScreen() {
  const character = useGameStore((s) => s.character);
  const store = useGameStore();
  const unlockFantasyDlc = useGameStore((s) => s.unlockFantasyDlc);
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const storeProducts = getIAPProducts();

  const grantDevFallback = (productId: IAPProductId) => {
    applyPurchaseToStore(productId, store);
    void store._persist();
    Alert.alert("Dev purchase", "Granted locally (store catalog unavailable).");
  };

  const buy = async (productId: IAPProductId) => {
    if (purchasing) return;
    setPurchasing(productId);
    try {
      const catalog = getIAPProducts();
      if (catalog.length === 0) {
        grantDevFallback(productId);
        return;
      }
      await purchaseProduct(productId);
    } catch (e) {
      Alert.alert(
        "Purchase failed",
        (e as Error).message ?? "Try again later.",
      );
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing("restore");
    try {
      const purchases = await restorePurchases();
      let granted = 0;
      for (const p of purchases) {
        const ok = await processVerifiedPurchase(p, store);
        if (ok) granted += 1;
      }
      Alert.alert(
        "Restored",
        granted > 0
          ? `${granted} purchase(s) restored.`
          : purchases.length > 0
            ? "Purchases found but server verification failed. Sign in and try again."
            : "No purchases found.",
      );
    } catch (e) {
      Alert.alert("Restore failed", (e as Error).message ?? "Try again later.");
    } finally {
      setPurchasing(null);
    }
  };

  const openPrivacy = async () => {
    try {
      await openLegalUrlSafe(getPrivacyPolicyUrl(), "Privacy Policy");
    } catch {
      Alert.alert(
        "Unable to open privacy policy",
        "Set EXPO_PUBLIC_PRIVACY_POLICY_URL or deploy hosting.",
      );
    }
  };

  const buyLuckWithCoins = () => {
    if (!store.spendCoins(500)) {
      Alert.alert("Not enough coins", "You need 500 coins for a Luck Boost.");
      return;
    }
    store.addLuckBoost(3);
    Alert.alert("Luck Boost", "3 luck boosts added to your character.");
  };

  const watchAdForLuck = async () => {
    if (busy) return;
    setPurchasing("rewarded_luck");
    try {
      const earned = await showRewardedAd();
      if (earned) {
        store.addLuckBoost(1);
        Alert.alert("Luck Boost", "You earned 1 luck boost!");
      } else {
        Alert.alert("Ad unavailable", "Try again in a moment.");
      }
    } finally {
      setPurchasing(null);
    }
  };

  if (!character) return null;

  const busy = purchasing !== null;

  const products = IAP_CATALOG.map((entry) => ({
    title: entry.title,
    desc: entry.description,
    price: getCatalogPriceLabel(
      entry.productId,
      storeProducts,
      entry.fallbackPriceLabel,
    ),
    color: entry.color,
    badge: entry.badge,
    productId: entry.productId,
    onPress: () => {
      if (entry.productId === "luck_boost" && storeProducts.length === 0) {
        buyLuckWithCoins();
        return;
      }
      void buy(entry.productId);
    },
  }));

  const avatarPacks = AVATAR_PACK_CATALOG.map((entry) => ({
    ...entry,
    price: getCatalogPriceLabel(
      entry.productId,
      storeProducts,
      entry.fallbackPriceLabel,
    ),
  }));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <ScreenHeader title="Life Store" subtitle="Power up your journey" />
          <View style={styles.walletRow}>
            <View style={styles.walletChip}>
              <Svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill={COLORS.gold}
              >
                <Circle cx="12" cy="12" r="10" />
              </Svg>
              <Text style={styles.walletText}>
                {character.coins.toLocaleString()}
              </Text>
            </View>
            <View
              style={[styles.walletChip, { borderColor: COLORS.orchidBorder }]}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path
                  fill={COLORS.orchid}
                  d="M12 2L2 9l10 13L22 9z"
                  opacity={0.9}
                />
              </Svg>
              <Text style={[styles.walletText, { color: COLORS.orchid }]}>
                {character.gems}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Banner */}
          <FadeInView delay={100}>
            <PremiumBanner
              isPremium={character.isPremium}
              onPress={() => {
                void buy("premium_yearly");
              }}
              priceLabel={getCatalogPriceLabel(
                "premium_yearly",
                storeProducts,
                "$2.99",
              )}
            />
          </FadeInView>

          <Text style={styles.gridLabel}>SEASON PASS</Text>
          <FadeInView delay={150}>
            <Pressable
              style={styles.rewardedBtn}
              onPress={() => {
                void buy("season_pass");
              }}
              accessibilityLabel="Buy season pass"
            >
              <Text style={styles.rewardedText}>
                {character.hasSeasonPass
                  ? "Season Pass Active"
                  : "Unlock Season Pass"}{" "}
                · XP {character.seasonXp ?? 0}
              </Text>
            </Pressable>
            {character.hasSeasonPass &&
              SEASON_PASS_TIERS.map((tier) => {
                const claimed = (character.claimedSeasonTiers ?? []).includes(
                  tier.tier,
                );
                const canClaim =
                  !claimed && (character.seasonXp ?? 0) >= tier.xpRequired;
                return (
                  <Pressable
                    key={tier.tier}
                    style={[styles.rewardedBtn, claimed && { opacity: 0.5 }]}
                    disabled={claimed}
                    onPress={() => {
                      if (!canClaim) return;
                      const result = store.claimSeasonTier(tier.tier);
                      Alert.alert(
                        result.ok ? "Reward" : "Season Pass",
                        result.message,
                      );
                    }}
                  >
                    <Text style={styles.rewardedText}>
                      {claimed ? "Claimed — " : ""}Tier {tier.tier} —{" "}
                      {tier.rewardCoins}c
                      {tier.rewardGems ? ` + ${tier.rewardGems} gems` : ""}
                    </Text>
                  </Pressable>
                );
              })}
          </FadeInView>

          <Text style={styles.gridLabel}>EXPANSION PACKS</Text>
          <FadeInView delay={180}>
            <View style={styles.expansionCard}>
              <View style={styles.expansionHeader}>
                <Text style={styles.expansionTitle}>
                  🧙‍♂️ Fantasy Expansion Pack
                </Text>
                {isDlcUnlocked(character, "dlc_fantasy") ? (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedBadgeText}>ACTIVE</Text>
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>LOCKED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.expansionDesc}>
                Unlock rare magical careers (Alchemist, Wizard) and fantasy
                species traits (Elf Grace, Orc Might, Dragon Blood) with custom
                magical events!
              </Text>

              {isDlcUnlocked(character, "dlc_fantasy") ? (
                <Text style={styles.expansionActiveText}>
                  ✨ All magical careers, species traits, and events are active!
                </Text>
              ) : (
                <View style={styles.unlockButtonsRow}>
                  <Pressable
                    style={styles.unlockBtn}
                    onPress={() => {
                      const res = unlockFantasyDlc("gems");
                      Alert.alert("Fantasy DLC", res.message);
                    }}
                  >
                    <Text style={styles.unlockBtnText}>💎 100 Gems</Text>
                  </Pressable>
                  <Pressable
                    style={styles.unlockBtn}
                    onPress={() => {
                      const res = unlockFantasyDlc("coins");
                      Alert.alert("Fantasy DLC", res.message);
                    }}
                  >
                    <Text style={styles.unlockBtnText}>🪙 1k Coins</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unlockBtn,
                      globalPrestige.prestigeLevel < 3 && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      const res = unlockFantasyDlc("prestige");
                      Alert.alert("Fantasy DLC", res.message);
                    }}
                  >
                    <Text style={styles.unlockBtnText}>⭐ Prestige L3</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </FadeInView>

          <Text style={styles.gridLabel}>AVATAR PACKS</Text>
          <View style={styles.productGrid}>
            {avatarPacks.map((pack, i) => (
              <FadeInView
                key={pack.productId}
                delay={i * 60 + 120}
                style={{ width: "48%" }}
              >
                <ProductCard
                  title={pack.title}
                  desc={pack.description}
                  price={pack.price}
                  color={pack.color}
                  onPress={() => {
                    void buy(pack.productId);
                  }}
                />
              </FadeInView>
            ))}
          </View>

          {/* Products Grid */}
          <Text style={styles.gridLabel}>CONSUMABLES & BOOSTS</Text>
          <View style={styles.productGrid}>
            {products.map((p, i) => (
              <FadeInView
                key={p.title}
                delay={i * 60 + 200}
                style={{ width: "48%" }}
              >
                <ProductCard {...p} />
              </FadeInView>
            ))}
          </View>

          <Pressable
            style={styles.rewardedBtn}
            onPress={() => void watchAdForLuck()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Watch ad for one luck boost"
          >
            <Text style={styles.rewardedText}>
              {purchasing === "rewarded_luck"
                ? "Loading ad…"
                : "Watch ad for +1 Luck Boost"}
            </Text>
          </Pressable>

          {/* Restore Purchases */}
          <Pressable
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <Text style={styles.restoreText}>
              {purchasing === "restore" ? "Restoring…" : "Restore Purchases"}
            </Text>
          </Pressable>

          <Text style={styles.legal}>
            Subscriptions auto-renew. Cancel any time. Purchases are
            non-refundable. Prices may vary by region.
          </Text>

          <Pressable
            onPress={() => void openPrivacy()}
            style={styles.privacyLink}
          >
            <Text style={styles.privacyLinkText}>Privacy Policy</Text>
          </Pressable>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg2,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.t1,
  },
  headerSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    marginTop: 2,
  },
  walletRow: { flexDirection: "row", gap: SPACING.sm },
  walletChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  walletText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 12,
    color: COLORS.gold,
  },

  scroll: { padding: SPACING.lg },

  // Premium
  premiumWrap: { marginBottom: SPACING.xl },
  premiumCard: {
    borderRadius: RADII.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}30`,
  },
  premiumBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  premiumLeft: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  crownWrap: { flexShrink: 0 },
  crownBg: {
    width: 48,
    height: 48,
    borderRadius: RADII.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumInfo: { flex: 1 },
  premiumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  premiumTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 17,
    color: "#FFFFFF",
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.20)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
  },
  activeBadgeText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 8,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  premiumSub: {
    fontFamily: FONTS.body,
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
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  premiumPeriod: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  perks: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    paddingTop: SPACING.md,
  },
  perkRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  perkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FCD34D" },
  perkText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.90)",
  },

  // Grid label
  gridLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },

  // Products
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  productCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: SPACING.sm,
    position: "relative",
    overflow: "hidden",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.xs,
    borderWidth: 1,
  },
  productBadgeText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: RADII.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  productTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.t1,
  },
  productDesc: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.t3,
    lineHeight: 15,
  },
  priceBtn: {
    paddingVertical: 8,
    borderRadius: RADII.sm,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  priceText: { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  // Footer
  restoreBtn: { alignItems: "center", paddingVertical: SPACING.lg },
  restoreText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.t3,
  },
  rewardedBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: `${COLORS.teal}40`,
    backgroundColor: `${COLORS.teal}10`,
  },
  rewardedText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.teal,
  },
  legal: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t4,
    textAlign: "center",
    lineHeight: 15,
    marginTop: SPACING.sm,
  },
  privacyLink: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  privacyLinkText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.sapphire,
  },

  // Expansion Pack styling
  expansionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: "#4B5563",
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  expansionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expansionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 15,
    color: "#F9FAFC",
  },
  unlockedBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    borderColor: "#34D399",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  unlockedBadgeText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 9,
    color: "#34D399",
  },
  lockedBadge: {
    backgroundColor: "rgba(156, 163, 175, 0.15)",
    borderColor: "#9CA3AF",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  lockedBadgeText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 9,
    color: "#9CA3AF",
  },
  expansionDesc: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    lineHeight: 16,
  },
  expansionActiveText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: "#34D399",
    marginTop: 4,
  },
  unlockButtonsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  unlockBtn: {
    flex: 1,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.t1,
  },
});

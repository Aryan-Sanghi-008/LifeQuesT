import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useGameStore } from "@store/gameStore";
import { FadeInView, CurrencyChip, ScreenHeader } from "@components/index";
import {
  purchaseProduct,
  restorePurchases,
  getIAPProducts,
  processVerifiedPurchase,
  applyPurchaseToStore,
} from "@services/iap";
import { showRewardedAd } from "@services/ads";
import { getPrivacyPolicyUrl, openLegalUrlSafe } from "@config/legal";
import { IAPProductId } from "@/types";
import { SEASON_PASS_TIERS } from "@data/gameData";
import {
  IAP_CATALOG,
  AVATAR_PACK_CATALOG,
  getCatalogPriceLabel,
} from "@data/iapCatalog";
import { isDlcUnlocked } from "@data/dlcData";
import { ShopTabBar, type ShopTab } from "./ShopTabBar";
import { FeaturedDealHero } from "./FeaturedDealHero";
import { GemValueCalculator } from "./GemValueCalculator";
import { PremiumBanner } from "./PremiumBanner";
import { ProductCard } from "./ProductCard";

export function ShopScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors, fonts } = useTheme();
  const character = useGameStore((s) => s.character);
  const store = useGameStore();
  const unlockFantasyDlc = useGameStore((s) => s.unlockFantasyDlc);
  const purchaseStreakShield = useGameStore((s) => s.purchaseStreakShield);
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>('bundles');

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

  const seasonPassSection = (
    <>
      <Text style={styles.gridLabel}>SEASON PASS</Text>
      <FadeInView delay={150}>
        <Pressable style={styles.rewardedBtn} onPress={() => void buy("season_pass")} accessibilityLabel="Buy season pass">
          <Text style={styles.rewardedText}>
            {character.hasSeasonPass ? "Season Pass Active" : "Unlock Season Pass"}{" "}· XP {character.seasonXp ?? 0}
          </Text>
        </Pressable>
        {character.hasSeasonPass && SEASON_PASS_TIERS.map((tier) => {
          const claimed = (character.claimedSeasonTiers ?? []).includes(tier.tier);
          const canClaim = !claimed && (character.seasonXp ?? 0) >= tier.xpRequired;
          return (
            <Pressable key={tier.tier} style={[styles.rewardedBtn, claimed && { opacity: 0.5 }]}
              disabled={claimed}
              onPress={() => { if (!canClaim) return; const result = store.claimSeasonTier(tier.tier); Alert.alert(result.ok ? "Reward" : "Season Pass", result.message); }}>
              <Text style={styles.rewardedText}>{claimed ? "Claimed — " : ""}Tier {tier.tier} — {tier.rewardCoins}c{tier.rewardGems ? ` + ${tier.rewardGems} gems` : ""}</Text>
            </Pressable>
          );
        })}
      </FadeInView>
    </>
  );

  const expansionSection = (
    <>
      <Text style={styles.gridLabel}>EXPANSION PACKS</Text>
      <FadeInView delay={180}>
        <View style={styles.expansionCard}>
          <View style={styles.expansionHeader}>
            <Text style={styles.expansionTitle}>🧙‍♂️ Fantasy Expansion Pack</Text>
            {isDlcUnlocked(character, "dlc_fantasy")
              ? <View style={styles.unlockedBadge}><Text style={styles.unlockedBadgeText}>ACTIVE</Text></View>
              : <View style={styles.lockedBadge}><Text style={styles.lockedBadgeText}>LOCKED</Text></View>}
          </View>
          <Text style={styles.expansionDesc}>Unlock rare magical careers (Alchemist, Wizard) and fantasy species traits with custom magical events!</Text>
          {isDlcUnlocked(character, "dlc_fantasy")
            ? <Text style={styles.expansionActiveText}>✨ All magical careers, species traits, and events are active!</Text>
            : <View style={styles.unlockButtonsRow}>
                <Pressable style={styles.unlockBtn} onPress={() => { const res = unlockFantasyDlc("gems"); Alert.alert("Fantasy DLC", res.message); }}>
                  <Text style={styles.unlockBtnText}>💎 100 Gems</Text>
                </Pressable>
                <Pressable style={styles.unlockBtn} onPress={() => { const res = unlockFantasyDlc("coins"); Alert.alert("Fantasy DLC", res.message); }}>
                  <Text style={styles.unlockBtnText}>🪙 1k Coins</Text>
                </Pressable>
                <Pressable style={[styles.unlockBtn, globalPrestige.prestigeLevel < 3 && { opacity: 0.5 }]}
                  onPress={() => { const res = unlockFantasyDlc("prestige"); Alert.alert("Fantasy DLC", res.message); }}>
                  <Text style={styles.unlockBtnText}>⭐ Prestige L3</Text>
                </Pressable>
              </View>}
        </View>
      </FadeInView>
    </>
  );

  const footer = (
    <>
      <Pressable style={styles.rewardedBtn} onPress={() => void watchAdForLuck()} disabled={busy} accessibilityRole="button">
        <Text style={styles.rewardedText}>{purchasing === "rewarded_luck" ? "Loading ad…" : "Watch ad for +1 Luck Boost"}</Text>
      </Pressable>
      <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={busy} accessibilityRole="button">
        <Text style={styles.restoreText}>{purchasing === "restore" ? "Restoring…" : "Restore Purchases"}</Text>
      </Pressable>
      <Text style={styles.legal}>Subscriptions auto-renew. Cancel any time. Purchases are non-refundable. Prices may vary by region.</Text>
      <Pressable onPress={() => void openPrivacy()} style={styles.privacyLink}>
        <Text style={styles.privacyLinkText}>Privacy Policy</Text>
      </Pressable>
      <View style={{ height: SPACING.xxxl }} />
    </>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <ScreenHeader title="Life Store" subtitle="Power up your journey" />
          <View style={styles.walletRow}>
            <CurrencyChip type="coin" amount={character.coins} />
            <CurrencyChip type="gem" amount={character.gems} />
          </View>
        </View>

        <ShopTabBar active={activeTab} onSelect={setActiveTab} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {(activeTab === 'premium') && (
            <>
              <FadeInView delay={100}>
                <PremiumBanner
                  isPremium={character.isPremium}
                  onPress={() => void buy("premium_yearly")}
                  priceLabel={getCatalogPriceLabel("premium_yearly", storeProducts, "$2.99")}
                />
              </FadeInView>
              {seasonPassSection}
              <FadeInView delay={200}>
                <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  <Text style={[styles.gridLabel, { marginBottom: 8 }]}>STREAK SHIELD</Text>
                  <Pressable
                    onPress={() => {
                      const result = purchaseStreakShield();
                      Alert.alert(result.ok ? '🛡️ Shield Purchased' : 'Not enough gems', result.message);
                    }}
                    style={({ pressed }) => [{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      backgroundColor: pressed ? `${colors.sapphire}20` : `${colors.sapphire}10`,
                      borderWidth: 1, borderColor: `${colors.sapphire}30`,
                      borderRadius: 12, padding: 14,
                    }]}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${colors.sapphire}20`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 20 }}>🛡️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Streak Shield</Text>
                      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>Protects your streak for 1 missed day</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.sapphire, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>50 💎</Text>
                      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10 }}>You have: {character?.streakShieldCount ?? 0}</Text>
                    </View>
                  </Pressable>
                </View>
              </FadeInView>
              {footer}
            </>
          )}

          {activeTab === 'bundles' && (
            <>
              <FeaturedDealHero onPress={() => void buy("season_pass")} priceLabel={getCatalogPriceLabel("season_pass", storeProducts, "$4.99")} />
              <GemValueCalculator onBuy={() => void buy('gems_small')} />
              {expansionSection}
              <Text style={styles.gridLabel}>CONSUMABLES & BOOSTS</Text>
              <View style={styles.productGrid}>
                {products.map((p, i) => (
                  <FadeInView key={p.title} delay={i * 60 + 200} style={{ width: "48%" }}>
                    <ProductCard {...p} />
                  </FadeInView>
                ))}
              </View>
              {footer}
            </>
          )}

          {activeTab === 'cosmetics' && (
            <>
              <Text style={styles.gridLabel}>AVATAR PACKS</Text>
              <View style={styles.productGrid}>
                {avatarPacks.map((pack, i) => (
                  <FadeInView key={pack.productId} delay={i * 60 + 120} style={{ width: "48%" }}>
                    <ProductCard title={pack.title} desc={pack.description} price={pack.price} color={pack.color} onPress={() => void buy(pack.productId)} />
                  </FadeInView>
                ))}
              </View>
              {footer}
            </>
          )}

          {activeTab === 'scenarios' && (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
              <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 22 }}>Scenario Packs</Text>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                Royal Dynasty, Cyber Future, Crime Empire, and Fantasy Realms are coming soon as premium scenario packs.
              </Text>
              <View style={{ backgroundColor: `${colors.gold}15`, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: `${colors.gold}30`, width: '100%' }}>
                <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13, textAlign: 'center' }}>Coming in a future update</Text>
              </View>
              {footer}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default ShopScreen;

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg2,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.t1,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.t3,
    marginTop: 2,
  },
  walletRow: { flexDirection: "row", gap: spacing.sm },
  walletChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.bgCard,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  walletText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
    color: colors.gold,
  },

  scroll: { padding: spacing.lg },

  gridLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.t4,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  restoreBtn: { alignItems: "center", paddingVertical: spacing.lg },
  restoreText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.t3,
  },
  rewardedBtn: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${colors.teal}40`,
    backgroundColor: `${colors.teal}10`,
  },
  rewardedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.teal,
  },
  legal: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.t4,
    textAlign: "center",
    lineHeight: 15,
    marginTop: spacing.sm,
  },
  privacyLink: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  privacyLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.sapphire,
  },

  expansionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: "#4B5563",
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  expansionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expansionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: "#F9FAFC",
  },
  unlockedBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    borderColor: "#34D399",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  unlockedBadgeText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9,
    color: "#34D399",
  },
  lockedBadge: {
    backgroundColor: "rgba(156, 163, 175, 0.15)",
    borderColor: "#9CA3AF",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  lockedBadgeText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9,
    color: "#9CA3AF",
  },
  expansionDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.t3,
    lineHeight: 16,
  },
  expansionActiveText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: "#34D399",
    marginTop: 4,
  },
  unlockButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  unlockBtn: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.t1,
  },
});

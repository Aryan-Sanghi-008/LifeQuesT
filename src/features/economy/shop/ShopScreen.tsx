import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useToastStore } from "@store/toastStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useShopActions, getShopStoreState } from "./hooks/useShopActions";
import { FadeInView, CurrencyChip, ScreenHeader } from "@components/index";
import { ScenarioArt, ScenarioStorefrontCard } from "@components/scenario";
import { SCENARIOS } from "@data/scenarios";
import { CosmeticPreviewSheet } from "./CosmeticPreviewSheet";
import {
  migrateCosmeticIdList,
  getThemeCosmeticsByMode,
  getCosmeticsByCategory,
  type CosmeticItem,
} from "@data/cosmeticCatalog";
import {
  IAP_CATALOG,
  AVATAR_PACK_CATALOG,
  MYSTERY_SPIN_CATALOG,
  SCENARIO_PACK_CATALOG,
  IAP_CLIENT_GRANTS,
  getCatalogPriceLabel,
  STARTER_PACK_FALLBACK_PRICE,
} from "@data/iapCatalog";
import { shouldShowStarterOffer } from "@services/persistence";
import { isDlcUnlocked } from "@data/dlcData";
import { ShopTabBar, type ShopTab } from "./ShopTabBar";
import { FeaturedDealHero } from "./FeaturedDealHero";
import { GemValueCalculator } from "./GemValueCalculator";
import { PremiumBanner } from "./PremiumBanner";
import { ProductCard } from "./ProductCard";
import { PreCharacterPremiumShop } from "./PreCharacterPremiumShop";
import {
  purchaseProduct,
  restorePurchases,
  getIAPProducts,
  processVerifiedPurchase,
  applyPurchaseToStore,
} from "@services/iap";
import { showRewardedAd } from "@services/ads";
import { SupportLifeQuestButton } from "@shared/components/SupportLifeQuestButton";
import { getHydratedLiveOpsConfig } from "@engine/liveOpsEngine";
import { getActiveLimitedTimeOffers } from "@services/liveOpsConfig";
import { getPrivacyPolicyUrl, openLegalUrlSafe } from "@config/legal";
import { IAPProductId, RootStackParamList, ScenarioId } from "@/types";
import { SEASON_PASS_TIERS } from "@data/gameData";

export function ShopScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors, fonts, radii, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Shop">>();
  const traitUpsell = route.params?.source === "trait_upsell";
  const {
    character,
    accountIsPremium,
    globalPrestige,
    unlockFantasyDlc,
    purchaseStreakShield,
    purchaseMysterySpinWithGems,
    purchaseCosmetic,
    applyCosmetic,
  } = useShopActions();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [previewCosmetic, setPreviewCosmetic] = useState<{ item: CosmeticItem; owned: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>(
    route.params?.tab ?? (traitUpsell ? "premium" : "bundles"),
  );
  const showToast = useToastStore((s) => s.showToast);

  const storeProducts = getIAPProducts();

  const grantDevFallback = (productId: IAPProductId) => {
    const store = getShopStoreState();
    applyPurchaseToStore(productId, store);
    void store._persist();
    showToast('Purchase activated! Enjoy your benefits.', 'success');
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
      showToast((e as Error).message ?? "Purchase failed. Try again later.", "error");
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing("restore");
    try {
      const purchases = await restorePurchases();
      const store = getShopStoreState();
      let granted = 0;
      for (const p of purchases) {
        const ok = await processVerifiedPurchase(p, store);
        if (ok) granted += 1;
      }
      showToast(
        granted > 0
          ? `${granted} purchase(s) restored.`
          : purchases.length > 0
            ? "Purchases found but verification failed. Sign in and try again."
            : "No purchases found.",
        granted > 0 ? "success" : "info",
      );
    } catch (e) {
      showToast((e as Error).message ?? "Restore failed. Try again later.", "error");
    } finally {
      setPurchasing(null);
    }
  };

  const openPrivacy = async () => {
    try {
      await openLegalUrlSafe(getPrivacyPolicyUrl(), "Privacy Policy");
    } catch {
      showToast("Unable to open Privacy Policy. Set EXPO_PUBLIC_PRIVACY_POLICY_URL.", "error");
    }
  };

  if (!character) {
    return (
      <PreCharacterPremiumShop
        isPremium={accountIsPremium}
        traitUpsell={traitUpsell}
        purchasing={purchasing}
        storeProducts={storeProducts}
        onBuyMonthly={() => void buy("premium_monthly")}
        onBuyYearly={() => void buy("premium_yearly")}
        onRestore={() => void handleRestore()}
        onPrivacy={() => void openPrivacy()}
      />
    );
  }

  const buyLuckWithCoins = () => {
    const store = getShopStoreState();
    if (!store.spendCoins(500)) {
      showToast("Not enough coins — you need 500 coins for a Luck Boost.", "error");
      return;
    }
    store.addLuckBoost(3);
    showToast("3 Luck Boosts added to your character!", "success");
  };

  const watchAdForLuck = async () => {
    if (purchasing !== null) return;
    const c = getShopStoreState().character;
    if (c?.hasNoAds || c?.isPremium) return;
    setPurchasing("rewarded_luck");
    try {
      const earned = await showRewardedAd();
      if (earned) {
        getShopStoreState().addLuckBoost(1);
        showToast("You earned 1 Luck Boost!", "success");
      } else {
        showToast("Ad unavailable — try again in a moment.", "info");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const watchAdForCoins = async () => {
    if (purchasing !== null) return;
    const c = getShopStoreState().character;
    if (c?.hasNoAds || c?.isPremium) return;
    setPurchasing("rewarded_coins");
    try {
      const earned = await showRewardedAd();
      if (earned) {
        const granted = getShopStoreState().grantAdRewardCoins(200);
        showToast(
          granted > 0 ? `You earned ${granted} coins!` : "Daily coin cap reached.",
          granted > 0 ? "success" : "info",
        );
      } else {
        showToast("Ad unavailable — try again in a moment.", "info");
      }
    } finally {
      setPurchasing(null);
    }
  };

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

  const unlockedStyles = character.unlockedAvatarStyles ?? [];

  const isAvatarPackOwned = (productId: IAPProductId) => {
    const grants = IAP_CLIENT_GRANTS[productId];
    if (!grants) return false;
    if (grants.unlockAllAvatarStyles) {
      const all: import('@/types').AvatarStyleId[] = [
        'adventurer', 'adventurer-neutral', 'lorelei', 'lorelei-neutral', 'bottts', 'notionists', 'big-smile',
      ];
      return all.every((s) => unlockedStyles.includes(s));
    }
    const styles = grants.avatarStyles ?? (grants.avatarStyle ? [grants.avatarStyle] : []);
    return styles.length > 0 && styles.every((s) => unlockedStyles.includes(s));
  };

  const avatarPacks = AVATAR_PACK_CATALOG.map((entry) => ({
    ...entry,
    price: getCatalogPriceLabel(entry.productId, storeProducts, entry.fallbackPriceLabel),
    owned: isAvatarPackOwned(entry.productId),
  }));

  const unlockedCosmeticIds = migrateCosmeticIdList(globalPrestige.unlockedCosmeticIds);
  const mapCosmetics = (category: import('@data/cosmeticCatalog').CosmeticCategory) =>
    getCosmeticsByCategory(category).map((item) => ({
      ...item,
      owned: unlockedCosmeticIds.includes(item.id),
    }));

  const lightThemes = getThemeCosmeticsByMode('light').map((item) => ({
    ...item,
    owned: unlockedCosmeticIds.includes(item.id),
  }));
  const darkThemes = getThemeCosmeticsByMode('dark').map((item) => ({
    ...item,
    owned: unlockedCosmeticIds.includes(item.id),
  }));
  const tombstoneCosmetics = mapCosmetics('tombstone');
  const eventSkinCosmetics = mapCosmetics('event_skin');
  const nameFontCosmetics = mapCosmetics('name_font');
  const soundPackCosmetics = mapCosmetics('sound_pack');

  const formatCosmeticPrice = (item: CosmeticItem) => {
    if (item.iapProductId) {
      const iap = getCatalogPriceLabel(item.iapProductId, storeProducts, item.fallbackPriceLabel ?? '');
      return item.gemCost ? `${iap} · or ${item.gemCost} 💎` : iap;
    }
    return item.gemCost ? `${item.gemCost} 💎` : 'Free';
  };

  const openCosmeticPreview = (item: CosmeticItem, owned: boolean) => {
    setPreviewCosmetic({ item, owned });
  };

  const handlePreviewEquip = () => {
    if (!previewCosmetic) return;
    const result = applyCosmetic(previewCosmetic.item.id);
    showToast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setPreviewCosmetic(null);
  };

  const handlePreviewBuy = async () => {
    if (!previewCosmetic) return;
    const item = previewCosmetic.item;
    if (item.iapProductId) {
      setPreviewCosmetic(null);
      await buy(item.iapProductId);
      applyCosmetic(item.id);
      return;
    }
    const result = purchaseCosmetic(item.id);
    showToast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) {
      applyCosmetic(item.id);
      setPreviewCosmetic(null);
    }
  };

  const starterOfferActive = shouldShowStarterOffer();
  const limitedTimeOffers = getActiveLimitedTimeOffers(getHydratedLiveOpsConfig());

  const unlockedScenarioIds = globalPrestige.unlockedScenarioIds ?? [];
  const scenarioPacks = SCENARIO_PACK_CATALOG.map((entry) => {
    const scenarioId = entry.productId.replace('scenario_', '');
    const owned = scenarioId === 'pack_all'
      ? ['royal','crime','cyber','medieval','zombie','mars','celebrity','fantasy','political'].every((id) => unlockedScenarioIds.includes(id as never))
      : unlockedScenarioIds.includes(scenarioId as never);
    return {
      ...entry,
      scenarioId: scenarioId === 'pack_all' ? null : (scenarioId as ScenarioId),
      price: getCatalogPriceLabel(entry.productId, storeProducts, entry.fallbackPriceLabel),
      owned,
    };
  });
  const scenarioBundle = scenarioPacks.find((p) => p.productId === 'scenario_pack_all');
  const individualScenarioPacks = scenarioPacks.filter((p) => p.productId !== 'scenario_pack_all');

  const navigateScenarioOwned = (scenarioId: ScenarioId | null) => {
    if (!scenarioId) {
      navigation.navigate('ScenarioPicker');
      return;
    }
    navigation.navigate('ScenarioDetail', { scenarioId });
  };

  const seasonPassSection = (
    <>
      <Text style={styles.gridLabel}>SEASON PASS</Text>
      <FadeInView delay={150}>
        {character.hasSeasonPass ? (
          <View style={[styles.rewardedBtn, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }]}>
            <Text style={styles.rewardedText}>Season Pass · XP {character.seasonXp ?? 0}</Text>
            <View style={{ backgroundColor: `${colors.emerald}25`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: `${colors.emerald}50` }}>
              <Text style={{ color: colors.emerald, fontFamily: fonts.monoSemiBold, fontSize: 9, letterSpacing: 0.8 }}>ACTIVE</Text>
            </View>
          </View>
        ) : (
          <Pressable style={styles.rewardedBtn} onPress={() => void buy("season_pass")} accessibilityLabel="Buy season pass">
            <Text style={styles.rewardedText}>Unlock Season Pass</Text>
          </Pressable>
        )}
        {character.hasSeasonPass && SEASON_PASS_TIERS.map((tier) => {
          const claimed = (character.claimedSeasonTiers ?? []).includes(tier.tier);
          const canClaim = !claimed && (character.seasonXp ?? 0) >= tier.xpRequired;
          return (
            <Pressable key={tier.tier} style={[styles.rewardedBtn, (claimed || !canClaim) && { opacity: 0.5 }]}
              disabled={claimed}
              onPress={() => {
                const result = getShopStoreState().claimSeasonTier(tier.tier);
                showToast(result.message, result.ok ? "success" : "error");
              }}>
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
                <Pressable style={styles.unlockBtn} onPress={() => { const res = unlockFantasyDlc("gems"); showToast(res.message ?? "Done", res.ok ? "success" : "error"); }}>
                  <Text style={styles.unlockBtnText}>💎 100 Gems</Text>
                </Pressable>
                <Pressable style={styles.unlockBtn} onPress={() => { const res = unlockFantasyDlc("coins"); showToast(res.message ?? "Done", res.ok ? "success" : "error"); }}>
                  <Text style={styles.unlockBtnText}>🪙 1k Coins</Text>
                </Pressable>
                <Pressable style={[styles.unlockBtn, globalPrestige.prestigeLevel < 3 && { opacity: 0.5 }]}
                  onPress={() => { const res = unlockFantasyDlc("prestige"); showToast(res.message ?? "Done", res.ok ? "success" : "error"); }}>
                  <Text style={styles.unlockBtnText}>⭐ Prestige L3</Text>
                </Pressable>
              </View>}
        </View>
      </FadeInView>
    </>
  );

  const footer = (
    <>
      {character.hasNoAds || character.isPremium ? (
        <SupportLifeQuestButton label="LifeQuest Plus — Active" />
      ) : (
        <>
          <Pressable style={styles.rewardedBtn} onPress={() => void watchAdForCoins()} disabled={busy} accessibilityRole="button">
            <Text style={styles.rewardedText}>{purchasing === "rewarded_coins" ? "Loading ad…" : "Watch ad for 200 Coins"}</Text>
          </Pressable>
          <Pressable style={styles.rewardedBtn} onPress={() => void watchAdForLuck()} disabled={busy} accessibilityRole="button">
            <Text style={styles.rewardedText}>{purchasing === "rewarded_luck" ? "Loading ad…" : "Watch ad for +1 Luck Boost"}</Text>
          </Pressable>
        </>
      )}
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
                  onPressMonthly={() => void buy("premium_monthly")}
                  onPressYearly={() => void buy("premium_yearly")}
                  monthlyPriceLabel={getCatalogPriceLabel("premium_monthly", storeProducts, "$4.99")}
                  yearlyPriceLabel={getCatalogPriceLabel("premium_yearly", storeProducts, "$34.99")}
                  loadingMonthly={purchasing === "premium_monthly"}
                  loadingYearly={purchasing === "premium_yearly"}
                />
              </FadeInView>
              {seasonPassSection}
              <FadeInView delay={200}>
                <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  <Text style={[styles.gridLabel, { marginBottom: 8 }]}>STREAK SHIELD</Text>
                  <Pressable
                    onPress={() => {
                      const result = purchaseStreakShield();
                      showToast(result.message, result.ok ? "success" : "error");
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
              <FadeInView delay={250}>
                <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  <Text style={[styles.gridLabel, { marginBottom: 8 }]}>MYSTERY BOX SPINS</Text>
                  <Pressable
                    onPress={() => {
                      const result = purchaseMysterySpinWithGems();
                      showToast(result.message, result.ok ? 'success' : 'error');
                    }}
                    style={({ pressed }) => [{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      backgroundColor: pressed ? `${colors.orchid}20` : `${colors.orchid}10`,
                      borderWidth: 1, borderColor: `${colors.orchid}30`,
                      borderRadius: 12, padding: 14, marginBottom: 8,
                    }]}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${colors.orchid}20`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 20 }}>🎲</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Extra Spin</Text>
                      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>1 bonus Lucky Wheel spin, instant</Text>
                    </View>
                    <Text style={{ color: colors.orchid, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>20 💎</Text>
                  </Pressable>
                  {MYSTERY_SPIN_CATALOG.map((entry) => (
                    <Pressable
                      key={entry.productId}
                      onPress={() => void buy(entry.productId)}
                      style={({ pressed }) => [{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: pressed ? `${colors.orchid}20` : `${colors.orchid}10`,
                        borderWidth: 1, borderColor: `${colors.orchid}30`,
                        borderRadius: 12, padding: 14,
                      }]}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${colors.orchid}20`, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20 }}>🎁</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>{entry.title}</Text>
                        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>{entry.description}</Text>
                      </View>
                      <Text style={{ color: colors.orchid, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
                        {getCatalogPriceLabel(entry.productId, storeProducts, entry.fallbackPriceLabel)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FadeInView>
              {footer}
            </>
          )}

          {activeTab === 'bundles' && (
            <>
              {starterOfferActive && (
                <FadeInView delay={40}>
                  <Pressable
                    onPress={() => void buy('starter_pack')}
                    style={{ borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md }}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#4F46E5']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={{ padding: spacing.xl, gap: spacing.sm }}
                    >
                      <Text style={{ color: '#FFFFFFCC', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
                        LIMITED OFFER
                      </Text>
                      <Text style={{ color: '#FFF', fontFamily: fonts.displayBlack, fontSize: 24 }}>Starter Pack</Text>
                      <Text style={{ color: '#FFFFFFCC', fontFamily: fonts.body, fontSize: 13, lineHeight: 20 }}>
                        50 gems · No ads · Silver Spoon scenario
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ color: '#FFF', fontFamily: fonts.displayBold, fontSize: 22 }}>
                          {getCatalogPriceLabel('starter_pack', storeProducts, STARTER_PACK_FALLBACK_PRICE)}
                        </Text>
                        <View style={{ backgroundColor: '#00000055', borderRadius: radii.sm, paddingHorizontal: 16, paddingVertical: 10 }}>
                          <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold, fontSize: 14 }}>Get It Now</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </Pressable>
                </FadeInView>
              )}
              {limitedTimeOffers.map((offer) => (
                <FadeInView key={offer.id} delay={60}>
                  <Pressable
                    onPress={() => offer.productId ? void buy(offer.productId as IAPProductId) : undefined}
                    style={{ borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md }}
                  >
                    <LinearGradient
                      colors={[`${colors.gold}CC`, `${colors.gold2}99`]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={{ padding: spacing.lg, gap: spacing.xs }}
                    >
                      <Text style={{ color: '#FFFFFFCC', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
                        LIMITED TIME
                      </Text>
                      <Text style={{ color: '#FFF', fontFamily: fonts.displayBold, fontSize: 20 }}>{offer.title}</Text>
                      {offer.subtitle ? (
                        <Text style={{ color: '#FFFFFFCC', fontFamily: fonts.body, fontSize: 13 }}>{offer.subtitle}</Text>
                      ) : null}
                    </LinearGradient>
                  </Pressable>
                </FadeInView>
              ))}
              <FeaturedDealHero
                onPress={() => void buy("season_pass")}
                priceLabel={getCatalogPriceLabel("season_pass", storeProducts, "$0.99/season")}
                owned={character.hasSeasonPass ?? false}
              />
              <GemValueCalculator
                onBuy={() => void buy('gems_small')}
                priceLabel={getCatalogPriceLabel('gems_small', storeProducts, '$1.49')}
              />
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
              <Text style={styles.gridLabel}>LIGHT THEMES</Text>
              <View style={styles.productGrid}>
                {lightThemes.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 60} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.sapphire}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>DARK THEMES</Text>
              <View style={styles.productGrid}>
                {darkThemes.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 80} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.sapphire}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>EVENT CARD SKINS</Text>
              <View style={styles.productGrid}>
                {eventSkinCosmetics.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 90} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.orchid}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>NAME FONTS</Text>
              <View style={styles.productGrid}>
                {nameFontCosmetics.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 100} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.gold}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>SOUND PACKS</Text>
              <View style={styles.productGrid}>
                {soundPackCosmetics.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 110} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.teal}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>TOMBSTONE STYLES</Text>
              <View style={styles.productGrid}>
                {tombstoneCosmetics.map((item, i) => (
                  <FadeInView key={item.id} delay={i * 60 + 120} style={{ width: "48%" }}>
                    <ProductCard
                      title={item.label}
                      desc={item.description}
                      price={item.owned ? 'View' : formatCosmeticPrice(item)}
                      color={item.previewColor ?? colors.t3}
                      owned={item.owned}
                      onPress={() => openCosmeticPreview(item, item.owned)}
                      onOwnedPress={() => openCosmeticPreview(item, true)}
                    />
                  </FadeInView>
                ))}
              </View>
              <Text style={styles.gridLabel}>AVATAR PACKS</Text>
              <View style={styles.productGrid}>
                {avatarPacks.map((pack, i) => (
                  <FadeInView key={pack.productId} delay={i * 60 + 140} style={{ width: "48%" }}>
                    <ProductCard
                      title={pack.title}
                      desc={pack.description}
                      price={pack.owned ? 'Owned' : pack.price}
                      color={pack.color}
                      owned={pack.owned}
                      onPress={() => pack.owned ? undefined : void buy(pack.productId)}
                    />
                  </FadeInView>
                ))}
              </View>
              {footer}
            </>
          )}

          {activeTab === 'scenarios' && (
            <>
              {scenarioBundle && (
                <FadeInView delay={60}>
                  <Pressable
                    onPress={scenarioBundle.owned ? () => navigation.navigate('ScenarioPicker') : () => void buy('scenario_pack_all')}
                    accessibilityRole="button"
                    accessibilityLabel={
                      scenarioBundle.owned
                        ? 'All scenarios unlocked. Browse scenarios'
                        : `Buy ${scenarioBundle.title} for ${scenarioBundle.price}`
                    }
                    style={{ borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.35)' }}
                  >
                    <View style={{ height: 148, overflow: 'hidden' }}>
                      <LinearGradient
                        colors={scenarioBundle.owned
                          ? [`${colors.emerald}40`, `${colors.emerald}18`, colors.bgCard]
                          : ['#1E293B', '#334155', '#0F172A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {/* Collage of premium motifs */}
                      <View style={{ ...StyleSheet.absoluteFill, flexDirection: 'row', opacity: 0.55 }}>
                        {(['royal', 'cyber', 'mars', 'fantasy'] as ScenarioId[]).map((id) => (
                          <View key={id} style={{ flex: 1, overflow: 'hidden' }}>
                            <ScenarioArt scenarioId={id} variant="compact" />
                          </View>
                        ))}
                      </View>
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.75)']}
                        style={{ ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: spacing.xl }}
                      >
                        <Text style={{ color: scenarioBundle.owned ? colors.emerald : colors.gold, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
                          {scenarioBundle.owned ? 'ALL SCENARIOS UNLOCKED' : 'BEST VALUE'}
                        </Text>
                        <Text style={{ color: '#FFF', fontFamily: fonts.displayBlack, fontSize: 24, marginTop: 4 }}>
                          {scenarioBundle.title}
                        </Text>
                        <Text style={{ color: '#FFFFFFCC', fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
                          {scenarioBundle.description}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          {scenarioBundle.owned ? (
                            <Text style={{ color: colors.emerald, fontFamily: fonts.bodyBold, fontSize: 14 }}>Browse Scenarios</Text>
                          ) : (
                            <>
                              <Text style={{ color: '#FFF', fontFamily: fonts.displayBold, fontSize: 22 }}>{scenarioBundle.price}</Text>
                              <View style={{ backgroundColor: '#00000066', borderRadius: radii.sm, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: `${colors.gold}50` }}>
                                <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold, fontSize: 14 }}>Unlock All</Text>
                              </View>
                            </>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  </Pressable>
                </FadeInView>
              )}
              <Text style={styles.gridLabel}>SCENARIO PACKS</Text>
              <View style={{ paddingHorizontal: 4, gap: 12, paddingBottom: 8 }}>
                {individualScenarioPacks.map((pack, i) => {
                  const scenarioMeta = pack.scenarioId
                    ? SCENARIOS.find((s) => s.id === pack.scenarioId)
                    : undefined;
                  if (!pack.scenarioId || !scenarioMeta) {
                    return (
                      <FadeInView key={pack.productId} delay={i * 50 + 80} style={{ width: '100%' }}>
                        <ProductCard
                          title={pack.title}
                          desc={pack.description}
                          price={pack.price}
                          color={pack.color}
                          owned={pack.owned}
                          badge={pack.badge}
                          onPress={() => void buy(pack.productId as IAPProductId)}
                        />
                      </FadeInView>
                    );
                  }
                  return (
                    <ScenarioStorefrontCard
                      key={pack.productId}
                      scenarioId={pack.scenarioId}
                      name={scenarioMeta.name}
                      tagline={scenarioMeta.tagline}
                      description={pack.description}
                      owned={pack.owned}
                      isPremium
                      priceLabel={pack.price}
                      badgeSubtitle={pack.owned ? undefined : pack.price}
                      variant="editorial"
                      enterDelay={i * 50 + 80}
                      onPress={() => {
                        if (pack.owned) {
                          navigateScenarioOwned(pack.scenarioId!);
                          return;
                        }
                        void buy(pack.productId as IAPProductId);
                      }}
                    />
                  );
                })}
              </View>
              {footer}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <CosmeticPreviewSheet
        item={previewCosmetic?.item ?? null}
        owned={previewCosmetic?.owned ?? false}
        visible={!!previewCosmetic}
        purchasing={!!purchasing}
        priceLabel={
          previewCosmetic
            ? formatCosmeticPrice(previewCosmetic.item)
            : undefined
        }
        onClose={() => setPreviewCosmetic(null)}
        onEquip={handlePreviewEquip}
        onBuy={() => void handlePreviewBuy()}
      />
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

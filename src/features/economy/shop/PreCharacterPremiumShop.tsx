import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles, useTheme, SPACING } from "@theme";
import { FadeInView, ScreenHeader } from "@components/index";
import { PremiumBanner } from "./PremiumBanner";
import { TRAITS_WITH_DESCRIPTIONS } from "@data/traitCatalog";
import { getCatalogPriceLabel } from "@data/iapCatalog";
import { getIAPProducts } from "@services/iap";

type StoreProduct = ReturnType<typeof getIAPProducts>[number];

const PREMIUM_TRAIT_IDS = ["lucky", "stoic", "magnetic"] as const;

type PreCharacterPremiumShopProps = {
  isPremium: boolean;
  traitUpsell: boolean;
  purchasing: string | null;
  storeProducts: StoreProduct[];
  onBuyMonthly: () => void;
  onBuyYearly: () => void;
  onRestore: () => void;
  onPrivacy: () => void;
};

export function PreCharacterPremiumShop({
  isPremium,
  traitUpsell,
  purchasing,
  storeProducts,
  onBuyMonthly,
  onBuyYearly,
  onRestore,
  onPrivacy,
}: PreCharacterPremiumShopProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, fonts } = useTheme();
  const busy = purchasing !== null;

  const premiumTraits = TRAITS_WITH_DESCRIPTIONS.filter((t) =>
    (PREMIUM_TRAIT_IDS as readonly string[]).includes(t.id),
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerPad}>
          <ScreenHeader
            title={traitUpsell ? "Unlock Plus Traits" : "LifeQuest Plus"}
            subtitle={
              traitUpsell
                ? "Subscribe to select Lucky, Stoic, and Magnetic at character creation."
                : "Premium perks apply to your next life."
            }
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {traitUpsell && (
            <FadeInView delay={50}>
              <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
                PREMIUM TRAITS
              </Text>
              {premiumTraits.map((trait) => (
                <View
                  key={trait.id}
                  style={[
                    styles.traitRow,
                    { backgroundColor: colors.bgCard, borderColor: `${colors.gold}40` },
                  ]}
                >
                  <Text style={[styles.traitName, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
                    {trait.label}
                  </Text>
                  <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                    {trait.description}
                  </Text>
                </View>
              ))}
            </FadeInView>
          )}

          {isPremium ? (
            <FadeInView delay={100}>
              <View style={[styles.activeCard, { backgroundColor: `${colors.emerald}15`, borderColor: `${colors.emerald}40` }]}>
                <Text style={[styles.activeTitle, { color: colors.emerald, fontFamily: fonts.bodyBold }]}>
                  LifeQuest Plus is active
                </Text>
                <Text style={[styles.activeBody, { color: colors.t2, fontFamily: fonts.body }]}>
                  Go back to Traits and pick up to two Plus traits for your new life.
                </Text>
              </View>
            </FadeInView>
          ) : (
            <FadeInView delay={100}>
              <PremiumBanner
                isPremium={false}
                onPressMonthly={onBuyMonthly}
                onPressYearly={onBuyYearly}
                monthlyPriceLabel={getCatalogPriceLabel("premium_monthly", storeProducts, "$4.99")}
                yearlyPriceLabel={getCatalogPriceLabel("premium_yearly", storeProducts, "$34.99")}
                loadingMonthly={purchasing === "premium_monthly"}
                loadingYearly={purchasing === "premium_yearly"}
              />
            </FadeInView>
          )}

          <Pressable style={styles.restoreBtn} onPress={onRestore} disabled={busy} accessibilityRole="button">
            <Text style={[styles.restoreText, { color: colors.t2, fontFamily: fonts.bodySemiBold }]}>
              {purchasing === "restore" ? "Restoring…" : "Restore Purchases"}
            </Text>
          </Pressable>

          <Text style={[styles.legal, { color: colors.t4, fontFamily: fonts.body }]}>
            Subscriptions auto-renew. Cancel any time. Purchases are non-refundable. Prices may vary by region.
          </Text>
          <Pressable onPress={onPrivacy} style={styles.privacyLink}>
            <Text style={[styles.privacyLinkText, { color: colors.sapphire, fontFamily: fonts.body }]}>
              Privacy Policy
            </Text>
          </Pressable>
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    headerPad: { paddingHorizontal: 16 },
    scroll: { paddingHorizontal: 16, paddingBottom: 24 },
    sectionLabel: { fontSize: 11, letterSpacing: 1.2, marginBottom: 10 },
    traitRow: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    },
    traitName: { fontSize: 15, marginBottom: 4 },
    traitDesc: { fontSize: 13, lineHeight: 18 },
    activeCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    activeTitle: { fontSize: 16, marginBottom: 6 },
    activeBody: { fontSize: 14, lineHeight: 20 },
    restoreBtn: {
      alignItems: "center",
      paddingVertical: 14,
      marginTop: 8,
    },
    restoreText: { fontSize: 14 },
    legal: { fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 8 },
    privacyLink: { alignItems: "center", paddingVertical: 8 },
    privacyLinkText: { fontSize: 13 },
  });

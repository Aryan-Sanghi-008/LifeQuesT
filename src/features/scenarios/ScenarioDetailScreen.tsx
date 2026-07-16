import { View, Text, ScrollView, Pressable, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { useTheme, ANIM } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { ScenarioArt, ScenarioArtFxLayer, ScenarioMotion, getScenarioVisual } from "@components/scenario";
import { SCENARIOS, ScenarioId } from "@data/scenarios";
import type { RootStackParamList } from "@/types";
import { useScenarioPurchase, getScenarioPurchaseStore } from "@features/scenarios/hooks/useScenarioPurchase";
import { purchaseProduct, getIAPProducts, applyPurchaseToStore } from "@services/iap";
import { useToastStore } from "@store/toastStore";
import { IAPProductId } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ScenarioDetail">;

export function ScenarioDetailScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { isScenarioOwned } = useScenarioPurchase();
  const showToast = useToastStore((s) => s.showToast);
  const [purchasing, setPurchasing] = useState(false);
  const reducedMotion = useReducedMotion();
  const ctaScale = useRef(new Animated.Value(1)).current;

  const onCtaPressIn = () => {
    if (reducedMotion) return;
    Animated.spring(ctaScale, { toValue: 0.96, useNativeDriver: true, ...ANIM.spring }).start();
  };
  const onCtaPressOut = () => {
    if (reducedMotion) return;
    Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start();
  };

  const scenario = SCENARIOS.find((s) => s.id === (route.params.scenarioId as ScenarioId));

  if (!scenario) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.t2, fontFamily: fonts.body }}>Scenario not found.</Text>
      </SafeAreaView>
    );
  }

  const visual = getScenarioVisual(scenario.id);
  const accent = visual.accent;
  const owned = isScenarioOwned(scenario.id);
  const storeProducts = getIAPProducts();
  const iapEntry = storeProducts.find((p) => p.productId === scenario.iapProductId);
  const priceLabel = iapEntry?.localizedPrice ?? scenario.priceLabel ?? "Unlock";

  const handleCTA = async () => {
    if (owned) {
      navigation.navigate("CharacterCreate", { scenarioId: scenario.id });
      return;
    }
    if (!scenario.iapProductId) return;
    setPurchasing(true);
    try {
      const catalog = getIAPProducts();
      if (catalog.length === 0) {
        const store = getScenarioPurchaseStore();
        applyPurchaseToStore(scenario.iapProductId as IAPProductId, store);
        await store._persist();
        showToast(`${scenario.name} unlocked!`, "success");
        navigation.navigate("CharacterCreate", { scenarioId: scenario.id });
        return;
      }
      await purchaseProduct(scenario.iapProductId as IAPProductId);
      showToast(`${scenario.name} unlocked! Starting new life…`, "success");
      navigation.navigate("CharacterCreate", { scenarioId: scenario.id });
    } catch (e) {
      showToast((e as Error).message ?? "Purchase failed. Try again.", "error");
    } finally {
      setPurchasing(false);
    }
  };

  const ctaLabel = owned
    ? `Start ${scenario.name}`
    : purchasing
      ? "Processing…"
      : `Unlock · ${priceLabel}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Scenario</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <ScenarioMotion scenarioId={scenario.id} pressable={false} enterDelay={0}>
          <View style={styles.heroWrap}>
            <ScenarioArt scenarioId={scenario.id} variant="hero">
              <View style={[styles.heroChrome, { padding: spacing.lg }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  {owned && (
                    <View style={{
                      backgroundColor: `${colors.emerald}28`,
                      borderRadius: radii.sm,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: `${colors.emerald}50`,
                    }}>
                      <Text style={{ color: colors.emerald, fontFamily: fonts.monoSemiBold, fontSize: 10, letterSpacing: 0.5 }}>
                        OWNED
                      </Text>
                    </View>
                  )}
                  {!owned && scenario.isPremium && (
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(0,0,0,0.45)",
                      borderRadius: radii.sm,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: `${colors.gold}50`,
                    }}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path
                          stroke={colors.gold}
                          strokeWidth={2}
                          strokeLinecap="round"
                          d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
                        />
                      </Svg>
                      <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 12 }}>
                        Premium · {priceLabel}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: "#FFF", fontFamily: fonts.displayBold, fontSize: 28, textShadowColor: "rgba(0,0,0,0.45)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
                    {scenario.name}
                  </Text>
                  <Text style={{ color: accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                    {scenario.tagline}
                  </Text>
                </View>
              </View>
              <ScenarioArtFxLayer scenarioId={scenario.id} />
            </ScenarioArt>
          </View>
        </ScenarioMotion>

        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.5 }}>
              ABOUT THIS SCENARIO
            </Text>
            <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 }}>
              {scenario.description}
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.5 }}>
              STAT MODIFIERS
            </Text>
            <View style={{
              backgroundColor: colors.bgCard,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              {scenario.statModifiers.map((mod, idx) => (
                <View
                  key={mod.label}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: spacing.md,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13 }}>
                    {mod.label}
                  </Text>
                  <Text style={{
                    color: mod.positive ? colors.emerald : colors.crimson,
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 13,
                  }}>
                    {mod.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <Pressable
            onPress={handleCTA}
            onPressIn={onCtaPressIn}
            onPressOut={onCtaPressOut}
            disabled={purchasing}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            style={[
              {
                borderRadius: radii.md,
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              },
              owned ? { backgroundColor: accent } : { backgroundColor: colors.gold },
            ]}
          >
            {purchasing && <ActivityIndicator size="small" color="#FFF" />}
            <Text style={{ color: "#FFFFFF", fontFamily: fonts.displayBold, fontSize: 15 }}>
              {ctaLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: "100%",
    minHeight: 168,
  },
  heroChrome: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
});

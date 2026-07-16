import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { ScenarioStorefrontCard } from "@components/scenario";
import { SCENARIOS } from "@data/scenarios";
import type { RootStackParamList, ScenarioId } from "@/types";
import { useGameStore } from "@store/gameStore";
import { FREE_SCENARIO_IDS } from "@data/scenarioCatalog";
import { getFeaturedScenarioId as getRemoteFeaturedScenarioId } from "@services/remoteConfig";
import { getHydratedLiveOpsConfig } from "@engine/liveOpsEngine";
import { useToastStore } from "@store/toastStore";
import { getMonthKey } from "@data/plusRotation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function SectionLabel({ label, right }: { label: string; right?: string }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1 }}>
        {label}
      </Text>
      {right ? (
        <Text style={{ color: colors.gold, fontFamily: fonts.monoSemiBold, fontSize: 11 }}>
          {right}
        </Text>
      ) : null}
    </View>
  );
}

export function ScenarioPickerScreen() {
  const { colors, fonts, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const showToast = useToastStore((s) => s.showToast);
  const character = useGameStore((s) => s.character);
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const isScenarioOwned = useGameStore((s) => s.isScenarioOwned);
  const getPlusScenarioPool = useGameStore((s) => s.getPlusScenarioPool);
  const redeemPlusScenarioPick = useGameStore((s) => s.redeemPlusScenarioPick);
  const ensurePlusMonthlyState = useGameStore((s) => s.ensurePlusMonthlyState);

  const isPremium = character?.isPremium ?? false;
  const month = getMonthKey();
  const plusCredits = globalPrestige.plusScenarioCreditsMonth === month
    ? (globalPrestige.plusScenarioCredits ?? 0)
    : 2;
  const plusPool = getPlusScenarioPool();
  const plusMonthIds = globalPrestige.plusMonthScenarioIds ?? [];

  const freeScenarios = SCENARIOS.filter((s) => FREE_SCENARIO_IDS.includes(s.id as never));
  const premiumScenarios = SCENARIOS.filter((s) => !FREE_SCENARIO_IDS.includes(s.id as never));
  const plusScenarios = SCENARIOS.filter((s) => plusPool.includes(s.id as ScenarioId));
  const featuredScenarioId = (getHydratedLiveOpsConfig()?.featuredScenario
    ?? getRemoteFeaturedScenarioId()) as ScenarioId;
  const featuredScenario = SCENARIOS.find((s) => s.id === featuredScenarioId);

  const handlePlusPick = (scenarioId: ScenarioId) => {
    if (!isPremium) return;
    ensurePlusMonthlyState();
    if (isScenarioOwned(scenarioId)) {
      navigation.navigate("ScenarioDetail", { scenarioId });
      return;
    }
    const result = redeemPlusScenarioPick(scenarioId);
    showToast(result.message, result.ok ? "success" : "error");
  };

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
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Scenarios</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {featuredScenario && (
          <>
            <SectionLabel label="FEATURED" />
            <ScenarioStorefrontCard
              scenarioId={featuredScenario.id}
              name={featuredScenario.name}
              tagline={featuredScenario.tagline}
              description={featuredScenario.description}
              owned={isScenarioOwned(featuredScenario.id)}
              isPremium={featuredScenario.isPremium}
              priceLabel={featuredScenario.priceLabel}
              badgeSubtitle="Featured this week"
              featured
              variant="hero"
              enterDelay={0}
              onPress={() => navigation.navigate("ScenarioDetail", { scenarioId: featuredScenario.id })}
            />
          </>
        )}

        {isPremium && (
          <>
            <SectionLabel label={`PLUS PICKS · ${month}`} right={`${plusCredits} left`} />
            {plusScenarios.map((s, idx) => {
              const owned = isScenarioOwned(s.id);
              const pickedThisMonth = plusMonthIds.includes(s.id);
              return (
                <ScenarioStorefrontCard
                  key={`plus-${s.id}`}
                  scenarioId={s.id}
                  name={s.name}
                  tagline={s.tagline}
                  description={s.description}
                  owned={owned}
                  isPremium={s.isPremium}
                  priceLabel={s.priceLabel}
                  badgeSubtitle={pickedThisMonth ? "This month" : "Use pick"}
                  variant="editorial"
                  enterDelay={idx * 70}
                  onPress={() => handlePlusPick(s.id)}
                />
              );
            })}
            <View style={{ height: 4 }} />
          </>
        )}

        <SectionLabel label="FREE" />
        {freeScenarios.map((s, idx) => (
          <ScenarioStorefrontCard
            key={s.id}
            scenarioId={s.id}
            name={s.name}
            tagline={s.tagline}
            description={s.description}
            owned={isScenarioOwned(s.id)}
            isPremium={false}
            variant="editorial"
            enterDelay={idx * 70}
            onPress={() => navigation.navigate("ScenarioDetail", { scenarioId: s.id })}
          />
        ))}

        <View style={{ height: 4 }} />
        <SectionLabel label="PREMIUM" />
        {premiumScenarios.map((s, idx) => (
          <ScenarioStorefrontCard
            key={s.id}
            scenarioId={s.id}
            name={s.name}
            tagline={s.tagline}
            description={s.description}
            owned={isScenarioOwned(s.id)}
            isPremium
            priceLabel={s.priceLabel}
            variant="editorial"
            enterDelay={idx * 70}
            onPress={() => navigation.navigate("ScenarioDetail", { scenarioId: s.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
});

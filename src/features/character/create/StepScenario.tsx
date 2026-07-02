import { View, Text, Pressable } from "react-native";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { ScenarioId } from "@/types";
import { SCENARIOS } from "@data/scenarios";
import { useGameStore } from "@store/gameStore";
import { FREE_SCENARIO_IDS } from "@data/scenarioCatalog";

type StepScenarioProps = {
  selectedScenario: ScenarioId;
  setSelectedScenario: (s: ScenarioId) => void;
};

export function StepScenario({
  selectedScenario,
  setSelectedScenario,
}: StepScenarioProps) {
  const { colors, fonts, spacing, radii, shadows } = useTheme();
  const isScenarioOwned = useGameStore((s) => s.isScenarioOwned);

  const freeScenarios = SCENARIOS.filter((s) => FREE_SCENARIO_IDS.includes(s.id as never));
  const premiumScenarios = SCENARIOS.filter((s) => !FREE_SCENARIO_IDS.includes(s.id as never));

  const renderScenario = (s: typeof SCENARIOS[0]) => {
    const active = selectedScenario === s.id;
    const owned = isScenarioOwned(s.id);

    return (
      <Pressable
        key={s.id}
        onPress={() => owned && setSelectedScenario(s.id)}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            borderRadius: radii.md,
            padding: spacing.md,
            borderWidth: active ? 2 : 1,
            borderColor: active ? s.accentColor : owned ? colors.border : `${colors.border}60`,
            backgroundColor: active ? `${s.accentColor}10` : colors.bgCard,
            opacity: owned ? 1 : 0.5,
            ...shadows.subtle,
          },
        ]}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.sm,
            backgroundColor: `${s.accentColor}20`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>{s.iconEmoji ?? "🌍"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>{s.name}</Text>
            {!owned && (
              <View style={{ backgroundColor: `${colors.gold}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 10 }}>
                  {s.priceLabel ?? "PREMIUM"}
                </Text>
              </View>
            )}
            {active && owned && (
              <View style={{ backgroundColor: `${s.accentColor}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: s.accentColor, fontFamily: fonts.bodyBold, fontSize: 10 }}>SELECTED</Text>
              </View>
            )}
          </View>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>{s.tagline}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <FadeInView style={{ gap: spacing.md }}>
      <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 28, marginTop: spacing.sm }}>
        Choose your world
      </Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginBottom: spacing.sm }}>
        Each scenario shapes the world around you. Free scenarios are always available — unlock premium worlds via in-app purchase.
      </Text>

      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.5 }}>FREE</Text>
      {freeScenarios.map(renderScenario)}

      <View style={{ height: 4 }} />
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.5 }}>PREMIUM · Unlock via Life Store</Text>
      {premiumScenarios.map(renderScenario)}
    </FadeInView>
  );
}

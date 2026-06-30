import { View, Text, Pressable } from "react-native";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { ScenarioId } from "@/types";
import { SCENARIOS } from "@data/scenarios";

type StepScenarioProps = {
  selectedScenario: ScenarioId;
  setSelectedScenario: (s: ScenarioId) => void;
};

export function StepScenario({
  selectedScenario,
  setSelectedScenario,
}: StepScenarioProps) {
  const { colors, fonts, spacing, radii, shadows } = useTheme();

  return (
    <FadeInView style={{ gap: spacing.md }}>
      <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 28, marginTop: spacing.sm }}>
        Choose your world
      </Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginBottom: spacing.sm }}>
        Each scenario shapes the world around you. Classic is always free — others unlock via season pass.
      </Text>
      {SCENARIOS.map((s) => {
        const active = selectedScenario === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => !s.locked && setSelectedScenario(s.id)}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                borderRadius: radii.md,
                padding: spacing.md,
                borderWidth: active ? 2 : 1,
                borderColor: active ? s.accentColor : colors.border,
                backgroundColor: active ? `${s.accentColor}10` : colors.bgCard,
                opacity: s.locked ? 0.55 : 1,
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
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: s.accentColor,
                  opacity: 0.85,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>{s.name}</Text>
                {s.locked && (
                  <View style={{ backgroundColor: `${colors.gold}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 10 }}>LOCKED</Text>
                  </View>
                )}
                {active && !s.locked && (
                  <View style={{ backgroundColor: `${s.accentColor}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: s.accentColor, fontFamily: fonts.bodyBold, fontSize: 10 }}>SELECTED</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>{s.tagline}</Text>
            </View>
          </Pressable>
        );
      })}
    </FadeInView>
  );
}

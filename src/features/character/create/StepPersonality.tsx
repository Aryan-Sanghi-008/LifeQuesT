import { View, Text, Pressable } from "react-native";
import { useTheme } from "@theme";
import { FadeInView } from "@components/index";
import { BigFivePersonality } from "@/types";
import { getPersonalityImpactSummary } from "@engine/personalityModifiers";

const BIG_FIVE_TRAITS: Array<{
  key: keyof BigFivePersonality;
  label: string;
  low: string;
  high: string;
  color: string;
}> = [
  { key: "openness", label: "Openness", low: "Conventional", high: "Curious", color: "#8B5CF6" },
  { key: "conscientiousness", label: "Conscientiousness", low: "Spontaneous", high: "Disciplined", color: "#06B6D4" },
  { key: "extraversion", label: "Extraversion", low: "Introverted", high: "Outgoing", color: "#F59E0B" },
  { key: "agreeableness", label: "Agreeableness", low: "Competitive", high: "Cooperative", color: "#10B981" },
  { key: "neuroticism", label: "Neuroticism", low: "Resilient", high: "Sensitive", color: "#EF4444" },
];

const SLIDER_STEPS = [10, 25, 40, 55, 70, 85, 100];

type StepPersonalityProps = {
  personality: BigFivePersonality;
  setPersonality: (p: BigFivePersonality) => void;
};

export function StepPersonality({
  personality,
  setPersonality,
}: StepPersonalityProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const impactLines = getPersonalityImpactSummary(personality);

  return (
    <FadeInView style={{ gap: spacing.md }}>
      <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 28, marginTop: spacing.sm }}>
        Your personality
      </Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginBottom: spacing.sm }}>
        Sliders affect event odds, career fit, relationships, and mental health over time.
      </Text>
      <View style={{ backgroundColor: colors.bgCard, borderRadius: radii.md, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.border }}>
        {impactLines.map((line) => (
          <Text key={line} style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 }}>{line}</Text>
        ))}
      </View>
      {BIG_FIVE_TRAITS.map((trait) => {
        const val = personality[trait.key] ?? 50;
        const steps = SLIDER_STEPS;
        return (
          <View key={trait.key} style={{ gap: 6, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.t2, fontFamily: fonts.bodyBold, fontSize: 13 }}>{trait.label}</Text>
              <Text style={{ color: trait.color, fontFamily: fonts.monoSemiBold, fontSize: 12 }}>{val}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
              {steps.map((step) => {
                const active = step <= val;
                return (
                  <Pressable
                    key={step}
                    onPress={() => setPersonality({ ...personality, [trait.key]: step })}
                    style={{
                      flex: 1,
                      height: 28,
                      borderRadius: radii.xs ?? 4,
                      backgroundColor: active ? trait.color : colors.bg2,
                      borderWidth: 1,
                      borderColor: active ? trait.color : colors.border,
                    }}
                  />
                );
              })}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10 }}>{trait.low}</Text>
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10 }}>{trait.high}</Text>
            </View>
          </View>
        );
      })}
    </FadeInView>
  );
}

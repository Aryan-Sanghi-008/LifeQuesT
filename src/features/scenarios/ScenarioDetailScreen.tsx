import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import { SCENARIOS, ScenarioId } from "@data/scenarios";
import type { RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ScenarioDetail">;

export function ScenarioDetailScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const scenario = SCENARIOS.find((s) => s.id === (route.params.scenarioId as ScenarioId));

  if (!scenario) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.t2, fontFamily: fonts.body }}>Scenario not found.</Text>
      </SafeAreaView>
    );
  }

  const accent = scenario.accentColor;

  const handleCTA = () => {
    if (scenario.locked) {
      Alert.alert("Coming Soon", `${scenario.name} will be available in a future update. Stay tuned!`);
    } else {
      navigation.navigate("CharacterCreate", { scenarioId: scenario.id });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Scenario</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[`${accent}30`, `${accent}08`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: spacing.xl, gap: spacing.md }}
        >
          <View style={{ width: 56, height: 56, borderRadius: radii.md,
            backgroundColor: `${accent}20`, alignItems: "center", justifyContent: "center" }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path stroke={accent} strokeWidth={2} strokeLinecap="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
          </View>
          <View>
            <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 26 }}>
              {scenario.name}
            </Text>
            <Text style={{ color: accent, fontFamily: fonts.bodySemiBold, fontSize: 14, marginTop: 4 }}>
              {scenario.tagline}
            </Text>
          </View>
          {scenario.locked && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: `${colors.bg}80`, borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: 8,
              alignSelf: "flex-start" }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path stroke={colors.t3} strokeWidth={2} strokeLinecap="round"
                  d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />
              </Svg>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13 }}>
                Coming in a future update
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Description */}
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
              ABOUT THIS SCENARIO
            </Text>
            <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 }}>
              {scenario.description}
            </Text>
          </View>

          {/* Stat Modifiers */}
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
              STAT MODIFIERS
            </Text>
            <View style={{ backgroundColor: colors.bgCard, borderRadius: radii.md,
              borderWidth: 1, borderColor: colors.border }}>
              {scenario.statModifiers.map((mod, idx) => (
                <View key={mod.label} style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}>
                  <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13 }}>
                    {mod.label}
                  </Text>
                  <Text style={{
                    color: mod.positive ? colors.emerald : colors.crimson,
                    fontFamily: fonts.bodySemiBold, fontSize: 13,
                  }}>
                    {mod.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
        padding: spacing.lg, backgroundColor: colors.bg,
        borderTopWidth: 1, borderTopColor: colors.border }}>
        <Pressable
          onPress={handleCTA}
          style={[
            { borderRadius: radii.md, paddingVertical: 14, alignItems: "center" },
            scenario.locked
              ? { backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border }
              : { backgroundColor: accent },
          ]}
        >
          <Text style={{
            color: scenario.locked ? colors.t3 : "#FFFFFF",
            fontFamily: fonts.displayBold, fontSize: 15,
          }}>
            {scenario.ctaLabel}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

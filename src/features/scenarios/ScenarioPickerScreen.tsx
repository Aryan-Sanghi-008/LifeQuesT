import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { SCENARIOS, Scenario } from "@data/scenarios";
import type { RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round"
        d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}

function ScenarioCard({ scenario, onPress }: { scenario: Scenario; onPress: () => void }) {
  const { colors, fonts, spacing, radii } = useTheme();
  const accent = scenario.accentColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: `${accent}30`,
          borderRadius: radii.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      android_ripple={{ color: `${accent}15` }}
    >
      {/* Color band at top */}
      <View style={[styles.cardBand, { backgroundColor: `${accent}18` }]}>
        <View style={[styles.accentDot, { backgroundColor: accent }]} />
        {scenario.locked && (
          <View style={[styles.lockBadge, { backgroundColor: colors.bg2 }]}>
            <LockIcon color={colors.t3} />
            <Text style={[styles.lockText, { color: colors.t3, fontFamily: fonts.body }]}>
              Coming soon
            </Text>
          </View>
        )}
        {!scenario.locked && (
          <View style={[styles.lockBadge, { backgroundColor: `${accent}20` }]}>
            <Text style={[styles.lockText, { color: accent, fontFamily: fonts.bodySemiBold }]}>
              Playable
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.cardBody, { padding: spacing.md, gap: spacing.xs }]}>
        <Text style={[styles.cardName, { color: colors.t1, fontFamily: fonts.displayBold }]}>
          {scenario.name}
        </Text>
        <Text style={[styles.cardTagline, { color: accent, fontFamily: fonts.bodySemiBold }]}>
          {scenario.tagline}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.t3, fontFamily: fonts.body }]} numberOfLines={2}>
          {scenario.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, overflow: "hidden" },
  cardBand: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  accentDot: { width: 8, height: 8, borderRadius: 4 },
  lockBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  lockText: { fontSize: 11 },
  cardBody: {},
  cardName: { fontSize: 16 },
  cardTagline: { fontSize: 12 },
  cardDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});

export function ScenarioPickerScreen() {
  const { colors, fonts, spacing } = useTheme();
  const navigation = useNavigation<Nav>();

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
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Scenarios</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 }}>
          Choose a scenario to explore. More worlds are coming in future updates.
        </Text>
        {SCENARIOS.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            onPress={() => navigation.navigate("ScenarioDetail", { scenarioId: s.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

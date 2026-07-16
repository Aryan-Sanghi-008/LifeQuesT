import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@theme";
import { GlassCard } from "@components/index";
import type { CharacterStats } from "@/types";

const MINI_STATS: Array<{ key: keyof CharacterStats; label: string; colorKey: string }> = [
  { key: "health", label: "Health", colorKey: "health" },
  { key: "happiness", label: "Happy", colorKey: "happiness" },
  { key: "wealth", label: "Wealth", colorKey: "wealth" },
];

export function MiniVitalsStrip({
  stats,
  onPress,
}: {
  stats: CharacterStats;
  onPress: () => void;
}) {
  const { colors, fonts, spacing } = useTheme();
  const colorMap: Record<string, string> = {
    health: colors.health,
    happiness: colors.happiness,
    wealth: colors.wealth,
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open full stats"
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}
    >
      <GlassCard
        style={{
          flexDirection: "row",
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          alignItems: "center",
        }}
      >
        {MINI_STATS.map((s, i) => {
          const val = stats[s.key] as number;
          const col = colorMap[s.colorKey];
          return (
            <View
              key={s.key}
              style={[
                styles.vital,
                i > 0 && {
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderLeftColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.statNum, { color: col, fontFamily: fonts.monoSemiBold }]}>
                {Math.round(val)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.t4, fontFamily: fonts.body }]}>
                {s.label}
              </Text>
            </View>
          );
        })}
        <View
          style={[
            styles.more,
            {
              borderLeftWidth: StyleSheet.hairlineWidth,
              borderLeftColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.moreText, { color: colors.t3, fontFamily: fonts.bodySemiBold }]}>
            More ›
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  vital: { flex: 1, alignItems: "center", paddingVertical: 4, gap: 2 },
  statNum: { fontSize: 16 },
  statLabel: { fontSize: 10, letterSpacing: 0.3 },
  more: { paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  moreText: { fontSize: 10 },
});

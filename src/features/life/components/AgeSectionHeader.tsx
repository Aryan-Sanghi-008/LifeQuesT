import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import { LifeStageBannerIcon } from "@components/LifeStageBannerIcon";
import { getLifeStageConfig } from "@features/life/lifeFeed";

export function AgeSectionHeader({
  age,
  isStageTransition,
}: {
  age: number;
  isStageTransition: boolean;
}) {
  const { colors, fonts, radii, spacing } = useTheme();
  const config = getLifeStageConfig(age);

  if (isStageTransition) {
    return (
      <LinearGradient
        colors={[`${config.gradient[0]}28`, `${config.gradient[1]}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.banner, { borderRadius: radii.sm, marginHorizontal: spacing.lg }]}
      >
        <LifeStageBannerIcon age={age} color={config.gradient[0]} size={40} />
        <View>
          <Text
            style={[
              styles.stageLabel,
              { color: config.gradient[0], fontFamily: fonts.bodyBold },
            ]}
          >
            {config.label.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.ageText,
              { color: config.gradient[0], fontFamily: fonts.displayBlack },
            ]}
          >
            AGE {age}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.yearRow, { marginHorizontal: spacing.lg }]}>
      <View style={[styles.yearLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.yearLabel, { color: colors.t4, fontFamily: fonts.monoSemiBold }]}>
        AGE {age}
      </Text>
      <View style={[styles.yearLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 8,
  },
  stageLabel: { fontSize: 9, letterSpacing: 1, opacity: 0.75 },
  ageText: { fontSize: 15, letterSpacing: 0.5 },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 6,
  },
  yearLine: { flex: 1, height: StyleSheet.hairlineWidth },
  yearLabel: { fontSize: 10, letterSpacing: 0.8 },
});

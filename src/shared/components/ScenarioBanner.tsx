import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";
import { ScenarioId } from "@/types";
import { SCENARIO_CATALOG } from "@data/scenarioCatalog";

interface Props {
  scenarioName: string;
  type: ScenarioId;
  description?: string;
}

export function ScenarioBanner({ scenarioName, type, description }: Props) {
  const { colors, fonts, radii } = useTheme();

  const catalogEntry = SCENARIO_CATALOG.find((s) => s.id === type);
  const accentColor = catalogEntry?.accentColor ?? colors.sapphire;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: `${accentColor}40`,
          borderRadius: radii.md,
          backgroundColor: colors.bgCard,
        },
      ]}
    >
      <View style={[styles.leftStripe, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <Text
          style={[
            styles.tag,
            { color: accentColor, fontFamily: fonts.bodyBold },
          ]}
        >
          ACTIVE SCENARIO
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {catalogEntry?.iconEmoji ? (
            <Text style={{ fontSize: 16 }}>{catalogEntry.iconEmoji}</Text>
          ) : null}
          <Text
            style={[
              styles.title,
              { color: colors.t1, fontFamily: fonts.displayBold },
            ]}
          >
            {scenarioName}
          </Text>
        </View>
        {description && (
          <Text
            style={[
              styles.desc,
              { color: colors.t2, fontFamily: fonts.body },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 10,
    width: "100%",
  },
  leftStripe: {
    width: 6,
  },
  content: {
    padding: 12,
    flex: 1,
    gap: 2,
  },
  tag: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});

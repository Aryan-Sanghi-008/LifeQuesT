import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";

interface Props {
  scenarioName: string;
  type: "royal" | "zombie" | "cyber" | "crime" | "fantasy";
  description?: string;
}

export function ScenarioBanner({ scenarioName, type, description }: Props) {
  const { colors, fonts, radii } = useTheme();

  const typeColors: Record<string, string> = {
    royal: colors.scenarioRoyal,
    zombie: colors.scenarioZombie,
    cyber: colors.scenarioCyber,
    crime: colors.scenarioCrime,
    fantasy: colors.scenarioFantasy,
  };

  const accentColor = typeColors[type] ?? colors.sapphire;

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
        <Text
          style={[
            styles.title,
            { color: colors.t1, fontFamily: fonts.displayBold },
          ]}
        >
          {scenarioName}
        </Text>
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

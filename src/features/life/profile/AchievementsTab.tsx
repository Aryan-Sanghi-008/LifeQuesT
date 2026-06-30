import { View, Text } from "react-native";
import { useTheme, useThemedStyles } from "@theme";
import { SectionLabel } from "@components/index";
import { ACHIEVEMENTS } from "@data/gameData";
import { createSectionStyles } from "./styles";

export function AchievementsTab({
  achievements,
}: {
  achievements: string[];
}) {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createSectionStyles);
  const unlockedAch = achievements.length;

  return (
    <View style={styles.section}>
      <SectionLabel
        label={`Achievements (${unlockedAch}/${ACHIEVEMENTS.length})`}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = achievements.includes(ach.id);
          return (
            <View
              key={ach.id}
              style={{
                width: "47%",
                padding: 12,
                borderRadius: 10,
                backgroundColor: unlocked ? `${colors.gold}15` : colors.bgCard,
                borderWidth: 1,
                borderColor: unlocked ? `${colors.gold}40` : colors.border,
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <Text
                style={{
                  color: unlocked ? colors.gold : colors.t3,
                  fontFamily: fonts.bodyBold,
                  fontSize: 13,
                }}
              >
                {ach.label}
              </Text>
              <Text
                style={{
                  color: colors.t4,
                  fontFamily: fonts.body,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {ach.description}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

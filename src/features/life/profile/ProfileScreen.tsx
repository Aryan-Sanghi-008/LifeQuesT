import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useTheme, useThemedStyles, SPACING } from "@theme";
import { useGameStore } from "@store/gameStore";
import { ScreenShell, TabScreenHeader } from "@components/index";
import { ProfileTabBar, ProfileTab } from "./ProfileTabBar";
import { ProfileOverview } from "./ProfileOverview";
import { StatsTab } from "./StatsTab";
import { AchievementsTab } from "./AchievementsTab";
import { LegacyTab } from "./LegacyTab";

const createScreenStyles = ({
  colors,
  fonts,
  spacing,
}: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scroll: { flexGrow: 1 },
    footer: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t4,
      textAlign: "center",
      paddingTop: spacing.xl,
    },
  });

export function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createScreenStyles);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const character = useGameStore((s) => s.character);
  const resetGame = useGameStore((s) => s.resetGame);
  const setAvatarStyle = useGameStore((s) => s.setAvatarStyle);
  const user = useGameStore((s) => s.user);
  const slotsSynced = useGameStore((s) => s.slotsSynced);
  const saveGame = useGameStore((s) => s.saveGame);

  if (!character) return null;

  const handleReset = () => {
    Alert.alert(
      "End This Life?",
      "This will permanently delete your character and start over. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Life",
          style: "destructive",
          onPress: () => {
            void resetGame();
          },
        },
      ],
    );
  };

  return (
    <ScreenShell>
      <TabScreenHeader
        title="Profile"
        subtitle={character.name}
        accent={colors.catMilestone}
      />
      <ProfileTabBar active={activeTab} onSelect={setActiveTab} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ProfileOverview
          character={character}
          showOverviewSections={activeTab === "overview"}
          onSetAvatarStyle={setAvatarStyle}
          onReset={handleReset}
          user={user}
          slotsSynced={slotsSynced}
          onSaveGame={saveGame}
        />

        {activeTab === "stats" && <StatsTab character={character} />}

        {activeTab === "achievements" && (
          <AchievementsTab achievements={character.achievements} />
        )}

        {activeTab === "legacy" && <LegacyTab />}

        <Text style={[styles.footer, { color: colors.t4 }]}>
          LifeQuesT · Built with purpose
        </Text>
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </ScreenShell>
  );
}
